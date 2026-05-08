---
title: Slurm cheat sheet
blurb: >
    Explains the common commands and options for the scheduler
icon: work
weight: 50
---

# Slurm cheat sheet
Slurm is the job scheduler that we use in Unity. For an introduction on Slurm, see [Introduction to Slurm: The Job Scheduler]({{< relref "jobs" >}}).

## Common terms
The following is a list of common terms in Slurm (See also: an [Overview]({{< relref "threads-cores-processes-sockets" >}}) with a more complete description.):
* **Node** - a single computer.
* **Socket** - a single CPU.
* **Core** - a single compute unit inside a CPU.
* **CPU** - one core, except on power9 where it is a Thread within a Core.
* **Job** - a schedulable unit; an allocation of resources.
* **Job step** - a set of related processes within a task. `.batch` is the script as submitted, `.0`..`.X` are any `srun` invocations from within the script
* **Task** - a process within a job step.

## Submit a job with arguments
To submit a job in Slurm, use the `sbatch` command. If you want to set parameters for your job, there are many arguments available for you to add to your batch file. See the [Introduction to batch jobs]({{< relref "sbatch" >}}) page for examples of how to create a batch file with arguments. Note that any arguments specified on the command line when submitting your job override those in the file.

The following table contains a list of arguments you can use to specify parameters for your batch job. For more detailed information on submitting jobs in Slurm, see the [sbatch manpage]({{< slurmlink "sbatch.html" >}}).
| Argument | Description |
| --- | --- |
| **General** | |
| `--time=`, `-t` | Set the worst case estimate of job run time in  `Days-Hours:Minutes:Seconds` format. |
| `--time-min=` | Set the minimum amount of time the job can usefully run for. This should be smaller than `--time=`, and may allow the scheduler to start the job sooner. |
| `--job-name=`, `-J`| Set the name of the job; default name: *script name* <br/> Use `sacct --name=...` to find it later. |
| `--output=`, `-o`| Specify the filename to place output. If an error occurs, it will be placed in output by default. |
|`--error=`, `-e` | Specify the filename to place error output. Only use this argument if you want a separate place to store errors. |
| `--exclusive` | Request entire nodes. This results in better performance for jobs that can use multiple cores or most of the memory, but generally results in longer queue times. Recommended with `--mem=0`. |
| `--mail-type=...` | Send an email when the job changes state. Usually `FAIL,END,TIME_LIMIT_80` are the most useful. See [sbatch manpage]({{< slurmlink "sbatch.html#OPT_mail-type" >}}) for a complete list of values. |
| **Compute Resources** | |
| `--nodes=<n>`, `-N` | Specify the number of nodes to use; should be 1 unless it supports MPI. |
| `--cpus-per-task=<n>`, `-c` | Specify the number of cores per task to allocate. |
| `--mem=<n>g` | Specify the number of Gigabytes of memory per-node. |
| `--mem-per-cpu=<n>g` | Specify the number of Gigabytes of memory per core (alternative to `--mem`) |
| `--ntasks=<n>`, `-n` | Specify the number of tasks to allocate space for (MPI=number of processes). |
| `--ntasks-per-node=<n>` | Specify the number of tasks per node (considered maximum when used with `--ntasks`). |
| `--constraint=mpi` | When using `-n` without `-N`, ensure all the CPUs are the same model. |
| `--constraint=...` | Specify the [Constraints]({{< relref features >}}) See also [sbatch manpage]({{< slurmlink "sbatch.html#OPT_constraint" >}}) for more information on syntax.|
| **GPU Resources** | |
| `--gpus=<n>`, <br/> `--gres=gpu:<n>`, <br/> `--gres=gpu:<type>:<n>` | Specify the number of GPUs per Job. See [Using GPUs]({{< ref "documentation/tools/gpus" >}}). |
| `--gpus-per-task=<n>`, <br/> `--gpus-per-task=<type>:<n>` | Specify the number of GPUs per Task. (Alternative to above) |
| `--gpus-per-node=<n>`, <br/> `--gpus-per-node=<type>:<n>` | Specify the number of GPUs per Node. (Alternative to above) |
| `--ntasks-per-gpu=<n>` | Specify the number of tasks per GPU allocated. |
| `--mem-per-gpu=<n>g` | Specify the number of Gigabytes of CPU memory per GPU (altenative to `--mem`; *NOT VRAM*). |
| `--constraint="sm_XX&vrmamYY"` | Specify the [Constraints]({{< relref features >}}) for minimum compute capability level and minimum VRAM (GB) per GPU.
| **Related Jobs** | |
| `--array=<indices>` |  Create [Array Job]({{< relref "arrays" >}}) See also [sbatch manpage]({{< slurmlink "sbatch.html#OPT_array" >}}) for more information.  |
| `--dependency=...` | Configure dependencies between jobs. See [sbatch manpage]({{< slurmlink "sbatch.html#OPT_dependency" >}}) for more information.  |
| **Uncommon** | |
| `--account=pi...` |  Use a given account (only needed for multi-PI or class use)). |

