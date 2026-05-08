---
title: "Weekly Digest 8/02/24"
published: "2024-08-02T10:15:00-04:00"
author: lauren
draft: false
---
Hi Unity Users! This week’s edition of the Weekly Digest features new documentation, updated documentation, and an exciting announcement.

## New documentation 🎉
* [Venv - Virtual environments in Python]({{< relref "venv" >}}). This is an overview of virtual environments in Python, including how to create, activate, move, and deactivate an environment, install packages, and submit a slurm job with `venv`.

## Updated documentation ✏️
* [SSH Connection documentation]({{< relref "ssh" >}}) was updated to recommend configuring an SSH agent so that you don’t need to enter a password every time you use SSH keys for SSH connections.
* [Module usage documentation]({{< relref "module-usage.md" >}}) was updated to suggest using `module spider` to search for specific software instead of `module avail`.

## Announcements 📢
* We recently added 68 L40S GPUs to Unity! These are speedy, high VRAM GPUs suitable for machine learning. To use them, specify `--constraint=l40s` in either the `gpu` or `gpu-preempt` partitions.
