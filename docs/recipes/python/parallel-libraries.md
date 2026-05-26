---
title: "Parallelism in the Scientific Python Stack"
description: "How NumPy, pandas, SciPy, scikit-learn, and other libraries handle parallel work on {{ cluster.name }}, and how to control them"
tags:
  - python
  - parallel
  - numpy
  - scikit-learn
  - intermediate
---

# Parallelism in the Scientific Python Stack

!!! abstract "What we're cooking"
    How popular scientific Python libraries parallelize work under the hood, how to control thread and process counts so they play nicely with Slurm, and when to reach for explicitly parallel tools like Joblib or Dask.

!!! tip "Looking for `multiprocessing` and `concurrent.futures`?"
    This recipe covers *library-level* parallelism (NumPy, scikit-learn, etc.). If you're writing your own parallel loops, see [Parallel Python on a Single Node](parallel.md) instead.

## The hidden parallelism problem

Many scientific Python libraries already use multiple threads internally. NumPy delegates linear algebra to compiled BLAS libraries. scikit-learn uses Joblib to parallelize model fitting. Polars runs queries on a Rust thread pool. These native threads bypass Python's GIL, so they *do* achieve true parallelism.

On your laptop, this is fine. The library detects your 8 cores and uses them.

On a shared cluster, it's a problem. Your Slurm job might request 4 CPUs, but NumPy sees the node's full 64 cores and spawns 64 threads. Those threads fight for 4 physical cores, slow everything down, and interfere with other users' jobs on the same node.

The fix is straightforward: tell each library how many threads to use. The rest of this recipe shows how for each major library.

## NumPy, SciPy, and BLAS threads

NumPy and SciPy delegate heavy linear algebra (matrix multiply, SVD, eigenvalue decomposition, linear solves, FFT) to compiled BLAS/LAPACK implementations. On {{ cluster.name }}, this is typically OpenBLAS or Intel MKL. These libraries spawn **native threads** that bypass the GIL entirely.

### What triggers multi-threading

Not every NumPy operation is multi-threaded. The speedup comes from linear algebra routines, not element-wise math:

| Multi-threaded (BLAS/LAPACK) | Single-threaded |
|---|---|
| `A @ B` (matrix multiply) | `a + b`, `a * b` (element-wise) |
| `np.linalg.solve()` | `np.sin()`, `np.exp()` |
| `np.linalg.svd()` | `np.sort()` |
| `np.linalg.eig()` | Indexing, slicing |
| `scipy.linalg.*` | `np.sum()`, `np.mean()` |

If your workload is mostly element-wise operations, adding more threads won't help.

### Controlling thread count

Set environment variables in your sbatch script **before** Python starts:

```bash
export OMP_NUM_THREADS=$SLURM_CPUS_PER_TASK
export MKL_NUM_THREADS=$SLURM_CPUS_PER_TASK
export OPENBLAS_NUM_THREADS=$SLURM_CPUS_PER_TASK
```

These variables control OpenMP (used by most BLAS implementations), Intel MKL, and OpenBLAS respectively. Setting all three covers whichever backend is linked.

### Checking what's linked

To see which BLAS library NumPy is using:

```python
import numpy as np
np.show_config()
```

For runtime thread inspection and control, use the `threadpoolctl` package:

```python
from threadpoolctl import threadpool_info
import json
print(json.dumps(threadpool_info(), indent=2))
```

This shows each thread pool, its library, and how many threads it's using.

### Example: matrix multiply scaling

Save this as `blas_bench.py` to see how BLAS thread count affects performance:

```python
"""Benchmark matrix multiply with different thread counts."""

import os
import time
import numpy as np

# Read thread count from environment (set by sbatch script)
n_threads = os.environ.get("OMP_NUM_THREADS", "not set")
print(f"OMP_NUM_THREADS={n_threads}")

# Generate two large random matrices
rng = np.random.default_rng(42)
size = 4000
A = rng.standard_normal((size, size))
B = rng.standard_normal((size, size))

# Warm-up run (first call may include JIT/setup overhead)
_ = A @ B

# Timed run
t0 = time.perf_counter()
C = A @ B
elapsed = time.perf_counter() - t0

print(f"Matrix multiply ({size}x{size}): {elapsed:.2f}s")
```

Submit it with different thread counts to see the scaling curve:

