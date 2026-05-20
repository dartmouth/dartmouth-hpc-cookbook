---
Title: Overview of threads, cores, and sockets in Slurm for HPC workflows
blurb: >
    An overview of threads, cores, and sockets in Slurm for HPC workflows.
---
# Overview of threads, cores, and sockets in Slurm for HPC workflows

This page clarifies key concepts of threads, cores, sockets, and processes in high-performance computing (HPC) and how they interact with [Slurm]({{< relref jobs >}}), the job scheduler used on Unity. These concepts can often be a source of confusion due to Slurm’s inconsistent terminology.

We’ll provide an overview of standard HPC terminology, Slurm's historical focus on MPI workloads, and how Slurm’s resource allocation flags align with modern parallel computing practices. This overview will help you optimize your Slurm job submissions, whether you're running simple or hybrid parallel jobs.

## Slurm’s historical focus on MPI workloads
It helps to have some background context of Slurm's history and that of the HPC landscape in general.

When Slurm first released in 2002, HPC was mainly used by fields like geophysics and computational chemistry, which have massively **parallel simulation work**. These fields largely relied on running tightly-connected parallel simulations and communication across multiple nodes. The majority of these simulations used the **Message Passing Interface (MPI)** for communication between tasks.

{{< callout tip "What's the Message Passing Interface (MPI)?" >}} MPI is a standardized and portable library used for communication between different tasks in a parallel computing environment, typically across multiple nodes in an HPC system.{{< /callout >}}

MPI follows a **task-based parallelization paradigm**. A task-based parallelization paradigm means that when you run an MPI program for *n* tasks, you're launching *n* independent copies of the program that are collected into the communication "world" and assigned a number ("rank," in MPI terminology) to govern which task communicates with which other tasks.

For that reason, Slurm was developed with MPI workloads in mind. The main problem to solve at the time was how to launch these MPI tasks on separate servers and facilitate the communication between them. To the MPI, it matters very little whether *task A* or *task B* are on the same node or not. The MPI just needs to know where to look and what protocol to use to send the data.

## What does this mean for Slurm now?
Since the task-based parallelization paradigm was the prevailing paradigm during Slurm's development, tasks are Slurm's main unit of work. The flag `-n` refers to tasks, which default to one CPU core each (more on that in a minute). In an MPI program, you use `-n` to specify the total number of tasks you want to start up. Then, in the batch script, you invoke `n` copies of your MPI program with `srun`, which Slurm knows how to start up on the appropriate node using the appropriate resources.

