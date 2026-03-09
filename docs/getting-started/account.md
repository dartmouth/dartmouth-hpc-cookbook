---
title: Requesting an Account
description: "How to get an account on {{ institution.short_name }}'s HPC systems and what comes with it"
tags:
  - getting-started
  - account
---

# Requesting an Account

Before you can log in to the cluster, submit jobs, or even explore the system, you need an HPC account. The good news: it's quick to set up, free for anyone in the {{ institution.short_name }} community, and comes with storage space you can access from anywhere on campus.

## What You Get

An HPC account gives you:

- **Login access** to {{ institution.short_name }}'s Linux compute servers using your existing campus credentials
- **A home directory** — your own persistent storage space, shared across all HPC systems
- **Access to the job scheduler** so you can submit work to the cluster's compute nodes

Think of it as your workspace on the cluster. Your home directory is where you'll keep scripts, small datasets, and configuration files. It's backed up and available every time you log in, no matter which system you connect to.

!!! tip "Home directories aren't just for the cluster"
    Your home directory lives on network storage, which means you can also mount it on your personal laptop or desktop. This makes it easy to transfer files back and forth without needing a separate tool.

{% include "site/account-details.md" %}

## Managing Disk Quotas

Every home directory has a **quota** — a limit on how much storage space it can use. Quotas exist to make sure no single user (or runaway program) consumes more than their fair share of a shared resource.

To check your current usage, run:

```bash
quota ~
```

If you're running low on space, here are some strategies:

**1. Find what's using space.** The `du` command shows disk usage by directory:

```bash
du -h --max-depth=1 ~ | sort -hr | head -20  # (1)!
```

1. This lists the 20 largest directories in your home, sorted by size. It's a quick way to find where space is going.

**2. Remove what you don't need.** Old output files, logs from completed jobs, and outdated datasets are common culprits.

**3. Compress files you want to keep but aren't actively using:**

```bash
gzip large_output.csv           # (1)!
tar -czf old_results.tar.gz old_results/  # (2)!
```

1. Compresses a single file in-place. The original is replaced by `large_output.csv.gz`.
2. Archives and compresses an entire directory into one file.

**4. Move large datasets to a more appropriate storage tier.** Your home directory is designed for small, frequently accessed files. Large research datasets belong on shared lab storage or scratch. See [Storage Fundamentals](../fundamentals/storage.md) for guidance on choosing the right tier.

??? failure "Disk quota exceeded"
    If you see errors like `Disk quota exceeded` or `No space left on device`, your home directory is full. Start by running `quota ~` to confirm, then follow the strategies above to free up space. If you need a temporary workaround to unblock yourself, you can work from scratch storage (`{{ storage.scratch_path }}`) while you clean up.

## Passwordless Login

Because {{ institution.short_name }} uses centralized campus authentication, standard SSH key pairs aren't supported for logging in. Instead, you can set up **GSSAPI authentication**, which works with your campus credentials to provide a similar passwordless login experience. See [Connecting to the Cluster](connecting.md) for details on setting this up.

## What's Next?

With your account in hand, you're ready to connect:

- [**Connect to the cluster**](connecting.md) — log in via SSH and explore the system
- [**Submit your first job**](first-job.md) — run a simple batch job with {{ cluster.scheduler }}
- [**Storage Fundamentals**](../fundamentals/storage.md) — understand the different storage tiers and when to use each one
