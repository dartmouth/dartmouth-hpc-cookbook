# Plan: Parallel Python Recipes

## Overview

Two recipes that together cover single-node CPU-bound parallelism in Python:

1. **`docs/recipes/python/parallel.md`** — "Parallel Python on a Single Node": `multiprocessing`, `concurrent.futures`, GIL, Slurm integration. Your own code, your own loops.
2. **`docs/recipes/python/parallel-libraries.md`** — "Parallelism in the Scientific Python Stack": how NumPy, pandas, SciPy, scikit-learn, Polars, Dask, Numba, and Joblib handle parallel work under the hood, plus how to control them on a Slurm cluster.

The first recipe is for people writing their own parallel logic. The second is for people using libraries that parallelize internally (often without the user realizing it). Both are common HPC scenarios, and the pitfalls are different.

---

## Recipe 1: Parallel Python on a Single Node

**File:** `docs/recipes/python/parallel.md`

### Frontmatter

```yaml
title: "Parallel Python on a Single Node"
description: "How to parallelize CPU-bound Python work across multiple cores using multiprocessing and concurrent.futures on {{ cluster.name }}"
tags:
  - python
  - parallel
  - intermediate
```

### Sections

#### `!!! abstract "What we're cooking"`
How to use Python's `multiprocessing` and `concurrent.futures` to run CPU-bound work across multiple cores on a single {{ cluster.name }} node, and how to request the right Slurm resources to match.

#### 1. The GIL problem
- Python's Global Interpreter Lock prevents threads from running Python bytecode in parallel. For CPU-bound work, threads give concurrency (interleaving) but not true parallelism. You need **processes**.
- Link back to [Parallel Computing fundamentals](../docs/fundamentals/parallel-computing.md) for the processes-vs-threads deep dive.
- Short code demo showing `threading` NOT speeding up a CPU-bound task (collapsible block).

#### 2. `multiprocessing.Pool`
- `Pool.map()` as the simplest entry point.
- **Complete, runnable example** (`parallel_primes.py`): count primes in ranges using a real computation. Shows `if __name__ == "__main__":` guard.
- Expected output.
- Mention `Pool.starmap()` for multi-argument functions.

#### 3. `concurrent.futures` — the modern API
- `ProcessPoolExecutor` as the higher-level alternative.
- Rewrite the same example with `executor.map()`.
- `executor.submit()` + `as_completed()` for heterogeneous task durations.
- Recommend `concurrent.futures` as default for new code.

#### 4. Submitting to Slurm
- Use `{{ sbatch_template() }}` macro.
- Key flags: `--cpus-per-task=N`, `--mem` or `--mem-per-cpu`.
- **Match workers to CPUs:** requesting 4 CPUs but spawning 16 workers wastes time. Requesting 16 but spawning 4 wastes resources.
- Read `$SLURM_CPUS_PER_TASK` in Python so the script auto-adapts.
- Complete sbatch + Python script pair.

#### 5. How many workers?
- Rule of thumb: `num_workers = int(os.environ.get("SLURM_CPUS_PER_TASK", os.cpu_count()))`.
- Memory warning: each process copies data. N workers x data size = total memory.
- Diminishing returns from spawn overhead and IPC.

#### 6. Common pitfalls
`??? failure` collapsible admonitions:

1. **"Parallel code is slower than sequential"** — Task granularity too small; overhead dominates.
2. **"RuntimeError: freeze_support"** — Missing `if __name__ == "__main__":` guard.
3. **"Requested 16 CPUs but only 1 is used"** — Used `threading` instead of `multiprocessing`, or forgot to parallelize.
4. **"MemoryError with many workers"** — Each process copies data; budget with `--mem-per-cpu`.
5. **"Lambda crashes with PicklingError"** — `multiprocessing` pickles functions. Use module-level named functions.

#### 7. When to reach for something else
- I/O-bound: [Concurrent Programming](../docs/fundamentals/concurrent-programming.md)
- Independent tasks, simplest approach: [Job Arrays](../docs/recipes/slurm/job-arrays.md)
- More cores than one node: [mpi4py](../docs/recipes/mpi/mpi4py.md)
- Using NumPy, pandas, scikit-learn: **[Parallelism in the Scientific Python Stack](parallel-libraries.md)** (the companion recipe)

