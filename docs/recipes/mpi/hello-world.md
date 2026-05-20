---
title: "MPI Hello World"
description: "Compile and run a simple C MPI program across multiple nodes on {{ cluster.name }}"
tags:
  - mpi
  - c
  - beginner
---

# MPI Hello World

!!! abstract "What we're cooking"
    Write and compile a minimal C program that uses MPI to print a greeting
    from every parallel process, then submit it as a multi-node batch job on
    {{ cluster.name }}.

## What is MPI?

A single compute node has many cores, but they all share the same memory pool.
When a problem is too large to fit in one node's memory, or when you want
to use hundreds of cores at once, you need a different approach: **distributed
memory parallelism**.

MPI (Message Passing Interface) is the standard for writing programs that
run as many simultaneous processes spread across multiple nodes, communicating
by sending messages over the network. Each process has its own private memory;
if it needs data from another process, it has to explicitly ask for it.

!!! tip "New to parallel programming?"
    If concepts like distributed memory, message passing, and processes vs. threads are unfamiliar, read the [Distributed Computing fundamentals](../../fundamentals/distributed-computing.md) article first. It explains *why* this model exists and when to use it. This recipe focuses on the *how*.

**Open MPI** is the most widely used implementation of the MPI standard and
the one available on {{ cluster.name }}.

!!! tip "MPI vs. threading"
    Threading (e.g., OpenMP) parallelises work *within* a single node by
    sharing memory between threads. MPI parallelises work *across* nodes by
    passing messages between processes. Real HPC programs often combine both:
    one MPI process per node, multiple threads per process.

Every MPI program revolves around a few key ideas:

| Concept | Meaning |
|---|---|
| **Rank** | Each process gets a unique integer ID starting at 0 |
| **Size** | Total number of processes in the job |
| **Communicator** | A group of processes that can talk to each other (`MPI_COMM_WORLD` means all of them) |

A rank-0 process is conventionally used as the "root" for coordination, but
all ranks run the same executable.

## Step 1: Load the Open MPI module

```bash
module load openmpi/5.0.3
```

This makes the `mpicc` compiler wrapper and `mpirun` launcher available.
You need this on both login nodes and in every batch job.

!!! note "Available Open MPI versions"
    {{ cluster.name }} provides several Open MPI versions: `openmpi/4.1.6` and `openmpi/5.0.3`, plus CUDA-enabled variants (`openmpi/5.0.3-cuda12.6`). You must specify a version; bare `module load openmpi` will not work. Use `module avail openmpi` to see what's currently installed.

## Step 2: Write the program

Create a file called `hello_mpi.c`:

```c
#include <stdio.h>
#include <unistd.h>
#include <mpi.h>   // (1)!


int main(int argc, char *argv[]) {
    MPI_Init(&argc, &argv);  // (2)!

    int rank, size;
    MPI_Comm_rank(MPI_COMM_WORLD, &rank);  // (3)!
    MPI_Comm_size(MPI_COMM_WORLD, &size);  // (4)!

    char hostname[256];
    gethostname(hostname, sizeof(hostname));  // (5)!

    printf("Hello from rank %d of %d on %s\n", rank, size, hostname);

    MPI_Finalize();  // (6)!
    return 0;
}
```

1. The MPI header. `mpicc` knows where to find it, so no manual include
   path is needed.
2. Every MPI program must call `MPI_Init` first. It sets up the runtime,
   establishes communication channels between all processes, and assigns
   each one its rank.
3. Ask the runtime: *what is my rank?* Each process gets a different
   answer: 0, 1, 2, … up to size−1.
4. Ask the runtime: *how many processes are there in total?* Every process
   gets the same answer.
5. `gethostname` comes from `<unistd.h>`. It
   lets us see *which node* each rank landed on.
6. Every MPI program must call `MPI_Finalize` before exiting. It shuts down
   the MPI runtime cleanly. Forgetting it can leave zombie processes or
   corrupt job accounting.

## Step 3: Compile

`mpicc` is a thin wrapper around `gcc` that automatically adds the
include paths and linker flags MPI requires:

```bash
mpicc -o hello_mpi hello_mpi.c
```

You'll get an executable called `hello_mpi`. There's nothing special about
this binary. `mpicc` produces a normal ELF executable; the MPI runtime
is just a library linked into it.

## Step 4: Test interactively

Before submitting a full batch job, it's worth doing a quick sanity check
on the login node:

```bash
mpirun -np 4 ./hello_mpi
```

`-np 4` launches 4 processes. You should see four lines (one per rank)
in no guaranteed order:

```
Hello from rank 2 of 4 on login1
Hello from rank 0 of 4 on login1
Hello from rank 3 of 4 on login1
Hello from rank 1 of 4 on login1
```

!!! warning "Login nodes are for quick tests only"
    Don't run large jobs on the login node. It's a shared resource used
    by everyone on the cluster. The test above with 4 processes for a
    fraction of a second is fine; running 64 ranks for an hour is not.

