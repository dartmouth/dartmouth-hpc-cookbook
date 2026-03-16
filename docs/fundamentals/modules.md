---
title: "Environment Modules"
description: "How to find, load, and manage software on {{ cluster.name }} using environment modules"
tags:
  - fundamentals
  - linux
  - modules
---

# Environment Modules

On your laptop, installing software is straightforward — you download it, install it, and it's available everywhere. HPC clusters work differently. Hundreds of users share the same system, often needing different (and incompatible) versions of the same software. **Environment modules** are how clusters solve this problem.

## The Problem Modules Solve

Imagine a cluster where every piece of software is installed globally, the way you'd install apps on your laptop. One research group needs Python 3.9 for a legacy pipeline. Another needs Python 3.12 for a new project. A third group needs a version of NumPy compiled against a specific version of MKL. A bioinformatics lab needs GCC 10 to build their tools, while a physics group needs GCC 13 for C++20 support.

Installing all of these globally creates conflicts. Libraries compiled against one version of a compiler may crash when loaded alongside another. Two versions of the same tool can't both live at `/usr/bin/python3`. And if a sysadmin upgrades a shared library to satisfy one group, it may silently break another group's workflow.

HPC systems are **shared infrastructure**. Unlike your laptop, you don't get to decide what's installed system-wide. Environment modules solve this by letting each user choose exactly the software they need, in the versions they need, without affecting anyone else on the system.

## What Modules Actually Do

If you've read [Linux — Permissions, Pipes & the Environment](linux-advanced.md), you know that your shell uses environment variables like `$PATH` to find commands. When you type `python3`, your shell searches through the directories listed in `$PATH` until it finds a matching executable.

Modules work by **manipulating these environment variables**. When you load a module, it prepends the software's `bin/` directory to your `$PATH`, adds its `lib/` directory to `$LD_LIBRARY_PATH`, and sets any other variables the software needs. When you unload it, those changes are reversed.

That's the entire trick. There's no containerization, no virtualization — just careful management of environment variables. This is why understanding `$PATH` and environment variables first makes modules feel intuitive rather than magical.

## Core Commands

These are the commands you'll use every day on {{ cluster.name }}. They all start with `module`.

### See what's available

```bash
module avail
```

This lists every module installed on the cluster. The output can be overwhelming — {{ cluster.name }} has hundreds of modules. To narrow it down, pass a search term:

```bash
module avail python
```

This shows only modules whose names contain "python." Use this when you know roughly what you need but aren't sure of the exact version or name.

### Load a module

```bash
module load python/3.11.5
```

This makes Python 3.11.5 available in your current session. After running this, `python3` points to version 3.11.5 and any associated tools (like `pip`) are also on your `$PATH`.

You can load multiple modules at once:

```bash
module load gcc/12.2.0 openmpi/4.1.4
```

### See what's loaded

```bash
module list
```

This shows every module currently active in your session. If something isn't behaving as expected, this is the first thing to check — the software you need might not be loaded.

### Unload a module

```bash
module unload python/3.11.5
```

This reverses the environment changes that `module load` made. The software is no longer available in your session.

### Start fresh

```bash
module purge
```

This unloads **everything**. It's useful when you've accumulated modules over a session and want a clean slate. Many experienced users start their job scripts with `module purge` to ensure a predictable environment.

### Inspect a module

```bash
module show python/3.11.5
```

This reveals exactly what a module does — which directories it adds to `$PATH`, what environment variables it sets, and whether it loads any other modules as dependencies. This is invaluable for debugging:

```
prepend-path    PATH            /opt/software/python/3.11.5/bin
prepend-path    LD_LIBRARY_PATH /opt/software/python/3.11.5/lib
setenv          PYTHON_HOME     /opt/software/python/3.11.5
```

!!! tip "When in doubt, `module show`"
    If a program can't find a library or a tool isn't behaving as expected after loading a module, `module show` tells you exactly what changed. It's the fastest way to debug module-related issues.

## Understanding Module Names

Modules follow a `name/version` naming convention:

```
python/3.11.5
gcc/12.2.0
cuda/12.1
openmpi/4.1.4
```

The name identifies the software, and the version after the slash identifies the specific release. Some key things to know:

- **Default versions**: If you run `module load python` without specifying a version, the system loads a default (usually marked with `(D)` in `module avail` output). It's better to always specify the version explicitly — the default may change when the system is updated, which could break your workflow.

- **Partial matching**: You can often use partial version numbers. `module load python/3.11` may resolve to `python/3.11.5` if that's the only 3.11.x installed.