---

## Recipe 2: Parallelism in the Scientific Python Stack

**File:** `docs/recipes/python/parallel-libraries.md`

### Frontmatter

```yaml
title: "Parallelism in the Scientific Python Stack"
description: "How NumPy, pandas, SciPy, scikit-learn, and other libraries handle parallel work, and how to control them on {{ cluster.name }}"
tags:
  - python
  - parallel
  - numpy
  - scikit-learn
  - intermediate
```

### Sections

#### `!!! abstract "What we're cooking"`
How popular scientific Python libraries parallelize work under the hood, how to control thread and process counts so they play nicely with Slurm, and when to reach for explicitly parallel tools like Dask or Joblib.

#### 1. The hidden parallelism problem
- Many scientific Python libraries already use multiple threads internally (via C/Fortran extensions that bypass the GIL). On your laptop this is fine; on a shared cluster it can cause **oversubscription** if you're not aware of it.
- The common symptom: your 4-CPU Slurm job spawns 64 threads because NumPy detected the node has 64 cores.
- This section sets up the "why you need to care" motivation.

#### 2. NumPy, SciPy, and BLAS/LAPACK threads
- NumPy and SciPy delegate linear algebra to BLAS/LAPACK implementations (OpenBLAS, MKL, or BLIS). These spawn **native threads** that bypass the GIL.
- Operations that trigger multi-threading: matrix multiply (`@`), `np.linalg.solve`, SVD, eigenvalue decomposition, FFT, etc. Element-wise operations (`+`, `*`, `np.sin`) do NOT.
- How to control thread count:
  - `OMP_NUM_THREADS`, `MKL_NUM_THREADS`, `OPENBLAS_NUM_THREADS` environment variables
  - Set these in your sbatch script *before* `python` runs
  - Rule of thumb: set to `$SLURM_CPUS_PER_TASK`
- Runnable example: matrix multiply timing with different thread counts, showing the speedup curve.
- `threadpoolctl` package for runtime inspection and control.

#### 3. pandas
- pandas itself is mostly single-threaded for DataFrame operations.
- I/O can benefit from parallelism (`read_csv` with `engine="pyarrow"`).
- `df.apply()` is sequential; don't expect it to use multiple cores.
- For parallel pandas-like work, point to Polars or Dask (covered below).

#### 4. scikit-learn and Joblib
- Many scikit-learn estimators accept `n_jobs` parameter (`RandomForestClassifier(n_jobs=-1)`).
- Under the hood, scikit-learn uses **Joblib**, which can use either threads or processes (backend-dependent).
- `n_jobs=-1` means "use all available CPUs" (reads `os.cpu_count()` by default).
- On a Slurm cluster, `os.cpu_count()` returns the *node's* total cores, not your allocation. This causes oversubscription.
- Fix: set `LOKY_MAX_CPU_COUNT` or `JOBLIB_NUM_CPUS` to `$SLURM_CPUS_PER_TASK`, or pass `n_jobs=int(os.environ["SLURM_CPUS_PER_TASK"])` explicitly.
- Runnable example: `RandomForestClassifier` with timing across different `n_jobs` values.

#### 5. Polars
- Polars uses Rust's Rayon under the hood for automatic multi-threaded execution.
- Reads `POLARS_MAX_THREADS` environment variable.
- Set `POLARS_MAX_THREADS=$SLURM_CPUS_PER_TASK` in your sbatch script.
- Brief comparison with pandas for parallel-friendly workloads.

#### 6. Numba
- `@numba.jit` compiles Python to machine code; single-threaded by default.
- `@numba.jit(parallel=True)` + `prange` for automatic loop parallelism. Uses threads that bypass the GIL.
- Controlled by `NUMBA_NUM_THREADS` environment variable.
- Good fit for custom numerical kernels that don't map to NumPy operations.
- Brief example: a prange loop vs. plain Python loop.

