---
title: "Slurm Intermediate Patterns"
description: "Resource requests, job dependencies, output management, and post-job analysis on {{ cluster.name }}"
tags:
  - slurm
  - intermediate
---

# Slurm Intermediate Patterns

!!! abstract "What we're cooking"
    Practical Slurm patterns for researchers who have submitted their first job and are ready to go beyond the basics: smarter resource requests, job pipelines with dependencies, and diagnosing completed jobs.

## Memory: `--mem` vs `--mem-per-cpu`

Slurm gives you two ways to request memory, and choosing the wrong one leads to either wasted resources (longer queue waits) or job failures.

**`--mem=16G`** requests a fixed total amount of memory for the entire job, regardless of how many CPUs you've requested. Use this for single-process jobs — Python scripts, R scripts, serial analyses — where memory usage is determined by your data and code, not by core count.

**`--mem-per-cpu=4G`** requests that much memory *per CPU core*. Use this for MPI jobs where memory requirements scale naturally with the number of tasks. If you request `--ntasks=8 --mem-per-cpu=4G`, you get 32 GB total, and if you later increase to 16 tasks, the memory scales automatically.

!!! warning "Underestimating memory gets your job killed"
    If your job exceeds its memory allocation, Slurm kills it with an out-of-memory (OOM) error. The job exits with state `OUT_OF_MEMORY` and exit code `137`. Use `seff JOBID` on completed jobs (see [below](#diagnosing-completed-jobs-with-sacct-and-seff)) to see actual memory usage, then request 20–30% more than the observed peak on your next run.

Getting memory right matters for two reasons: too little and your job dies; too much and you wait longer in the queue. Cluster schedulers give priority to jobs that request fewer resources, so over-requesting "just in case" actively hurts your throughput.

## Time limits and partitions

Every partition on {{ cluster.name }} has a maximum wall-clock time. You must request a time limit at or below that ceiling. Use `sinfo -o "%P %l %a"` to see available partitions, their time limits, and availability:

```bash
sinfo -o "%20P %10l %5a %10D"
```

A few practical rules:

- **Shorter requests get higher priority.** Slurm's backfill scheduler can slot short jobs into gaps. A 1-hour job that fits in a gap will often start much sooner than a 24-hour job waiting for a large window.
- **Use the right partition for your job length.** Many clusters have a short/standard/long partition structure. Running a 2-hour job in the long partition wastes your queue priority.
- **Add a buffer, but not too much.** Estimate your runtime, then request 25–50% more. Don't request the partition maximum "just in case" — your job gets killed at the time limit regardless, so requesting 7 days for a job that takes 6 hours only hurts you.

!!! tip "Benchmark with a small input first"
    Run your analysis on a small representative subset of your data to get a reliable runtime estimate before submitting the full job. An interactive session ([Interactive Jobs](interactive-jobs.md)) is ideal for this.

## Useful `#SBATCH` directives

A reference for commonly needed directives beyond the basics:

**Output and error file naming** — Slurm supports several substitution patterns:

| Pattern | Expands to |
|---|---|
| `%j` | Job ID |
| `%a` | Array task ID |
| `%N` | Name of the first node assigned |
| `%x` | Job name (from `--job-name`) |

Example: `--output=logs/%x_%j.out` produces `logs/my-job_12345.out`.

**Email notifications:**

```bash
#SBATCH --mail-type=END,FAIL
#SBATCH --mail-user=your.name@{{ institution.short_name | lower }}.edu
```

`--mail-type` accepts `BEGIN`, `END`, `FAIL`, `REQUEUE`, and `ALL`. Getting an email when a job fails is particularly useful for long-running pipelines you're not actively monitoring.

**Automatic requeue on node failure:**

```bash
#SBATCH --requeue
```

If the node your job is running on crashes or is taken down for maintenance, Slurm will automatically requeue your job rather than marking it failed. Useful for fault tolerance on long jobs, but only appropriate if your job is **restartable** (i.e., it can safely start over from scratch, or has checkpointing logic).

**Environment export behavior:**

```bash
#SBATCH --export=ALL    # Default: pass all environment variables from the submitting shell
#SBATCH --export=NONE   # Start with a clean environment (recommended for reproducibility)
```

`--export=NONE` is the more reproducible choice for production jobs — it ensures your job doesn't accidentally depend on something you happened to have loaded in your interactive session. Always pair it with explicit `module load` calls in your script.

## Job dependencies — chaining jobs into pipelines

The `--dependency` flag tells Slurm to hold a job until specific other jobs reach a certain state. This is how you build automated multi-stage pipelines without sitting at your keyboard waiting to submit the next step.

The pattern: capture the job ID from each `sbatch` call, then use it as a dependency for the next step.

```bash
# Submit preprocessing job and capture its ID
JOB1=$(sbatch preprocess.sh | awk '{print $4}')
echo "Preprocessing job: $JOB1"

# Submit analysis — starts only after JOB1 succeeds (exit code 0)
JOB2=$(sbatch --dependency=afterok:$JOB1 analyze.sh | awk '{print $4}')
echo "Analysis job: $JOB2"

# Submit postprocessing — starts after JOB2 completes (success or failure)
sbatch --dependency=afterok:$JOB2 postprocess.sh
```

**Dependency types:**

| Type | Meaning |
|---|---|
| `afterok:JOBID` | Start after JOBID exits successfully (exit code 0) |
| `afterany:JOBID` | Start after JOBID completes, regardless of exit status |
| `afternotok:JOBID` | Start only if JOBID fails — useful for cleanup/notification jobs |
| `after:JOBID` | Start after JOBID begins running (rarely needed) |

You can chain dependencies on multiple jobs: `--dependency=afterok:123:456:789` waits for all three.

!!! tip "Check dependency status"
    A job waiting on a dependency shows as `PD` (pending) in `squeue` with reason `Dependency`. Once its upstream job completes successfully, it transitions to eligible. If the upstream job fails and you used `afterok`, the dependent job will never start — it stays pending with reason `DependencyNeverSatisfied` until you cancel it.

!!! warning "Failed upstream jobs block the whole pipeline"
    If you use `afterok` throughout a pipeline and an early stage fails, all downstream jobs become permanently blocked. Build in a manual check between stages for critical pipelines, or use `afterany` for cleanup/notification steps that should always run.

## Diagnosing completed jobs with `sacct` and `seff`

Once a job finishes, `squeue` no longer shows it. Use `sacct` and `seff` to understand what happened.

**`sacct` — detailed accounting data:**

```bash
sacct -j JOBID --format=JobID,State,ExitCode,MaxRSS,CPUTime,Elapsed
```

Key fields:

- **`State`** — `COMPLETED`, `FAILED`, `CANCELLED`, `TIMEOUT`, `OUT_OF_MEMORY`
- **`ExitCode`** — Exit code in `CODE:SIGNAL` format. `0:0` is clean exit; `1:0` is a script error; `0:9` is a signal 9 (kill)
- **`MaxRSS`** — Peak resident memory used across all tasks — compare this to what you requested
- **`Elapsed`** — Actual wall-clock runtime — compare to your `--time` request

**`seff` — human-readable efficiency report:**

```bash
seff JOBID
```

`seff` summarizes CPU and memory efficiency as percentages. Example output:

```
Job ID: 12345
State: COMPLETED (exit code 0)
Cores: 8
CPU Utilized: 06:24:00
CPU Efficiency: 80.00% of 08:00:00 core-walltime
Memory Utilized: 14.23 GB
Memory Efficiency: 88.94% of 16.00 GB
```

!!! tip "Use efficiency data to tune future requests"
    If memory efficiency is 20%, you requested far more than you needed — halve it next time. CPU efficiency below 50% often means the job is I/O bound (waiting on disk reads/writes) rather than compute bound. If that's unexpected, profile your code or consider using faster scratch storage.

!!! warning "Low CPU efficiency isn't always a problem"
    Some workflows are inherently I/O bound — loading large model checkpoints, reading genomics files, streaming data from storage. Low CPU efficiency for these jobs is expected. But if you *expect* CPU-intensive work and see low efficiency, it's worth investigating.

## Environment in batch jobs

Batch jobs start with a **minimal environment** — not the rich, configured environment you have after logging in interactively. Modules you loaded in your terminal session, aliases you've set, and `PATH` modifications from your `.bashrc` may not be present.

Best practices for reliable batch scripts:

```bash
#!/bin/bash
#SBATCH ...

# 1. Start clean — remove any inherited module state
module purge

# 2. Load exactly what you need, explicitly
module load python/3.11

# 3. Go to your working directory explicitly
cd /path/to/your/project

# 4. Run your command
python my_script.py
```

This makes your script reproducible: it works the same whether run interactively or submitted as a batch job, and whether you submitted it from your project directory or somewhere else.

!!! info "Learn more about modules"
    See [Environment Modules](../../fundamentals/modules.md) for a full guide to loading software on {{ cluster.name }}, including how to find available modules and manage conflicting dependencies.
