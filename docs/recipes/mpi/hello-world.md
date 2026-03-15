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

## Step 1: Load the Open MPI Module

```bash
module load openmpi
```

This makes the `mpicc` compiler wrapper and `mpirun` launcher available.
You need this on both login nodes and in every batch job.

## Step 2: Write the Program

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

## Step 4: Test Interactively

Before submitting a full batch job, it's worth doing a quick sanity check
on the login node:

```bash
mpirun -np 4 ./hello_mpi
```

`-np 4` launches 4 processes. You should see four lines (one per rank)
in no guaranteed order:

```
Hello from rank 2 of 4 on discovery-login1
Hello from rank 0 of 4 on discovery-login1
Hello from rank 3 of 4 on discovery-login1
Hello from rank 1 of 4 on discovery-login1
```

!!! warning "Login nodes are for quick tests only"
    Don't run large jobs on the login node. It's a shared resource used
    by everyone on the cluster. The test above with 4 processes for a
    fraction of a second is fine; running 64 ranks for an hour is not.

## Step 5: Submit a Batch Job

Now let's run across two nodes, with 4 ranks per node (8 total):

{{ sbatch_template(
    job_name="mpi_hello",
    partition="standard",
    time="00:05:00",
    nodes=2,
    ntasks_per_node=4,
    mem="1G",
    modules=["openmpi"],
    commands="mpirun ./hello_mpi"
) }}

A few things worth noting in this script:

- **`--nodes=2`** requests exactly 2 nodes. Slurm will choose which ones.
- **`--ntasks-per-node=4`** tells Slurm to place 4 MPI ranks on each node,
  giving 8 processes in total. This is clearer than `--ntasks=8` alone
  because it makes the per-node layout explicit and guarantees the ranks
  are evenly spread.
- **`--mem=1G`** is the total memory *per node* (not per task). Adjust as
  needed for real workloads.
- **`mpirun`** (without `-np`) reads the task count from Slurm's environment
  and launches the right number of processes on the right nodes. You don't
  need to specify hostnames manually.

Submit the job:

```bash
sbatch mpi_hello.sh
```

## Understanding the Output

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

## Common Pitfalls

??? failure "command not found: mpicc / mpirun"
    You forgot `module load openmpi`. Add it to both your interactive
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
    Set both `--nodes` and `--ntasks` explicitly.

??? failure "Job failed immediately with a process manager error"
    This usually means `mpirun` couldn't contact the processes on the
    remote node. Common causes: (1) you loaded a different version of
    Open MPI at compile time vs. run time. Always use the same module;
    (2) the job's allocated nodes can't reach each other over the cluster
    network (rare, but worth checking with your support team).
