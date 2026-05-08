---
title: "Unity Feature Announcements"
published: "2023-07-21T12:13:45-07:00"
author: georgia
draft: false
---

As of 1:30 pm on 7/21, the Gypsum nodes and storage are operational again.
Thank you for your patience.

In addition, we’d like to take this opportunity to announce a few new Unity 
features and remind you of our upcoming GPU workshop!

## [Introduction to Using GPUs on Unity]({{< relref "events/2023/gpus.md" >}})

Unity facilitator [Connor Kenyon]({{< relref connor >}}) of the University of Massachusetts Dartmouth 
will present a workshop on the available GPU resources on Unity. During this 
workshop, participants will gain experience accessing and utilizing a GPU in 
both interactive Jupyter sessions as well as with SLURM. Talking points will 
include requesting an overview of available resources, accessing GPUs on Unity,
and a brief introduction to available GPU accelerated software as well as tools
for profiling GPU code. This workshop will provide direct practical experience 
by setting up a Jupyter notebook environment for popular machine learning 
software such as PyTorch and tensorflow on the Unity OnDemand interface. 
This workshop will be held remotely via Zoom. Please register for a Unity 
account prior to the workshop if you do not already have one 
[on the Unity portal]({{< param account-base-url >}}).

Date and Time: Friday, July 28, 2023 at 2 pm EDT
Zoom Link: [See the event announcement]({{< relref "events/2023/gpus.md" >}})

## VSCode on Unity

The popular code editor VSCode is now available directly on Unity via [an Open 
OnDemand interactive application]({{< param ood-url >}}pun/sys/dashboard/batch_connect/sys/bc_vscode/session_contexts/new). 
As with other OOD apps, this opens on a 
compute node so it is appropriate to use the VS Code terminal and Jupyter 
Extensions to run your code. You can install extensions at the user level and 
manage your own settings as well. Please send us a ticket by emailing 
{{< param help-email >}} or send a message in #help-desk in the 
[user Slack]({{< param slack-url >}}) if 
you run 
into any problems with VSCode.

## Open OnDemand Module Browser

Systems administrator [Simon Leary]({{< relref simon >}}) created a [module 
browser plugin for Open OnDemand]({{< param ood-url>}}pun/sys/modules). 
This plugin lets you browse the modules 
available on Unity via a graphical interface and is similar to using the 
command-line “module spider” command.  You can access it through the interactive
application menu on Open OnDemand. However, unlike most interactive OOD apps, 
this module browser does not run on a compute node, so you don’t need to request
resources to use it. Please send us a ticket by emailing 
{{< param help-email >}} or send a message in #help-desk in the 
[user Slack]({{< param slack-url >}}) if
you run into any problems with the module browser.

## New “short” QOS

We’re pleased to announce a new Unity feature: a special “Quality of Service 
(QOS)” for short debug or interactive jobs.

The new QOS is limited to:
- One job per user
- Two nodes per job
- Four hours per job

A QOS is not a partition, so it can be used in combination with any partition 
you have access to (`cpu`, `gpu`, `cpu-preempt`, `gpu-preempt`, etc). 
Essentially, 
this QOS lets you “jump the line” with a higher priority for a small, short job. 
However, this does not always mean no wait, just a shorter wait, and depends on 
resource availability.

You can use it by adding `--qos=short` to your `srun` or `sbatch` command. For
Open
OnDemand apps, this should go in the “extra slurm arguments” field at the bottom
of most of the startup forms. You also need to set the time limit to less than 4
hours and nodes to 2 or fewer or you will get an invalid QOS message. 
For example:

```bash
srun -N 1 -n 8 --mem=16G --qos=short -p cpu -t 2:00:00 --pty /bin/bash
```

## Unity User Community

If you haven’t already done so, we encourage you to join our Unity User 
Community Slack! To join the Unity Slack community, [please sign up with your 
school email here]({{< param slack-url >}}). If you’re unable to register with 
your school email, 
please contact {{< param help-email >}} with your preferred email address and 
we’ll send you a direct invite.