- **Hierarchical modules**: Some modules only appear after you've loaded a prerequisite. For example, MPI libraries compiled with a specific compiler may only show up in `module avail` after you load that compiler. If you can't find a module you expect to exist, check whether it depends on another module being loaded first.

!!! info "Finding the right module"
    If `module avail` doesn't turn up what you need, try `module keyword <term>` or `module spider <term>` — these search module descriptions, not just names, and can find software that isn't visible until its dependencies are loaded.

## Loading Modules in Job Scripts

This is the single most important thing to understand about modules on a cluster: **modules loaded in your interactive session do not carry over into your batch jobs.**

When you submit a job with `sbatch`, it starts a fresh shell on a compute node. That shell has no memory of what you loaded on the login node. If your job needs Python, you must load it in the job script.

```bash
#!/bin/bash
#SBATCH --job-name=analysis
#SBATCH --ntasks=1
#SBATCH --mem=4G
#SBATCH --time=01:00:00

module purge                  # start clean
module load python/3.11.5     # load what you need

python3 my_analysis.py
```

The `module purge` at the top ensures you're starting from a known state, regardless of what might be loaded by default. Then you explicitly load exactly what your job requires. This makes your job script **self-contained and reproducible** — anyone can read it and know exactly what software environment it expects.

For more on job script structure, see [Submit Your First Job](../getting-started/first-job.md).

!!! danger "The #1 cause of \"command not found\" in jobs"
    If your job script fails with `command not found` or `No such file or directory`, the first thing to check is whether you forgot to `module load` the software. This is by far the most common mistake new cluster users make.

## Common Pitfalls

!!! warning "Conflicting modules"
    Loading two versions of the same software (e.g., `python/3.9.7` and `python/3.11.5`) leads to unpredictable behavior. The module system may warn you, or it may silently let both coexist with one shadowing the other. Always `module unload` or `module purge` before switching versions.

!!! warning "Modules in `.bashrc` — handle with care"
    You might be tempted to add `module load` commands to your `~/.bashrc` so your favorite software is always available. This works but is fragile:

    - It makes your environment depend on the current state of the module system. If a module is updated or renamed, your shell may throw errors every time you log in.
    - It can interfere with job scripts that expect a clean starting environment.
    - It makes your setup harder for collaborators to reproduce.

    If you do put module loads in `~/.bashrc`, keep them minimal and always use `module purge` at the top of your job scripts.

!!! warning "Forgetting module dependencies"
    Some software requires multiple modules. An MPI program might need both a compiler module and an MPI module loaded. If you load only one, the program may fail with confusing linker errors. Check the software's documentation or use `module show` to see if it lists any prerequisites.

## When NOT to Use Modules

Modules are the right tool for **system-level software**: compilers (GCC, Intel), MPI implementations (OpenMPI, MVAPICH), GPU toolkits (CUDA), and core scientific libraries. These are complex to build, need to be compiled for the specific cluster hardware, and are shared across many users.

Modules are **not** the right tool for managing Python packages, R libraries, or other language-specific dependencies. For those, use the language's own package manager inside an isolated environment:

- **Python packages**: Use virtual environments managed by a tool like `uv`. See [Getting Started with uv](../recipes/python/uv.md) for a complete walkthrough. You'll still use `module load python/3.11.5` to get a base Python interpreter, but your project's packages (`numpy`, `pandas`, `torch`, etc.) should live in a virtual environment, not come from modules.

- **R packages**: Install them into a user library with `install.packages()` inside an R session.

The distinction is about **scope**. Modules manage software that's shared across the cluster. Virtual environments and user libraries manage dependencies that are specific to your project. Mixing these up — trying to use modules for everything or ignoring modules entirely — leads to environments that are brittle and hard to reproduce.

## Quick Reference

| Command | What it does |
|---------|-------------|
| `module avail` | List all available modules |
| `module avail <term>` | Search for modules matching a term |
| `module load <name>` | Make software available in your session |
| `module unload <name>` | Remove a module from your session |
| `module list` | Show currently loaded modules |
| `module purge` | Unload all modules |
| `module show <name>` | Display what a module does (env var changes) |
| `module spider <name>` | Search module names and descriptions |

## What's Next

- [**Submit Your First Job**](../getting-started/first-job.md): Put your module knowledge to work in a real batch job
- [**Getting Started with uv**](../recipes/python/uv.md): Set up isolated Python environments on the cluster
- [**MPI Hello World**](../recipes/mpi/hello-world.md): Load compiler and MPI modules to run your first parallel program
