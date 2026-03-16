---
title: "Interactive Jobs"
description: "How to run interactive sessions on compute nodes using srun and salloc on {{ cluster.name }}"
tags:
  - slurm
  - interactive
  - beginner
---

# Interactive Jobs

!!! abstract "What we're cooking"
    How to request an interactive shell on a compute node — so you can run commands, test code, and debug without submitting a batch script, and without hogging the login node.

## Why not just run on the login node?

When you SSH into {{ cluster.name }}, you land on a **login node** — a shared gateway used by everyone on the cluster simultaneously. It's meant for light tasks: editing files, writing job scripts, submitting jobs, checking queue status.

The login node is *not* meant for computation. Running a heavy analysis there slows it down for every other user logged in at the same time, and cluster admins actively kill resource-heavy processes on the login node. Even a moderately expensive Python script loading a large dataset can degrade the experience for dozens of colleagues.

The rule of thumb: if a command takes more than a few seconds or uses more than a small amount of RAM, run it on a compute node. Interactive jobs give you a shell on a compute node — you type commands just like normal, but the resources belong to you.

## `srun --pty bash` — Getting an interactive shell

The simplest way to get an interactive session is with `srun`:

```bash
srun --ntasks=1 --cpus-per-task=4 --mem=8G --time=02:00:00 --pty bash
```

What each flag does:

| Flag | Meaning |
|---|---|
| `--ntasks=1` | One task (one process) |
| `--cpus-per-task=4` | Four CPU cores for that task |
| `--mem=8G` | 8 GB of RAM total |
| `--time=02:00:00` | Time limit of 2 hours |
| `--pty bash` | Open a pseudo-terminal running bash |

After a moment in the queue, your prompt changes to show the name of the compute node you've been assigned — something like `[netid@c01 ~]$`. You're now running on a compute node. Run your commands, inspect your data, test your code. When you're done, type `exit` to release the allocation and return to the login node.

!!! tip "Set a realistic time limit"
    Your interactive session ends when the time limit expires — even mid-command. Set enough time for your work, but don't request days. Shorter requested times generally get higher queue priority, so you'll wait less to get started. Two to four hours is a common range for exploratory sessions.

## Requesting a GPU interactively

If you need a GPU — to test a model, check CUDA availability, or profile GPU code — add `--gres` and specify the GPU partition:

```bash
srun --ntasks=1 --cpus-per-task=4 --mem=16G --gres=gpu:1 --partition=gpu --time=01:00:00 --pty bash
```

Once you're connected, verify that the GPU is visible:

```bash
nvidia-smi
```

You should see the GPU model, memory usage, and driver version. If `nvidia-smi` returns nothing, confirm you're on a node with GPUs using `echo $SLURMD_NODENAME` and cross-check with `sinfo`.

!!! info "GPU partitions and types"
    {{ cluster.name }} has multiple GPU partitions with different hardware. See [GPU Computing](../../fundamentals/gpu-computing.md) for available GPU types and how to request a specific one with `--gres=gpu:a100:1` or similar.

## `salloc` — Reserving resources for multiple commands

`srun --pty bash` gives you a single interactive shell tied to one allocation. When you `exit`, the allocation is gone. If you need to run *multiple* commands against the same set of reserved resources — common in MPI development — use `salloc` instead:

```bash
salloc --ntasks=4 --mem=32G --time=04:00:00
```

`salloc` reserves the resources and returns you to a shell on the **login node**, but with the allocation active. You then use `srun` to dispatch work to the reserved compute node(s):

```bash
# Resources are now reserved — run commands against them:
srun ./my_mpi_program
srun --ntasks=4 ./another_mpi_program

# Release the allocation when done:
exit
```

This is particularly useful for MPI development: you reserve four tasks once, then iterate quickly — edit code, recompile, re-run — without re-queuing for every test.

!!! tip "Check your allocation with `squeue`"
    While `salloc` is active, `squeue --me` will show your reservation. The job state will be `R` (running) even though you haven't dispatched any work yet — the resources are being held for you.

## Common patterns

A few practical ways interactive jobs fit into a real research workflow:

**Testing before batch submission.** Get an interactive node, run your command with a small input, confirm it works and finishes in the expected time, then write the batch script with confidence. This avoids submitting batch jobs that fail in the first 30 seconds due to a missing module or wrong file path.

**Debugging a failing batch job.** When a batch job fails, request an interactive node with the same resource spec as the failing job, then reproduce the steps manually. You can inspect environment variables, check file permissions, and run the failing command directly.

**Exploratory data analysis.** Get a node with substantial RAM — `--mem=64G` or more — to load large datasets into Python or R interactively. This is far more practical than submitting and waiting for a batch job every time you want to try something.

## Limitations

Interactive jobs are powerful for development and debugging, but they're not suited for production runs:

- **Disconnection ends the job.** If you close your laptop, lose network connectivity, or your SSH session times out, the interactive job may be terminated. All progress in that session is lost.
- **You must be present.** You have to stay connected for the duration, which is impractical for long analyses.
- **Time limits are enforced.** Slurm will kill your session when the time limit is reached, whether or not you're in the middle of something.

For anything that runs longer than a few hours or that you don't need to supervise, use a batch script. See [Submit Your First Job](../../getting-started/first-job.md) for the full batch workflow.
