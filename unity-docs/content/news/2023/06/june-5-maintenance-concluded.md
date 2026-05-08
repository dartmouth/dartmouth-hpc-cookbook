---
title: Unity Maintenance Concluded
published: 2023-06-10T13:45:49-0400
author: georgia
---

Unity Users,


We are pleased to announce Unity is now open for use again following
our June 5 through June 10, 2023 maintenance. Thank you for your patience as we performed necessary upgrades and maintenance to keep Unity running smoothly.


We've included a copy of the change list below. If you have any
questions or encounter any issues, please submit a ticket to hpc@umass.edu.


In addition to the announced changes below, we're currently resolving
a problem with the Mathematica license. We apologize for any inconvenience and hope to have it fixed shortly.


Welcome back!


## Change List


**Priority Queue Default Time:**

We’re reducing the default time on Priority queues to 1 hour. The
maximum time remains unchanged. To run jobs longer than one hour, use the “-t” flag to set the time limit to the desired time for your job. The Slurm scheduler is most effective when jobs are scheduled with accurate time limits, so please set the time limit
to a realistic limit for your job.

**Module Changes**

The module hierarchy update will be out of beta and deployed as
the default on Unity. Please see here
for a description of of the changes. In addition, we will be enabling the module option to require a module version. This makes
it much less likely that your workflow breaks unexpectedly if we install a newer version of a module! If previously you loaded a package with “module load <package name>”, you’ll simply need to update that to “module load <package name>/<version>”. For example,
“module load apptainer” becomes “module load apptainer/1.1.5”. You can view the available versions of a module with “module spider <package name>”.


**Goodbye JupyterHub!**


We will be decommissioning JupyterHub in favor of supporting Open
OnDemand. JupyterLab, RStudio, and Matlab are all available from the Open OnDemand interface. If you have custom conda environments on JupyterHub, they will be available from the JupyterLab interface in Open OnDemand. See
here
for documentation, and please
send us a ticket or
join our Unity
User Community Slack if you have any questions or difficulties with the transition. 


**Disabling Hyperthreading**


We’re disabling hyperthreading across Unity since it is often detrimental
to HPC workloads. This may mean an apparent core count for a node you frequently use may appear different since hyperthreading appears to Slurm as twice the amount of cores. We have
updated
our documentation to reflect the true number of CPUs on each node.


**Scratch**


We will be adding a significant amount of storage to our scratch
filesystem and deploying the HPC Workspace scratch management software. You will be able to use the HPC Workspace commands to request a temporary (30 day) scratch directory. This is great if you have jobs that require staging large files or that generate a
lot of intermediate file data! Please
see our documentation for more information. We anticipate the scratch space being fully available a couple of weeks after the maintenance
period. 

**Slurm Update**


Our largest upgrade will be moving Slurm from 20.02.7 to 23.02.2.
Most users will not notice a difference since the core functionality remains unchanged. However, it makes more recent Slurm features available
