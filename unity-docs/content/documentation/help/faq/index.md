---
title: Frequently Asked Questions
blurb: >
    Answers to frequently asked questions about Unity.
---

# Frequently Asked Questions

If you have general questions that are not included in this page or in the rest of the documentation, please email [{{< param "help-email" >}}](mailto:{{< param "help-email" >}}). To troubleshoot more specific errors and issues, see [Troubleshooting]({{< relref "troubleshooting" >}}).

## Connect to Unity
### How do I connect to the Unity platform and begin using it?
There are multiple ways to connect to Unity:
- [Unity OnDemand]({{< relref "documentation/connecting/ondemand" >}}) is the simplest and most convenient method of connecting because it allows you to login through your browser.
- [SSH Connection]({{< relref "ssh" >}}) is the most traditional method of connecting to Unity, especially for experienced Command Line Interface (CLI) users. SSH connection allows you to connect to Unity in your terminal.
- [Visual Studio Code Desktop]({{< relref "vscode" >}}) allows you to connect to Unity using the [Remote-SSH](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-ssh) feature, which is useful for users that prefer to use VS Code as their editor.
- [PuTTY](https://www.chiark.greenend.org.uk/~sgtatham/putty/latest.html) is a convenient way to connect to Unity that is available to Windows users. See the [SSH Connection]({{< relref "ssh" >}}) guide for instructions on how to connect with PuTTY.

## Software and Tools
### Where can I find software to use on Unity?
Most of our software is package installed and is available by default.

[Unity OnDemand]({{< relref "documentation/software/ondemand" >}}) provides JupyterLab, Matlab, RStudio, Mathematica, and a XFCE, a general purpose interactive desktop environment.

Non standard and version specific software are available as [modules]({{< relref "modules" >}}).
- To print all available modules, use the command `module av`.
- To filter the available modules, use `module av <name>`.
- To load a module and gain access to its binaries (executables), use `module load <name>`.

To install additional software, see our guide on [conda environments]({{< relref "conda" >}}).

### I'm looking for xyz software; could you install it?
Most software that is requested is free for use and can be installed for you. To request software, please fill out our [software request form](https://umassamherst.co1.qualtrics.com/jfe/form/SV_8BUNWRPu7g9EOzA).
If the software you want is licensed, we may be able to help since the campus often has site-wide licenses for many applications.

### Can I run containers on Unity?
Yes! We support Apptainer (formerly Singularity) containers, which are fully compatible with Docker images. Run `module load apptainer/latest` to access it.

## Storage and Hardware
### How much storage do I get on Unity and is it backed up?
Refer to our [storage documentation]({{< relref "storage" >}}).
We do not provide backup solutions by default.
We take snapshots of `/home/` and `/work/` every day at 1AM, but delete them after two days.

### How can I extend the 30-day scratch workspace? Mine seems to have expired, and I can’t access it.
For information on how to extend a workspace, see the [HPC Workspace documentation]({{< relref "documentation/managing-files/hpc-workspace/#extend-a-workspace" >}}).

### I'm a PI, and I would like to purchase hardware to buy-in to Unity.
Great! Send us an email and we'll be happy to help. We are very flexible when it comes to the needs of research labs.

## Job Management
### I'm part of multiple PI groups; how can I make sure I'm doing my work under a certain group and not a different one?
To change an association for a job, use the command `--account=pi_...`.

### How can I check the resource use of my job while it's running?
To connect to the node where your job is running and start an interactive shell, use the command `srun --overlap --pty --jobid X /bin/bash`.

Tools like `nvitop` will only show the GPU(s) assigned to the job you attached to (not all your jobs on that node), while `htop -u $USER` will show all of your processes' CPU and memory usage. Use `scontrol -d show job X` to see which CPU cores your job is using.
