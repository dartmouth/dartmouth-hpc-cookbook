---
title: "Getting Started with Open OnDemand"
description: "How to access {{ cluster.name }} through a web browser using Open OnDemand, and when to choose it over SSH"
tags:
  - getting-started
  - open-ondemand
  - beginner
---

# Getting Started with Open OnDemand

!!! abstract "What we're cooking"
    How to access {{ cluster.name }} through a browser using Open OnDemand, and when to choose the web portal over the command line.

## What is Open OnDemand?

Open OnDemand (OOD) is a web portal that lets you use the HPC cluster entirely through your browser — no SSH client, no terminal setup, no command-line knowledge required to get started. Once you log in, you have access to:

- A **file browser** for navigating, uploading, and downloading files
- A **job submission interface** for creating and monitoring Slurm jobs
- **Shell access** — a full terminal in your browser tab
- **Interactive apps** — launch Jupyter notebooks, RStudio, VS Code, and desktop sessions with a few clicks

OOD is designed to lower the barrier to entry for HPC. If you've been putting off learning the command line, OOD lets you start doing useful work on the cluster right away. That said, OOD and the command line aren't mutually exclusive — most researchers end up using both.

!!! tip "New to the cluster?"
    If this is your first time accessing {{ cluster.name }}, start with [Getting Started](../../getting-started/connecting.md) to create your account and understand the cluster architecture. OOD and SSH are two different *ways in* — the cluster itself is the same either way.

## When to use Open OnDemand vs SSH

Choosing between OOD and the command line isn't an either/or decision. The table below outlines where each approach shines.

| Situation | OOD | SSH + CLI |
|---|---|---|
| New to Linux / command line | ✅ Better | ❌ Steep learning curve |
| Uploading/downloading a few files | ✅ Drag and drop | Works fine |
| Running Jupyter Notebooks | ✅ One click | Requires SSH tunneling |
| Running RStudio | ✅ One click | Requires X11 or tunneling |
| Automating repetitive jobs | ❌ Manual only | ✅ Scripts and cron |
| Complex job pipelines | ❌ Limited | ✅ Full control |
| Transferring large datasets (>1 GB) | ❌ Slow | ✅ rsync / Globus |
| Working offline / scripting | ❌ Browser required | ✅ Works anywhere |

OOD and SSH complement each other. Many researchers use OOD for exploration and prototyping, then switch to job scripts for production runs. They share the same cluster, the same storage, and the same files — switching between them is seamless.

## Accessing Open OnDemand

1. Open a browser and navigate to the {{ cluster.name }} OOD portal.

    !!! tip "Find the URL"
        The exact OOD URL for your institution is listed on the [{{ institution.short_name }} Research Computing support page]({{ institution.support_url }}). Look for "Open OnDemand" or "Web Portal".

2. Log in with your **campus credentials** — the same username and password you use for other {{ institution.short_name }} services.

3. After login, you'll land on the **OOD dashboard**.

That's it. No VPN, no SSH keys, no extra configuration needed.

## The Dashboard

The OOD dashboard is organized around a top navigation bar. Here's what each menu does:

- **Files** — Opens a file browser for your home directory and other storage locations. You can upload, download, create, and delete files here.
- **Jobs** — Contains the **Job Composer** (create and submit batch jobs) and **Active Jobs** (monitor running and queued jobs).
- **Clusters** — Provides shell access — a terminal that connects you to {{ cluster.name }} exactly as SSH would, but running in your browser.
- **Interactive Apps** — Launch graphical applications on compute nodes: Jupyter Notebook, JupyterLab, RStudio Server, VS Code, and virtual desktop sessions.

## Managing Files

The **Files** menu opens a file browser that works much like a desktop file manager. From here you can:

- **Navigate** your home directory and scratch space using the folder tree on the left
- **Upload files** by dragging them from your desktop and dropping them into the browser window, or by clicking the **Upload** button
- **Download files** by selecting them and clicking the **Download** button
- **Create, rename, and delete** files and directories using the toolbar

!!! warning "OOD file transfer has a size limit"
    The OOD file browser is convenient for small files but slow and unreliable for large ones. For anything over ~100 MB, use [rsync or Globus](../../fundamentals/data-transfer.md) instead. Uploading large datasets through the browser risks timeouts and incomplete transfers.

## Shell Access

The **Clusters** menu → **{{ cluster.name }} Shell** opens a terminal in your browser tab. This is functionally identical to an SSH session:

- Same files and directories
- Same environment modules
- Same job submission commands (`sbatch`, `squeue`, `scancel`)
- Same resource limits

Shell access through OOD is particularly handy when you're on a managed computer where installing an SSH client is restricted, or when you just want a quick terminal without leaving your browser.

!!! tip
    Everything you can do over SSH — loading modules, submitting jobs, editing files with `vim` or `nano`, running scripts — works exactly the same in the OOD shell.

## What's Next

- [**Interactive Apps in Open OnDemand**](apps.md) — launch Jupyter, RStudio, and VS Code through OOD without any SSH tunneling
- [**Submit Your First Job**](../../getting-started/first-job.md) — running batch jobs via the Job Composer or the command line
- [**Transferring Data**](../../fundamentals/data-transfer.md) — efficient file transfer for larger datasets using rsync and Globus
