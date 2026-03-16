---
title: "Running Containers with Apptainer"
description: "How to pull, run, and build Apptainer containers on {{ cluster.name }}, including GPU passthrough and Slurm integration"
---

# Running Containers with Apptainer

!!! abstract "What we're cooking"
    How to pull container images from Docker Hub and NGC, run commands inside
    them, access your cluster files via bind mounts, use GPUs, write custom
    definition files, and submit container-based batch jobs on {{ cluster.name }}.

New to containers? Read [Containers on HPC: An Introduction](intro.md) first
for the conceptual background and a decision framework for when to use them.

## Step 1: Pull an Image

Apptainer can pull images directly from Docker Hub or any Docker-compatible
registry. Pulled images are converted to Apptainer's native `.sif` format —
a single portable file.

```bash
# Pull Ubuntu 22.04 from Docker Hub
apptainer pull docker://ubuntu:22.04

# Pull a GPU-optimized PyTorch image from NVIDIA's registry (NGC)
apptainer pull docker://nvcr.io/nvidia/pytorch:24.01-py3
```

Each command produces a `.sif` file in the current directory (e.g.,
`ubuntu_22.04.sif`, `pytorch_24.01-py3.sif`).

!!! warning "Don't store `.sif` files in your home directory"
    Container images can be several gigabytes. Your home directory has a
    quota — filling it will break jobs and logins. Store `.sif` files on
    scratch or a project directory instead:

    ```bash
    cd {{ storage.scratch_path }}/$USER
    apptainer pull docker://nvcr.io/nvidia/pytorch:24.01-py3
    ```

Pulling a large image takes time and network I/O — do it once on a login node
and reuse the `.sif` file in subsequent jobs.

## Step 2: Run Commands in the Container

There are three main ways to interact with a container:

### `apptainer exec` — run a specific command

```bash
apptainer exec ubuntu_22.04.sif cat /etc/os-release
```

This launches the container, runs `cat /etc/os-release` inside it, prints the
output, then exits. The container process is gone when the command finishes.
Use `exec` when you want to run your script or tool as part of a larger
workflow.

```bash
# Run a Python script using the container's Python
apptainer exec pytorch_24.01-py3.sif python train.py --epochs 50
```

### `apptainer run` — run the image's default entry point

Some images define a default command (their entry point). `apptainer run`
executes that default. It is equivalent to `docker run` without specifying a
command. Many scientific images don't define a meaningful default, so `exec`
is more generally useful.

```bash
apptainer run ubuntu_22.04.sif
```

### `apptainer shell` — interactive shell inside the container

```bash
apptainer shell ubuntu_22.04.sif
```

This drops you into a shell *inside* the container. Useful for exploring the
environment, debugging, or prototyping. Your shell prompt will change to
`Apptainer>` to remind you you're inside the container.

```
Apptainer> python3 --version
Python 3.10.12
Apptainer> exit
```

## Step 3: Bind Mounts — Accessing Your Files

By default, the container has its own isolated filesystem. Your home directory,
scratch space, and project directories are **not visible** unless you mount
them explicitly.

Use `--bind` (or `-B`) to mount paths from the cluster into the container:

```bash
# Mount a scratch directory as /data inside the container
apptainer exec --bind {{ storage.scratch_path }}/$USER:/data \
    pytorch_24.01-py3.sif python /data/train.py
```

The syntax is `--bind /host/path:/container/path`. You can mount multiple
paths:

```bash
apptainer exec \
    --bind {{ storage.scratch_path }}/$USER:/data \
    --bind /path/to/my/code:/code \
    pytorch_24.01-py3.sif python /code/train.py --data-dir /data
```

!!! note "Auto-mounted paths on {{ cluster.name }}"
    Apptainer on {{ cluster.name }} automatically binds your home directory
    and `/tmp` into every container, so files in your home are accessible
    without an explicit `--bind`. Paths on `{{ storage.scratch_path }}` and
    other shared filesystems may also be auto-bound depending on the site
    configuration — try accessing them first before adding an explicit mount.

**Persistent bind paths with `$APPTAINER_BINDPATH`**

If you always bind the same directories, set this environment variable in
your `~/.bashrc` or at the top of your job script:

```bash
export APPTAINER_BINDPATH="{{ storage.scratch_path }}/$USER:/data"
```

Apptainer reads this variable and applies those mounts to every container
you run, without needing `--bind` each time.

## Step 4: GPU Passthrough

Add the `--nv` flag to expose the host's NVIDIA drivers and CUDA libraries to
the container:

```bash
apptainer exec --nv pytorch_24.01-py3.sif python -c "
import torch
print(torch.cuda.is_available())
print(torch.cuda.get_device_name(0))
"
```

The `--nv` flag injects the host driver into the container at runtime —
the container image itself does not need to include the CUDA driver, only the
CUDA toolkit libraries that match the host driver version.

