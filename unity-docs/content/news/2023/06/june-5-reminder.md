---
title: Unity Maintenance Reminder (2023-06-05)
published: 2023-06-02T12:46:23-0400
author: georgia
---

We are quickly approaching our annual maintenance period! Unity will be completely offline from June 5th at midnight (the start of June 5th) through June 10th for necessary maintenance and upgrades. This coincides with the annual shutdown at the datacenter Unity lives at, the MGHPCC. 

Once Unity is back online and ready for use again, we will send a follow up email. Until then, I invite you to join us on our Unity User Community Slack where you can get the most up-to-date information and chat with the Unity team. Sign up here with your University credentials to join. If you’re unable to join automatically with your University email, please send a ticket to hpc@umass.edu for a direct invite.  

If you’re working on Unity down to the wire, keep in mind that your job will not start if the time limit overlaps the start of maintenance. You can use the `-t` flag on Slurm to set a time limit to shorten your job to fit into the acceptable window. In addition, you can add `--deadline=2023-06-05` to your job so it will remove itself from the queue if it won’t run in time for the maintenance. We will be purging the queues during the Slurm upgrade, so anything queued will not run after the maintenance reservation is lifted.

For your convenience (and for our new users, welcome!) [here are the previously announced changes]({{< relref "june-5-update-may-26-outage.md" >}}). In addition, we’ve added one more change to our plans: 

**Priority Queue Default Time:**

We’re reducing the default time on Priority queues to 1 hour. The maximum time remains unchanged. To run jobs longer than one hour, use the `-t` flag to set the time limit to the desired time for your job. The Slurm scheduler is most effective when jobs are scheduled with accurate time limits, so please set the time limit to a realistic limit for your job.

We hope to get you back to your work as quickly as possible next week. Thank you for your patience and understanding.
