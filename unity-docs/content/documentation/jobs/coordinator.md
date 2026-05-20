---
title: Managing group resource use
blurb: >
 Managing jobs and job limits for users in your account
icon: work
weight: 100
---
# Managing group resource use

PI's may request that themselves or a designator user within their group be made a Coordinator for their group. Please send an email to [{{< param help-email >}}](mailto:{{< param help-email >}}) request this.

A **Coordinator** in Slurm is like a “power user” for group (Slurm "**Account**"). As a Coordinator you can:

- See and manage jobs for users in your account
- Adjust limits that control how much of the cluster your group members can use

You do **not** have full administrator powers, but you can help keep your group’s jobs under control and share resources fairly.

## Seeing jobs in your account

Use `squeue` to see which jobs your group members are running:

```bash
# See jobs for a specific account (e.g., "pi_groupname")
squeue -A pi_groupname
```

Common helpful filters:

```bash
# See all running jobs in your account
squeue -A pi_groupname -t RUNNING

# See pending (waiting) jobs in your account
squeue -A pi_groupname -t PENDING

# See jobs of a specific user in your account
squeue -A pi_groupname -u someuser
```

## Managing other users’ jobs

As a Coordinator for `pi_groupname`, you can **hold, release, or cancel** jobs submitted under that account, including jobs owned by other users in your group.

###  Cancel jobs

Cancel a job by job ID:

```bash
# Cancel a single job
scancel 123456

# Cancel all jobs from a specific user in your account
scancel -u someuser -A pi_groupname

# Cancel all pending jobs in your account
scancel -t PENDING -A pi_groupname
```

Use cases:

- A user accidentally submitted 1,000 jobs instead of 10.
- A job is clearly stuck (no progress, wrong partition, etc.).

###  Hold and release jobs

You can **hold** a job so it does not start, and **release** it later.

```bash
# Hold a job (prevent it from starting)
scontrol hold 123456

# Release a held job
scontrol release 123456
```

Typical reasons to hold:

- A student has submitted a very large job right before a deadline and you want to wait until other jobs finish.
- You want the user to fix their code before the job runs again (note that changes to the batch script require cancel and resubmit).

## Viewing and editing user limits in your account

As Coordinator, you can adjust **resource limits** for users under your account using `sacctmgr`. These limits help control how much of the cluster they can use at once.

- Maximum jobs running at once
- Maximum CPUs/cores in use
- Maximum GPUs in use
- Maximum jobs per user in a specific account

###  Check current user limits

To see the limits for a user under your account:

```bash
# Show user info, scoped to your account
sacctmgr show user someuser withassoc format=User,Account,GrpJobs,GrpTRES,MaxJobs,MaxTRES
```

You may see fields like:

- `MaxJobs` – max number of jobs this user can run at once
- `MaxTRES` – max resources (like CPUs or GPUs) this user can use
- `GrpJobs` / `GrpTRES` – group-wide limits for the association (what the entire group can use at once)

## Examples of changing user limits

You  use `sacctmgr` to modify limits. Commands below assume your account is `pi_groupname`.
### Example: Limit how many jobs a user can run at once

Scenario: A user `alice` keeps submitting hundreds of short jobs that overwhelm the queue. You want to limit her to **20 running jobs at any time** in account `pi_groupname`.

```bash
# Set MaxJobs=20 for user alice in account pi_groupname
sacctmgr modify user where name=alice account=pi_groupname set MaxJobs=20
```

Verify:

```bash
sacctmgr show user alice withassoc format=User,Account,MaxJobs
```

Result: Alice can still submit more than 20 jobs, but Slurm will only allow **20 to run simultaneously**. The rest will stay pending.

### Example: Cap the total CPUs a user can use at once

Scenario: User `bob` submits a few very large multi-core jobs that monopolize the cluster. You want to limit him to **64 CPUs** at a time in `pi_groupname`.

