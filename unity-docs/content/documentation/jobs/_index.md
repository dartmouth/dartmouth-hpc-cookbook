---
title: Submitting Jobs
menu:
  - docs
blurb: >
    How to launch work on Unity's compute nodes through Slurm, including
    interactive and non-interactive methods.
icon: work
weight: 50
---

# Introduction to Slurm: The job scheduler
**Slurm** is the job scheduler we use in Unity. The following guide will go into depth about some introductory elements of Slurm. There are many features of Slurm that go beyond the scope of this guide, but everything you need to know should be available on this page. For an in-depth cheat sheet on Slurm, see the [Slurm cheat sheet]({{< relref "slurm.md" >}}).

{{< callout warning "Don't run jobs on the login node" >}}
Doing work on the login nodes can cause Unity to become sluggish for the entire user base.
We have disincentivized this by setting limits on cpu and memory.
Learn how to use `salloc` interactive sessions to switch from a login node to a compute node.
{{< /callout >}}

## Core limits
There is currently a 1000 CPU core and 64 GPU limit to be shared by the users of each lab.

If you try to go over this limit, you are denied for `MaxCpuPerAccount`.

To check the resources currently in use by your PI group, use the `unity-slurm-account-usage` command.

## Partitions or queues
Our cluster has a number of slurm **partitions** defined, also known as a **queue**. You can request to use a specific partition based on what resources your job needs. To find out which partition is best for your job, see [Partitions]({{< relref "partitions" >}}).

## Job submission overview
A **job** is an operation which users submit to the cluster to run under allocated resources. There are two commands for submitting jobs: `salloc` and `sbatch`.

`salloc` is tied to your current terminal session which allows you to interact with your job, however, once you close your terminal, the job loses its allocated resources and stops running.

`sbatch` on the other hand, is not tied to your current session, so you can start it and walk away, but you cannot interact with your job. If you want to interact with your job **and** be able to walk away, you can use `tmux` to make a detachable session. For more information, see [Use `tmux` with `salloc` to keep a session open](#use-tmux-with-salloc-to-keep-a-session-open).

### Use `salloc` to submit jobs
A `salloc` job is tied to your ssh session. If you break (ctrl+C) or close your ssh session during a `salloc` job, **the job is killed**.

**Highly recommended**: You can also create an **interactive** job, which allows your job to take input from your keyboard. You can run `bash` in an interactive job to resume your work on a compute node just as you would on a login node.

See [SALLOC Jobs]({{< relref "salloc" >}}) for more information.

### Use `sbatch` to submit jobs
An `sbatch` job is submitted to the cluster with no information returned to the user other than a Job ID. An `sbatch` job will try to create a file in your current working directory that contains the results of your job.

See [Introduction to batch jobs]({{< relref "sbatch" >}}) for more information.

### Use `tmux` with `salloc` to keep a session open
To keep a session open even if your ssh command disconnects, use `tmux`. This can be useful on spotty Wi-Fi so you don't lose your work. Please note which `login` node number you land on, because you'll need to connect to the same one to reattach your tmux session. You can use `ssh loginX` (where `X` is the number you noted) to switch from the login node you land from your machine to the one where your tmux session is.

The following is an example of how to use `tmux` and `salloc` to keep a session open even if your `ssh` command disconnects:

```
# Open tmux session:
tmux

# Open an interactive job on compute node with one cpu core:
salloc -c 1

# Make the interactive job  have a blinking cursor for an hour:
sleep 3600; echo "done"

# Open tmux keyboard-shortcut command mode:
# > ctrl+b
# Detach tmux session and go back to login node:
# > d
# At this point, you can log off and log back in without killing the job.

# Print a list of tmux sessions:
tmux ls

# The first number on the left (let's call it X) is needed to re-attach the session:
tmux attach-session -t X

# This brings us back to the interactive job
```

## Other resources
For an in-depth cheat sheet on Slurm, see the [Slurm cheat sheet]({{< relref "slurm.md" >}}).