#### 7. Dask
- Dask provides parallel versions of NumPy arrays and pandas DataFrames that can scale beyond memory and across cores.
- `dask.distributed.LocalCluster` for single-node parallelism.
- Set `n_workers` and `threads_per_worker` to match your Slurm allocation.
- Note: Dask adds overhead; only use when data doesn't fit in memory or when you need lazy evaluation.
- Brief example or pointer to Dask documentation (not a full Dask tutorial).

#### 8. The Slurm wrapper script
- A template sbatch script that sets ALL the relevant environment variables in one place:
  ```bash
  export OMP_NUM_THREADS=$SLURM_CPUS_PER_TASK
  export MKL_NUM_THREADS=$SLURM_CPUS_PER_TASK
  export OPENBLAS_NUM_THREADS=$SLURM_CPUS_PER_TASK
  export NUMBA_NUM_THREADS=$SLURM_CPUS_PER_TASK
  export POLARS_MAX_THREADS=$SLURM_CPUS_PER_TASK
  ```
- Explain why this matters and when you'd set them to different values.

#### 9. Common pitfalls
`??? failure` collapsible admonitions:

1. **"My job is using all 64 cores on the node but I only requested 4"** — Library thread count defaults to `os.cpu_count()`, which reports the full node. Set environment variables.
2. **"Adding multiprocessing on top of NumPy made it slower"** — NumPy is already multi-threaded internally. Layering `multiprocessing.Pool` on top creates N processes x M threads. Set `OMP_NUM_THREADS=1` when using `multiprocessing` with NumPy.
3. **"scikit-learn n_jobs=-1 is slower than n_jobs=4"** — Oversubscription from Joblib spawning more workers than allocated CPUs.
4. **"My Dask job ran out of memory"** — Default `LocalCluster` uses too many workers. Match to Slurm allocation.

#### 10. Quick reference table

| Library | Parallelism type | Control mechanism | Default behavior |
|---------|-----------------|-------------------|-----------------|
| NumPy/SciPy | BLAS threads (native) | `OMP_NUM_THREADS`, `MKL_NUM_THREADS` | All node cores |
| pandas | Mostly single-threaded | N/A | 1 core |
| scikit-learn | Joblib (processes or threads) | `n_jobs` param, `LOKY_MAX_CPU_COUNT` | 1 core (unless `n_jobs` set) |
| Polars | Rayon threads (native) | `POLARS_MAX_THREADS` | All node cores |
| Numba | OpenMP threads (native) | `NUMBA_NUM_THREADS`, `parallel=True` | All node cores |
| Dask | Processes + threads | `LocalCluster(n_workers=...)` | Varies |
| Joblib (standalone) | Processes (loky backend) | `n_jobs`, `LOKY_MAX_CPU_COUNT` | 1 |

---

## Cross-linking changes

### 1. `mkdocs.yml` nav

Add both recipes to the Python section:

```yaml
    - Python:
      - recipes/python/uv.md
      - recipes/python/pytorch.md
      - recipes/python/transformers.md
      - recipes/python/conda.md
      - recipes/python/parallel.md              # NEW
      - recipes/python/parallel-libraries.md    # NEW
```

### 2. `docs/recipes/index.md`

Update the Python card description:

> Manage environments with uv or Conda, run PyTorch and Hugging Face Transformers workloads, parallelize CPU-bound work across multiple cores, and scale training across multiple GPUs.

### 3. `docs/fundamentals/parallel-computing.md` (line ~199)

Add links in the "What's Next" recipe list:

```markdown
- [**Parallel Python**](../recipes/python/parallel.md) — multiprocessing and concurrent.futures on a single node
- [**Parallelism in the Scientific Python Stack**](../recipes/python/parallel-libraries.md) — how NumPy, scikit-learn, and friends handle parallel work
```

### 4. `docs/fundamentals/parallel-programming.md` (line ~96)

Add to the recipe links at the bottom:

```markdown
- [**Parallel Python**](../recipes/python/parallel.md) — CPU-bound parallelism on a single node
```