```bash
# Limit bob to 64 CPUs (C for CPU) across all running jobs in account pi_groupname
sacctmgr modify user where name=bob account=pi_groupname set MaxTRES=cpu=64
```

Check:

```bash
sacctmgr show user bob withassoc format=User,Account,MaxTRES
```

Result: If bob already has 64 CPUs in use, any new job asking for more CPUs will stay pending until some CPUs free up.

### Example: Limit total memory usage for a user

Scenario: User `carol` runs several memory-heavy jobs that cause memory pressure. You want to limit her to **256 GB of RAM** at once.

```bash
# Limit carol to 256G of total memory across her running jobs
sacctmgr modify user where name=carol account=pi_groupname set MaxTRES=mem=256G
```

Check:

```bash
sacctmgr show user carol withassoc format=User,Account,MaxTRES
```

Result: Once Carol reaches 256G of allocated memory across her jobs, additional memory-demanding jobs will wait.

{{< callout tip >}}
Tip: `MaxTRES` can combine multiple resources, e.g.:
```bash
sacctmgr modify user where name=carol account=pi_groupname \
         set MaxTRES=cpu=64,mem=256G
```
{{< /callout >}}

### Example: Temporary stricter limits for a whole class

Scenario: For a course group, you want to restrict each student to **4 jobs and 16 CPUs** in your account `ds532_school_edu`.

```bash
# Limit max running jobs
sacctmgr modify user where account=ds532_school_edu set MaxJobs=4

# Limit total CPUs
sacctmgr modify user where account=ds532_school_edu set MaxTRES=cpu=16
```

Limits can also be ste on a per-user basis by adding `user=student_usernname`.
You can relax those limits by raising them or clearing them (set to -1).


### Example: Limit how many A100 GPUs a user can use

Scenario: User `dave` is running multiple GPU jobs and tends to grab all the A100 GPUs. You want to limit him to **2 A100 GPUs total** at any time in account `mygroup`.

```bash
# Limit dave to 2 A100 GPUs across all running jobs in account mygroup
sacctmgr modify user where name=dave account=mygroup set MaxTRES=gres/gpu:a100=2
```

Check:

```bash
sacctmgr show user dave withassoc format=User,Account,MaxTRES
```

Result: If dave already has 2 A100 GPUs allocated (e.g., one job with `--gres=gpu:a100:2` or two jobs with `--gres=gpu:a100:1`), any additional job that requests an A100 GPU will remain **PENDING** until one of his GPU jobs finishes.

You can also combine GPU limits with CPU/memory limits in one command, for example:

```bash
sacctmgr modify user where name=dave account=mygroup \
    set MaxTRES=cpu=32,mem=128G,gres/gpu:a100=2
```

This keeps dave within **32 CPUs**, **128G RAM**, and **2 A100 GPUs** simultaneously.


## Balancing fairness and usability

When changing limits, consider:

- **Fairness:** Ensure a single user cannot block the whole group.
- **Flexibility:** For advanced users running large but important jobs, coordinate with them so limits are reasonable.
- **Transparency:** Tell users what limits are in place and why (e.g., “You’re limited to 32 CPUs so everyone gets a share”).

## Summary of useful commands

**View jobs:**

```bash
squeue -A pi_groupname
squeue -A pi_groupname -u someuser
```

**Manage jobs:**

```bash
scancel 123456           # Cancel job
scancel -A pi_groupname -u X  # Cancel all jobs of user X in your account
scontrol hold 123456     # Hold job
scontrol release 123456  # Release job
```

**View limits:**

```bash
sacctmgr show user someuser withassoc format=User,Account,MaxJobs,MaxTRES
```

**Change limits (examples):**

```bash
# Max 20 jobs:
sacctmgr modify user where name=alice account=pi_groupname set MaxJobs=20

# Max 64 CPUs:
sacctmgr modify user where name=bob account=pi_groupname set MaxTRES=cpu=64

# Max GPUs:
sacctmgr modify user where name=carol account=pi_groupname set MaxTRES=gres/gpu:a100=2,gres/gpu:24
```
