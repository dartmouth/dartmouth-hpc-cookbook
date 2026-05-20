---
title: Interactive CLI Jobs
---

# `Salloc` job submission overview

`salloc` is a command in Slurm used to allocate resources. It allows users to request resources on a compute node in real-time without submitting a batch script or job to the Slurm queue.

When you run `salloc`, Slurm allocates resources based on your request and provides you with a shell environment on a compute node. You can then execute commands interactively, run tests, debug programs, or perform any other tasks that require access to compute resources.


You will use `salloc` and `sbatch` in different scenarios depending on your requirements and workflow in a Slurm-managed environment.

## When to use SALLOC
 Use `salloc` when:
 * You need to interactively access compute resources.
 * You need to submit tasks that require immediate access to resources for debugging, testing, or interactive computation.
 * You need on-demand access to compute nodes without the need to submit a job script to the Slurm scheduler.
 * You need to submit short-lived tasks that require immediate attention and don't warrant the overhead of submitting a separate job script.

## When to use SBATCH

`sbatch` allows you to submit scripts containing multiple commands, job dependencies, and other specifications for execution on compute nodes. If you have to run a single application multiple times or are trying to run a non-interactive application, you should usually use [`sbatch`]({{< relref "sbatch" >}}) instead of `salloc`, since `sbatch` allows you to specify parameters in the file and is *non-blocking*.

Use `sbatch` when:
* You have batch jobs that you want to submit to the Slurm scheduler for execution.
* You need to submit an automated or scheduled execution of tasks. With `sbatch`, you can submit batch scripts to execute tasks without manual intervention.
* You need to submit long-running jobs, simulations, data processing, and other tasks that can run without interactive supervision.

## Submit jobs using `salloc`

`salloc` is a *blocking* command which means you can't execute other commands within the shell until this command is finished (not necessarily the job, just the allocated compute node).

When you run `salloc`, it creates a new shell environment that you can interact with (not to be mistaken with the original shell in which you ran the command). The new shell environment allows you to interact with the allocated node.

For example, if you run `salloc srun /bin/hostname` and resources are available, the hostname of the allocated node is printed right away. If resources are not available, the command waits while you are pending in the queue. You can use `Ctrl+C` to **cancel the request**. In order to **cancel the job once it has already started**, you must input `Ctrl+C` twice within one second.

{{< callout note>}} Please note that like `sbatch`, you can use `salloc` to run a batch file, but interactively, the `#SBATCH` directives in the file are ignored. {{< /callout >}}

The command syntax is `salloc <options> srun [executable] <args>`.

You can use options to specify or define the resources you want for the executable. The following are some of the available options:

* `-c <num>` Number of CPUs (cores) to allocate to the job per task
* `-n <num>` The number of tasks to allocate (for MPI)
* `-G <num>` Number of GPUs to allocate to the job
* `--mem <num>[M|G|T]` Memory to allocate to the job (in MB by default)
* `-p <partition>` Partition to submit the job to

{{< callout tip "List of Parameters" >}}
To see all available parameters, run `man salloc` or see the [online version]({{< slurmlink "salloc.html#SECTION_OPTIONS" >}}).
{{< /callout >}}

To run an interactive job with your default shell, pass the resources required to `salloc` and do not specify a command:

```
salloc -c 6 -p cpu
```

To run an application on the cluster that uses a GUI, you **must** use an interactive job, in addition to the `--x11` argument:

```
salloc -c 6 -p cpu --x11 xclock
```

{{< callout warning >}}
You cannot run an interactive/GUI job using the `sbatch` command, you must use `salloc`.
{{< /callout >}}
