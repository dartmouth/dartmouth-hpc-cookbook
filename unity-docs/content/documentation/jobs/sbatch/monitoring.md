---
title: Monitor a batch job
---
# Monitor a batch job
For running jobs, there are several ways to monitor it's progress, whether that's [tailing log files](#watch-job-progress-by-tailing-log-files), using [`sstat`](#check-status-quickly-using-sstat) or connecting to the node with [`srun`](#confirm-job-utilization-using-srun).

## Watch job progress by tailing log files
If your job produces output as it runs, you can use `tail` on the log file to watch the progress. Using `-F` causes it to watch for new lines. Use `Ctrl-C` (or `Cmd-C` on macOS) to stop monitoring the file. This does not affect the running job.

```shell
tail -F slurm-XXX.out
```

## Check status quickly using `sstat`
The `sstat` command can provide information about a running job's use of resources. For best formatting, use the following command:

```shell
sstat -a -j <jobid> -o JobID%-15,TRESUsageInTot%-85
```

Ignore the `<jobid>.extern` step. If you use `srun`, `mpirun`, or `mpiexec`, then the numbered job steps show the usage of that program. The `.batch` contains the usage of all of the commands in your batch script.

The following table shows some sample output from a job submitted with `-n 32 -N 4 --ntasks-per-node=8`, which spread 32 tasks 4 nodes with 8 cores on each (not a recommended layout):

| JobID        |  TRESUsageInTot |
| ------------ |  -------------- |
| jobid.extern | cpu=00:00:00,energy=0,fs/disk=...,mem=0,pages=0,vmem=0 |
| jobid.batch  | cpu=8-11:09:22,energy=0,fs/disk=...,mem=4164440K,pages=0,vmem=4289444K |
| jobid.0      | cpu=25-09:24:52,energy=0,fs/disk=...,mem=12502612K,pages=0,vmem=12532576K |

This job was running for about 25.5 hours. The usage in `.batch` only represents the 8 cores on the `BatchHost`. The `.0` step is the usage of the MPI program. The usage here is 609 hours, which is less than the 816 hours expected (32 cores * 25.5 hours), indicating some inefficiency. This could be due to network traffic, I/O wait, or some non-MPI process that ran first, although that alone would not account for all the time.

## Confirm job utilization using `srun`
In order to confirm that a job is utilizing the all the nodes, cores, and GPUs requested, you may connect to a node interactively using the following command:

```shell
srun --overlap --nodelist=<nodename> --pty --jobid=<jobid> /bin/bash
```

The `--nodelist` argument should only contain one name and is only required if you want to connect to a node other than the first one. Use the following command to see your job's assigned nodes, cores, and GPUs:

```shell
scontrol -d show job <jobid>
```

Where `BatchHost` is the node your batch script is running on, and `NodeList` is the list of all nodes allocated to your job. `CPU_IDS` lists the cores on each node assigned to your job, and the `IDX` field shows which GPUs are available to it. Sample output:

```terminal
JobId=... JobName=...
...
   NodeList=uri-gpu003
   BatchHost=uri-gpu003
   JOB_GRES=gpu:a100:4
     Nodes=uri-gpu003 CPU_IDs=0-63 Mem=515000 GRES=gpu:a100:4(IDX:0-3)
...
```

### Check CPU and memory usage
The recommended tool to see CPU utilization is (copy as-is; no need to expand the variables yourself):

```shell
systemd-cgtop system.slice/${HOSTNAME}_slurmstepd.scope/job_${SLURM_JOB_ID}
```

The `%CPU` column shows the sum of the utilization on all of the cores assigned on this node. This should be close to 100 times the number of cores. The `Memory` column should show a value close to what you requested. Note tools like `htop` may also work, but the CPU numbers are 0 based.

### Check GPU usage
The recommended tool to see GPU utilization is `nvitop`. See [Unity GPUs]({{< relref "documentation/tools/gpus" >}}) for more information. Note it doesn't show GPUs for other jobs on the node, even if they're also your jobs.
