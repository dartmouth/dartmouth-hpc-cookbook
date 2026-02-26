---
title: Python with Virtual Environments
description: Set up and use Python virtual environments on the cluster
tags:
  - python
  - beginner
---

# Python with Virtual Environments (venv)

!!! abstract "What you'll learn"
    How to create, activate, and use Python virtual environments on
    {{ cluster.name }} for reproducible, isolated Python workflows.

## Why Use a venv on the Cluster?

The system Python on {{ cluster.name }} is shared and locked down — you can't
`pip install` into it. Virtual environments give you an isolated space to
install exactly the packages you need without conflicting with other users or
system packages.

!!! warning "Don't use `pip install --user`"
    While `--user` installs technically work, they pollute your home directory
    and create version conflicts across projects. Always use a venv instead.

## Step-by-Step

### 1. Load a Python Module

First, check what Python versions are available:

```bash
module avail python
```

Load the version you want:

```bash
module load python/3.11  # (1)!
```

1. Check `module avail python` for the latest available versions.

### 2. Create the Virtual Environment

```bash
python -m venv ~/envs/myproject  # (1)!
```

1. Store venvs in `~/envs/` to keep things organized. You can also place them
   in your project directory.

### 3. Activate and Install Packages

```bash
source ~/envs/myproject/bin/activate
pip install --upgrade pip
pip install numpy pandas scikit-learn
```

!!! tip "Pin your dependencies"
    Always save your requirements for reproducibility:
    ```bash
    pip freeze > requirements.txt
    ```

### 4. Use in a Batch Job

{{ sbatch_template(
    job_name="python_venv",
    partition="standard",
    time="02:00:00",
    cpus=4,
    mem="8G",
    modules=["python/3.11"],
    commands="source ~/envs/myproject/bin/activate\npython my_analysis.py"
) }}

Submit it:

```bash
sbatch run_analysis.sh
```

## Common Pitfalls

??? failure "ModuleNotFoundError in batch job"
    You probably forgot to activate the venv in your sbatch script. Make sure
    `source ~/envs/myproject/bin/activate` appears **after** `module load` and
    **before** your `python` command.

??? failure "Disk quota exceeded when installing packages"
    Your home directory has a quota. For large environments (especially ML
    packages), create the venv on scratch storage instead:
    ```bash
    python -m venv /scratch/$USER/envs/myproject
    ```
    Remember that scratch is **not backed up** — keep your `requirements.txt`
    in version control.

??? failure "Wrong Python version inside the venv"
    The venv is tied to the Python that created it. If you loaded
    `python/3.9` when you created it, the venv uses 3.9 regardless of what
    module is currently loaded. Create a new venv if you need a different
    version.

## Next Steps

- [Python with Conda](conda.md) — if you need packages with complex compiled
  dependencies (e.g., GDAL, MPI bindings)
- [Jupyter on the Cluster](jupyter.md) — run Jupyter notebooks using your venv
  as a kernel
- [Dask for Parallel Computing](dask.md) — scale your Python workload across
  multiple nodes