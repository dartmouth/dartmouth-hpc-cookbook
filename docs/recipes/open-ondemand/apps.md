---
title: "Interactive Apps in Open OnDemand"
description: "How to launch Jupyter, RStudio, VS Code, and more through Open OnDemand on {{ cluster.name }}"
tags:
  - open-ondemand
  - jupyter
  - rstudio
  - gpu
---

# Interactive Apps in Open OnDemand

!!! abstract "What we're cooking"
    How to launch interactive applications (JupyterLab, RStudio, VS Code, MATLAB, Mathematica, and a full Linux desktop) directly in your browser through Open OnDemand, without any SSH tunneling or port forwarding.

## How interactive apps work

When you launch an interactive app through OOD, it does three things automatically:

1. **Submits a Slurm job** on your behalf that starts the application on a compute node
2. **Waits for the job to start** and shows you its queue status in real time
3. **Creates a secure proxy tunnel** so your browser connects directly to the app running on that node

You don't need to understand any of this to use it, but knowing the model helps you make better decisions:

- **You're using real compute resources**, not the login node. Interactive apps are subject to the same Slurm scheduling as batch jobs.
- **You need to request appropriate time and resources** up front. Under-requesting memory or CPUs is the most common cause of crashes.
- **Interactive sessions are capped at 8 hours.** When your requested time expires, OOD closes the connection and your app shuts down. Save your work before the time limit.

!!! tip "Not familiar with OOD yet?"
    Start with [Getting Started with Open OnDemand](getting-started.md) for an overview of the portal, file management, and shell access.

## Launching JupyterLab

JupyterLab is the most-used interactive app on most HPC clusters. OOD makes it one-click:

1. Click **Interactive Apps** → **JupyterLab**
2. Fill in the resource request form:
    - **Partition** — `cpu` for CPU-only work, or a GPU-enabled partition if you need GPU access. For lightweight tasks (editing, small tests), try the `ood-shared` partition.
    - **Maximum job duration** — in `Hours:Minutes:Seconds` format (e.g., `4:00:00` for four hours). The maximum is `8:00:00`.
    - **Memory (in GB)** — depends on your data; 8–16 GB is a reasonable starting point
    - **GPU count** — set to 1 if using GPU; leave at 0 otherwise. You must select a GPU-enabled partition for this to work.
    - **Modules** — any Lmod modules to load before the session starts (e.g., `cuda/12.1`). Do *not* put Python packages here; use a virtual environment instead.
    - **Short QOS checkbox** — check this for jobs under 4 hours. It boosts your scheduling priority, so your session starts faster.
    - **Extra arguments for Slurm** — optional `sbatch` flags for advanced customization (usually leave blank)
3. Click **Launch** and wait for the job to enter the running state (this can take from a few seconds to a few minutes depending on cluster load)
4. Click **Connect to Jupyter** when the button appears

!!! tip "The `ood-shared` partition for lightweight work"
    The `ood-shared` partition is designed for small interactive jobs: code editing, short tests, and other lightweight workloads. It supports up to 8 cores and 16 GB of memory, with 4x oversubscription so resources are almost always available. Use it when you don't need heavy compute.

!!! tip "Using a GPU in Jupyter"
    Select a GPU-enabled partition and request 1 GPU in the resource form. Once your notebook is open, you can confirm GPU availability with:
    ```python
    import torch
    print(torch.cuda.is_available())   # True if a GPU was allocated
    print(torch.cuda.get_device_name(0))
    ```
    See [PyTorch with GPU Support](../python/pytorch.md) for a full GPU workflow.