{{ sbatch_template(
    job_name="blas-bench",
    cpus="8 (1)",
    mem="8G",
    time="00:10:00",
    modules=["uv/latest"],
    commands="export OMP_NUM_THREADS=$SLURM_CPUS_PER_TASK\nexport MKL_NUM_THREADS=$SLURM_CPUS_PER_TASK\nexport OPENBLAS_NUM_THREADS=$SLURM_CPUS_PER_TASK\n\nuv run python blas_bench.py",
    annotations=[
        "Try 1, 2, 4, 8, 16 to see how performance scales with thread count.",
    ]
) }}

You'll typically see good speedup up to 4-8 threads for a 4000×4000 matrix, with diminishing returns beyond that.

## pandas

pandas is mostly single-threaded for DataFrame operations. Functions like `df.apply()`, `df.groupby().agg()`, and `df.merge()` run on one core regardless of how many CPUs you've requested.

There are a few exceptions:

- **I/O with PyArrow**: `pd.read_parquet()` and `pd.read_csv(engine="pyarrow")` can use multiple threads for decompression and parsing.
- **Certain internal operations**: Some recent pandas versions parallelize specific operations when using the PyArrow backend (`pd.options.mode.dtype_backend = "pyarrow"`).

For genuinely parallel tabular data processing, consider **Polars** (covered below) or **Dask**.

!!! tip "Profile before parallelizing pandas"
    If your pandas code is slow, the bottleneck is often inefficient use of `apply()` (which loops row by row in Python). Vectorizing with built-in pandas/NumPy operations can give a 10-100x speedup without any parallelism.

## scikit-learn and Joblib

Many scikit-learn estimators accept an `n_jobs` parameter that controls parallelism:

```python
from sklearn.ensemble import RandomForestClassifier

# Use 8 parallel workers for fitting
clf = RandomForestClassifier(n_trees=100, n_jobs=8)
clf.fit(X_train, y_train)
```

Under the hood, scikit-learn uses **Joblib**, a lightweight library for parallel function execution. Joblib's default backend (`loky`) spawns worker processes, similar to `multiprocessing`.

### The `n_jobs=-1` trap

Setting `n_jobs=-1` means "use all available CPUs." Joblib reads `os.cpu_count()` to decide how many that is. On a Slurm cluster, `os.cpu_count()` returns the **node's total core count** (e.g., 64), not the number of cores you requested (e.g., 8). Your 8-CPU job spawns 64 workers, oversubscribing the node.

The fix: set the `LOKY_MAX_CPU_COUNT` environment variable in your sbatch script:

```bash
export LOKY_MAX_CPU_COUNT=$SLURM_CPUS_PER_TASK
```

With this set, `n_jobs=-1` correctly spawns workers matching your allocation. Alternatively, pass the count explicitly:

```python
import os
n_cpus = int(os.environ.get("SLURM_CPUS_PER_TASK", os.cpu_count()))
clf = RandomForestClassifier(n_trees=100, n_jobs=n_cpus)
```

### scikit-learn functions that support `n_jobs`

Not all scikit-learn operations parallelize. Here are the most common ones that do:

| Function/Class | What parallelizes |
|---|---|
| `RandomForestClassifier/Regressor` | Tree fitting and prediction |
| `GradientBoostingClassifier` | **Not parallel** (trees are sequential) |
| `cross_val_score()` | Fold evaluation |
| `GridSearchCV` / `RandomizedSearchCV` | Parameter combinations |
| `KNeighborsClassifier` | Distance computation |

Check each estimator's documentation for whether it accepts `n_jobs`.

### Example: random forest scaling

Save this as `sklearn_bench.py`:

```python
"""Benchmark RandomForest fitting with different n_jobs values."""

import os
import time
import numpy as np
from sklearn.datasets import make_classification
from sklearn.ensemble import RandomForestClassifier

n_cpus = int(os.environ.get("SLURM_CPUS_PER_TASK", os.cpu_count()))
print(f"SLURM_CPUS_PER_TASK={n_cpus}")

# Generate a synthetic dataset
X, y = make_classification(n_samples=50_000, n_features=50, random_state=42)

for n_jobs in [1, 2, 4, n_cpus]:
    clf = RandomForestClassifier(n_estimators=200, n_jobs=n_jobs, random_state=42)
    t0 = time.perf_counter()
    clf.fit(X, y)
    elapsed = time.perf_counter() - t0
    print(f"n_jobs={n_jobs:>2d}: {elapsed:.2f}s")
```

