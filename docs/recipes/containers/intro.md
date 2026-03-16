---
title: "Containers on HPC: An Introduction"
description: "What containers are, why they matter on {{ cluster.name }}, and when to use them instead of modules and virtual environments"
---

# Containers on HPC: An Introduction

!!! abstract "What you'll learn"
    What containers are and why they exist, the difference between Docker and
    Apptainer, and a clear framework for deciding when to reach for a container
    versus the module system or a Python virtual environment.

## The Core Idea

In the early twentieth century, global shipping was a logistical nightmare.
Every port, ship, and truck used different loading conventions. Cargo had to be
manually repacked at every transfer point — slow, expensive, and error-prone.
The invention of the standardized *shipping container* changed everything: pack
your goods once, and they move unchanged from factory to freighter to freight
train to warehouse, because the container is the interface.

Software has the same problem. A data-processing pipeline that runs perfectly
on your laptop may fail on the cluster because the cluster has a different
version of a C library, a different Python, or a dependency your code assumed
was globally installed. Reproducing a colleague's results means recreating
their entire software environment — often an underdocumented and frustrating
exercise.

**Software containers** solve this the same way shipping containers did: bundle
your application *together with everything it needs* — the runtime, libraries,
configuration, and dependencies — into a single portable image. That image runs
identically wherever a compatible container runtime exists.

Concretely, a container image is a read-only, layered filesystem snapshot. When
you run a container, you get a lightweight, isolated process that sees that
filesystem as its root. The host OS kernel is shared (unlike a full virtual
machine), so containers are fast to start and have almost no overhead.

## Why Containers Matter on HPC

Clusters like {{ cluster.name }} are shared infrastructure. You cannot install
software globally — you don't have root access, and even if you did, changes
would affect everyone. The standard approach is [environment modules](../../fundamentals/modules.md),
which work well for common software the system administrators maintain. But
modules have limits:

- **Software not in the module system** — niche tools, specific versions, or
  software with unusual build requirements may simply not be available.
- **Complex system-level dependencies** — some software links against specific
  versions of system libraries (CUDA, MPI, OpenSSL) that must match precisely.
  A Python virtual environment handles Python packages but can't manage these
  lower-level dependencies.
- **Reproducibility across machines** — modules give you the same software
  version, but the underlying system libraries can still differ between clusters
  or over time as the cluster is updated. A container carries its own libraries.
- **Published research software** — many computational tools are now distributed
  as Docker images. Using the published image directly is more reliable than
  trying to replicate the build from scratch.

## Docker vs. Apptainer

[Docker](https://www.docker.com/) is the dominant container platform. If you
search for containerized software, you will almost always find a Docker image.
However, Docker requires a background daemon process running as root, and it
grants containers a level of privilege that is incompatible with the security
model of shared HPC clusters. You cannot run Docker on {{ cluster.name }}.

**[Apptainer](https://apptainer.org/)** (formerly Singularity) is the solution
designed for HPC. The key differences:

| | Docker | Apptainer |
|---|---|---|
| Runs as root? | Yes (daemon) | No — you stay yourself |
| Daemon required? | Yes | No |
| HPC-compatible? | No | Yes |
| Reads Docker images? | Native | Yes — pulls from Docker Hub directly |
| Common use case | Development, cloud | HPC, scientific computing |

The practical implication: you can take any Docker image from
[Docker Hub](https://hub.docker.com/) or the
[NVIDIA Container Registry](https://catalog.ngc.nvidia.com/) and run it on
{{ cluster.name }} using Apptainer with no modification. The command
`apptainer pull docker://ubuntu:22.04` downloads a Docker image and converts it
to Apptainer's native `.sif` format automatically.

!!! tip "Singularity → Apptainer"
    Apptainer is the new name for Singularity after the project moved to the
    Linux Foundation in 2021. The commands and concepts are identical.
    You may see both names in documentation and forum posts — they refer to
    the same tool.

## When to Use Containers vs. Modules and Virtual Environments

This is the most practical question, and the answer is usually straightforward:

| Situation | Recommended approach |
|---|---|
| Software is already in `module avail` | **Load the module** |
| Pure Python work, no unusual system deps | **`uv` + virtual environment** |
| You have a published Docker image for your tool | **Apptainer** |
| Software has complex system-level dependencies (CUDA, MPI ABI, etc.) | **Apptainer** |
| You need identical results across clusters or over time | **Apptainer** |
| Software isn't in the module system and can't be pip-installed | **Apptainer** |
| You're sharing an environment with collaborators on other institutions | **Apptainer** |

In practice, containers and modules are complementary. A container image often
*includes* a Python runtime and packages — you don't need a separate virtual
environment inside it. But you might still load a module (like MPI) and bind it
into the container at runtime to get the cluster's optimized version.

## Container Terminology

A few terms come up constantly when working with containers. They're worth
knowing before diving into the hands-on material:

**Image**
:   The static, read-only bundle — the filesystem snapshot that defines the
    software environment. Think of it as the blueprint. An image is a file;
    you don't "run" an image, you run a *container* based on it.

**Container**
:   A running instance of an image. One image can spawn many containers
    simultaneously. When the container exits, any changes to its filesystem
    are discarded (unless you've set up a bind mount — see below).

**Layer**
:   Images are built in layers. Each `RUN` command in a Dockerfile (or `%post`
    block in an Apptainer definition file) adds a layer. Layers are cached and
    shared, so pulling an image that shares layers with one you already have is
    fast.

**Bind mount**
:   A way to expose a directory from the host system inside the container.
    By default, the container sees only its own filesystem — your cluster home
    directory and scratch space are invisible. Bind mounts bridge that gap.
    On {{ cluster.name }}, common paths like your home directory are typically
    auto-mounted, but for scratch and project directories you'll bind them
    explicitly.

**Registry**
:   A server that stores and distributes images. The main ones you'll encounter:
    - [Docker Hub](https://hub.docker.com/) — the default public registry,
      home to most open-source software images
    - [NGC (NVIDIA Container Registry)](https://catalog.ngc.nvidia.com/) —
      NVIDIA's registry for GPU-optimized images (PyTorch, TensorFlow, RAPIDS,
      etc.), pre-configured for CUDA

**.sif file**
:   Apptainer's native image format (Singularity Image Format). When you pull
    a Docker image with Apptainer, it is converted to a `.sif` file — a single,
    portable file you can copy anywhere.

## What's Next

The [Apptainer recipe](apptainer.md) walks through everything hands-on:
pulling images, running commands, bind mounts, GPU passthrough, writing
definition files, and putting it all together in a Slurm batch job.
