---
title: Fundamentals
description: "Core concepts and skills for working effectively on {{ institution.short_name }}'s HPC cluster"
---

# Fundamentals

This section covers the foundational knowledge you'll need to work confidently on {{ cluster.name }}. If the [Getting Started](../getting-started/what-is-hpc.md) track got you connected and running your first job, Fundamentals is where you build real fluency.

The material is organized into two tracks that you can work through independently:

## :material-console: Navigating the Cluster

Everything you need to operate day-to-day on a Linux-based HPC system — from basic shell commands to moving data in and out of the cluster.

| Page | What you'll learn |
|---|---|
| [Linux Basics](linux-basics.md) | Essential command-line skills: navigating directories, managing files, and reading documentation |
| [Advanced Linux](linux-advanced.md) | Permissions, pipes, redirection, environment variables, and shell configuration |
| [Environment Modules](modules.md) | Finding, loading, and managing software versions on the cluster |
| [Editing Files](editing.md) | Practical use of `nano` and `vi` — the editors available on every cluster node |
| [Storage](storage.md) | The different storage tiers on {{ cluster.name }} and when to use each one |
| [Transferring Data](data-transfer.md) | Moving files between your computer and the cluster with `scp`, `rsync`, and Globus |
| [Job Scheduling](scheduling.md) | How {{ cluster.scheduler }} decides what runs when, and how to request the right resources |
| [GPU Computing](gpu-computing.md) | What GPUs are, when they help, and how to request them for your jobs |

## :material-sitemap: Parallel Programming

Understanding how work gets divided across processors and machines — the conceptual backbone of HPC.

| Page | What you'll learn |
|---|---|
| [Parallel Programming Overview](parallel-programming.md) | The big picture: concurrent, parallel, and distributed paradigms and when each applies |
| [Concurrent Programming](concurrent-programming.md) | Interleaving tasks to exploit idle time in I/O-bound workloads |
| [Parallel Computing](parallel-computing.md) | True simultaneous execution across multiple processors within a single machine |
| [Distributed Computing](distributed-computing.md) | Scaling computation across multiple machines connected by a network |

!!! tip "Not sure where to start?"
    If you're new to Linux, begin with [Linux Basics](linux-basics.md) and work through the **Navigating the Cluster** track in order — each page builds on the previous one. The **Parallel Programming** track is more conceptual and can be read in any order, though starting with the [overview](parallel-programming.md) will give you a helpful mental map.
