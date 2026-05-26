---
title: "Parallel Python on a Single Node"
description: "How to parallelize CPU-bound Python work across multiple cores using multiprocessing and concurrent.futures on {{ cluster.name }}"
tags:
  - python
  - parallel
  - intermediate
---

# Parallel Python on a Single Node

!!! abstract "What we're cooking"
    How to use Python's `multiprocessing` and `concurrent.futures` to run
    CPU-bound work across multiple cores on a single {{ cluster.name }} node,
    and how to request the right Slurm resources to match.

!!! tip "New to parallel programming?"
    If concepts like processes vs. threads, Amdahl's Law, or the difference between concurrency and parallelism are unfamiliar, read the [Parallel Computing fundamentals](../../fundamentals/parallel-computing.md) article first. This recipe focuses on the practical Python side and assumes you have that background.

## Python's GIL problem

Most languages let you spin up threads and run them on separate CPU cores simultaneously. Python doesn't, at least not for regular Python code. The **Global Interpreter Lock** (GIL) is a mutex inside CPython that allows only one thread to execute Python bytecode at a time, even on a 64-core machine.

For **I/O-bound** work (waiting on network, disk, APIs), threads are fine. The GIL is released while waiting, so other threads can run. For **CPU-bound** work (number crunching, data processing, simulations), threads give you the *illusion* of parallelism through interleaving, but no actual speedup. Your 8 threads take turns on one core rather than running on 8 cores simultaneously.

The fix: use **processes** instead of threads. Each process gets its own Python interpreter with its own GIL. Eight processes can run on eight cores with true simultaneous execution.