!!! warning "CUDA version compatibility"
    The CUDA toolkit version inside the container must be compatible with the
    CUDA driver installed on the compute node. Driver version sets the
    *maximum* CUDA toolkit version it can support — a container built for
    CUDA 12.4 will not run on a node whose driver only supports CUDA 11.x.

    NVIDIA's [NGC images](https://catalog.ngc.nvidia.com/) (e.g.,
    `nvcr.io/nvidia/pytorch:24.01-py3`) are pre-tested against specific driver
    versions. The image tag tells you which CUDA version it requires.
    Check the image's page on NGC for the exact driver compatibility table.

You must request GPU resources from Slurm to actually have a GPU available
when the job runs — see the batch job example below.

## Step 5: Building Custom Images

When an existing image doesn't quite fit your needs, you can build your own.
Apptainer uses **definition files** (`.def`) to describe how to build an image.

Here's a minimal example that starts from an existing Docker image and adds
Python packages on top:

```singularity
Bootstrap: docker
From: ubuntu:22.04

%post
    apt-get update -y
    apt-get install -y python3 python3-pip
    pip3 install numpy scipy matplotlib

%environment
    export LC_ALL=C
    export PATH=/usr/local/bin:$PATH

%labels
    Author mynetid
    Version 1.0

%help
    A minimal Ubuntu 22.04 image with NumPy, SciPy, and Matplotlib.
```

Save this as `myenv.def`, then build the image:

```bash
# Build using --fakeroot (rootless build — works on the cluster)
apptainer build --fakeroot myenv.sif myenv.def
```

The `--fakeroot` flag allows you to build images without actual root access
by using a Linux user namespace feature. It is available on {{ cluster.name }}
for most use cases.

!!! tip "Complex builds: build locally, copy to cluster"
    Some builds require network access, very long compile times, or steps that
    don't work cleanly under `--fakeroot`. In those cases, build the image on
    your own machine (where you have Docker or Apptainer with root), then copy
    the `.sif` file to the cluster with `scp` or `rsync`.

    ```bash
    # On your local machine
    apptainer build myenv.sif myenv.def

    # Copy to cluster scratch
    scp myenv.sif {{ cluster.login_node }}:{{ storage.scratch_path }}/$USER/
    ```

## Step 6: Running Containers in a Slurm Job

`apptainer exec` slots naturally into a batch script — just replace the bare
Python call with the containerized version:

{{ sbatch_template(
    job_name="container-train",
    partition="gpuq",
    time="04:00:00",
    cpus=4,
    mem="32G",
    gpus=1,
    commands="# Path to your SIF file\nSIF={{ storage.scratch_path }}/$USER/pytorch_24.01-py3.sif\n\n# Bind scratch into the container at /data\napptainer exec --nv \\\\\n    --bind {{ storage.scratch_path }}/$USER:/data \\\\\n    \"$SIF\" \\\\\n    python /data/train.py --output /data/results"
) }}

Key points for container jobs:

- Set `SIF` as a variable at the top — easy to swap images without hunting
  through the script
- Use `--nv` if your workload uses the GPU
- Use `--bind` to expose your data and output directories
- No `module load` is needed for the software inside the container — it's all
  bundled in the image. You may still need to load cluster modules for things
  *outside* the container (e.g., if launching MPI across nodes).

## Common Pitfalls

!!! warning "`.sif` files in home will fill your quota"
    GPU-capable container images routinely exceed 5–10 GB. A few pulls into
    your home directory will exhaust your quota and cause jobs and logins to
    fail. Always pull images to `{{ storage.scratch_path }}/$USER` or a project
    directory, and keep a note of where they live.

!!! warning "CUDA driver vs. toolkit version mismatch"
    If your container was built against CUDA 12.4 but the node's driver only
    supports CUDA 11.x, your code will fail at runtime with a cryptic error
    like `CUDA driver version is insufficient`. Always check the NGC image tag
    and verify driver compatibility with `nvidia-smi` on the compute node.

!!! warning "File not found inside the container"
    If your script exits with `FileNotFoundError` or `No such file or directory`
    for a path you know exists, you've forgotten a bind mount. The container
    cannot see host paths unless they are mounted. Use `--bind` or set
    `$APPTAINER_BINDPATH` to expose the directory. Verify with:

    ```bash
    apptainer exec --bind /my/path:/mnt myimage.sif ls /mnt
    ```

!!! warning "Container filesystem is read-only"
    The container image itself cannot be written to. If your code tries to
    write output files *inside* the container's own filesystem (e.g., to a
    path that isn't bind-mounted from the host), it will fail with a
    permission error.

    The fix is to write output to a bind-mounted host directory instead.
    If you need a writable overlay for temporary files, add `--writable-tmpfs`:

    ```bash
    apptainer exec --writable-tmpfs myimage.sif my_tool
    ```

    `--writable-tmpfs` creates an in-memory writable layer — useful for tools
    that need to write to arbitrary paths but where you don't care about
    keeping the output.
