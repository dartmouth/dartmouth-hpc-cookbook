---
title: "Conda Environments"
description: "When and how to use Conda on {{ cluster.name }} for managing non-Python dependencies alongside Python"
tags:
  - python
  - conda
---

# Conda Environments

!!! abstract "What we're cooking"
    When to reach for Conda instead of `uv`, how to load it on
    {{ cluster.name }} without blowing your home quota, and how to use Conda
    environments safely in Slurm batch jobs.

The recommended environment manager for most Python work on {{ cluster.name }}
is [`uv`](uv.md). It's faster, lighter, and purpose-built for Python. But Conda
solves a different problem: it manages *non-Python* compiled libraries and tools
alongside Python. If you need that, this recipe shows you how to use it well.

---

## When to use Conda instead of uv

Default to `uv`. Reach for Conda when one of these is true:

| Situation | Why Conda helps |
|---|---|
| You need non-Python software (GDAL, HDF5, CUDA toolkit, R packages) | Conda manages compiled libraries, not just Python packages |
| You received an `environment.yml` from a collaborator | Reproducing someone else's Conda environment is one command |
| You need bioinformatics tools from [Bioconda](https://bioconda.github.io/) | Tools like `samtools`, `bwa`, and `STAR` live there, not on PyPI |

If none of these apply, stick with `uv`. Conda environments are larger, slower
to create, and more prone to dependency conflicts.

---

## Loading Conda on the cluster

{{ cluster.name }} provides a shared Conda installation via the module system.
Always use it; never install your own Anaconda or Miniconda in your home
directory.

```bash
module load conda/latest
```

This loads [Miniforge](https://github.com/conda-forge/miniforge), a lightweight
Conda distribution that uses `conda-forge` as its default channel and ships with
the fast `libmamba` solver built in. From your perspective it works exactly like
any other Conda installation.

!!! danger "Do not install Anaconda in your home directory"
    A full Anaconda installation contains hundreds of pre-installed packages and
    can consume **5-10 GB** of your home quota before you've created a single
    environment. The module-provided installation is shared across all users and
    counts against no one's quota. Use it.

---

## Creating and activating environments

After loading the module, create and activate an environment:

```bash
module load conda/latest

conda create -n myenv python=3.12
conda activate myenv
conda install numpy scipy
```

By default, this creates the environment under `~/.conda/envs/myenv`. That's
fine for small environments, but Conda environments grow quickly. See the next
section for how to keep them off your home directory.

---

## Keep large environments off your home directory

Conda environments can balloon to several gigabytes each. A typical scientific
environment with NumPy, SciPy, and a few compiled libraries easily reaches
1-3 GB. Add a bioinformatics stack or geospatial tools and you're looking at
5-20 GB.

{{ cluster.name }} home directories have a limited quota ({{ storage.home_quota }}).
Filling it up will break logins and job submissions.

Create environments on [scratch storage](../../fundamentals/storage.md) or in
your PI's `/work` directory instead:

```bash
# Option 1: scratch (fast, but may be purged periodically)
conda create --prefix /path/to/your/scratch/envs/myenv python=3.12

# Option 2: /work (persistent, shared with your PI group)
mkdir -p /work/pi_yourpi/envs
conda create --prefix /work/pi_yourpi/envs/myenv python=3.12
```

The `--prefix` flag sets an explicit path instead of a name. Activation works
the same way; just pass the full path:

```bash
conda activate /path/to/your/scratch/envs/myenv
```

See the [storage guide](../../fundamentals/storage.md) for how scratch and
`/work` are organized on {{ cluster.name }}.

!!! tip "Set a default env location"
    To make all environments land outside your home directory automatically,
    add these to your `~/.condarc`:

    ```yaml
    envs_dirs:
      - /path/to/your/scratch/envs
      - ~/.conda/envs
    ```

    After this, `conda create -n myenv` will create the environment at
    `/path/to/your/scratch/envs/myenv` by default.

    Alternatively, set environment variables in your `~/.bashrc`:

    ```bash
    export CONDA_ENVS_PATH=/path/to/your/scratch/envs
    export CONDA_PKGS_DIRS=/path/to/your/scratch/conda-pkgs
    ```

    The `CONDA_PKGS_DIRS` variable redirects the package cache too, which can
    also eat significant home directory space.

!!! warning "Check your environment sizes"
    ```bash
    du -sh ~/.conda/envs/*
    du -sh ~/.conda/pkgs
    ```

    Remove environments you no longer need:

    ```bash
    conda env remove -n old-env
    # or for prefix-based:
    conda env remove --prefix /path/to/your/scratch/envs/old-env
    ```

    The package cache (`~/.conda/pkgs`) is safe to clear at any time:

    ```bash
    conda clean --all
    ```

---

## Installing from channels

Conda packages are distributed through *channels*. The two most important are:

- **`conda-forge`**: community-maintained, broad coverage, usually more
  up-to-date than `defaults`. This is the default channel on {{ cluster.name }}
  because the module loads Miniforge.
- **`bioconda`**: bioinformatics tools (aligners, variant callers, genome
  browsers, and more).

Install from a specific channel with `-c`:

```bash
conda install -c conda-forge gdal
conda install -c bioconda samtools
```

### Setting channel priority in `.condarc`

For any project that uses bioconda regularly, configure your `~/.condarc` file
to set channel order and enforce strict priority:

```yaml
channels:
  - conda-forge
  - bioconda
  - defaults
channel_priority: strict
```

`strict` priority means Conda will not mix packages across channels for the
same dependency. This prevents subtle version conflicts that can arise when
multiple channels supply the same package.

---

## Example: Geospatial analysis with GDAL

This example shows why Conda exists: GDAL is a C/C++ library for reading and
writing geospatial data formats. Installing it with `pip` requires system-level
headers and build tools that you don't have on the cluster. Conda installs the
compiled library and its Python bindings together.

### Create the environment

```bash
module load conda/latest

conda create --prefix /path/to/your/scratch/envs/geo python=3.12
conda activate /path/to/your/scratch/envs/geo

conda install -c conda-forge gdal rasterio geopandas
```

### Write a test script

Save this as `check_geo.py`:

```python
import rasterio
import geopandas as gpd
from osgeo import gdal

print(f"GDAL version: {gdal.__version__}")
print(f"Rasterio version: {rasterio.__version__}")
print(f"GeoPandas version: {gpd.__version__}")

# Quick check that GDAL can list its supported drivers
drivers = [gdal.GetDriver(i).ShortName for i in range(gdal.GetDriverCount())]
print(f"GDAL knows {len(drivers)} raster/vector drivers")
print("Sample drivers:", drivers[:10])
```

### Submit a batch job

```bash
#!/bin/bash
#SBATCH --job-name=geo-test
#SBATCH --partition=cpu
#SBATCH --time=00:10:00
#SBATCH --cpus-per-task=1
#SBATCH --mem=4G
#SBATCH --output=%x_%j.out
#SBATCH --error=%x_%j.err

# Load Conda and activate the environment
module load conda/latest
conda activate /path/to/your/scratch/envs/geo

python check_geo.py
```

The key point: the `conda install` brought in the compiled GDAL library, its
system dependencies (libproj, libgeos, etc.), and the Python bindings, all
resolved together. Trying this with `pip install gdal` on the cluster would
fail because the C headers aren't available.

---

## Exporting and restoring environments

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
collaborators or between machines (e.g., laptop to cluster). Use the full export
when you need a snapshot that must be bit-for-bit reproducible.

### Restore an environment

```bash
conda env create -f environment.yml
```

If the file was created with `--from-history`, Conda will re-solve and install
the latest compatible versions. If it was a full export, it will try to
recreate the exact environment.

---

## Using Conda environments in Slurm jobs

In batch scripts, load the module and activate your environment the same way
you would interactively:

```bash
module load conda/latest
conda activate myenv
```

See the [geospatial example above](#submit-a-batch-job) for a complete Slurm
script.

---

## Using Conda environments in Jupyter

If you use JupyterLab through [Open OnDemand](../open-ondemand/apps.md), you
can register any Conda environment as a Jupyter kernel so it appears in the
kernel picker.

First, activate your environment and install `ipykernel`:

```bash
module load conda/latest
conda activate myenv

conda install ipykernel
```

Then register it:

```bash
python -m ipykernel install --user --name myenv --display-name "My Conda Env"
```

The `--display-name` is what shows up in the JupyterLab kernel menu. After
registering, reload the JupyterLab page (or restart the server) and the new
kernel will appear.

To remove a kernel you no longer need:

```bash
jupyter kernelspec uninstall myenv
```

---

{% include "site/conda-presets.md" %}

## Common pitfalls

??? failure "Installing Anaconda in your home directory"
    Don't do it. The full Anaconda distribution is 5+ GB before you install
    anything. Use `module load conda/latest` to access a shared installation
    that doesn't count against your quota.

??? failure "Mixing pip and conda in the same environment"
    It's sometimes necessary (if a package isn't on any Conda channel), but
    it's risky. Conda doesn't know about packages installed by pip, so it may
    overwrite them or create conflicts when you install or update other packages.
    If you must mix them:

    - Install everything you can via Conda first.
    - Use pip for the remaining packages as a final step.
    - Don't run `conda install` again after using `pip` in the same environment.

---

## Next steps

- **Prefer `uv` for pure Python work**: see the [uv recipe](uv.md) for a
  faster, simpler workflow when you don't need non-Python dependencies.
- **Submit your first job**: once your environment is ready, the
  [interactive jobs](../slurm/interactive-jobs.md) recipe walks you through
  testing it before committing to a batch run.
- **Containers as an alternative**: for fully reproducible, shareable
  environments that include system libraries, see the
  [Apptainer recipe](../containers/apptainer.md).