## Job steps
Inside of your batch file, use the `srun` command to specify the command to run across the nodes allocated.

It's uncommon to need to specify other arguments with this command, but `srun` accepts most of the arguments from the [arguments table](#submit-a-job-with-arguments) if necessary, with the exceptions of `--array` and `--dependency`. See the [srun manpage]({{< slurmlink "srun.html" >}}) for more detailed information.

## Interactive jobs
To start an interactive job, use the `salloc` command followed by arguments that specify details about your job.

Similar to `srun`, `salloc` takes the same arguments as `sbatch`, except `--array`. The [Using SALLOC]({{< relref "salloc" >}}) page has more information, as does the official [salloc manpage]({{< slurmlink "salloc.html" >}}).

## Modify a job
It's possible to change some job properties while they are pending, and a few after they start running with the [scontrol modify jobid=]({{< slurmlink "scontrol.html" >}}) command. Use `<tab>` completion to see all the various parameters that can be changed for pending jobs. The following is a list of the most common arguments:
| Argument | Description |
| --- | --- |
| `arraytaskthrottle` | Adjust the maximum number of array items that can run currently. |
| `mailtype` | Change the events that generate an email for this job. |
| `mailuser` | Email to send to ; uses account email by default. |
| `timelimit `| Adjust the time limit for a job (while pending only). |
| `partition` | Adjust the list of partitions the job is submitted to.  |
| `qos` | Set the QOS to use for this job (currently only adding `short` makes sense). |
| `nice` | Lower the priority of a pending job. |

You can use the separate command `scontrol top <jobid_list>` to give higher priority to specific jobs compared to your other jobs in the same partition. This command accepts a comma-separated list of job IDs. Note that this command only works for jobs within a single partition.


## Cancel a job
To cancel running and pending jobs, use `scancel jobid`. To cancel a running step, use `scancel jobid.step`.

## Check a running job
There are multiple ways to check the progress and efficiency of a running job. See [Monitoring a Batch job]({{< relref "sbatch/monitoring" >}}) for details.

## Check on recent job status
To check on the status of recent jobs, use the `squeue` command followed by an argument that specifies what type of information you want to view. Note that only jobs that are currently running or finished in the last ~5 minutes are available with the `squeue` command.
The following table shows common argument options.  For more details, see the [squeue manpage]({{< slurmlink "squeue.html" >}}).

{{< callout caution >}}
Do not run this command in a quick loop as it can take time to process.
{{< /callout >}}

| Argument | Description |
| --- | --- |
| `--me` | Show only your jobs. |
| `--start` | Show the most pessimistic estimate of when a job can start, if available, and the reason it's waiting. <br/> In some cases the reason may not be available or may be wrong. |
| `-j <jobid>` | Show the job specified. |
| `--account=pi...`, `-A` | Show only jobs from a list of PI groups. |
| `--state=pd,r,f`, `-t` | Show only jobs in the pending, running, or failed state. |

## Check on older job status
To check on the status of an older job, use the `sacct` command followed by an argument that specifies what type of information you want to view. The following table shows common argument options. For more detailed information, see the [sacct manpage]({{< slurmlink "sacct.html" >}}).
| Argument | Description |
| --- | --- |
| `--user=username` | List jobs from another user (defaults to your own jobs only).  |
| `-A`, `--account=pi...` | List all jobs from a given group. |
| `--start=<date/time>` <br/> `--end=<date/time>`  | Show only jobs started or running between these times. Formats can be `YYYY-MM-DDThh:mm:ss` (i.e., literal `T` between) `YYYY-MM-DD`, `MMDD`, or `hh:mm`. `--end` defaults to `now`, and `--start` defaults to previous midnight. |
| `--state=...` | Limit jobs to only a list of states. Must specify `--end` for this to work. `requeue` requires specifying `--duplicates`. States include `completed, failed, running, pending, node_fail, requeue, timeout`. |
| `--name=` | Limit result to jobs with a given name or list of names. |

## Check on node status
To check on the status of slurm nodes and partitions, use the `sinfo` command followed by an argument that specifies what type of information you want to view. The following table shows common argument options. For more details, see the [sinfo manpage]({{< slurmlink "sinfo.html" >}}).
| Argument | Description |
| --- | --- |
| `--summary`, `-s` | Show summary statistics of nodes (Allocated/Idle/Other/Total). |
| `--partition=`, `-p` | Limit display to a list of partitions. |
