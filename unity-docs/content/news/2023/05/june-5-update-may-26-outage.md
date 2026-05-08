---
title: Unity Maintenance 6/5 Update & Service Outage 5/26
published: 2023-05-23T13:31:49-0400
author: georgia
---

On Friday, May 26th, from 7 am to 9 am, we will be migrating the server that hosts the Unity Web Portal and JupyterHub. Those services will be unavailable during that time. Open OnDemand, SSH access to Unity, and batch jobs will not be affected. 

**Maintenance Update**

As a reminder, Unity will be offline from June 5th to June 10th, 2023, for our annual maintenance. You will not be able to access your data during this time, so plan accordingly! In addition, we’re planning several changes for Unity:

**Module Changes**

The module hierarchy update will be out of beta and deployed as the default on Unity. Please see here for a description of of the changes. In addition, we will be enabling the module option to require a module version. This makes it much less likely that your workflow breaks unexpectedly if we install a newer version of a module! If previously you loaded a package with `module load <package name>`, you’ll simply need to update that to `module load <package name>/<version>`. For example, `module load apptainer` becomes `module load apptainer/1.1.5`. You can view the available versions of a module with `module spider <package name>`.

**Goodbye JupyterHub!**

We will be decommissioning JupyterHub in favor of supporting Open OnDemand. JupyterLab, RStudio, and Matlab are all available from the Open OnDemand interface. If you have custom conda environments on JupyterHub, they will be available from the JupyterLab interface in Open OnDemand. See here for documentation, and please send us a ticket or join our Unity User Community Slack if you have any questions or difficulties with the transition. 

**Disabling Hyperthreading**

We’re disabling hyperthreading across Unity since it is often detrimental to HPC workloads. This may mean an apparent core count for a node you frequently use may appear different since hyperthreading appears to Slurm as twice the amount of cores. We have updated our documentation to reflect the true number of CPUs on each node.

**Scratch**

We will be adding a significant amount of storage to our scratch filesystem and deploying the HPC Workspace scratch management software. You will be able to use the HPC Workspace commands to request a temporary (30 day) scratch directory. This is great if you have jobs that require staging large files or that generate a lot of intermediate file data! Please see our documentation for more information. We anticipate the scratch space being fully available a couple of weeks after the maintenance period. 

**Slurm Update**

Our largest upgrade will be moving Slurm from 20.02.7 to 23.02.2. Most users will not notice a difference since the core functionality remains unchanged. However, it makes more recent Slurm features available.
