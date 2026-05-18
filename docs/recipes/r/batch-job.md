---
title: "Running R Batch Jobs"
description: "How to run R scripts as non-interactive batch jobs on {{ cluster.name }}"
tags:
  - r
  - slurm
  - intermediate
---

# Running R Batch Jobs

!!! abstract "What we're cooking"
    How to submit R scripts as batch jobs on {{ cluster.name }}, from a minimal
    single-core script to a parallel job using multiple cores.

!!! tip "New to R on the cluster?"
    Read [R on the Cluster](getting-started.md) first to set up your R environment
    and install packages before submitting batch jobs.

Running R interactively is useful for exploration, but for real analyses (anything
that takes more than a few minutes, uses large datasets, or needs many cores) you
want to submit a **batch job**. Batch jobs run on compute nodes unattended, freeing
your terminal and letting the scheduler allocate the resources you need.

## Running R non-interactively

There are two ways to run an R script from the command line:

- **`Rscript myscript.R`** is the modern, recommended approach. Runs the script and
  exits. Output goes to stdout, which Slurm captures in your log file.
- **`R CMD BATCH myscript.R output.Rout`** is the older approach. Captures all output
  (including the R startup banner) to a `.Rout` file rather than stdout.

Use `Rscript`. It respects command-line arguments via `commandArgs()`, writes output
where Slurm expects it, and produces cleaner logs. `R CMD BATCH` is common in older
scripts you may encounter, but there's no reason to start new work with it.

## A minimal batch job

Here is a complete, working job script for a single-core R job:

```bash
#!/bin/bash
#SBATCH --job-name=my-r-analysis
#SBATCH --ntasks=1
#SBATCH --cpus-per-task=1
#SBATCH --mem=8G
#SBATCH --time=02:00:00
#SBATCH --output=logs/analysis_%j.out
#SBATCH --error=logs/analysis_%j.err

module load r-rocker-ml-verse/4.4.0+apptainer
shopt -s expand_aliases

Rscript analysis.R
```

A few things worth noting:

- **`shopt -s expand_aliases`** is required. The `r-rocker-ml-verse` module defines
  `R` and `Rscript` as shell aliases that run inside an Apptainer container. Bash
  does not expand aliases in non-interactive scripts by default, so without this
  line `Rscript` will not be found.
- **The `logs/` directory must exist before you submit.** Slurm will not create it
  for you. Run `mkdir -p logs` once before your first `sbatch`.
- **`%j` in the filename** is replaced by the job ID, so each run gets its own log
  file and nothing gets overwritten.

Submit with:

```bash
mkdir -p logs
sbatch job.sh
```

## Memory for R

R loads all data into RAM. A 1 GB CSV file becomes roughly 1–4 GB in memory once
parsed and stored as R data frames, depending on data types. Underestimating memory
is one of the most common reasons R batch jobs fail with `OOM` (out of memory)
errors.

To estimate how much memory your script actually needs, run it interactively via
an [interactive job](../slurm/interactive-jobs.md) or RStudio in
[Open OnDemand](../open-ondemand/getting-started.md) and check memory at the peak
point in your script:

```r
# install.packages(c("pryr", "lobstr"))
pryr::mem_used()          # total R memory in use right now
lobstr::obj_size(my_df)   # size of a specific object
```

Take the peak number and add **20% headroom**. If your script uses 12 GB at peak,
request `--mem=15G`. This buffer accounts for R's internal overhead and prevents
edge-case failures on slightly larger inputs.

## Reading data in a job

Jobs run on compute nodes that may differ from the login node, so file paths matter.

- **Use absolute paths** or paths relative to `$SLURM_SUBMIT_DIR` (the directory
  where you ran `sbatch`). Relative paths like `./data/input.csv` work fine because
  Slurm sets the working directory to the submission directory by default.
- **For large input files**, stage data to scratch before your R script reads it.
  Scratch storage offers better I/O throughput than network-mounted filesystems
  for heavy read workloads. See
  [Storage Fundamentals](../../fundamentals/storage.md) for details.

Reading a file from scratch in R:

```r
df <- read.csv("/path/to/your/scratch/mydata.csv")
```

