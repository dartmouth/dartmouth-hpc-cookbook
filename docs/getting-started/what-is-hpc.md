---
title: What is HPC?
description: "An introduction to High-Performance Computing and {{ institution.short_name }}'s HPC systems"
tags:
  - getting-started
  - concepts
---

# What is HPC?

**High-Performance Computing (HPC)** is the practice of aggregating computing power to deliver much higher performance than a typical desktop or laptop can offer. Researchers use HPC to tackle problems that are too large, too slow, or too complex for a single machine. Things like simulating climate models, analyzing genomic data, or training machine learning models are all typical HPC workloads.

If you've ever found yourself waiting hours (or days) for code to finish on your laptop, HPC is likely the solution.

## Why Not Just Use a Faster Laptop?

Even the most powerful laptop has hard limits: a fixed number of CPU cores, a ceiling on memory, and limited storage. HPC systems let you go beyond these limits by connecting many machines together so they can work on a problem collaboratively.

There are two key architectural models to understand:

**Shared memory** is what you're used to. Your laptop has one pool of memory that all its CPU cores can access directly. This is simple and fast, but it doesn't scale beyond a single machine.

**Distributed memory** is the model used by clusters of computers working collaboratively. Many individual machines (called **compute nodes**) each have their own private memory. They communicate over a high-speed network, coordinating to solve problems that no single machine could handle alone. This is what makes it possible to run a computation across hundreds or even thousands of processors simultaneously.

!!! note

    We can still leverage shared memory within an individual node in the cluster to allow all of that node's CPUs to work together. Only once we want to scale out across multiple nodes is when we are required to use a distributed memory programming model.



```mermaid
graph LR
    subgraph "Your Laptop (Shared Memory)"
        CPU1[Core 1] --> RAM[Shared RAM]
        CPU2[Core 2] --> RAM
        CPU3[Core 3] --> RAM
        CPU4[Core 4] --> RAM
    end
```

```mermaid
graph TB
    subgraph "HPC Cluster (Distributed Memory)"
        direction TB
        subgraph Node1["Node 1"]
            C1[CPUs] --- M1[Memory]
        end
        subgraph Node2["Node 2"]
            C2[CPUs] --- M2[Memory]
        end
        subgraph Node3["Node 3"]
            C3[CPUs] --- M3[Memory]
        end
        Node1 <-->|"High-Speed Network"| Node2
        Node2 <-->|"High-Speed Network"| Node3
        Node1 <-->|"High-Speed Network"| Node3
    end
```

## Storage: Where Your Data Lives

Beyond raw computing power, HPC workloads also depend on **storage**. Most clusters provide at least two tiers: **high-speed scratch storage** that compute nodes can read and write quickly during a job, and **long-term storage** for datasets and results that need to persist between jobs but don't require the same speed. Choosing the right storage tier for each stage of your workflow can make a big difference in both performance and cost. We cover this in detail in the [Storage Fundamentals](../fundamentals/storage.md) article.



{% include "site/systems-overview.md" %}

## How You Interact with an HPC Cluster

On your own computer, you simply start a program and it runs immediately using as many resources as it needs until it hits the system's limits.

Using an HPC cluster is different from using your personal computer. Here's the typical workflow:

1. **Connect** — You log in to the cluster's **login node** over SSH from your own computer.
2. **Prepare** — On the login node, you write scripts, transfer data, and set up your environment.
3. **Submit** — You submit a **job** to the scheduler, describing what you want to run and what resources it needs.
4. **Wait** — The scheduler finds available resources and runs your job. You don't need to stay connected.
5. **Collect results** — When the job finishes, you retrieve the output files.

```mermaid
flowchart LR
    A["Your Computer"] -->|SSH| B["Login Node"]
    B -->|"sbatch job.sh"| C["Scheduler"]
    C --> D["Compute Nodes"]
    D -->|results| B
```

!!! warning "The login node is shared"
    When you connect to {{ cluster.name }}, you land on the **login node** — a shared gateway used by all users. It's appropriate for lightweight tasks like editing files, submitting or monitoring jobs. **Do not run computationally intensive work on the login node.** Doing so can degrade performance for everyone. Use the scheduler to submit real work to the compute nodes.

## Key Terminology

New to HPC? Hover over technical terms to see a (hopefully) helpful definition. Check the [glossary](../reference/glossary.md) for the full list of terms like nodes, jobs, partitions, and more that you'll encounter throughout this cookbook.

## What's Next?

Now that you have a sense of what HPC is and how {{ institution.short_name }}'s systems are organized, it's time to get hands-on:

- [**Request an account**](account.md) for our HPC systems
- [**Connect to our HPC systems**](connecting.md) via SSH
- [**Submit your first job**](first-job.md) with {{ cluster.scheduler }}
