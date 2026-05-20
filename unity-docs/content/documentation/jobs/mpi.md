---
title: Message Passing Interface (MPI)
blurb: >
    Explains how to use MPI to run jobs across multiple nodes
icon: work
weight: 50
---

# Use MPI for multi-node job execution
The following guide provides an overview of the message passing interface (MPI) and how to use MPI to run jobs across multiple nodes. See also our discussion on how MPI jobs are mapped to resources in this [Overview]({{< relref "threads-cores-processes-sockets" >}}).

## What is MPI?
The [Message Passing Interface (MPI)](https://en.wikipedia.org/wiki/Message_Passing_Interface) provides a standard way to pass around low level variables between processes within a node or between nodes. Almost all languages have support for it, but it is most frequently used in C/C++ and Fortran code, and to a lesser extent with mpi4py.

## Determine if your software support MPI
When using existing software, review its documentation to see if it supports MPI. If it doesn't mention MPI explicitly, it probably doesn't support it (with few exceptions).

If you are compiling software yourself, look at the options of `./configure --help` or `cmake -LAH` to find MPI related settings. See the [Software Installation Guide]({{< relref "softwarefromscratch" >}}) for more information on how to build software from scratch.

If you are doing ML/AI jobs using `pytorch`, you can use `torchrun` to do a distributed launch, but make sure your code using `torch.distributed` appropriately (see [PyTorch Distributed Overview](https://pytorch.org/tutorials/beginner/dist_overview.html) for more information).

## MPI implementations
Since MPI only defines the interface for passing messages, there are many possible implementations. Among these, there are a few major implementations that are widely used:

* OpenMPI - The most common implementation with an open source license (BSD-3)
* MPICH - Another widely used implementation with a permissive license - many other MPI stacks derive from this
* Intel MPI - Shipped with the Intel Compiler (now branded with Intel oneAPI) - also derived from MPICH
* MVAPICH - Multiple purpose-built implementations

In theory, any MPI program should build against any of these implementations. However, once built against a given implementation, the software must run with the same support libraries. For example, it is not possible to compile against OpenMPI and then run using Intel's MPI implementation. The program generally either crashes or exits quickly with an error when it fails under this condition.

## General compiling instructions
When compiling an MPI program, you may need to specify a different name for the compiler, such as:

| Language | GNU Compiler  | Intel Compiler| GNU MPI | Intel MPI |
| --- | --- | --- | --- | --- |
| C | `cc`/`gcc` | `icc` | `mpicc` | `mpiicc` |
| C++ | `c++`/`g++` | `icpc`/`icx` | `mpic++` | `mpiicpc`/`mpicxx` |
| Fortran | `gfortran` | `ifort`/`ifx` |  `mpif77`/`mpif90`/`mpifort`| `mpiifort`/`mpifc` |

The mechanism for selecting the compiler varies by software.

## General usage instructions
The configuration of an MPI stack varies significantly based the MPI library's compile-time options, so there isn't a one-size-fits-all set of usage instructions. However, the following sections guide you through how to start an MPI program based on some common use cases.

### Shaping your job
When chosing the shape of your job in terms of the number of nodes, cores, tasks, gpus, etc, there are many `sbatch` options that seem similar, but affect how the resources are allocated and how the job runs, and the interactions between them are complex. Here are some common configurations.

{{< callout tip >}}
No matter which options you choose, you should verify your job is scaling the way you intend by checking the job efficiency, or monitoring it during a run. See how to [Monitor a batch job]({{< relref "monitoring" >}}) for details on how.
{{< /callout >}}

#### Single node, single process, single core
This is actually the default configuration if no other resources are requested. This is most common for non-MPI applications.

```bash
#SBATCH --nodes=1 --ntasks=1 --cpus=1
yourprog
```

#### Single node, single process, multiple cores
This configuration works for processes that support threads, or even OpenMP (different from OpenMPI, OpenMP is meant for creating lightweight threads).

```bash
#SBATCH --nodes=1 --ntasks=1 --cpus=8
# If the job supports OpenMP, set this:
export OMP_NUM_THREADS=$SLURM_CPUS_ON_NODE
yourprog
```

You can also request an entire node and scale your job to the size of the node:

```bash
#SBATCH --nodes=1 --ntasks=1 --exclusive --mem=250g
# If the job supports OpenMP, but running one procress, set this:
export OMP_NUM_THREADS=$SLURM_CPUS_ON_NODE
# See if your program has a way to specify threads:
yourprog --threads $SLURM_CPUS_ON_NODE
```

Despite the name, `SLURM_CPUS_ON_NODE` scales to the number of cores your job is allocated on the node, not the number of physical cores the node has.

Note that while `--mem=0` gives the job all memory on a node, it doesn't let you sepcify a minimum, so it's not recommended. See the [node list]({{< relref "nodes" >}}), [cpu summary]({{< relref "cpu_summary" >}}) and [gpu summary]({{< relref "gpu_summary" >}}) pages for memory per node or core information.

#### Single node, multiple processes
For programs that support MPI, usually they run as mutliple processes. Sometimes they support "hybrid" mode which means they can run both multiple processes and mulitiple threads per process. See your software's documentation for how to find the correct balance.

```bash
#SBATCH --nodes=1 --ntasks=10 --exclusive --mem=250g
# If the application supports OpenMP, use 1 thread only
# unless also using --cpus-per-task, # in which case use
# OMP_NUM_THREADS=$SLURM_CPUS_PER_TASK
export OMP_NUM_THREADS=1
mpirun yourprog
```

See below for guidance on `srun`, `mpirun` and `mpiexec`, but note that you must use one of these to launch multiple processes on the same node.

#### Multiple nodes, multiple processes
For best performance with well scaling code, it usually best to ask for complete nodes with `--exclusive`. See the [node list]({{< relref "nodes" >}}), [cpu summary]({{< relref "cpu_summary" >}}) and [gpu summary]({{< relref "gpu_summary" >}}) pages for cores per node information, and which partitions they reside in.

```bash
#SBATCH --nodes=4 --ntasks-per-node=64 --exclusive --mem-per-cpu=2g
#SBATCH --constraint=ib # Use this for "tightly coupled" jobs
export OMP_NUM_THREADS=1
mpirun yourprog
```

See below for guidance on `srun`, `mpirun` and `mpiexec`, but note that you must use one of these to launch across mulitple nodes.

#### Unspecified nodes, multiple processes
While it's possible to specify the number of tasks without saying how many nodes to spread across, this can lead to high communications overhead, so isn't recommended for "tightly coupled" jobs like simulations tend to be. Note that these may also benefit from `--constraint=ib` for a low latency network, however the `mpi` constraint itself doesn't imply this. They can be combined with `--constraint=mpi&ib`.

```bash
#SBATCH --ntasks=256 --mem-per-cpu=2g --constraint=mpi
export OMP_NUM_THREADS=1
mpirun yourprog
```

**Key takeaways**

* `--ntasks` (and variants) control how many processes are created. Prefer also specifying `--nodes` with this option.
* `--nodes` controls the maximum number of nodes allocated to the job. If `--ntasks` isn't specified, then `--ntasks-per-node=1` is assumed.
* `--cpus-per-task, -c` maps to threads, not processes. For most MPI jobs this should be `1`, however some software has "hybrid" modes that support more than one (either a finite number like `2-4`, or `--cores-per-socket`, although there is no `SLURM_*` varaible for this number, so you'll have to target a particular CPU type, see [Node Features]({{< relref "documentation/cluster_specs/features/#cpu-model" >}}))

More coverage of these options is available in the [sbatch manpage]({{< slurmlink "sbatch.html#SECTION_OPTIONS" >}}).

### Slurm's `srun`
Slurm provides the `srun` command to start an MPI program (it can also run non-MPI programs if you want extra accounting via `sacct`).
Generally, `srun` doesn't require any extra parameters or environment variables to run; however, be aware that it does inherit its information via the `$SLURM_*` variables that `sbatch` sets. If you use `#SBATCH --export=NONE` in particular, then you may need to do `srun --export=ALL` if your program relies on environment variables being set.

| Option | Description |
| -- | -- |
| `--label` | Prefix each line with the Rank it came from |

### OpenMPI `mpirun` or `mpiexec`
If you are using a Slurm aware OpenMPI (`orte-info | grep plm: slurm` to find out), and `mpirun` is available (some installs insist on `srun`), then running it directly without any parameters should suffice. The more standard `mpiexec` is also available.

OpenMPI has many parameters that affect how it runs. See their [Fine Tuning Guide](https://www.open-mpi.org/faq/?category=tuning) for all the details.

| Option | Description |
| -- | -- |
| `--tag-output` | Prefix each line with the Job and Rank it came from |
| `--timestamp-output` | Prefix lines with the current timestamp |

### MPICH `mpiexec`
 `mpiexec` should not require any parameters.

| Option | Description |
| -- | -- |
| `-prepend-rank` | Prefix each line with the Rank it came from |

### Intel `mpiexec`
 `mpiexec` should not require any parameters.

| Option | Description |
| -- | -- |
| `-prepend-rank` | Prefix each line with the Rank it came from |

It's also possible to use `srun` with Intel MPI; in that case, you should set the following:

```shell
export I_MPI_PMI_LIBRARY=/usr/lib/x86_64-linux-gnu/libpmi2.so
```

## Other variables
Some MPI implementations allow you to use environment variables to control and customize their behavior. Generally, if these MPI variables aren't explicitly set, the libraries will auto-detect the environment. However, there are some edge cases where manually setting these environment variables may be beneficial.

Libfabric based (`fi_info`)
| Variable | Value | Meaning |
| --- | --- | --- |
| FI_PROVIDER | tcp | Use regular communication between nodes; should always work |
| FI_PROVIDER | shm | Only use shared memory; only works with `--nodes=1` |
| FI_PROVIDER | verbs | Use InfiniBand low latency network; only works with `--constraint=ib` |
| FI_PROVIDER | shm,verbs | Separate multiple providers with a comma |

UCX based (`ucx_info`)
| Variable | Value | Meaning |
| --- | --- | --- |
| UCX_TLS | tcp | Use regular communication between nodes; should always work |
| UCX_TLS | shm | Only use shared memory; only works with `--nodes=1` |
| UCX_TLS | cuda | Use CUDA support; only works with `--gpu=<X>` |
| UCX_TLS | rc_x | Use InfiniBand low latency network; only works with `--constraint=ib` |
| UCX_TLS | shm,rc_x | Separate multiple providers with a comma |
