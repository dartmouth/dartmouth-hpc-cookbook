---
title: Batch Jobs
---

# Introduction to batch jobs

A **batch job** refers to a task or a series of tasks that can be executed without user intervention. These jobs are submitted to a job scheduler, which manages resources and executes them when the required resources (such as CPUs, memory, etc.) become available. Unity uses **Slurm**, a popular open-source job scheduler used in many supercomputing clusters and high-performance computing (HPC) setups.

`sbatch` is a command within Slurm that is used to submit batch jobs. `sbatch` is a *non-blocking* command, meaning there is no circumstance where running the command will cause it to hold. If the resources requested in the batch job are unavailable, the job will be placed into a queue and will start to run once resources become available.

This page guides you through the following:
- [Introduction to batch jobs](#introduction-to-batch-jobs)
  - [Create and submit a batch job](#create-and-submit-a-batch-job)
  - [Check the status of your job while it's pending or running](#check-the-status-of-your-job-while-its-pending-or-running)
  - [Receive emails about your job status](#receive-emails-about-your-job-status)
    - [Receive a time limit email to prevent a loss of work](#receive-a-time-limit-email-to-prevent-a-loss-of-work)
  - [Check job progress](#check-job-progress)


## Create and submit a batch job
There are two parts to submitting a batch job:
- You need to create a **batch script**, which is a separate file that contains all of the [parameters]({{< slurmlink "sbatch.html#SECTION_OPTIONS" >}}) for your job and the commands you want to run.
- You need to use the `sbatch` command to submit the batch job you created.

The following steps will guide you through how to create and submit a batch job in more detail.

1. Create a batch script file in your preferred location.

2. In the first line of the batch script, write the line `#!/bin/bash`, or whichever interpreter you need. If you are unsure of which interpreter to use, use `#!/bin/bash`.

3. After the `#!/bin/bash` line, specify your `#SBATCH` parameters. These parameters specify important information about your batch job, such as the number of cores per task or the amount of memory you are requesting.

    The following example is a simple batch script that contains common `sbatch` parameters.

    ```bash
    #!/bin/bash
    #SBATCH -c 1  # Number of Cores per MPI Task
    #SBATCH --ntasks 2 # Number of MPI Tasks
    #SBATCH -N 1 # Number of Nodes
    #SBATCH --mem=8G  # Requested Memory Per Node
    #SBATCH -p cpu  # Partition
    #SBATCH -t 01:00:00  # Job time limit
    #SBATCH -o slurm-%j.out  # %j = job ID

    module load openmpi/5.0.3
    mpirun hostname
    ```
    Note that these lines are contained within the batch script file. Any parameters specified on the command line when submitting your job will override those in the file.

    As defined by the parameters, this example script allocates two MPI tasks with one CPU each on a single node in the CPU partition. The last two lines of this example load an MPI module and run a simple command in parallel. Feel free to remove or modify any of the parameters in the script to suit your needs. Additionally, Slurm provides [a wide variety of additional parameters]({{< slurmlink "sbatch.html#SECTION_OPTIONS" >}}) for use with `sbatch`.

4. To submit your batch job, use the command `sbatch BATCH_SCRIPT`. Be sure to replace `BATCH_SCRIPT` with the file name of your batch script.

## Check the status of your job while it's pending or running
To check the status of **all** your jobs while they are pending or running, use the `squeue --me` command.

Alternatively, to see the status of a specific job at any time, use the command `sacct -j YOUR_JOB_ID`. Be sure to replace `YOUR_JOB_ID` with the actual job ID you received when you submitted your job.

## Receive emails about your job status

To receive emails based on the status of your job, use the `--mail-type` argument. Common mail types are `BEGIN, END, FAIL, INVALID_DEPEND, and REQUEUE`. For more information on which mail type makes the most sense for you, see [Slurm's sbatch page]({{< slurmlink "sbatch.html#OPT_mail-type" >}}) which not only covers `--mail-type` but also contains a full guide on `sbatch`.

To check that the email feature works for you with either `salloc` or `sbatch`, use the following code samples.

In your terminal:
```bash
salloc --mail-type=BEGIN /bin/true
```
Or, within your batch script:

```bash
#!/bin/bash
#SBATCH --mail-type=BEGIN
/bin/true
```

The `BEGIN` mail type sends you an email once your job begins.

{{< callout "tip" >}}
If you want Slurm to send mail to an email other than the email associated with your Unity account, you can specify the `--mail-user` argument.
{{< /callout >}}

### Receive a time limit email to prevent a loss of work

Your job will be terminated as soon as it reaches its time limit, regardless of how close it was to finishing its task. Without [checkpointing](https://en.wikipedia.org/wiki/Application_checkpointing), those CPU hours would be lost, and you would have to schedule the job all over again.

Another way to prevent losing your work is to check on your job's output as it approaches its time limit. To receive an email about your job's output as it approaches its time limit, use the `--mail-type=TIME_LIMIT_80` argument.

With the `--mail-type=TIME_LIMIT_80` argument, Slurm emails you if 80% of the time limit has passed and your job is still running. Then, you can check on the job's output and determine if it will finish in time. If you do not think your job will finish in time, email us at {{< help-email >}} or ask on the [Community Slack]({{< relref "community" >}}) and we can extend your job's time limit.

{{< callout "warning" >}}
We can't guarantee we can extend your job's time limit before the job ends.
Please try to request enough time up front and request an extension only in
unforeseen circumstances.
{{< /callout >}}

## Check job progress

To see the status of all your jobs while they are pending or running, use the `squeue --me` command. This command shows the state of your jobs (e.g., running, pending, completed), job ID, partition, username, and more.

 Alternatively, to see the status of a certain job at any time, use the command `sacct -j YOUR_JOBID`.

 For an in-depth guide on monitoring batch jobs, see [Monitor a batch job]({{< relref "monitoring.md" >}}).