!!! note "Scratch paths on {{ cluster.name }}"
    {{ cluster.name }} organizes scratch as workspaces, not as per-user directories.
    Use the actual path to your scratch workspace rather than constructing one from
    `$USER`. See [Storage Fundamentals](../../fundamentals/storage.md) for how
    scratch workspaces are set up.

## Parallel R

R runs single-threaded by default. To use multiple cores, you must explicitly
parallelize your code and tell R how many cores it has been allocated.

### Option A: `parallel` package (built-in)

The `parallel` package is included with every R installation. `mclapply()` is a
drop-in parallel replacement for `lapply()`:

```r
library(parallel)
n_cores <- as.integer(Sys.getenv("SLURM_CPUS_PER_TASK", unset = "1"))
results <- mclapply(my_list, my_function, mc.cores = n_cores)
```

Request cores in your job script with `#SBATCH --cpus-per-task=8`. Reading the
allocation from `$SLURM_CPUS_PER_TASK` at runtime means your script adapts
automatically if you change the allocation, no code changes required.

### Option B: `future` + `furrr` (modern approach)

[`future`](https://future.futureverse.org/) and
[`furrr`](https://furrr.futureverse.org/) give you parallel versions of the
tidyverse `purrr` functions with minimal changes to existing code:

```r
library(future)
library(furrr)
plan(multisession, workers = as.integer(Sys.getenv("SLURM_CPUS_PER_TASK", unset = "1")))
results <- future_map(my_list, my_function)
```

`future` also supports distributed computing across multiple nodes, making it a
good choice if you anticipate needing to scale beyond a single machine.

### Option C: `foreach` + `doParallel`

This combination is common in older R code and CRAN packages. If you encounter it
in code you're adapting, it works reliably, but `parallel` or `future` are
cleaner choices for new code.

!!! warning "Never call `detectCores()` in a batch job"
    `detectCores()` returns the total number of CPU cores on the physical node,
    often 48 or 96. Your job has been allocated only a fraction of those. If you
    use `detectCores()` to set parallelism, your job will spawn far more workers
    than it has resources for, thrash the node, get killed by the scheduler, and
    disrupt other users. **Always read from `$SLURM_CPUS_PER_TASK`.**

## A parallel batch job

Here is a complete job script for a multi-core R job:

```bash
#!/bin/bash
#SBATCH --job-name=parallel-r
#SBATCH --ntasks=1
#SBATCH --cpus-per-task=8
#SBATCH --mem=32G
#SBATCH --time=04:00:00
#SBATCH --output=logs/parallel_%j.out

module load r-rocker-ml-verse/4.4.0+apptainer
shopt -s expand_aliases

Rscript --no-restore --no-save parallel_analysis.R
```

The `--no-restore --no-save` flags tell R not to load a saved `.RData` workspace on
start and not to save one on exit. This is important for reproducibility in batch
jobs: saved workspaces can silently carry stale objects between runs, making results
depend on previous executions.

!!! warning "`--vanilla` disables `renv` auto-activation"
    You may see `Rscript --vanilla` recommended elsewhere. `--vanilla` implies
    `--no-init-file`, which skips `.Rprofile`, the mechanism `renv` uses to
    auto-activate. If you use `renv` for your project, either avoid `--vanilla` (use
    `--no-restore --no-save` instead) or add an explicit activation line at the top
    of your R script:

    ```r
    source("renv/activate.R")
    ```

    See [renv in batch jobs](getting-started.md#renv-in-batch-jobs) for more details.

Inside `parallel_analysis.R`, read the core count dynamically:

```r
library(parallel)
n_cores <- as.integer(Sys.getenv("SLURM_CPUS_PER_TASK", unset = "1"))
cat("Running with", n_cores, "cores\n")

results <- mclapply(my_list, my_function, mc.cores = n_cores)
```

## What's next

- [Job Arrays](../slurm/job-arrays.md) — running the same R script on many inputs
  without writing a separate job script for each
- [R on the Cluster](getting-started.md) — package installation and `renv` for
  reproducible environments
- [Interactive Jobs](../slurm/interactive-jobs.md) — testing R code interactively
  before committing it to a batch job
