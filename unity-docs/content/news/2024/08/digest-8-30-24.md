---
title: "Unity Digest 8/30/24"
published: "2024-08-30T12:00:00-04:00"
author: lauren
draft: false
---
Hi Unity Users! Welcome back to the Unity Digest, which has shifted to a bi-weekly schedule since our last update. In this edition, you’ll find new and updated documentation, along with some key announcements. Let’s dive in!

## NEW documentation 🎉
* [R Parallelization]({{< relref "run-r-in-parallel.md" >}}). A secondary page to the Introduction to R on Unity docs that provides an overview on how to run R in parallel.

## UPDATED documentation ✏️
* The Unity Nodes list was updated to add two new GPU features: fp64 and bf16; [Node Features (Constraints)]({{< relref "features" >}}) page provides the definitions under “GPU Feature”.
* The [Unity GPUs]({{< relref "documentation/tools/gpus" >}}) page was updated to include a note about CUDA Compute Capability.
* The [Slurm Cheat Sheet]({{< relref "slurm.md" >}}) was updated to include Slurm commands for adjusting job priority.

## ANNOUNCEMENTS 📢

❗**Reminder: Fall Onboarding**: Don’t miss our Fall Onboarding Sessions on September 5th and 6th! For times and registration information, see our [Upcoming Events]({{< relref "events" >}}) page.

❗**Additional 24 A100 GPUs**: We made an additional 24 A100 GPUs available in the general `gpu` partition. To request an A100, use the Slurm constraint flag `-C a100`. However, if you need a high VRAM GPU and not specifically an A100, we encourage you to use `-C vram40` (or another vram feature appropriate for your workload) to choose from any of our high VRAM GPUs, including the A100s and new L40Ss. See our [Node Features (Constraints)]({{< relref "features" >}}) page for details.

❗**OS Update & Unity Downtime**: On October 22, 2024, we will apply a significant and critical operating system update to Unity. All Unity servers will move from the current operating system, Ubuntu 20.04, to the current LTS version, Ubuntu 24.04. This update is necessary for Unity's continued maintenance and security.

This means that **on 10/22, we will take Unity offline to perform the update**. In addition, we're making significant updates to our research software module stack. More information on how to prepare your workloads for the update to follow here and via email announcement next week.
