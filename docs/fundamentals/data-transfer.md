---
title: "Transferring Data"
description: "How to move files between your computer and {{ cluster.name }} using scp, rsync, and Globus"
tags:
  - fundamentals
  - storage
  - data
---

# Transferring Data

Before you can run any job on {{ cluster.name }}, your data needs to be there. Your laptop and the cluster are completely separate machines — files on one don't automatically appear on the other. This page covers the tools you'll use to move data between your local machine and the cluster, and when to reach for each one.

## The Two Filesystems

Your laptop has one filesystem. {{ cluster.name }} has another. They have no automatic connection. Unlike cloud storage services (Google Drive, Dropbox, OneDrive), which continuously sync changes between your devices and their servers, there is no background process keeping these two in sync. You have to explicitly push files to the cluster or pull them back.

This is important to internalize because it changes how you plan your work. Before a job starts, you need to make sure your input data is already on the cluster. After a job finishes, you need to actively retrieve results before scratch storage is purged.

!!! info "Storage on the cluster"
    The cluster has multiple storage tiers — home directories, scratch storage, and long-term shared storage. Understanding what each tier is for will help you decide where to put files after you transfer them. See [Storage Fundamentals](storage.md) for details.

## `scp` — Copying Individual Files

`scp` (secure copy) is the simplest transfer tool. It works like `cp`, but one side of the copy can be a remote machine. You'll authenticate the same way you connect via SSH — with your NetID credentials.

Replace `netid` in the examples below with your actual Dartmouth NetID.

### Copy a file *to* the cluster

```bash
scp myfile.txt netid@{{ cluster.login_node }}:~/
```

This copies `myfile.txt` from your current directory on your laptop to your home directory (`~/`) on the cluster.

### Copy a file *from* the cluster

```bash
scp netid@{{ cluster.login_node }}:~/results/output.csv ./
```

This pulls `output.csv` from the `results/` directory in your cluster home directory into your current local directory.

### Copy a directory

```bash
scp -r mydir/ netid@{{ cluster.login_node }}:~/
```

The `-r` flag copies recursively, transferring `mydir/` and all its contents.

!!! tip "When `scp` is the right choice"
    `scp` is great for quick, one-off transfers of a single file or small directory. Its simplicity is its strength. However, `scp` has no concept of resuming — if a transfer is interrupted halfway through a large file, you have to start over from scratch. For anything larger or more complex, use `rsync` instead.

## `rsync` — Efficient Incremental Transfers (Recommended)

`rsync` is the workhorse for data transfer on HPC clusters. Rather than blindly copying everything every time, rsync first compares the source and destination, then only transfers files that have changed or are missing. This makes it dramatically faster for follow-up syncs, and it can resume interrupted transfers without re-sending data that already made it across.

These properties make rsync the right default choice for most HPC workflows.

### Sync a local directory to the cluster

```bash
rsync -avz myproject/ netid@{{ cluster.login_node }}:~/myproject/
```

### Sync results back from the cluster

```bash
rsync -avz netid@{{ cluster.login_node }}:~/results/ ./results/
```

### What the flags mean

- **`-a`** — Archive mode. Preserves permissions, timestamps, symbolic links, and recursively copies directories. You almost always want this.
- **`-v`** — Verbose. Prints the name of each file as it's transferred, so you can see progress.
- **`-z`** — Compress data during transfer. Reduces bandwidth usage, which can meaningfully speed up transfers of text-heavy files like logs, CSVs, or source code.

!!! tip "The trailing slash matters"
    This is the most common rsync confusion. `myproject/` (with trailing slash) means "sync the *contents* of myproject into the destination." `myproject` (no trailing slash) means "sync the *directory itself* into the destination," which creates a `myproject/myproject/` nesting on the other end. When in doubt, use the trailing slash.

!!! info "Dry-run before you sync"
    You can add `--dry-run` (or `-n`) to see exactly what rsync *would* transfer, without actually moving any files. This is useful when syncing large directories to avoid surprises.

    ```bash
    rsync -avzn myproject/ netid@{{ cluster.login_node }}:~/myproject/
    ```

## Globus — For Large Datasets

For multi-gigabyte or multi-terabyte datasets, command-line tools like `scp` and `rsync` have limitations: they require your laptop to stay connected for the entire transfer, and a dropped network connection can interrupt or corrupt the transfer. Globus solves both problems.

Globus is a managed file transfer service designed for research data. It runs as a background service — you initiate a transfer through a web interface, and Globus handles the rest. It automatically retries on failure, resumes after interruptions, and sends you an email when the transfer completes. You don't have to stay connected or babysit the process.