## Step 5: Submit a batch job

Now let's run across two nodes, with 4 ranks per node (8 total):

{{ sbatch_template(
    job_name="mpi_hello",
    partition="cpu",
    time="00:05:00",
    nodes=2,
    ntasks_per_node=4,
    mem_per_cpu="2G",
    modules=["openmpi/5.0.3"],
    commands="export OMP_NUM_THREADS=1\nmpirun ./hello_mpi"
) }}

A few things worth noting in this script:

- **`--partition=cpu`** submits to the general-access CPU partition (48-hour max).
- **`--nodes=2`** requests exactly 2 nodes. Slurm will choose which ones.
- **`--ntasks-per-node=4`** tells Slurm to place 4 MPI ranks on each node,
  giving 8 processes in total. This is clearer than `--ntasks=8` alone
  because it makes the per-node layout explicit and guarantees the ranks
  are evenly spread.
- **`--mem-per-cpu=2G`** requests 2 GB of memory per core. For MPI jobs this
  is more natural than `--mem` (total per node), because the memory scales
  automatically if you change the number of ranks.
- **`OMP_NUM_THREADS=1`** prevents libraries linked with OpenMP support (common
  in scientific computing) from spawning extra threads that compete with your
  MPI ranks for cores. Always set this for pure-MPI jobs.
- **`mpirun`** (without `-np`) reads the task count from Slurm's environment
  and launches the right number of processes on the right nodes. No hostnames
  or extra flags needed. You can also use `srun ./hello_mpi` instead;
  `srun` is Slurm-native and works the same way. `mpirun` is the more
  portable choice if you run the same script on other clusters.

!!! tip "Faster scheduling for short test runs"
    For quick MPI tests under 2 hours, submit to `cpu-preempt` instead.
    Preempt partitions have access to more hardware (idle nodes owned by
    other groups), so your job may start faster. The tradeoff: your job
    can be killed after 2 hours if a priority user needs the node.

Submit the job:

```bash
sbatch mpi_hello.sh
```

## Understanding the output

After the job completes, read the output file:

```bash
cat mpi_hello_<jobid>.out
```

You'll see something like:

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

Notice two things:

1. **Two different hostnames**: Ranks are genuinely spread across two
   separate physical machines.
2. **The order is non-deterministic**: Different runs may print lines in
   a different sequence. This is normal. MPI processes run independently;
   `printf` does not synchronise across ranks. Real programs coordinate
   output (or avoid printing from every rank) to avoid this.

## Scaling up: InfiniBand and the `mpi` partition

The hello-world example above runs fine on any two nodes. For real MPI
workloads that exchange messages frequently (simulations, iterative solvers,
domain decomposition), network latency matters.

{{ cluster.name }} has a dedicated **`mpi` partition** with InfiniBand-connected
nodes, purpose-built for tightly coupled multi-node jobs. These nodes have 64
cores and 250 GB of memory each, with a 2-day time limit.

To target this partition and request the InfiniBand interconnect:

```bash
#SBATCH --partition=mpi
#SBATCH --constraint=ib
```

If you don't need the `mpi` partition specifically but still want low-latency
networking on the `cpu` partition, you can add `--constraint=ib` there too.

!!! tip "Consistent CPU architecture with `--constraint=mpi`"
    If you use `--ntasks` without specifying `--nodes` (letting Slurm scatter ranks across any available nodes), add `--constraint=mpi` to ensure all tasks land on nodes with the same CPU model. Mixed architectures can cause subtle performance differences or, in rare cases, crashes with optimized binaries.

## Common pitfalls

??? failure "command not found: mpicc / mpirun"
    You forgot `module load openmpi/5.0.3`. Add it to both your interactive
    session and your batch script.

??? failure "Compiled with `gcc` instead of `mpicc`"
    If you compiled with plain `gcc hello_mpi.c`, the MPI header won't be
    found and you'll get `fatal error: mpi.h: No such file or directory`.
    Always use `mpicc`! It's a wrapper that adds the right flags
    automatically.

??? failure "All ranks landed on one node"
    If your output shows only one hostname, you probably forgot `--nodes`
    in your job script. Without it, Slurm is free to pack all tasks onto a
    single node (which it often prefers, since it avoids network traffic).
    Set both `--nodes` and `--ntasks-per-node` explicitly.

??? failure "Job failed immediately with a process manager error"
    This usually means `mpirun` couldn't contact the processes on the
    remote node. Common causes:

    1. **Mismatched Open MPI version**: You loaded a different version of
       `openmpi` at compile time vs. run time. Always use the same module
       for both. Check with `module list`.
    2. **Mismatched MPI implementation**: If you compiled against Open MPI
       but try to run with Intel MPI (or vice versa), the program will crash.
       An MPI binary is tied to the implementation it was built with.
    3. **Network issue**: The allocated nodes can't reach each other (rare,
       but worth checking with the {{ institution.support_team }} team).
