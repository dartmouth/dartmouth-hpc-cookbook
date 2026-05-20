---
title: "Weekly Digest 7/18/24"
published: "2024-07-18T17:00:00-04:00"
author: lauren
draft: false
---
Hi Unity Users! Welcome to the first edition of our Weekly Digest. This update will provide you all with an overview of the latest documentation, updates to existing documentation, cluster changes, and any other important announcements from your sysadmins. You can expect to receive these updates weekly. Let’s dive in!

## New documentation
* [Slurm cheat sheet]({{< relref "slurm.md" >}})
* [How to contribute to the Unity User documentation](https://gitlab.rc.umass.edu/unity/education/documentation/unity-website/-/blob/main/content/documentation/CONTRIBUTING.md?ref_type=heads). Only for those that have access to the behind-the-scenes of our website and are beginning to actively contribute to the Unity User Documentation.
* [Monitor a batch job]({{< relref "monitoring.md" >}}). Overview of how to monitor the progress of running batch jobs, including how to check job status and utilization.
* [Large job counts documentation]({{< relref "large-count.md" >}}). When and how to submit a large number of jobs.
* [Dataset docs]({{< relref "datasets" >}}). Provides information about each dataset available for Unity users to access. More to come.

## Useful updates to documentation
* [Troubleshooting for Windows PowerShell users: the SSH MACs issue]({{< relref "ssh" >}}) (which is a result of a known bug in Microsoft’s SSH library) can be found in the **Connect to Unity using the CLI** section, along with relevant locations throughout the docs (e.g. [Managing Files]({{< relref "managing-files" >}}) and [Frequently Asked Questions]({{< relref "faq" >}})).
* [Interactive CLI Jobs: Salloc job submission overview]({{< relref "salloc" >}}). Language was edited here to be easier for users to follow and understand. It more clearly breaks up when users should use `salloc` vs. when users should use `sbatch`.
* [Cluster Specification Storage doc]({{< relref "storage.md" >}}) was updated to include a storage expansion flowchart to help users decide what type of storage you need, or whether existing data is ideally placed.
* [FileZilla documentation]({{< relref "filezilla" >}}) was updated to include how to add a default remote directory in FileZilla.

## Cluster changes
If you submit a job with suspiciously low memory requests, Slurm may assume that you meant GB instead of the default MB and issue a warning. Similarly, if your requested memory slightly exceeds the threshold for higher RAM nodes, Slurm will also issue a warning.

Note that these are only warnings and **will not prevent your job from launching**.

## Other announcements
* [Meet and Mingle with the MGHPCC Community at PEARC’24!]({{< relref "mghpcc-mingle.md" >}})
