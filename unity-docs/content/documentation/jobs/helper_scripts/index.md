---
title: Helper Scripts
---

# Helper Scripts
When working with Slurm, you may find that your job submissions are denied for violating resource limits, or you may find that your jobs sit in the queue for a long time. We provide some commands to help you schedule jobs more effectively:

### `unity-slurm-gpu-usage`
*For each model of GPU, how many are there in total, and how many are currently idle? How many are pending to be allocated for future jobs?*

```txt
    Type   |            Allocated            |  Pending  |   VRAM  |   CC
===========================================================================
 any         [#######           ] 525/1423     106         0         0
 unknown                          0            68          0         0
 gh200       [##################] 1/1          0           80        9.0
 l40s        [##                ] 9/68         0           48        8.9
 a40         [######            ] 4/12         0           48        8.6
 a100        [###############   ] 126/148      12          80,40     8.0
 2080        [############      ] 4/6          0           8         7.5
 rtx8000     [####              ] 10/48        6           48        7.5
 2080ti      [#########         ] 205/426      20          11        7.5
 v100        [####              ] 16/73        0           32,16     7.0
 1080ti      [####              ] 76/342       0           11        6.1
 m40         [######            ] 32/96        0           23        5.2
 titanx      [####              ] 42/203       0           12        5.2
```

You can use the `--sort` argument to change the GPU sorting. Valid options for `--sort` are `total`, `cc/vram`, `free`, and `type`.

{{< callout tip "Using Idle Resources" >}}
Tailoring your job to use idle (not allocated) resources is a good way to get your job running quickly.
{{< /callout >}}

&nbsp;
### `unity-slurm-node-usage`
*For each node, how many CPU cores, gigs of RAM, and GPUs are currently idle? Which partitions can I use to schedule a job on that node?*

```txt
        Hostname       |       Idle CPU Cores      |         Idle Memory         |       Idle GPUs       |              Partitions
===============================================================================================================================================
gpu001                  [#######      ] 9/16        [#            ] 11.8 GB       [             ] 0/2     cpu-preempt,gpu
gpu002                  [###########  ] 14/16       [#############] 190.8 GB      [             ] 0/2     cpu-preempt,gpu
gpu003                  [############ ] 34/36       [######       ] 93.5 GB       [             ] 0/2     cpu-preempt,gpu
gpu004                  [############ ] 34/36       [#######      ] 108.9 GB      [             ] 0/2     cpu-preempt,gpu
gpu005                  [###########  ] 26/32       [############ ] 173.4 GB      [             ] 0/3     cpu-preempt,gpu
gpu006                  [#############] 32/32       [#############] 191.8 GB      [#############] 3/3     cpu-preempt,gpu
gpu007                  [#############] 32/32       [#############] 191.8 GB      [#############] 3/3     cpu-preempt,gpu
gpu009                  [#############] 31/32       [#############] 499.0 GB      [##########   ] 3/4     cpu-preempt,gpu
gpu010                  [#############] 32/32       [#############] 515.4 GB      [#############] 4/4     gpu-preempt
gpu011                  [############ ] 33/36       [######       ] 181.2 GB      [###          ] 1/4     gpu
gpu012                  [###########  ] 30/36       [#######      ] 204.8 GB      [###          ] 1/4     gpu
gypsum-gpu001           [#############] 12/12       [#############] 257.8 GB      [#############] 4/4     cpu,gpu-preempt
gypsum-gpu002           [#############] 12/12       [#############] 257.8 GB      [#############] 4/4     cpu,gpu-preempt
gypsum-gpu003           [#############] 12/12       [#############] 257.8 GB      [#############] 4/4     cpu,gpu-preempt
gypsum-gpu004           [#############] 12/12       [#############] 257.8 GB      [#############] 4/4     cpu,gpu-preempt
```

You can pipe a list of hostnames into this command to show the usage for only those nodes. Example:
```txt
printf 'cpu001\ncpu002' | unity-slurm-node-usage
collecting info from slurm...
  Hostname  |      Idle CPU Cores     |        Idle Memory         |  Idle GPUs  |        Partitions
===========================================================================================================
cpu001       [#########    ] 16/24     [#            ] 5.2 GB                     building,cpu
cpu002       [             ] 0/24      [############ ] 371.0 GB                   building,cpu
```