??? note "What about Python 3.13+ free-threaded builds?"
    CPython 3.13 introduced an experimental [free-threaded build](https://docs.python.org/3/howto/free-threading-python.html) that can disable the GIL, allowing true thread-based parallelism for CPU-bound code. This is a significant change, but as of mid-2026 the ecosystem isn't ready for a blanket recommendation: many C extensions (including parts of NumPy and other scientific libraries) need to be rebuilt or patched to be thread-safe without the GIL, and the free-threaded interpreter is not the default build on most systems.

    For now, treat `multiprocessing` as the reliable default for CPU-bound parallelism. It works on every Python version and doesn't depend on extension compatibility. Keep an eye on free-threading support in the libraries you use; once the ecosystem catches up, threads may become a simpler option for some workloads.

## `multiprocessing.Pool`

The `multiprocessing` module is Python's built-in tool for process-based parallelism. Its `Pool` class is the quickest way to parallelize a loop: you give it a function and a list of inputs, and it fans the work out across worker processes.

Here's a complete, runnable example. The task is counting prime numbers in successive ranges, a pure CPU-bound computation that benefits from multiple cores.

Save this as `parallel_primes.py`:

```python
"""Count primes in ranges using a multiprocessing Pool."""

import math
import multiprocessing
import os
import time


def is_prime(n):
    """Check whether a single integer is prime."""
    if n < 2:
        return False
    if n < 4:
        return True
    if n % 2 == 0 or n % 3 == 0:
        return False
    for i in range(5, int(math.sqrt(n)) + 1, 6):
        if n % i == 0 or n % (i + 2) == 0:
            return False
    return True


def count_primes_in_range(args):  # (1)!
    """Count how many primes exist in [start, end)."""
    start, end = args
    return sum(1 for n in range(start, end) if is_prime(n))


def main():
    # Split 0..2_000_000 into 20 equal chunks
    total = 2_000_000
    num_chunks = 20
    chunk_size = total // num_chunks
    chunks = [(i * chunk_size, (i + 1) * chunk_size) for i in range(num_chunks)]

    # Use SLURM_CPUS_PER_TASK if available, otherwise fall back to cpu_count
    num_workers = int(os.environ.get("SLURM_CPUS_PER_TASK", os.cpu_count()))  # (2)!

    # --- Sequential baseline ---
    t0 = time.perf_counter()
    sequential_total = sum(count_primes_in_range(c) for c in chunks)
    t_sequential = time.perf_counter() - t0

    # --- Parallel with multiprocessing ---
    t0 = time.perf_counter()
    with multiprocessing.Pool(processes=num_workers) as pool:  # (3)!
        results = pool.map(count_primes_in_range, chunks)  # (4)!
    parallel_total = sum(results)
    t_parallel = time.perf_counter() - t0

    print(f"Primes below {total:,}: {sequential_total:,}")
    print(f"Sequential:  {t_sequential:.2f}s")
    print(f"Parallel ({num_workers} workers): {t_parallel:.2f}s")
    print(f"Speedup: {t_sequential / t_parallel:.1f}x")

    assert sequential_total == parallel_total, "Results don't match!"


if __name__ == "__main__":  # (5)!
    main()
```

1. `Pool.map` sends each item to a worker. The function must accept a single argument, so we pack `start` and `end` into a tuple.
2. On a Slurm job, this reads the number of CPUs you requested. On your laptop, it falls back to all available cores.
3. The `with` statement ensures worker processes are cleaned up when the block exits.
4. `pool.map(func, iterable)` is the parallel equivalent of `[func(x) for x in iterable]`. It blocks until all results are ready.
5. **This guard is required.** Without it, each spawned worker process re-imports the module and tries to spawn its own workers, causing an infinite fork bomb.

Run it locally to verify:

```bash
uv run python parallel_primes.py
```

Expected output (timing varies by hardware):

```
Primes below 2,000,000: 148,933
Sequential:  1.82s
Parallel (8 workers): 0.31s
Speedup: 5.9x
```

!!! tip "Use `Pool.starmap()` for multi-argument functions"
    If your function takes multiple separate arguments (not a tuple), use `pool.starmap(func, [(a1, b1), (a2, b2), ...])` instead. It unpacks each tuple as positional arguments.

## `concurrent.futures` — the modern API

Python 3.2 introduced `concurrent.futures` as a higher-level interface over `multiprocessing` and `threading`. The `ProcessPoolExecutor` class does the same thing as `multiprocessing.Pool` with a cleaner API and better integration with Python's exception handling.

Here's the same prime-counting example rewritten:

```python
"""Count primes in ranges using concurrent.futures."""

import math
import os
import time
from concurrent.futures import ProcessPoolExecutor, as_completed


def is_prime(n):
    if n < 2:
        return False
    if n < 4:
        return True
    if n % 2 == 0 or n % 3 == 0:
        return False
    for i in range(5, int(math.sqrt(n)) + 1, 6):
        if n % i == 0 or n % (i + 2) == 0:
            return False
    return True


def count_primes_in_range(start, end):  # (1)!
    """Count how many primes exist in [start, end)."""
    return sum(1 for n in range(start, end) if is_prime(n))


def main():
    total = 2_000_000
    num_chunks = 20
    chunk_size = total // num_chunks
    chunks = [(i * chunk_size, (i + 1) * chunk_size) for i in range(num_chunks)]

    num_workers = int(os.environ.get("SLURM_CPUS_PER_TASK", os.cpu_count()))

    # --- Using executor.map (ordered results) ---
    t0 = time.perf_counter()
    with ProcessPoolExecutor(max_workers=num_workers) as executor:
        results = list(executor.map(count_primes_in_range, *zip(*chunks)))  # (2)!
    t_map = time.perf_counter() - t0

    print(f"Primes below {total:,}: {sum(results):,}")
    print(f"Parallel ({num_workers} workers, executor.map): {t_map:.2f}s")

    # --- Using submit + as_completed (results as they finish) ---
    t0 = time.perf_counter()
    with ProcessPoolExecutor(max_workers=num_workers) as executor:
        futures = {
            executor.submit(count_primes_in_range, start, end): (start, end)  # (3)!
            for start, end in chunks
        }
        total_primes = 0
        for future in as_completed(futures):  # (4)!
            total_primes += future.result()
    t_submit = time.perf_counter() - t0

    print(f"Parallel ({num_workers} workers, as_completed): {t_submit:.2f}s")


if __name__ == "__main__":
    main()
```

1. With `concurrent.futures`, the function can take multiple arguments directly. No tuple packing needed.
2. `executor.map` works like the built-in `map()` but runs in parallel. Results come back in input order.
3. `executor.submit()` schedules a single call and returns a `Future` object. You can attach metadata (here, the chunk range) to track which result is which.
4. `as_completed()` yields futures as they finish, not in submission order. This is useful when tasks have very different durations and you want to process results immediately.

### Which one should you use?

| Feature | `multiprocessing.Pool` | `concurrent.futures` |
|---|---|---|
| API style | Lower-level, more control | Higher-level, cleaner |
| Multiple arguments | `starmap()` | Direct function arguments |
| Results as they finish | `imap_unordered()` | `as_completed()` |
| Shared memory, Queues, Pipes | Yes | No (use `multiprocessing` directly) |
| Exception handling | Manual | Exceptions propagate from `future.result()` |

For most new code, **`concurrent.futures.ProcessPoolExecutor` is the better default**. It's more readable and handles exceptions more naturally. Reach for `multiprocessing` directly when you need lower-level primitives like shared memory, `Queue`, or `Pipe`.

## Submitting to Slurm

The key Slurm directive for single-node parallel Python is `--cpus-per-task`. You're running one task (one Python process) that internally spawns worker processes across multiple cores.

{{ sbatch_template(
    job_name="parallel-primes",
    cpus="8 (1)",
    mem="4G",
    time="00:10:00",
    modules=["uv/latest"],
    commands="uv run python parallel_primes.py",
    annotations=[
        "Match this to the number of workers your script uses. The script reads <code>SLURM_CPUS_PER_TASK</code> automatically.",
    ]
) }}

The script reads `SLURM_CPUS_PER_TASK` and adjusts its worker count to match:

```python
num_workers = int(os.environ.get("SLURM_CPUS_PER_TASK", os.cpu_count()))
```

This pattern means you change parallelism in *one place* (the sbatch `--cpus-per-task` line) and the Python code adapts.

!!! warning "Match CPUs to workers"
    If you request 4 CPUs but spawn 16 workers, the operating system crams 16 processes onto 4 cores and spends time context-switching between them. You get overhead without benefit.

    If you request 16 CPUs but spawn 4 workers, 12 cores sit idle. You're paying for resources you're not using, and other users can't access them.

    Always tie your worker count to `SLURM_CPUS_PER_TASK`.

## How many workers?

There's no universal answer, but here are practical guidelines:

**Start with `SLURM_CPUS_PER_TASK`.** One worker per allocated core is the right default for CPU-bound work.

**Budget memory per worker.** Each worker process gets its own copy of your program's memory. If your script loads a 2 GB dataset and you spawn 8 workers, you need at least 16 GB of RAM. Use `--mem-per-cpu` instead of `--mem` to scale memory with core count:

```bash
#SBATCH --cpus-per-task=8
#SBATCH --mem-per-cpu=2G   # 8 CPUs × 2 GB = 16 GB total
```

**Watch for diminishing returns.** Spawning processes and shipping data between them has overhead. For very small tasks (milliseconds each), that overhead can dominate. If doubling your workers from 8 to 16 only gives a 1.3x speedup instead of 2x, you've hit the point of diminishing returns. Profile before scaling beyond ~32 workers.

**Don't exceed a node's core count.** {{ cluster.name }} compute nodes typically have 32 to 128 cores depending on the partition. You can check with `sinfo -p <partition> -o "%n %c"`. Requesting more CPUs than a node has will make your job impossible to schedule.

## Common pitfalls

??? failure "My parallel code is slower than the sequential version"
    The most common cause is **task granularity**. If each chunk of work takes less than a few milliseconds, the overhead of spawning processes and transferring data between them exceeds the time saved. Fix: make each chunk larger (fewer chunks, more work per chunk).

    Also check whether you're accidentally using `ThreadPoolExecutor` (threads) instead of `ProcessPoolExecutor` (processes). Threads don't help with CPU-bound Python code because of the GIL.

??? failure "`RuntimeError: An attempt has been made to start a new process...`"
    You're missing the `if __name__ == "__main__":` guard. On macOS and Windows, Python uses the "spawn" start method, which re-imports your module in each worker. Without the guard, the import triggers another round of process spawning, recursively. Add the guard around any code that creates a `Pool` or `ProcessPoolExecutor`.

??? failure "I requested 16 CPUs but only 1 core is doing work"
    Three common causes:

    1. Your code doesn't actually use `multiprocessing` or `concurrent.futures`. Requesting CPUs in Slurm doesn't automatically parallelize your script.
    2. You used `threading` instead of `multiprocessing`. Threads share the GIL and won't utilize multiple cores for CPU-bound work.
    3. You hardcoded `num_workers=1` instead of reading `SLURM_CPUS_PER_TASK`.

??? failure "`MemoryError` or job killed by Slurm OOM"
    Each worker process gets its own copy of any data loaded before the fork. With 16 workers and a 4 GB dataset, you need 64 GB. Use `--mem-per-cpu` to budget accordingly, and consider loading data *inside* the worker function rather than in the main process.

??? failure "`PicklingError: Can't pickle <lambda>`"
    `multiprocessing` serializes (pickles) your function to send it to worker processes. Lambdas, nested functions, and closures can't be pickled. Move your function to the module's top level and give it a name.

    ```python
    # This fails:
    pool.map(lambda x: x ** 2, range(100))

    # This works:
    def square(x):
        return x ** 2

    pool.map(square, range(100))
    ```

## When to reach for something else

This recipe covers the case where you're writing your own parallel logic in Python. But that's not always the right tool:

- **Your tasks are completely independent (no shared code needed)?** A [Slurm job array](../slurm/job-arrays.md) is simpler. One sbatch submission fans out N copies of your script, each with a different input. No `multiprocessing` code needed.

- **Your bottleneck is I/O, not CPU?** Threads or `asyncio` are better suited. See the [Concurrent Programming fundamentals](../../fundamentals/concurrent-programming.md).

- **You need more cores than a single node provides?** You need distributed computing. See the [mpi4py recipe](../mpi/mpi4py.md) or the [Distributed Computing fundamentals](../../fundamentals/distributed-computing.md).

- **You're using NumPy, scikit-learn, or other scientific libraries?** Many of these already parallelize internally via native threads that bypass the GIL. Wrapping them in `multiprocessing` can actually make things slower by oversubscribing cores. See [Parallelism in the Scientific Python Stack](parallel-libraries.md) for how to control library-level parallelism on {{ cluster.name }}.
