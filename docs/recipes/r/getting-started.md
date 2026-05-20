---
title: "R on the Cluster"
description: "How to load R, install packages, and manage reproducible environments on {{ cluster.name }}"
tags:
  - r
  - beginner
  - reproducibility
---

# R on the Cluster

!!! abstract "What we're cooking"
    How to load R on {{ cluster.name }}, install packages to your personal library,
    and use `renv` for reproducible environments so your analysis works the same
    way every time, on any machine.

R is one of the most widely used tools for statistical analysis and data science.
Running it on {{ cluster.name }} gives you access to large memory, many cores, and
long-running jobs that would be impractical on a laptop. This page covers the
essentials for getting R working in that environment.

## Loading R

R on {{ cluster.name }} runs inside an Apptainer container via the
`r-rocker-ml-verse` module. This container is based on the
[rocker/ml-verse](https://rocker-project.org/images/versioned/cuda.html) Docker
image and bundles R along with a large collection of pre-installed packages and
system libraries. It is the same environment used by RStudio in
[Open OnDemand]({{ cluster.ondemand_url }}).

```bash
module spider r-rocker-ml-verse          # see available R versions
module load r-rocker-ml-verse/4.4.0+apptainer   # load a specific version
R --version                              # verify
```

!!! tip "Always pin to a specific version"
    Always load a specific version (e.g., `r-rocker-ml-verse/4.4.0+apptainer`)
    rather than a bare module name. If the default version changes, your code may
    break. Pinning to an explicit version is the first step toward reproducibility.

Once R is loaded, you can launch an interactive session with `R` or run scripts
with `Rscript`.

!!! note "Shell aliases in non-interactive scripts"
    The `r-rocker-ml-verse` module creates shell aliases so that `R` and `Rscript`
    run inside the container. In batch scripts (which run in non-interactive bash),
    you need to enable alias expansion with `shopt -s expand_aliases` after loading
    the module. See [Running R Batch Jobs](batch-job.md) for details.

## Installing R Packages

On a shared cluster you don't have write access to the system R library. Instead,
R automatically installs packages to a **personal library** in your home directory,
typically at a path like:

```
~/R/x86_64-pc-linux-gnu-library/4.4/
```

This happens transparently:

```r
install.packages("tidyverse")   # installs to personal library automatically
library(tidyverse)              # works normally
```

The first time you call `install.packages()` in a new R version, R will ask whether
it should create a personal library directory. Say yes. After that, all package
installs go there silently.

!!! warning "Don't install packages inside batch jobs"
    Run `install.packages()` in an interactive session (terminal or RStudio), not
    inside a script submitted with `sbatch`. Package installation can be slow,
    requires network access, and may prompt for user input.

### Installing binary packages (faster installs from the CLI)

When you install packages from the command line (not through RStudio), R defaults
to downloading **source** packages and compiling them locally. This can be slow
and error-prone. [Posit](https://packagemanager.posit.co/client/#/repos/2/overview/)
hosts a repository with pre-built **binary** packages for Linux that install much
faster.

RStudio on Open OnDemand is pre-configured to use binaries. If you install
packages from the CLI, you can get the same benefit by specifying the Posit
repository:

```r
# Determine the correct binary repository for this Linux distribution
repos <- c(CRAN = paste0(
  'https://packagemanager.posit.co/cran/__linux__/',
  system2('lsb_release', c('-c', '-s'), stdout = TRUE),
  '/latest'
))

install.packages("dplyr", repos = repos, dependencies = TRUE)
```

To make this the default for all future sessions, add the following to `~/.Rprofile`:

```r
options(repos = c(CRAN = paste0(
  'https://packagemanager.posit.co/cran/__linux__/',
  system2('lsb_release', c('-c', '-s'), stdout = TRUE),
  '/latest'
)))
options(HTTPUserAgent = sprintf(
  "R/%s R (%s)", getRversion(),
  paste(getRversion(), R.version["platform"], R.version["arch"], R.version["os"])
))
```

## Packages that need system libraries

Some R packages depend on external C/C++ libraries (GDAL, GEOS, PROJ, libcurl,
Java, etc.). On many HPC systems you'd need to load these yourself before
compiling the package. On {{ cluster.name }}, the `r-rocker-ml-verse` container
**already includes most of these dependencies**, because it is built from the
rocker/ml-verse image which bundles a wide set of system libraries commonly needed
by R packages.

This means packages like `sf`, `terra`, `curl`, and many others will install
without extra steps:

```r
install.packages("sf")    # system libs (GDAL, GEOS, PROJ) are already in the container
```

If you do hit a `configure: error: ... not found` message, it means the library
is not included in the container. In that case,
[contact {{ institution.support_team }}]({{ institution.support_url }}) for help
getting the dependency added.

!!! tip "Reading error messages"
    Package compilation errors are verbose but usually contain the key clue near the
    end. Search for `configure: error:` or `not found` in the output to identify
    the missing library.

## `renv` for reproducible environments

The problem with `install.packages()` is that it always installs the **latest
version** of a package. Run your analysis today, come back in a year, and
`install.packages()` will give you a different version of `dplyr`, which may
behave differently or break your code entirely.

[`renv`](https://rstudio.github.io/renv/) solves this by locking all package
versions into a `renv.lock` file, the same concept as Python's `uv.lock` (see
[Getting Started with uv](../python/uv.md) for the Python equivalent). When someone
else clones your project, or when you return to it after a year, `renv::restore()`
recreates the exact same package environment.

Basic workflow:

```r
install.packages("renv")
renv::init()          # initialize renv in your project directory
# install your packages normally with install.packages()...
renv::snapshot()      # record current package versions to renv.lock
renv::restore()       # on any other machine: restore the exact versions
```

`renv::init()` creates a project-local library so packages installed inside the
project don't affect your global library, and vice versa. The `renv.lock` file is
plain text and human-readable; you can inspect it to see exactly what's installed.

!!! tip "Commit `renv.lock` to git"
    The lock file is most useful when it lives in version control. Anyone who clones
    your repo can run `renv::restore()` to get the exact same packages. This is the
    R equivalent of the approach described in [Getting Started with uv](../python/uv.md).

### `renv` and R versions on {{ cluster.name }}

`renv` records the R version in `renv.lock`, but it does **not** manage the R
executable itself. You are responsible for loading the matching R version before
activating your environment:

```bash
module load r-rocker-ml-verse/4.4.0+apptainer   # load the R version renv expects
R
```

If you activate an renv environment with a different R version than the one
recorded, renv will warn you and offer to update the recorded version.

### `renv` in batch jobs

`renv` auto-activates through an `.Rprofile` file in your project directory. If
you run `Rscript` from the same directory, this works automatically. However, two
common situations break auto-activation:

- Running `Rscript` from a **different directory** than the project root.
- Using the `--vanilla` or `--no-init-file` flags, which skip `.Rprofile`.

In either case, add an explicit activation line at the top of your R script:

```r
source("/path/to/your/project/renv/activate.R")
# or equivalently:
renv::load("/path/to/your/project")
```

See [Running R Batch Jobs](batch-job.md) for complete batch job examples.

## Where to install packages

Your personal R library (`~/R/...`) lives in your home directory by default. Home
directory storage on {{ cluster.name }} is **persistent** and backed up, so this is
the right default for most users.

For very large package collections (hundreds of packages, or packages with large
compiled artifacts), you can redirect the library by setting the `R_LIBS_USER`
environment variable in your `~/.bashrc`:

```bash
export R_LIBS_USER=/path/to/your/project/R/library
```

!!! warning "Don't install packages in scratch"
    Don't set `R_LIBS_USER` to a scratch directory. Scratch files are purged
    automatically on a rolling schedule. Your home directory or a work/project
    directory is the right place for your R library. See
    [Storage Fundamentals](../../fundamentals/storage.md) for details on which
    storage tier to use.

## What's next

- [Running R Batch Jobs](batch-job.md) — submitting R scripts to the cluster scheduler
- [Environment Modules](../../fundamentals/modules.md) — how the module system works
- [Storage Fundamentals](../../fundamentals/storage.md) — where to keep your data and libraries
