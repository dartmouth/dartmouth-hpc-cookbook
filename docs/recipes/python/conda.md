---
title: "Conda/Mamba Environments"
description: "When and how to use Conda or Mamba as an alternative Python environment manager on {{ cluster.name }}"
tags:
  - python
  - conda
---

# Conda/Mamba Environments

!!! abstract "What we're cooking"
    When to reach for Conda instead of `uv`, how to load it on
    {{ cluster.name }} without blowing your home quota, and how to use Conda
    environments safely in Slurm batch jobs.

The recommended environment manager for most Python work on {{ cluster.name }}
is [`uv`](uv.md). It's faster, lighter, and purpose-built for Python. But Conda
solves a different problem: managing *non-Python* dependencies alongside Python.
If you need it, this recipe shows you how to use it well.

---

## When to Use Conda Instead of uv

Default to `uv`. Reach for Conda when one of these is true:

| Situation | Why Conda helps |
|---|---|
| You need non-Python software (GDAL, HDF5, CUDA toolkit, R packages) | Conda manages compiled libraries, not just Python packages |
| You received an `environment.yml` from a collaborator | Reproducing someone else's Conda environment is one command |
| You need bioinformatics tools from [Bioconda](https://bioconda.github.io/) | Tools like `samtools`, `bwa`, and `STAR` live there, not on PyPI |
| You need a very specific Python version that isn't available via modules | Conda can install any Python version into an environment |

If none of these apply, stick with `uv`. Conda environments are larger, slower
to create, and more prone to dependency conflicts.

---

## Mamba vs. Conda

Mamba is a drop-in replacement for the `conda` command. It reimplements the
dependency solver in C++, which makes environment creation and package
installation **significantly faster** — often 5–10× on complex environments.

Every `conda` command can be replaced with `mamba`:

```bash
mamba create -n myenv python=3.11   # same as: conda create ...
mamba install numpy                  # same as: conda install ...
mamba env export > environment.yml   # same as: conda env export ...
```

Check what's available on {{ cluster.name }}:

```bash
module avail mamba
module avail conda
```

Load whichever is available, preferring `mamba`:

```bash
module load mamba    # if available
# or
module load miniconda
```

---

## Loading Conda on the Cluster

{{ cluster.name }} provides a shared Conda installation via the module system.
Always use it — never install your own Anaconda or Miniconda in your home
directory.

```bash
module load miniconda   # exact name may vary; check: module avail conda
```

!!! danger "Do not install Anaconda in your home directory"
    A full Anaconda installation contains hundreds of pre-installed packages and
    can consume **5–10 GB** of your home quota before you've created a single
    environment. The module-provided installation is shared across all users and
    counts against no one's quota. Use it.

After loading the module, initialize Conda for your shell session:

```bash
conda init bash   # or: conda init zsh
```

You only need to run `conda init` once. It adds a small block to your
`~/.bashrc` (or `~/.zshrc`) that activates the base environment automatically
on login. Restart your shell (or `source ~/.bashrc`) after running it.

---

## Creating and Activating Environments

### Default location (home directory)

```bash
conda create -n myenv python=3.11
conda activate myenv
conda install numpy scipy
```

This creates the environment under `~/.conda/envs/myenv`. That's fine for
small environments, but Conda environments grow quickly. See the quota warning
below.

### Preferred: store on scratch

For any environment larger than a few hundred megabytes, create it on scratch
instead:

```bash
conda create --prefix {{ storage.scratch_path }}/envs/myenv python=3.11
conda activate {{ storage.scratch_path }}/envs/myenv
```

The `--prefix` flag sets an explicit path instead of a name. Activation works
the same way — just pass the full path instead of the name.

!!! tip "Set a default env location in `.condarc`"
    To make all environments land on scratch automatically, add this to
    `~/.condarc`:

    ```yaml
    envs_dirs:
      - {{ storage.scratch_path }}/envs
      - ~/.conda/envs
    ```

    After this, `conda create -n myenv` will create the environment at
    `{{ storage.scratch_path }}/envs/myenv` by default.

---

## Installing from Channels

Conda packages are distributed through *channels*. The two most important are:

- **`conda-forge`** — community-maintained, broad coverage, usually more
  up-to-date than `defaults`. Use this for most packages.
- **`bioconda`** — bioinformatics tools: aligners, variant callers, genome
  browsers, and more.

Install from a specific channel with `-c`:

```bash
conda install -c conda-forge gdal
conda install -c bioconda samtools
```

### Setting channel priority in `.condarc`

For any project that uses conda-forge or bioconda regularly, configure your
`~/.condarc` file to set channel order and enforce strict priority:

```yaml
channels:
  - conda-forge
  - bioconda
  - defaults
channel_priority: strict
```

`strict` priority means Conda will not mix packages across channels for the
same dependency. This prevents subtle version conflicts that can arise when
conda-forge and defaults both supply a package.

!!! warning "Slow `conda install`? Try mamba or set strict priority"
    The `conda` solver can be very slow on complex environments, especially
    without strict channel priority. If installation hangs at "Solving
    environment…", either switch to `mamba` (same commands, much faster solver)
    or add `channel_priority: strict` to your `.condarc`.

---

## Exporting and Restoring Environments

### Export an environment

There are two ways to export, and they behave very differently:

```bash
# Full export: exact pinned versions of every package (platform-specific)
conda env export > environment.yml

# History export: only what you explicitly installed (portable)
conda env export --from-history > environment.yml
```

| Method | Pros | Cons |
|---|---|---|
| Full export | Perfectly reproducible on the same platform | Won't work on a different OS or architecture |
| `--from-history` | Portable across platforms, re-resolves versions | Less precisely pinned |

**Recommendation:** Use `--from-history` when sharing environments with
collaborators or between machines (e.g., laptop → cluster). Use the full export
when you need a snapshot that must be bit-for-bit reproducible.

### Restore an environment

```bash
conda env create -f environment.yml
```

If the file was created with `--from-history`, Conda will re-solve and install
the latest compatible versions. If it was a full export, it will try to
recreate the exact environment.

---

## Using Conda Environments in Slurm Jobs

`conda activate` relies on shell functions that aren't available in a non-interactive
batch job by default. A bare `conda activate myenv` in a batch script will fail
silently or with an error like:

```
CommandNotFoundError: Your shell has not been properly configured to use 'conda activate'.
```

The fix is to source Conda's shell integration before activating:

```bash
source $(conda info --base)/etc/profile.d/conda.sh
conda activate myenv
```

### Complete Slurm batch script

```bash
#!/bin/bash
#SBATCH --job-name=conda-job
#SBATCH --output=logs/%x_%j.out
#SBATCH --time=02:00:00
#SBATCH --mem=16G
#SBATCH --cpus-per-task=4

# Load the module-provided Conda
module load miniconda

# Initialize Conda for this non-interactive shell
source $(conda info --base)/etc/profile.d/conda.sh

# Activate your environment
conda activate myenv
# or, for a prefix-based environment:
# conda activate {{ storage.scratch_path }}/envs/myenv

python my_script.py
```

### Alternative: use the environment's Python directly

If you want to avoid activation entirely, call Python using its full path
inside the environment:

```bash
/path/to/envs/myenv/bin/python my_script.py
```

This works without any `conda activate` and is useful for simple one-liners.
You can find the path with `conda env list`.

!!! tip "Find your environment's Python path"
    ```bash
    conda activate myenv
    which python
    ```
    Copy the output path and use it directly in your Slurm script.

---

## Home Directory Quota Warning

Conda environments can balloon to several gigabytes each. A typical scientific
environment with NumPy, SciPy, and a few other packages easily reaches 1–3 GB.
Add PyTorch or a bioinformatics stack and you're looking at 5–20 GB.

{{ cluster.name }} home directories have a limited quota. Filling it up will
break logins and job submissions.

**Keep environments on scratch or a project directory.** Configure `.condarc`
to default to scratch (see the `envs_dirs` tip above), or always use `--prefix`
with a scratch path when creating environments.

!!! warning "Check your environment sizes"
    ```bash
    du -sh ~/.conda/envs/*
    du -sh {{ storage.scratch_path }}/envs/*
    ```

    Remove environments you no longer need:

    ```bash
    conda env remove -n old-env
    # or for prefix-based:
    conda env remove --prefix {{ storage.scratch_path }}/envs/old-env
    ```

---

## Common Pitfalls

!!! danger "Installing Anaconda in your home directory"
    Don't do it. The full Anaconda distribution is 5+ GB before you install
    anything. Use `module load miniconda` to access a shared installation that
    doesn't count against your quota.

!!! warning "Mixing pip and conda in the same environment"
    It's sometimes necessary (if a package isn't on any Conda channel), but
    it's risky. Conda doesn't know about packages installed by pip, so it may
    overwrite them or create conflicts when you install or update other packages.
    If you must mix them:

    - Install everything you can via Conda first.
    - Use pip for the remaining packages as a final step.
    - Don't run `conda install` again after using `pip` in the same environment.

!!! danger "`conda activate` fails in batch jobs"
    `conda activate` requires shell functions that aren't set up in
    non-interactive scripts. Always add this line before activating in a Slurm
    job:

    ```bash
    source $(conda info --base)/etc/profile.d/conda.sh
    ```

!!! tip "Environment creation is painfully slow"
    Switch to `mamba` — it uses the same syntax as `conda` but resolves
    dependencies far faster. Also set `channel_priority: strict` in your
    `~/.condarc` to reduce the search space.

---

## Next Steps

- **Prefer `uv` for pure Python work** — see the [uv recipe](uv.md) for a
  faster, simpler workflow when you don't need non-Python dependencies.
- **Submit your first job** — once your environment is ready, the
  [interactive jobs](../slurm/interactive-jobs.md) recipe walks you through
  testing it before committing to a batch run.
- **Containers as an alternative** — for fully reproducible, shareable
  environments that include system libraries, see the
  [Apptainer recipe](../containers/apptainer.md).