{{< callout tip "Sometimes Resources Go to Waste" >}}
It's possible that there can be idle GPUs shown in `unity-slurm-gpu-usage` but no job can be scheduled to use them. One reason for this is that there isn't enough idle CPU cores or memory on the nodes with those idle GPUs.
{{< /callout >}}

&nbsp;
### `unity-slurm-partition-usage`

*For each partition, how many CPU cores and GPUs are currently idle?*

```txt
    partition name    |          idle CPUs          |         idle GPUs         |  total nodes
================================================================================================
arm-gpu                [#######      ] 40/72         [             ] 0/1         1
arm-preempt            [#############] 240/240                                   3
cpu                    [######       ] 4502/9812     [##########   ] 193/252     167
cpu-preempt            [#####        ] 2688/7736     [#######      ] 13/25       126
gpu                    [#####        ] 1024/2740     [########     ] 417/645     125
gpu-preempt            [#####        ] 1690/4492     [#######      ] 492/934     157
mpi                    [#            ] 24/320                                    5
ood-shared             [             ] 0/228         [##########   ] 59/76       19
power9                 [#############] 256/256                                   2
power9-gpu             [#############] 2144/2144     [#############] 44/44       15
power9-gpu-osg         [#############] 256/256       [#############] 4/4         2
power9-gpu-preempt     [#############] 2144/2144     [#############] 44/44       15
```

&nbsp;
### `unity-slurm-account-usage`
*What resources are the members of my PI group currently using? What more can I allocate without violating PI group resource limits?*

```txt
Current resource allocation under account "account1":
 username | CPUs allocated | GPUs allocated | CPUs pending | GPUs pending
=====================================================================================
user1      24               0                0              0
user2      9                6                128            0
user3      18               0                0              5
user4      9                1                0              0
user5      3                0                0              0
total      63               7                128            5
```

{{< callout tip "\"Account\" vs \"PI group\"" >}}
When using Slurm terminology, an "account" does not refer to your user account but actually your PI group.
{{< /callout >}}

&nbsp;
### `unity-slurm-job-time-usage`
*Of my recently completed jobs, how long did each job run? How much time did I allocate for each job to run?*

```txt
   JobName JobID           Elapsed  Timelimit
---------- ------------ ---------- ----------
      bash 15843792       00:04:06   01:00:00
slurm-exp+ 16165455       00:00:08   00:05:00
      bash 16197821       00:11:52   01:00:00
      bash 16197899       00:00:04   01:00:00
      bash 16197903       00:02:29   01:00:00
      bash 16198016       00:09:30   01:00:00
```

This command takes one optional positional argument `num_jobs_printed`.

{{< callout tip "Excess Job Time" >}}
`unity-slurm-job-time-usage` can help you to reduce excess job time. If you can do that, your jobs will be scheduled faster and Slurm will be more effective scheduling jobs cluser-wide.
{{< /callout >}}

&nbsp;
### `unity-slurm-find-nodes`
*Which nodes have a given feature/constraint?*

```txt
$ unity-slurm-find-nodes ppc64le
power9-gpu001   power9-gpu004   power9-gpu007   power9-gpu010   power9-gpu013   uri-cpu046
power9-gpu002   power9-gpu005   power9-gpu008   power9-gpu011   power9-gpu014   uri-cpu047
power9-gpu003   power9-gpu006   power9-gpu009   power9-gpu012   power9-gpu016
found 17 nodes.
```

[Learn more about features/constraints](/documentation/cluster_specs/features/)

{{< callout tip "Helper Script Synergy" >}}
You can pipe `unity-slurm-find-nodes` into `unity-slurm-node-usage` to see the usage for just the nodes that meet a given constraint.
{{< /callout >}}


&nbsp;
### `unity-slurm-list-features` / `unity-slurm-list-constraints`
*What features/constraints can I use to select nodes for my jobs?*

```txt
$ unity-slurm-list-constraints
1080_ti		amd7502		haswell		intel6148	p923		sm_89		vram8
1080ti		amd7543		ib		    intel6226r	power9le	sm_90		vram80
```

[See the full list of features/constraints](/documentation/cluster_specs/features/)


&nbsp;
### `unity-slurm-account-list`
*What accounts am I a member of?*

```txt
$ unity-slurm-account-list
account1
account2
```

&nbsp;
### `unity-slurm-set-default-account`
If you are a member of multiple accounts, one of them will be used by default when you schedule a job without specifying an account. This command changes that default account.
