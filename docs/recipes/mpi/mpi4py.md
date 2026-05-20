---
title: "MPI Hello World in Python"
description: "Run a distributed Python MPI program across multiple nodes on {{ cluster.name }} using mpi4py"
tags:
  - mpi
  - python
  - beginner
---

# MPI Hello World with mpi4py

!!! abstract "What we're cooking"
    Write a minimal Python script that uses **mpi4py** to print a greeting
    from every parallel process, then submit it as a multi-node batch job on
    {{ cluster.name }}.  If you haven't read the [C MPI recipe](hello-world.md)
    yet, skim it first. This page focuses on the Python differences rather
    than re-explaining MPI fundamentals.

## Why mpi4py?

!!! tip "New to parallel programming?"
    If distributed computing concepts like message passing, ranks, and communication overhead are new to you, read the [Distributed Computing fundamentals](../../fundamentals/distributed-computing.md) article first.

The [C MPI recipe](hello-world.md) shows the canonical approach: write C,
compile with `mpicc`, run with `mpirun`.  That works great for performance-critical
programs, but sometimes you want MPI's multi-node reach with Python's
ecosystem, like NumPy arrays, SciPy solvers, or pandas DataFrames.

**mpi4py** is the standard Python binding for MPI.  It wraps Open MPI (or
any other MPI implementation) and exposes a `Comm` object whose methods map
almost one-to-one to the C MPI calls you already know.  There's no compile
step; you just `import mpi4py` and launch with `mpirun` as usual.

!!! tip "When to choose mpi4py over C MPI"
    mpi4py passes Python objects through pickle automatically, which makes
    prototyping fast.  For bulk numerical work, use the upper-case
    methods (`Bcast`, `Scatter`, `Gather`, `Send`, `Recv`) that operate
    directly on NumPy buffer objects. They skip pickle entirely and approach
    raw C MPI speed.

## Step 1: Set up your Python environment

mpi4py is a Python package that compiles a small C extension linking against
Open MPI at install time.  The recommended approach on {{ cluster.name }} is
to manage your Python environment with **uv** (see the [uv recipe](../python/uv.md)).

Load the modules first. `uv` handles the Python version itself, but
`openmpi` must be loaded so mpi4py links against the right library:

```bash
module load openmpi/5.0.3 uv
```

Then create a project and add mpi4py:

```bash
uv init mpi-hello
cd mpi-hello
uv add mpi4py
```

Verify the install and confirm which MPI library mpi4py linked against:

```bash
uv run python -c "from mpi4py import MPI; print('mpi4py', MPI.Get_library_version())"
```