{{ sbatch_template(
    job_name="sklearn-bench",
    cpus=8,
    mem="4G",
    time="00:10:00",
    modules=["uv/latest"],
    commands="export LOKY_MAX_CPU_COUNT=$SLURM_CPUS_PER_TASK\n\nuv run python sklearn_bench.py"
) }}

## Polars

Polars is a DataFrame library written in Rust that automatically parallelizes operations using a thread pool. If your workload is data wrangling (filtering, grouping, joining, aggregating), Polars can be significantly faster than pandas without any explicit parallelism code.

Polars reads the `POLARS_MAX_THREADS` environment variable:

```bash
export POLARS_MAX_THREADS=$SLURM_CPUS_PER_TASK
```

Without this, Polars detects the node's full core count and oversubscribes your allocation.

!!! tip "When to use Polars over pandas"
    Polars is a good fit when your workload is large-scale data transformation (groupby, join, filter, aggregate) and you want parallelism without changing your code structure. It's not a drop-in pandas replacement (the API differs), but for new projects with heavy tabular processing, it's worth considering.

## Numba

Numba compiles Python functions to machine code using LLVM. By default, `@numba.jit` produces single-threaded code. Adding `parallel=True` and using `prange` (parallel range) enables automatic loop parallelism via OpenMP-style threads that bypass the GIL.

```python
import numba
import numpy as np

@numba.jit(nopython=True, parallel=True)  # (1)!
def pairwise_distance(X):
    """Compute pairwise Euclidean distance matrix."""
    n = X.shape[0]
    D = np.empty((n, n))
    for i in numba.prange(n):  # (2)!
        for j in range(n):
            d = 0.0
            for k in range(X.shape[1]):
                d += (X[i, k] - X[j, k]) ** 2
            D[i, j] = np.sqrt(d)
    return D
```

1. `parallel=True` tells Numba to look for parallelizable loops. `nopython=True` (the default for `@jit`) forces compilation rather than falling back to the Python interpreter.
2. `numba.prange` is the parallel version of `range`. Numba distributes iterations across threads.

Control the thread count with:

```bash
export NUMBA_NUM_THREADS=$SLURM_CPUS_PER_TASK
```

Numba is a good fit for custom numerical kernels (inner loops, distance computations, simulations) that don't map cleanly to vectorized NumPy operations. If your hot loop can be expressed as NumPy operations, prefer that: BLAS-backed NumPy is typically faster and doesn't require a JIT compilation step.

## Dask

Dask provides parallel and out-of-core versions of NumPy arrays (`dask.array`) and pandas DataFrames (`dask.dataframe`). It's useful when your data doesn't fit in memory or when you need lazy evaluation pipelines.

For single-node parallelism, use `LocalCluster`:

```python
from dask.distributed import Client, LocalCluster
import os

n_workers = int(os.environ.get("SLURM_CPUS_PER_TASK", 4))
cluster = LocalCluster(
    n_workers=n_workers,
    threads_per_worker=1,  # (1)!
    memory_limit="auto",
)
client = Client(cluster)
```

1. For CPU-bound work, one thread per worker avoids GIL contention. For I/O-heavy pipelines, you might increase `threads_per_worker`.

!!! warning "Dask adds overhead"
    Dask's task scheduler, serialization, and communication layer add latency. If your data fits in memory and your operations are already fast with NumPy or pandas, Dask will be slower, not faster. Use Dask when you *need* out-of-core processing or when you want to compose a complex pipeline that benefits from lazy evaluation and automatic parallelism.

## The Slurm wrapper script

Here's a template sbatch script that sets all the relevant environment variables in one place. Copy it as a starting point for any scientific Python job:

{{ sbatch_template(
    job_name="sci-python",
    cpus="8 (1)",
    mem_per_cpu="2G",
    time="01:00:00",
    modules=["uv/latest"],
    commands="# --- Thread control (set BEFORE Python starts) ---\nexport OMP_NUM_THREADS=$SLURM_CPUS_PER_TASK\nexport MKL_NUM_THREADS=$SLURM_CPUS_PER_TASK\nexport OPENBLAS_NUM_THREADS=$SLURM_CPUS_PER_TASK\nexport NUMBA_NUM_THREADS=$SLURM_CPUS_PER_TASK\nexport POLARS_MAX_THREADS=$SLURM_CPUS_PER_TASK\nexport LOKY_MAX_CPU_COUNT=$SLURM_CPUS_PER_TASK\n\nuv run python my_script.py",
    annotations=[
        "Adjust to match the parallelism your workload can use. Memory scales with this: 8 CPUs × 2 GB = 16 GB total.",
    ]
) }}

