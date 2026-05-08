---
title: "Unity Digest 2/28/25"
published: "2025-02-28T13:00:00-04:00"
author: lauren
draft: false
---
Hi Unity Users! Keep reading for some helpful documentation updates and announcements about Unity.

## UPDATED DOCS ✏️
- [Software Management]({{< relref "documentation/software/#building-software-from-scratch" >}}) was updated to include a section on **how to build software from scratch**
- [Troubleshooting]({{< relref "documentation/help/troubleshooting" >}}) was updated to include additional information on **how to solve SSH connection errors**

## ANNOUNCEMENTS 📢

### ⚙️ New hardware alert! Three L40S nodes and one A16 node added to Unity
Unity has been upgraded to include **three new nodes with 12 [Nvidia L40S](https://www.nvidia.com/en-us/data-center/l40s/) GPUs, four on each node**. We have also added **one node with [Nvidia A16](https://www.nvidia.com/en-us/data-center/products/a16-gpu/) GPUs**. These additions are now included on our [Node Features (Constraints)]({{< relref "features" >}}) page.

### 📢 More extensions for scratch space are now available
We have increased the **number of extensions for scratch space** from three to **five**. [Learn more about scratch space]({{< relref "documentation/managing-files/hpc-workspace/">}}).

### 💡 Use the MPI constraint to ensure consistent CPU type
In Slurm, `--ntasks, -n`​ sets the number of tasks, defaulting to 1 per node. If using MPI and not specifying a number of nodes, include `--constraint=mpi` to ensure a consistent CPU type, which is important for performance. Learn more on our [Overview of threads, cores, and sockets in Slurm for HPC workflows]({{< relref "documentation/get-started/hpc-theory/threads-cores-processes-sockets.md">}}).

### ❗ Reminder: `/project` snapshots are now available
In addition to `/work` and `/home`, users can recover files for `/project`. The [documentation on snapshots]({{< relref "documentation/cluster_specs/storage/#snapshots" >}}) has been updated to reflect this change.

### 🗓️ Missed the Unity Onboarding Workshop? Catch up here!
You can find the link to the recording on the [2025 Spring Onboarding event page]({{< relref "events/2025/spring-onboarding-25.md">}}).
