---
title: "Annual Maintenance: May 20-24, 2024"
published: "2024-04-17T11:40:45-05:00"
author: georgia
draft: false
aliases:
    - shutdown-warning-1
---

We are approaching our annual maintenance period, which coincides with the MGHPCC's data center maintenance shutdown. Unity, *including login access and storage*, will be offline from **Monday, May 20th at 9 am Eastern through Friday, May 24th** for necessary maintenance and upgrades. **During this time, you will not be able to log in to Unity, including Unity-connected storage.** We appreciate your patience during this disruption and will work to restore Unity access as quickly as possible following network restoration Friday afternoon.

We encourage users to plan accordingly. Keep in mind that your job will not start if the time limit overlaps the start of maintenance. You can use the `-t` flag with Slurm to set a time limit that shortens your job to fit into the acceptable window. For example, to restrict your job to 2 days and 12 hours, you can add `-t 2-12:00:00`. In addition, you can add `--deadline=2024-05-20` to your job so it will remove itself from the queue if it won’t run in time for the maintenance. We will be purging the queues during maintenance, so anything queued will not run after the reservation is lifted. You will receive a follow up email once Unity is back online and ready for use again.

We invite you to join us on our [Unity User Community Slack]({{< relref community >}}) where you can get the most up-to-date information and chat with the Unity team. Sign up with your University credentials to join. If you’re unable to join automatically with your University email, please send a ticket to {{< help-email >}} for a direct invite.

### UPDATE 2024-05-03

Most Unity `/project` directories are hosted on the Northeast Storage Exchange (NESE). Unfortunately, NESE maintenance will not conclude until **Tuesday, May 28th, at 2 pm EDT**. Until the NESE team gives the go-ahead to reconnect, `/project` directories will not be accessible from Unity. While Unity will resume operations as planned on Friday, May 24th, it will be a few more days until `/project` is available again.

### UPDATE 2024-05-10

The five A100 nodes that are currently named `superpod-gpu[001-005]` will be renamed to `gpu[013-017]` and connected to the rest of the NVIDIA HGX A100 nodes with InfiniBand interconnects. In addition, the priority partition `hgx-alpha` will be renamed `superpod-a100` to celebrate the completion of the InfiniBand network, which tightly couples all 96 A100 GPUs in the pod! If you use `hgx-alpha` as a priority user or specify the superpod nodes by name in `gpu-preempt` batch scripts, please update your scripts accordingly after the shutdown.