You should see output mentioning Open MPI and the version number (e.g., `Open MPI v5.0.3`). If it shows a different version than the module you loaded, reinstall mpi4py (see [Common pitfalls](#common-pitfalls) below).

!!! warning "Always load `openmpi` before installing mpi4py"
    mpi4py compiles a small C extension at install time and links it against
    whatever MPI library is active in your shell.  Load `openmpi/5.0.3`
    *before* running `uv add mpi4py`, and load the same module version in
    every batch job.  Mismatched versions are the most common cause of
    cryptic launch errors.

!!! note "Available Open MPI versions"
    {{ cluster.name }} provides `openmpi/4.1.6` and `openmpi/5.0.3`, plus CUDA-enabled variants. You must specify a version; bare `module load openmpi` will not work. Use `module avail openmpi` to see what's installed.

## Step 2: Write the script

Create a file called `hello_mpi.py`:

```python
from mpi4py import MPI  # (1)!
import socket

comm = MPI.COMM_WORLD          # (2)!
rank = comm.Get_rank()         # (3)!
size = comm.Get_size()         # (4)!
host = socket.gethostname()    # (5)!

print(f"Hello from rank {rank} of {size} on {host}")

MPI.Finalize()                 # (6)!
```

1. Importing `mpi4py.MPI` automatically calls `MPI_Init` behind the scenes.
   You don't need an explicit init call.
2. `MPI.COMM_WORLD` is the communicator that spans all ranks in the job.
   It is the Python equivalent of `MPI_COMM_WORLD` in C
3. `Get_rank()` returns this process's unique integer ID (0, 1, 2, …).
   Each process gets a different answer.
4. `Get_size()` returns the total number of processes.  Every process gets
   the same answer.
5. `socket.gethostname()` is the Python equivalent of the C `gethostname()`
   call. It tells us which physical node this rank landed on.
6. Calling `MPI.Finalize()` is optional in mpi4py because it registers an
   `atexit` handler that calls it automatically.  Being explicit is good
   practice. It makes the shutdown boundary clear and prevents surprises
   if you add cleanup code later.

## Step 3: Test interactively

Run a quick sanity check on the login node before submitting a batch job.
`uv run` activates the project environment automatically, so you don't
need a manual `source .venv/bin/activate`:

```bash
mpirun -np 4 uv run python hello_mpi.py
```

You should see four lines (in no guaranteed order):

```
Hello from rank 0 of 4 on login1
Hello from rank 2 of 4 on login1
Hello from rank 1 of 4 on login1
Hello from rank 3 of 4 on login1
```

!!! warning "Login nodes are for quick tests only"
    4 processes for a fraction of a second is fine. The login node is a shared resource. Don't run large or long-running jobs on the login node.

## Step 4: Submit a batch job

The batch script is nearly identical to the C version. Load `openmpi` and
`uv`, then use `uv run` so the correct project environment is activated
automatically:

{{ sbatch_template(
    job_name="mpi4py_hello",
    partition="cpu",
    time="00:05:00",
    nodes=2,
    ntasks_per_node=4,
    mem_per_cpu="2G",
    modules=["openmpi/5.0.3", "uv"],
    commands="export OMP_NUM_THREADS=1\nmpirun uv run python hello_mpi.py"
) }}

Key points about this script:

- **`--partition=cpu`** submits to the general-access CPU partition (48-hour max).
- **`--mem-per-cpu=2G`** requests 2 GB per core. For MPI jobs this scales
  automatically with the number of ranks, so you don't have to recalculate
  total memory when changing the task count.
- **`OMP_NUM_THREADS=1`** prevents libraries like NumPy (which often link
  against threaded BLAS/LAPACK) from spawning extra threads that compete
  with your MPI ranks for cores. Always set this for pure-MPI jobs.
- **`mpirun`** reads the task count from Slurm and launches ranks on the
  right nodes automatically. No extra flags needed. You can also use
  `srun uv run python hello_mpi.py` instead; `srun` is Slurm-native
  and works the same way.

!!! tip "Faster scheduling for short test runs"
    For quick MPI tests under 2 hours, submit to `cpu-preempt` instead.
    Preempt partitions have access to more hardware, so your job may start
    faster. The tradeoff: your job can be killed after 2 hours if a priority
    user needs the node.

Submit it:

```bash
sbatch mpi4py_hello.sh
```

## Understanding the output

After the job completes:

```bash
cat mpi4py_hello_<jobid>.out
```

```
Hello from rank 4 of 8 on node017
Hello from rank 0 of 8 on node042
Hello from rank 6 of 8 on node017
Hello from rank 2 of 8 on node042
Hello from rank 7 of 8 on node017
Hello from rank 1 of 8 on node042
Hello from rank 5 of 8 on node017
Hello from rank 3 of 8 on node042
```

Two hostnames confirm the ranks really are spread across two separate
machines. The scrambled order is expected because MPI processes run
independently and `print` doesn't synchronize across ranks.

## Scaling up: InfiniBand and the `mpi` partition

For real mpi4py workloads that exchange data frequently between ranks,
network latency matters. {{ cluster.name }} has a dedicated **`mpi` partition**
with InfiniBand-connected nodes (64 cores, 250 GB each, 2-day time limit).

```bash
#SBATCH --partition=mpi
#SBATCH --constraint=ib
```

You can also add `--constraint=ib` to the `cpu` partition if you need
InfiniBand without switching partitions.

!!! tip "Consistent CPU architecture with `--constraint=mpi`"
    If you use `--ntasks` without specifying `--nodes`, add `--constraint=mpi` to ensure all tasks land on nodes with the same CPU model. This prevents subtle performance differences from mixed architectures.

## Going further: point-to-point communication

The hello-world pattern above is embarrassingly parallel: Every rank does
the same thing with no coordination. Real distributed programs need ranks
to exchange data. Here's the simplest example, where rank 0 sends a message to
rank 1:

```python
from mpi4py import MPI

comm = MPI.COMM_WORLD
rank = comm.Get_rank()

if rank == 0:
    data = {"greeting": "hello", "from": rank}
    comm.send(data, dest=1, tag=42)   # (1)!
    print("Rank 0: sent message")
elif rank == 1:
    data = comm.recv(source=0, tag=42)  # (2)!
    print(f"Rank 1: received {data}")
```

1. `comm.send` serialises any Python object with pickle and sends it to
   the destination rank.  `tag` is an integer label that lets the receiver
   match the right message when multiple sends are in flight.
2. `comm.recv` blocks until a matching message arrives.  The call returns
   the deserialised Python object.

!!! tip "Lower-case vs. upper-case methods"
    mpi4py has two sets of communication methods:

    - **Lower-case** (`send`, `recv`, `bcast`, …): accept any Python object,
      use pickle, convenient for prototyping.
    - **Upper-case** (`Send`, `Recv`, `Bcast`, …): accept NumPy arrays and
      buffer-like objects directly, skip pickle, much faster for large data.

    Use upper-case methods whenever you're moving numerical arrays between
    ranks! They avoid serialization overhead and perform comparably to
    hand-written C MPI.

## Common pitfalls

??? failure "`ImportError: No module named 'mpi4py'`"
    mpi4py is not in your uv project.  From inside the project directory,
    run `module load openmpi/5.0.3 uv && uv add mpi4py`, then retry.  Make sure
    you're running via `uv run` so the project environment is active.

??? failure "mpi4py was built against a different MPI"
    If you see errors like `PMIX ERROR` or `Open RTE was unable to find any
    relevant information` at launch, mpi4py was compiled against a different
    Open MPI version than the one loaded at runtime.  Remove and reinstall:
    `uv remove mpi4py && module load openmpi/5.0.3 && uv add mpi4py`.

??? failure "All ranks landed on one node"
    You probably forgot `--nodes` in the batch script.  Without it, Slurm
    packs all tasks onto a single node.  Set both `--nodes` and
    `--ntasks-per-node` explicitly, just as you would for a C MPI job.

??? failure "`mpirun` not found"
    You forgot `module load openmpi/5.0.3`.  Add it to your batch script above
    the `mpirun` line.

??? failure "`uv` not found in the batch job"
    You forgot `module load uv`.  Add it alongside `module load openmpi/5.0.3` in
    your batch script.