All six variables point to `$SLURM_CPUS_PER_TASK`, which means you change the core count in one place (`--cpus-per-task`) and everything adapts.

!!! note "You don't always need all six variables"
    If you only use NumPy, you only need the BLAS variables (`OMP_NUM_THREADS`, etc.). If you only use scikit-learn, you only need `LOKY_MAX_CPU_COUNT`. Setting extras that don't apply is harmless. The template above is a safe default that covers the common stack.

## Mixing `multiprocessing` with threaded libraries

If you use `multiprocessing.Pool` (or `concurrent.futures.ProcessPoolExecutor`) to parallelize work *and* each worker calls NumPy linear algebra, you can accidentally create N processes × M threads. Eight workers, each running NumPy with 8 BLAS threads, produces 64 threads fighting for 8 cores.

The fix: when using `multiprocessing` with NumPy/SciPy, set BLAS threads to 1:

```bash
export OMP_NUM_THREADS=1
export MKL_NUM_THREADS=1
export OPENBLAS_NUM_THREADS=1
```

This forces each worker process to use a single BLAS thread, and your process-level parallelism handles the scaling. This is usually the right tradeoff for embarrassingly parallel workloads where each task does moderate linear algebra.

## Quick reference

| Library | Parallelism type | Control mechanism | Default (unset) |
|---|---|---|---|
| NumPy / SciPy | BLAS threads (native) | `OMP_NUM_THREADS`, `MKL_NUM_THREADS`, `OPENBLAS_NUM_THREADS` | All node cores |
| pandas | Mostly single-threaded | N/A | 1 core |
| scikit-learn | Joblib processes | `n_jobs` parameter, `LOKY_MAX_CPU_COUNT` | 1 core (unless `n_jobs` set) |
| Polars | Rayon threads (native) | `POLARS_MAX_THREADS` | All node cores |
| Numba | OpenMP threads (native) | `NUMBA_NUM_THREADS`, `parallel=True` + `prange` | All node cores |
| Dask | Processes + threads | `LocalCluster(n_workers=...)` | Varies |
| Joblib (standalone) | Processes (loky backend) | `n_jobs`, `LOKY_MAX_CPU_COUNT` | 1 core |

The "Default (unset)" column is the one that causes trouble. Any library that defaults to "all node cores" will oversubscribe your Slurm allocation if you don't set the corresponding variable.

## Common pitfalls

??? failure "My job is using all 64 cores on the node but I only requested 4"
    A library detected the full node's core count instead of your Slurm allocation. Set the environment variables listed in the quick reference table above. The most common culprit is NumPy's BLAS backend (OpenBLAS or MKL), which reads `OMP_NUM_THREADS`.

    You can verify with `htop` in an interactive session or by checking thread counts with `threadpoolctl`:

    ```python
    from threadpoolctl import threadpool_info
    print(threadpool_info())
    ```

??? failure "Adding `multiprocessing` on top of NumPy made things slower"
    You're oversubscribing. NumPy's BLAS is already using multiple threads internally. Layering `multiprocessing.Pool` on top creates N processes × M threads. Set `OMP_NUM_THREADS=1` (and the MKL/OpenBLAS equivalents) when combining `multiprocessing` with NumPy. See [Mixing multiprocessing with threaded libraries](#mixing-multiprocessing-with-threaded-libraries) above.

??? failure "scikit-learn `n_jobs=-1` is slower than `n_jobs=4`"
    `n_jobs=-1` reads `os.cpu_count()`, which returns the full node's core count. If you requested 4 CPUs, you're spawning 64 Joblib workers on 4 cores. Set `LOKY_MAX_CPU_COUNT=$SLURM_CPUS_PER_TASK` in your sbatch script.

??? failure "My Dask job ran out of memory"
    The default `LocalCluster` configuration may spawn more workers than your allocation can support. Explicitly set `n_workers` to match `SLURM_CPUS_PER_TASK` and consider `memory_limit` per worker. With `--mem-per-cpu=2G` and 8 CPUs, each Dask worker should get roughly 2 GB.
