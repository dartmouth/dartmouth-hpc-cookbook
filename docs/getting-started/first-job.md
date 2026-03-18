---
title: Submit Your First Job
description: "Submit, monitor, and inspect your first job on {{ institution.short_name }}'s HPC cluster"
tags:
  - getting-started
---

# Submit Your First Job

You have an [account](account.md). You're [connected to {{ cluster.name }}](connecting.md). Let's put the cluster to work.

By the end of this page you'll have submitted a job, watched it move through the queue, and read its output. It's time to do the full cycle described in [What is HPC?](what-is-hpc.md) for real!

!!! tip "New to the command line?"
    This guide assumes you can navigate directories and edit files in a terminal. If that's unfamiliar, work through [Linux Basics](../fundamentals/linux-basics.md) first — it won't take long.

## Write a Job Script

A **job script** is a short text file that tells the scheduler two things: what resources you need, and what commands to run. Open a new file:

```bash
nano first-job.sh
```

Paste the following:

```bash
#!/bin/bash
#SBATCH --job-name=first-job      # a label so you can identify this job
#SBATCH --ntasks=1                # run a single task
#SBATCH --mem=1G                  # request 1 GB of memory
#SBATCH --time=00:05:00           # allow up to 5 minutes (it'll be much faster)
#SBATCH --output=first-job.out    # write output to this file

echo "Hello from $(hostname)"
echo "Job ID: $SLURM_JOB_ID"
echo "Running as: $USER"
date
```

Save and exit (`Ctrl+O`, `Enter`, `Ctrl+X` in nano).

Let's break that down:

- `#!/bin/bash` tells Linux to run the script with Bash.
- Lines starting with `#SBATCH` are **directives** — instructions to the scheduler, not regular comments. Each one requests a specific resource or sets an option.
- Everything after the directives is your actual work. Here it's just a few `echo` commands so we can verify where and how the job ran.

That's the anatomy of every job script you'll ever write: directives at the top, commands below. The directives will get more interesting as your work does, but the structure stays the same.

## Submit It

```bash
sbatch first-job.sh
```

You'll see something like:

```
Submitted batch job 1234567
```

That number is your **job ID**. The scheduler has accepted your job and will run it as soon as resources are available.

## Watch It Run

Check the queue:

```bash
squeue --me
```

You'll see your job listed with its state — `PD` (pending) while it waits for resources, `R` (running) once it starts. For a job this small, it may finish before you even check. If `squeue --me` shows nothing, your job is already done.

## Read the Output

Once the job completes, the output lands in the file you specified:

```bash
cat first-job.out
```

You should see something like:

```
Hello from node042
Job ID: 1234567
Running as: f00abc
Thu Mar 12 10:15:42 EDT 2026
```

Notice the hostname: it's a **compute node**, not the login node you're typing on. Try running `hostname` right now in your terminal and compare. They'll be different! Your job ran somewhere else entirely, scheduled and managed without you having to think about which machine was available.

That's the core loop: **write a script, submit it, collect results**. Everything else you'll learn about {{ cluster.name }} builds on this.

## When Things Go Wrong

If your output file doesn't appear, or it's empty, a few things to check:

- **Still in the queue?** Run `squeue --me` to see if the job is still pending or running.
- **Job failed?** Run `sacct -j <job-id> --format=JobID,State,ExitCode` to see whether it completed or hit an error. A non-zero exit code means something went wrong.
- **Typo in the script?** Run `bash first-job.sh` directly on the login node as a quick syntax check. (This is fine for a trivial script like this one — don't do it with real workloads.)

Don't worry about memorizing `sacct` flags right now. We'll cover job monitoring properly later.

## What's Next

You just completed the full HPC workflow. Now it's time to build the skills that let you do real work on the cluster:

- [**Linux Basics**](../fundamentals/linux-basics.md) — navigate the filesystem and manage files from the command line
- [**Storage on {{ cluster.name }}**](../fundamentals/storage.md) — understand where to put your data and why it matters
- [**Modules**](../fundamentals/modules.md) — load the software you need for your research
- [**Job Scheduling**](../fundamentals/scheduling.md) — request the right resources, run parallel work, and use job arrays