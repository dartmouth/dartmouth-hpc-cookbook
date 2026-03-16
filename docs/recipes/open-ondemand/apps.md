---
title: "Interactive Apps in Open OnDemand"
description: "How to launch Jupyter, RStudio, VS Code, and virtual desktop sessions through Open OnDemand on {{ cluster.name }}"
tags:
  - open-ondemand
  - jupyter
  - rstudio
  - gpu
---

# Interactive Apps in Open OnDemand

!!! abstract "What we're cooking"
    How to launch interactive applications — Jupyter Notebook/Lab, RStudio, VS Code, and a full Linux desktop — directly in your browser through Open OnDemand, without any SSH tunneling or port forwarding.

## How Interactive Apps Work

When you launch an interactive app through OOD, it does three things automatically:

1. **Submits a Slurm job** on your behalf that starts the application on a compute node
2. **Waits for the job to start** and shows you its queue status in real time
3. **Creates a secure proxy tunnel** so your browser connects directly to the app running on that node

You don't need to understand any of this to use it — OOD handles it all. But knowing the model helps you make better decisions:

- **You're using real compute resources**, not the login node. Interactive apps are subject to the same Slurm scheduling as batch jobs.
- **You need to request appropriate time and resources** up front. Under-requesting memory or CPUs is the most common cause of crashes.
- **The session ends when the Slurm job ends.** When your requested time expires, OOD closes the connection and your app shuts down. Save your work before the time limit.

!!! tip "Not familiar with OOD yet?"
    Start with [Getting Started with Open OnDemand](getting-started.md) for an overview of the portal, file management, and shell access.

## Launching Jupyter Notebook / JupyterLab

Jupyter is the most-used interactive app on most HPC clusters. OOD makes it one-click:

1. Click **Interactive Apps** → **Jupyter Notebook** (or **JupyterLab** — same backend, different interface)
2. Fill in the resource request form:
    - **Number of hours** — how long you need the session
    - **Number of CPUs** — 1–4 is typical for interactive work
    - **Memory (GB)** — depends on your data; 8–16 GB is a reasonable starting point
    - **Partition** — use the default partition for CPU work; select the GPU partition if you need GPU access
    - **Number of GPUs** — set to 1 if using GPU; leave at 0 otherwise
3. Click **Launch** and wait for the job to enter the running state (this can take from a few seconds to a few minutes depending on cluster load)
4. Click **Connect to Jupyter** when the button appears

!!! tip "Using a GPU in Jupyter"
    Select the GPU partition and request 1 GPU in the resource form. Once your notebook is open, you can confirm GPU availability with:
    ```python
    import torch
    print(torch.cuda.is_available())   # True if a GPU was allocated
    print(torch.cuda.get_device_name(0))
    ```
    See [PyTorch with GPU Support](../python/pytorch.md) for a full GPU workflow.

!!! tip "Using your own Python environment in Jupyter"
    By default, Jupyter uses the system Python kernel. To use packages you installed with `uv` or `conda`, you need to register your virtual environment as a Jupyter kernel. See [Getting Started with uv](../python/uv.md) for details on how to do this.

## Launching RStudio

RStudio Server runs in your browser exactly as it does on a desktop — the difference is that the compute happens on {{ cluster.name }}.

1. Click **Interactive Apps** → **RStudio Server**
2. Fill in the resource form. For R workloads, **memory is usually the key resource to increase** — many R workflows load entire datasets into RAM
3. Click **Launch**, wait for the job to start
4. Click **Connect to RStudio** when ready

!!! tip "Your R packages persist"
    Your R package library is stored in your home directory, the same location used by SSH sessions. Packages installed with `install.packages()` in this RStudio session are available the next time you connect — you don't need to reinstall them each session.

For managing R environments and packages on the cluster, see [R on the Cluster](../r/getting-started.md).

## Launching VS Code

OOD can launch VS Code Server (also listed as **Code Server**) on a compute node, giving you a full VS Code interface in your browser:

1. Click **Interactive Apps** → **VS Code** (or **Code Server**)
2. Fill in the resource form — request enough CPUs and memory for the code you plan to run
3. Click **Launch**, wait for the session to start
4. Click **Connect to VS Code** when ready

Inside the session you get the full VS Code experience: terminal, file explorer, extensions, and the ability to run code directly on cluster hardware. This is particularly useful for:

- **Debugging Python or R scripts** with access to cluster resources and your actual data
- **Editing files** without needing to configure remote SSH in a local VS Code installation
- **Running quick experiments** interactively before committing to a batch job

## Virtual Desktop

Some applications require a full graphical interface — MATLAB, ParaView, VMD, and other scientific visualization tools are common examples. The virtual desktop gives you a complete Linux desktop environment in your browser.

1. Click **Interactive Apps** → **Desktop** (may be labeled **Linux Desktop** or **XFCE Desktop**)
2. Fill in the resource form
3. Click **Launch** and connect when ready

You get a full desktop running on a compute node. Applications launched from within the desktop use the node's CPU, GPU, and memory — not your laptop's. Performance depends on your network connection; a wired or fast Wi-Fi connection makes a noticeable difference.

## Common Pitfalls

Knowing these in advance will save you frustration.

**Session timeout — save your work**
: OOD sessions end when the Slurm time limit expires, without warning. You can't extend a running session — you'll need to launch a new one. Get into the habit of saving notebooks and scripts frequently, especially as your time limit approaches.

**Resource requests that are too small**
: If your Jupyter kernel dies unexpectedly or RStudio crashes, the most likely cause is insufficient memory. Cancel the session and launch a new one with more RAM. For memory-intensive work, monitor usage with `htop` in the OOD shell before committing to a long session.

**Home directory quota**
: Large notebook checkpoint files (`.ipynb_checkpoints/`) and data cached in your home directory can quietly fill your quota. Keep large input and output data on scratch storage, not your home directory. See [Storage Fundamentals](../../fundamentals/storage.md) for how storage is organized on {{ cluster.name }}.

**Idle sessions waste cluster resources**
: An OOD session holds a Slurm allocation for its entire duration — whether you're actively using it or not. Close sessions you're done with so those resources are available to other users. There's no penalty for ending a session early.

## What's Next

- [**Getting Started with uv**](../python/uv.md) — set up Python virtual environments and register them as Jupyter kernels
- [**PyTorch with GPU Support**](../python/pytorch.md) — GPU-accelerated deep learning workflows in Jupyter
- [**Open OnDemand Overview**](getting-started.md) — file management, shell access, and when to use OOD vs SSH