**Reach for Globus when:**

- Your dataset is over ~1 GB
- You need the transfer to run unattended overnight or over a weekend
- Network reliability between your location and the cluster is a concern
- You're moving data between two HPC systems (not just laptop to cluster)

{{ institution.short_name }} maintains a Globus endpoint for {{ cluster.name }}. Setting it up requires installing the Globus Connect Personal client on your laptop. For setup instructions and the endpoint name, visit the [{{ institution.short_name }} Research Computing support site]({{ institution.support_url }}).

!!! note "Globus for shared data"
    Globus also makes it easy to share datasets with collaborators at other institutions — they don't need an account at Dartmouth, just a Globus account (free). This is particularly useful for sharing large genomics datasets or simulation outputs.

## A Typical Job Data Workflow

Now that you know the tools, here's how they fit into a real job. The key insight from [Storage Fundamentals](storage.md) is that you should keep data on long-term storage, stage it to scratch for job execution, and retrieve results when you're done.

1. **Transfer input data to the cluster** — Use `rsync` or Globus to copy your dataset from your laptop (or external source) to long-term storage on the cluster.
2. **Stage to scratch before the job** — In your job script, copy input data from long-term storage to scratch (`{{ storage.scratch_path }}/`). Fast scratch I/O keeps your job from bottlenecking on disk.
3. **Run the job** — Your job reads from scratch and writes results to scratch.
4. **Copy results back** — After the job finishes, copy results from scratch to long-term storage (still on the cluster, so you don't lose them to purge), then transfer what you need back to your laptop with `rsync`.

```mermaid
flowchart LR
    A["Your Laptop"] -->|"rsync / Globus"| B["Long-Term Storage\n(DartFS)"]
    B -->|"cp in job script"| C["Scratch\n(fast I/O)"]
    C -->|"Job reads & writes"| C
    C -->|"cp in job script"| B
    B -->|"rsync / Globus"| A
```

!!! tip "Don't skip the staging step"
    It's tempting to point your job directly at long-term storage and skip staging to scratch. For small datasets, this works fine. For large datasets with heavy I/O, it's significantly slower and can impact other users sharing the same storage system.

## Best Practices

### Do this

!!! tip "Use `rsync` for most transfers"
    For anything larger than a handful of files, `rsync` is faster and more reliable than `scp`. Its incremental sync means follow-up transfers (after you've modified a few files) are nearly instant.

!!! tip "Use Globus for large datasets"
    If your dataset is over ~1 GB, or you want a transfer to run while you're offline, Globus is the right tool. It's reliable, resumable, and provides a progress dashboard.

!!! tip "Verify critical transfers with checksums"
    For data where integrity matters — sequencing data, archival datasets, anything you'd be upset to discover was corrupted — verify the transfer with `md5sum`:

    ```bash
    # On the source (your laptop)
    md5sum mydata.tar.gz

    # On the destination (the cluster)
    md5sum ~/mydata.tar.gz
    ```

    The two hashes should match. If they don't, re-transfer the file.

### Avoid this

!!! warning "Don't transfer thousands of tiny files"
    Every file transfer has network overhead — connection setup, metadata exchange, acknowledgements. Transferring 50,000 small files takes much longer than transferring one archive of the same total size. If you have a directory full of tiny files (e.g., many small CSVs, or a large number of images), pack them into a single archive first:

    ```bash
    tar -czf mydata.tar.gz mydata/
    rsync -avz mydata.tar.gz netid@{{ cluster.login_node }}:~/
    ```

    Unpack on the cluster side once it arrives.

!!! warning "Don't store large datasets in your home directory"
    Home directories have small quotas and are on slower storage. Use scratch (`{{ storage.scratch_path }}/`) for active job data, and {{ storage.shared_name }} for long-term storage. See [Storage Fundamentals](storage.md) for guidance on which tier to use.

### GUI option

If you prefer not to use the command line for casual file management, the **Open OnDemand** web interface includes a file browser that lets you upload and download files through your browser. It's convenient for moving a few files without opening a terminal, though it's not suitable for large transfers. You'll find details in the Open OnDemand recipe section.

## What's Next?

- [**Storage Fundamentals**](storage.md) — Understand where to put files once they're on the cluster
- [**Submit Your First Job**](../getting-started/first-job.md) — Put your data to work
- [**{{ institution.short_name }} Research Computing**]({{ institution.support_url }}) — Globus setup and additional storage documentation