!!! tip "Using your own Python environment in Jupyter"
    By default, Jupyter uses the system Python kernel. To use packages you installed with `uv` or `conda`, you need to register your virtual environment as a Jupyter kernel. See [Register Your Environment as a Jupyter Kernel](../python/uv.md#register-your-environment-as-a-jupyter-kernel) for step-by-step instructions.

!!! tip "Running notebooks beyond the 8-hour limit"
    If your notebook takes longer than 8 hours, run it as a batch job instead of an interactive session. Tools like `nbconvert` and `papermill` can execute notebooks non-interactively. This also protects against network disconnections killing your work mid-run. A dedicated recipe on non-interactive notebook execution is coming soon.

## Launching RStudio

RStudio Server runs in your browser exactly as it does on a desktop, the difference is that the compute happens on {{ cluster.name }}.

1. Click **Interactive Apps** → **RStudio Server**
2. Fill in the resource form. For R workloads, **memory is usually the key resource to increase** because many R workflows load entire datasets into RAM.
3. Click **Launch**, wait for the job to start
4. Click **Connect to RStudio** when ready

!!! note "RStudio runs inside an Apptainer container"
    On {{ cluster.name }}, RStudio sessions use the `r-rocker-ml-verse` Apptainer container, which bundles R and a wide set of common packages. This means the environment you see in RStudio is the same one you get when you `module load r-rocker-ml-verse/<version>+apptainer` at the command line. Keep this in mind when installing packages or reproducing environments.

!!! tip "Your R packages persist"
    Your R package library is stored in your home directory, the same location used by SSH sessions. Packages installed with `install.packages()` in this RStudio session are available the next time you connect; you don't need to reinstall them each session.

For managing R environments and packages on the cluster, see [R on the Cluster](../r/getting-started.md).

## Launching VS Code

OOD can launch VS Code Server (also listed as **Code Server**) on a compute node, giving you a full VS Code interface in your browser:

1. Click **Interactive Apps** → **VS Code** (or **Code Server**)
2. Fill in the resource form. For lightweight editing, the `ood-shared` partition (up to 8 cores, 16 GB) is a good fit.
3. Click **Launch**, wait for the session to start
4. Click **Connect to VS Code** when ready

Inside the session you get the full VS Code experience: terminal, file explorer, extensions, and the ability to run code directly on cluster hardware. This is particularly useful for:

- **Debugging Python or R scripts** with access to cluster resources and your actual data
- **Editing files** without needing to configure remote SSH in a local VS Code installation
- **Running quick experiments** interactively before committing to a batch job

!!! warning "One VS Code session at a time"
    {{ cluster.name }} limits VS Code sessions to **one per user**. If you need a second session, close the first one before launching another.

## Launching MATLAB

MATLAB is available as an interactive OOD app, running a full MATLAB desktop in your browser. This is the easiest way to use MATLAB on the cluster if you're used to the graphical interface.

1. Click **Interactive Apps** → **MATLAB**
2. Fill in the resource form. MATLAB sessions benefit from extra memory if you're working with large datasets.
3. Click **Launch**, wait for the session to start
4. Click **Connect to MATLAB** when ready

For non-interactive MATLAB workflows (batch processing, parameter sweeps), see [MATLAB Batch Jobs](../matlab/batch-job.md).

## Launching Mathematica

Mathematica is available as an interactive OOD app for symbolic computation, visualization, and notebook-based workflows.

1. Click **Interactive Apps** → **Mathematica**
2. Fill in the resource form
3. Click **Launch** and connect when ready

## Other available apps

{{ cluster.name }} OOD also provides additional interactive applications:

- **CryoSPARC** — a scientific software platform for cryo-electron microscopy (cryo-EM) used in structural biology and drug discovery pipelines
- **RShiny** — launch and share interactive Shiny dashboards for data processing, visualization, and reporting

These apps follow the same launch pattern: select the app from the **Interactive Apps** menu, fill in your resource request, launch, and connect.

## Virtual Desktop (XFCE)

Some applications require a full graphical interface. ParaView, VMD, and other scientific visualization tools are common examples. The virtual desktop gives you a complete XFCE Linux desktop environment in your browser.

1. Click **Interactive Apps** → **Desktop**
2. Fill in the resource form
3. Click **Launch** and connect when ready

You get a full desktop running on a compute node. Applications launched from within the desktop use the node's CPU, GPU, and memory, not your laptop's. Performance depends on your network connection; a wired or fast Wi-Fi connection makes a noticeable difference.

## Common pitfalls

??? failure "Session timeout: save your work"
    OOD sessions end when the Slurm time limit expires, without warning. You can't extend a running session; you'll need to launch a new one. Get into the habit of saving notebooks and scripts frequently, especially as your time limit approaches. The maximum interactive session duration is **8 hours**.

??? failure "Resource requests that are too small"
    If your Jupyter kernel dies unexpectedly or RStudio crashes, the most likely cause is insufficient memory. Cancel the session and launch a new one with more RAM. For memory-intensive work, monitor usage with `htop` in the OOD shell before committing to a long session.

??? failure "Home directory quota"
    Large notebook checkpoint files (`.ipynb_checkpoints/`) and data cached in your home directory can quietly fill your quota. Keep large input and output data on scratch or work storage, not your home directory. See [Storage Fundamentals](../../fundamentals/storage.md) for how storage is organized on {{ cluster.name }}.

??? failure "Idle sessions waste cluster resources"
    An OOD session holds a Slurm allocation for its entire duration, whether you're actively using it or not. Close sessions you're done with so those resources are available to other users. There's no penalty for ending a session early.

??? failure "Short QOS for faster scheduling"
    If your interactive session is under 4 hours, check the **Short QOS** box when launching. This gives your job higher scheduling priority so it starts faster. It works on any partition.

## What's next

- [**Getting Started with uv**](../python/uv.md) — set up Python virtual environments and register them as Jupyter kernels
- [**PyTorch with GPU Support**](../python/pytorch.md) — GPU-accelerated deep learning workflows in Jupyter
- [**Open OnDemand Overview**](getting-started.md) — file management, shell access, and when to use OOD vs. SSH
