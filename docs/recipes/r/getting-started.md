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
    and use `renv` for reproducible environments — so your analysis works the same
    way every time, on any machine.

R is one of the most widely used tools for statistical analysis and data science.
Running it on {{ cluster.name }} gives you access to large memory, many cores, and
long-running jobs that would be impractical on a laptop. This page covers the
essentials for getting R working in that environment.

## Loading R with Modules

R is available on {{ cluster.name }} via the [modules system](../../fundamentals/modules.md),
which lets you load specific software versions without affecting anything else on
the system.

```bash
module avail R        # see available R versions
module load R/4.3.1   # load a specific version (use tab completion to see actual versions)
R --version           # verify
```

!!! tip "Always pin to a specific version"
    Always load a specific R version (e.g., `R/4.3.1`) rather than just `R`. If the
    default version changes, your code may break. Pinning to an explicit version is
    the first step toward reproducibility.

Once R is loaded, you can launch an interactive session with `R` or run scripts
with `Rscript`. To keep R available in future sessions, add the `module load` line
to your `~/.bashrc`.

## Installing R Packages

On a shared cluster you don't have write access to the system R library — installing
there would affect every user on the system. Instead, R automatically installs
packages to a **personal library** in your home directory, typically at a path like:

```
~/R/x86_64-pc-linux-gnu-library/4.3/
```

This happens transparently:

```r
install.packages("tidyverse")   # installs to personal library automatically
library(tidyverse)              # works normally
```

The first time you call `install.packages()` in a new R version, R will ask whether
it should create a personal library directory. Say yes. After that, all package
installs go there silently.

One important detail: packages that contain C, C++, or Fortran code are **compiled
at install time**. This means the compiled code is tied to the R version and system
libraries that were active when you installed it. If you switch R versions, you may
need to reinstall those packages.

## Packages That Need System Libraries

Some R packages depend on external system libraries that must be present when the
package is compiled. Common examples:

| Package | Needs |
|---|---|
| `sf`, `terra` | GDAL, GEOS, PROJ (geospatial libraries) |
| `rJava` | Java runtime |
| `curl` | libcurl |
| `RPostgres` | libpq (PostgreSQL client) |

If you see errors like `configure: error: gdal-config not found` during
`install.packages()`, the required system library is not loaded. Use `module load`
to bring it in first:

```bash
module load gdal        # load the geospatial stack
```

Then, from within R:

```r
install.packages("sf")
```

!!! tip "Reading error messages"
    Package compilation errors are verbose but usually contain the key clue near the
    end. Search for `configure: error:` or `not found` in the output — it will name
    the missing library. Then `module avail <library-name>` to find the right module.

## `renv` for Reproducible Environments

The problem with `install.packages()` is that it always installs the **latest
version** of a package. Run your analysis today, come back in a year, and
`install.packages()` will give you a different version of `dplyr` — which may
behave differently, or break your code entirely.

[`renv`](https://rstudio.github.io/renv/) solves this by locking all package
versions into a `renv.lock` file — the same concept as Python's `uv.lock` (see
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
plain text and human-readable — you can inspect it to see exactly what's installed.

!!! tip "Commit `renv.lock` to git"
    The lock file is most useful when it lives in version control. Anyone who clones
    your repo can run `renv::restore()` to get the exact same packages. This is the
    R equivalent of the approach described in [Getting Started with uv](../python/uv.md).

## Where to Install Packages

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
    Don't set `R_LIBS_USER` to a scratch directory — scratch files are purged
    automatically on a rolling schedule. Your home directory or a DartFS project
    directory is the right place for your R library. See
    [Storage Fundamentals](../../fundamentals/storage.md) for details on which
    storage tier to use.

## What's Next

- [Running R Batch Jobs](batch-job.md) — submitting R scripts to the cluster scheduler
- [Environment Modules](../../fundamentals/modules.md) — how the module system works
- [Storage Fundamentals](../../fundamentals/storage.md) — where to keep your data and libraries
