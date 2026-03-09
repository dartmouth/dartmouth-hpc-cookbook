---
title: "Storage Fundamentals"
description: "Understanding the different types of storage on an HPC cluster and when to use each one"
tags:
  - fundamentals
  - concepts
  - storage
---

# Storage Fundamentals

When you work on your laptop, you have one hard drive that holds everything: your operating system, your documents, your datasets, and your results. HPC clusters are different. They typically offer **multiple storage tiers**, each designed for a different purpose. Using the right tier at the right time can dramatically improve your job performance and help you avoid common pitfalls like running out of space mid-job or bottlenecking on slow I/O.

## Why Storage Tiers Matter

HPC workloads generate and consume data at scales that a single file system can't efficiently handle. A genomics pipeline might need to read terabytes of sequencing data, write hundreds of intermediate files during processing, and then store a few gigabytes of final results. Each of those stages has different requirements:

- **Reading input data** needs reliable, always-available storage.
- **Writing intermediate files** during a job needs speed — the faster your storage, the less time your CPUs spend waiting on disk.
- **Keeping final results** needs persistence and enough capacity that you're not constantly deleting old work.

That's why clusters separate storage into tiers.

## High-Speed Scratch Storage

**Scratch storage** is designed for speed. It sits on fast disks (often SSDs or parallel file systems like Lustre) and is optimized for the heavy read/write patterns that jobs produce. This is where your jobs should write temporary and intermediate files.

The tradeoff is that scratch storage is **not permanent**. Files on scratch are typically subject to automatic purge policies — if a file hasn't been accessed in a certain number of days, it may be deleted to free space for other users. Scratch is working space, not archival space.

!!! tip "When to use scratch"
    Use scratch for anything your job produces *during* execution: intermediate files, checkpoint files, temporary outputs. Once your job finishes, copy the results you need to longer-term storage.

## Long-Term Storage

Long-term (or **persistent**) storage is where you keep datasets, code, and results that need to stick around. It's typically larger in capacity than scratch but slower to access, since it's optimized for durability and availability rather than raw I/O speed.

This is the right place for:

- Input datasets you'll reuse across multiple jobs
- Final results and publications-ready data
- Code repositories and environments
- Anything you can't afford to lose

!!! tip "When to use long-term storage"
    Keep your important data — input datasets, final results, and anything you'd be upset to lose — on long-term storage. Copy what you need to scratch at the start of a job, and copy results back when the job finishes.

## A Typical Storage Workflow

A common pattern for HPC jobs looks like this:

1. **Before the job** — Your input data lives on long-term storage.
2. **Job starts** — Your job script copies input data from long-term storage to scratch.
3. **Job runs** — All intermediate I/O happens on fast scratch storage.
4. **Job finishes** — Your job script copies results from scratch back to long-term storage.
5. **After the job** — Scratch files are eventually purged; your results are safe on long-term storage.

```mermaid
flowchart LR
    A["Long-Term Storage"] -->|"1. Copy input"| B["Scratch Storage"]
    B -->|"2. Job reads/writes"| C["Compute Nodes"]
    C -->|"3. Job writes results"| B
    B -->|"4. Copy results back"| A
```

This approach gives you the best of both worlds: fast I/O where it matters and safe, persistent storage for everything else.

## Home Directories

Most clusters also give each user a **home directory**. Your home directory is persistent and backed up, but it usually has a small quota (often just a few gigabytes). It's meant for configuration files, scripts, and small personal files — not for large datasets or job I/O.

!!! warning "Don't run jobs from your home directory"
    Home directories are typically on slower storage with tight quotas. Running jobs that do heavy I/O in your home directory can be slow for you and disruptive for other users sharing the same file system.

{% include "site/storage-overview.md" %}

## Key Takeaways

Understanding which storage tier to use is one of the simplest ways to improve your HPC experience. The general rule is straightforward: **use scratch for speed during jobs, and long-term storage for everything you want to keep.** Your home directory is for small personal files and configuration, not for heavy workloads.

## What's Next?

- [**What is HPC?**](../getting-started/what-is-hpc.md) if you haven't read the overview yet
- [**Submit your first job**](../getting-started/first-job.md) to put storage concepts into practice
