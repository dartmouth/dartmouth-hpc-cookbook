---
title: "Job Arrays"
description: "How to run many similar jobs in parallel using Slurm job arrays on {{ cluster.name }}"
tags:
  - slurm
  - parallel
  - intermediate
---

# Job Arrays

!!! abstract "What we're cooking"
    How to use Slurm job arrays to run the same analysis on many inputs simultaneously — the most efficient pattern for embarrassingly parallel workloads.

## The embarrassingly parallel problem

Many research workflows share the same shape: "Run this analysis on 1,000 input files." Or: "Train this model with 50 different hyperparameter combinations." Or: "Bootstrap this statistic 500 times with different random seeds."

Each run is completely independent — no communication between them, no shared state, no coordination required. This class of problem is called **embarrassingly parallel**: the work fans out trivially into independent units. If you have the resources to run them simultaneously, you can compress days of serial computation into hours.

*[embarrassingly parallel]: A class of problem that can be divided into independent subtasks with no need for communication between them. Sometimes called "pleasingly parallel."

Job arrays are Slurm's purpose-built tool for this pattern. Instead of manually submitting hundreds of individual jobs — or writing a shell loop that hammers the scheduler — you submit one job array and Slurm fans it out into N tasks, each with its own task ID.

## Your first job array

Here's a complete job array script that processes ten input files in parallel:

```bash
#!/bin/bash
#SBATCH --job-name=my-array
#SBATCH --array=1-10          # Run tasks numbered 1 through 10
#SBATCH --ntasks=1
#SBATCH --cpus-per-task=2
#SBATCH --mem=4G
#SBATCH --time=00:30:00
#SBATCH --output=logs/task_%a.out   # %a is replaced with the array task ID
#SBATCH --error=logs/task_%a.err

echo "Task ID: $SLURM_ARRAY_TASK_ID"
python analyze.py --input data/file_${SLURM_ARRAY_TASK_ID}.csv
```

Submit it the same way as any batch job:

```bash
mkdir -p logs
sbatch array_job.sh
```

The key concept: **`$SLURM_ARRAY_TASK_ID`** is an environment variable that Slurm sets differently for each task. Task 1 gets `SLURM_ARRAY_TASK_ID=1`, task 2 gets `SLURM_ARRAY_TASK_ID=2`, and so on up to 10. You use that variable inside your script to select different inputs, parameters, or configurations — the script logic is the same, only the input changes.

The `%a` placeholder in `--output` and `--error` expands to the task ID, so each task writes to its own log file. Without this, all tasks would try to write to the same file simultaneously, producing garbled output.

!!! tip "Create log directories before submitting"
    Slurm will not create missing directories for output files. If `logs/` doesn't exist when the job starts, your job will fail immediately. Run `mkdir -p logs` before `sbatch`.

## Using task IDs to select inputs

The task ID is just a number. You have full flexibility in how you map it to inputs.

**Map to a list of filenames using a bash array:**

```bash
#!/bin/bash
#SBATCH --array=0-4   # Zero-indexed to match bash array indexing

FILES=(
    data/sample_A.csv
    data/sample_B.csv
    data/sample_C.csv
    data/sample_D.csv
    data/sample_E.csv
)

INPUT=${FILES[$SLURM_ARRAY_TASK_ID]}
echo "Processing: $INPUT"
python analyze.py --input "$INPUT"
```

**Read from a config file where each line is one task's parameters:**

```bash
# params.txt — one line per task, task IDs are 1-indexed
# Line 1: --lr 0.001 --dropout 0.1
# Line 2: --lr 0.001 --dropout 0.2
# ...

PARAMS=$(sed -n "${SLURM_ARRAY_TASK_ID}p" params.txt)
python train.py $PARAMS
```

**Use the task ID directly as a script argument for parameter sweeps:**

```python
# In your Python script, receive the task ID and use it to index a parameter grid
import sys
import itertools

lrs = [1e-4, 1e-3, 1e-2]
dropouts = [0.1, 0.3, 0.5]
grid = list(itertools.product(lrs, dropouts))

task_id = int(sys.argv[1])  # Pass $SLURM_ARRAY_TASK_ID as argument
lr, dropout = grid[task_id]
```

```bash
# In the job script:
python train.py $SLURM_ARRAY_TASK_ID
```

## Controlling concurrency with `%`

By default, Slurm will try to start all array tasks as quickly as resources allow. For a small array (10–50 tasks), this is usually fine. For a large one (hundreds or thousands), you may want to limit how many run simultaneously to avoid overloading shared storage or saturating the scheduler.

The `%` suffix on `--array` sets the maximum concurrency:

```bash
#SBATCH --array=1-1000%50   # Run up to 50 tasks simultaneously
```

Tasks beyond the limit queue as `PD` (pending) with reason `ArrayTaskThrottle`, and start as earlier tasks finish.

!!! tip "Start small, then scale up"
    When testing a new array job, run it with a small array first (`--array=1-3`) to verify your script works correctly before submitting all 1,000 tasks. Once you're confident, resubmit with the full range and a reasonable concurrency limit (`%50` to `%100` is typical).

!!! warning "Watch your I/O footprint"
    If every task reads from or writes to the same files or directories, hundreds of simultaneous tasks can saturate the filesystem. Structure your tasks so each one reads/writes to distinct paths, and set a concurrency limit.

## Tracking progress

Job arrays appear as a single entry in `squeue`, with the task range shown in the job ID:

```bash
# Show all your jobs (array appears as one row with task range)
squeue --me

# Show only running tasks
squeue --me -t R

# Show detailed state per task
squeue --me -j JOBID
```

After the array finishes (or partially fails), use `sacct` to see per-task outcomes:

```bash
sacct -j JOBID --format=JobID,State,ExitCode,Elapsed,MaxRSS
```

Each task appears as `JOBID_TASKID` (e.g., `12345_7`). Tasks that failed with a non-zero exit code will show `FAILED` or `CANCELLED`.

**Re-running only failed tasks** is straightforward — just pass the specific task IDs:

```bash
# Re-run tasks 5, 12, and 47 from a previous array
sbatch --array=5,12,47 array_job.sh
```

You can also specify ranges with gaps: `--array=5-10,15,20-25`.

## Common pitfalls

!!! warning "Output file collisions"
    Forgetting `%a` in `--output` means all tasks write to the same log file. The result is interleaved, unreadable output — and potentially data loss if your script appends results to a file. Always use `%a` in both `--output` and `--error` for array jobs.

!!! warning "Shared result files cause race conditions"
    If multiple tasks try to append results to the same CSV or text file simultaneously, they will corrupt each other's writes. Write task results to separate files (e.g., `results/task_${SLURM_ARRAY_TASK_ID}.csv`) and merge them after all tasks complete.

!!! warning "GPU tasks in a CPU partition never start"
    If you request `--gres=gpu:1` but don't specify `--partition=gpu` (or whatever GPU partition name {{ cluster.name }} uses), your tasks will sit in the queue indefinitely with reason `Resources`. Check partition names with `sinfo`.

!!! warning "Too many tiny output files"
    Creating thousands of small files — one per task — can create significant filesystem overhead. If each task produces small results (a few KB), consider aggregating them within the task (process multiple inputs per task) rather than one-file-per-task at large scale.