MPI is fantastic, but it has a critical weakness (though weakness is debatable, it's simply a feature of the parallelization method). By default, each MPI task manages its own memory without the ability to access the memory of other tasks within the same communication world. So, if *task A* needs to tell *task B* something, *task A* needs to explicitly send it to *task B*. *Task B* can't just look at *task A*'s memory and retrieve it itself. (**Note**: this is now an oversimplification - MPI-3 standard has tools for true shared memory models. However, distributed memory is still the default).

## Introduction to OpenMP
Around the same time as MPI development, OpenMP emerged in the 90s as a method to standardize parallelization.

{{< callout note "OpenMP vs. OpenMPI" >}} OpenMP is sometimes confused with OpenMPI, an MPI implementation, but they're distinct things. {{< /callout >}}

Unlike MPI, OpenMP operates by default with **shared memory**. Each OpenMP thread has access to the same memory and can read or write to it when necessary. This has some major advantages:
1. There's no need for threads to send or wait to receive information from other threads.
2. There's a lot less data duplication overall, generally resulting in a lower memory footprint.

However, this doesn't work when *multiple servers* need to work together to solve a problem. If there is a problem so complex that it needs the computing power of multiple servers working together, the shared memory model used by OpenMP becomes insufficient because OpenMP relies on a single shared memory space that works well within only one server.

## The best of both worlds: hybrid parallelization programming
Computational scientists developed methods like **hybrid parallelization programming** to leverage the best of both worlds: MPI and OpenMP working together.

In this method, MPI serves as the top layer of parallelization method to ensure the workload can scale between servers. Then, each task uses OpenMP within itself to leverage multiple cores for local computation. So, if you have a node of 16 cores, you could now use 4 MPI tasks which each use 4 OpenMP threads.

Slurm incorporated this paradigm by separating the concept of the task from cores. The flag that is used to set “cores per task” is actually `--cpus-per-task=X`​, which causes confusion since it's not using the standard definition of a CPU.

{{< callout tip "--cpus-per-task=X means CPU **cores**, not CPUs" >}} In Slurm, "CPUs" in this context actually refers to CPU **cores**, not physical CPUs, which can sometimes be confusing. {{< /callout >}}

## Standard terminology
So, what is standard terminology then? Here's the terminology that tends to be largely agreed upon (from smallest to largest unit):

**Threads:**
More of a software concept than hardware. A thread is essentially just **executing a sequence of instructions**.

A multithreaded program can, in theory, execute in parallel. However, if your hardware does not have the capability to actually run these threads in parallel, the operating system (OS) will manage which thread actually gets to execute when, and a thread may not execute start to finish on one hardware core and will move around as the OS determines. Switching between threads has overhead, so if you have too many threads and they're all pretty active, your OS will have to swap between them a bunch and will degrade performance overall. This is confused a bit by Intel's concept of hyperthreading, where they claim to be able to run multiple threads on one core, which is turned off across the board on Unity since it doesn't generally work well for HPC.

**Process:**
Also a software concept and, loosely, a **collection of one or more threads**.

**Core:**
A core is **a part of a CPU that can execute a thread independently**.

So, a 16 core CPU can, in theory, execute 16 simultaneous threads. Note that performance scaling is murkier - throwing 16 cores at a problem will rarely scale linearly since memory access and communication between processes/tasks/threads adds up.

**CPU (hardware) socket:**
Hardware sockets, loosely, can be thought of as **how many CPUs a server can seat**.

Sockets can matter a lot for certain types of computation. Loading data onto, seeking the correct position, and reading data from memory all takes time, which adds up if you're doing a lot of those operations during computation.

On non-uniform memory access (NUMA) nodes, the most common type of design on Unity, the RAM on the server has locality to a certain socket. So, accessing RAM from a task on a socket that does not have locality to that RAM will be slower than if the RAM and the task are on the same socket. Sockets are more or less synonymous with CPUs nowadays.

## Slurm flags
Now that that's sorted out, let's see how this matches up with Slurm flags. There are many Slurm settings for tweaking what resources you're allocated, but the following flags are the most critical ones for CPU parallel programs, and are sufficient for most users.

`--sockets-per-node`​: This selects nodes with a certain number of sockets or greater. The majority of nodes in Unity have two sockets (but not all! The ARM architecture nodes may have one socket only, as is typical for ARM systems).

`--cores-per-socket`​: This is essentially cores per CPU. For example, cpu050​ has two sockets, each containing a 64 core AMD EYPC 7763. So, setting `--cores-per-socket=64`​ could select cpu050​ or anything with a higher core count on the individual sockets.

`--threads-per-core`​: Setting this to anything but 1 on Unity will just result in your job not being scheduled (except for on the power9 nodes). Threads per core is something that's set in the slurm config file and we don’t have any x86_64 nodes that will support hyperthreading.

The above three settings are about node selection, but more or less don't affect the resources your job is allocated once a node is selected.

For that, we have:

`--nodes, -N`​: The number of nodes requested. This is frequently used to confine tasks to a certain number of nodes, or else slurm will distribute tasks however it can fit them in fastest. Also frequently used with `--exclusive`​, which will allocate all resources on the selected node to the job.

`--ntasks, -n`​: Sets the number of tasks. This is usually meant for MPI tasks, but there are ways to leverage multiple tasks outside of the MPI paradigm. However, it's not typical. Tasks can be allocated on different nodes. Defaults to 1 per node. If not also specifying a number of nodes and using MPI, also specify `--constraint=mpi` to ensure a consistent CPU type, which is important for performance.

`--cpus-per-task, -c`​: sets the number of cores allocated to a task. So, if you set `--ntasks=3`​ and `--cpus-per-task=4`​, your job will require 12 cores total.

{{< callout note "Remember!" >}} In Slurm, `--cpus-per-task` refers to CPU cores, not physical CPUs. This distinction is important when configuring your job. It's also important to know that this flag never breaks cores across nodes within one task, so one task will always have all its cores on one node. {{< /callout >}}
