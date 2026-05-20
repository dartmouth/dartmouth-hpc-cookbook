---
title: "COMPLETED: Unity Ubuntu 24.04 Update on October 22, 2024"
published: "2024-10-25T15:00:00-04:00"
author: lauren
draft: false
---

**Unity's operating system (OS) upgrade is NOW COMPLETE!** On October 22, 2024, we upgraded all Unity servers from Ubuntu 20.04 to the new LTS (long term support) version, 24.04. This is a critical update to the cluster to ensure continued security and stability.

For real-time discussion about changes regarding the OS release, join the [#os-upgrade-24-04 channel](https://unity-user-community.slack.com/archives/C07RB8BP5P1) in our Unity User Community Slack. For more information on joining the Slack, see [here]({{< relref "community" >}}).

## Module stack changes

An OS update is a significant undertaking that affects all software on the system.

1. You'll notice that our module stack is more sparse! While we've brought a significant amount of software forward, we're anticipating there is more to reinstall. **If your software is missing and there is not a suitable version installed on Unity, please fill out [this software request form](https://umassamherst.co1.qualtrics.com/jfe/form/SV_8BUNWRPu7g9EOzA).**
2. The `miniconda` and `anaconda` modules have been replaced with `conda/latest`. While we anticipate the majority of existing environments will continue to work correctly, please keep an eye on your job output and monitor your personal environments.

## Long partitions replaced with QOS

We've simplified the partition list. `cpu` , `gpu` , `cpu-preempt`, and `gpu-preempt` partitions now have a 48 hour time limit. If you need to run a job lasting more than 48 hours, add the new **long QOS** with `#SBATCH -q long` to your batch scripts. However, please use this sparingly and avoid it if possible. We made the change to reduce the number of jobs asking for very long runtimes they didn't need as it makes it harder for Slurm to schedule resources.

## Help!

We have daily help on zoom available this week and next week. See the schedule (and troubleshooting tips) on the troubleshooting page in [#os-upgrade-24-04](https://unity-user-community.slack.com/archives/C07RB8BP5P1). Please drop in to see us or ask your question in [#os-upgrade-24-04 channel](https://unity-user-community.slack.com/archives/C07RB8BP5P1)!

## Extended Office Hours

Due to the OS upgrade, we are offering the following extended [Zoom office hours]({{< param officehours-url >}}):

|Date|Time|
|---|---|
|Monday 10/28|10:00 AM - 11:30 AM, 2:30 PM - 4:00 PM|
|Tuesday 10/29|10:00 AM - 11:30 AM, 2:30 PM - 4:00 PM|
|Wednesday 10/30|10:00 AM - 11:30 AM, 2:30 PM - 4:00 PM|
|Thursday 10/31|10:00 AM - 11:30 AM, 2:30 PM - 4:00 PM|
|Friday 11/1|10:00 AM - 11:30 AM, 2:30 PM - 4:00 PM|
