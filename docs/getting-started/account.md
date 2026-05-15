---
title: Request an Account
description: "How to request a {{ cluster.name }} account and what comes with it"
tags:
  - getting-started
  - account
---

# Request an Account

Before you can log in, submit jobs, or even poke around the system, you need a {{ cluster.name }} account. {{ cluster.name }} is a shared cluster operated by a multi-institutional consortium based at MGHPCC, so the account flow has two parts: you sign in once via your home institution's identity provider, then you join a PI group that grants you compute and storage allocations.

This page walks you through the four steps that take you from "no account" to a working SSH login:

1. Register on the {{ cluster.name }} portal with your {{ institution.short_name }} {{ institution.username_label }}.
2. Join a PI group so you have a place to put your data and run your jobs.
3. Generate an SSH key through the portal.
4. Connect from your local machine.

## Who can have an account?

Any researcher at a member institution of the {{ cluster.name }} consortium can request an account. If you're at {{ institution.short_name }}, you're eligible. External collaborators not affiliated with a member institution can sometimes get sponsored access through their PI's institution; see the {{ institution.short_name }}-specific notes after the walkthrough.

## What you get

Once your account is qualified (registered + at least one PI group approved), you receive:

- **Login access** to {{ cluster.name }}'s {{ cluster.login_node_count }} login nodes via SSH at `{{ cluster.login_node }}`.
- **A home directory** at `{{ storage.home_path }}/<your_username>` ({{ storage.home_quota }}) for configuration files, scripts, and small personal files.
- **A PI-group work directory** at `{{ storage.work_path }}/pi_<your_pi_group>` ({{ storage.work_quota }} shared with the group) for research data and job I/O.
- **Scratch space** at `{{ storage.scratch_path }}` ({{ storage.scratch_quota }}) for fast temporary work. Files here are not backed up and are auto-purged after a period of inactivity.
- **Access to the {{ cluster.scheduler }} scheduler** for submitting work to compute nodes.

For the full storage tour, see [Storage Fundamentals](../fundamentals/storage.md).

## Step 1: Register on the {{ cluster.name }} portal

1. Browse to [{{ cluster.portal_url }}]({{ cluster.portal_url }}) and click **Login / Request Account** in the left sidebar.
2. In the dropdown, select **{{ institution.sso_dropdown_label }}** and click **Continue**.
3. Sign in with your {{ institution.short_name }} {{ institution.username_label }} via SSO.
4. Verify your information and click **Register**.

!!! note "You'll start as 'unqualified'"
    Right after registration, your account is marked **unqualified**: you can sign into the portal but you can't yet log in to the cluster or submit jobs. You'll qualify in Step 2 by joining a PI group.

## Step 2: Join a PI group

Every {{ cluster.name }} user must belong to at least one PI (Principal Investigator) group. The PI group determines your storage allocations, scheduler accounting, and which partitions you can run on.

1. Read the **Terms of Service** linked above the request button.
2. Check the box confirming you've read it and click **Request to Join a PI Group**.
3. On the **My Principal Investigators** page, click the **+** button.
4. Search for your PI's group (typically named `pi_<pi_username>`).
5. Click **Send Request**.

Your PI receives an email and approves the request. Once approved, your account is qualified and you can log in.

!!! tip "Don't have a specific PI group?"
    If you aren't yet attached to a particular research group, your institution may run a general-purpose PI group you can join to get started. The {{ institution.short_name }}-specific notes below tell you which one to search for.

## Step 3: Generate an SSH key

{{ cluster.name }} uses SSH key authentication, not passwords. The portal generates the key pair for you and registers the public half automatically; you just need to download the private half and put it where your SSH client can find it.

1. In the left sidebar of the portal, click **Account Settings**.
2. Under **SSH Keys**, click the **+** button.
3. Select **Generate Key**, then choose **OpenSSH** (macOS/Linux) or **PuTTY** (Windows).
4. Download the private key file and click **Upload Public Key**.

Then move the private key into place on your local machine and load it into your SSH agent:

=== "macOS / Linux"

    ```bash
    mv ~/Downloads/privkey.key ~/.ssh/unity-privkey.key
    chmod 600 ~/.ssh/unity-privkey.key
    ssh-add ~/.ssh/unity-privkey.key
    ```

=== "Windows (PowerShell)"

    ```powershell
    Move-Item ~\Downloads\privkey.key ~\.ssh\unity-privkey.key
    ssh-add ~\.ssh\unity-privkey.key
    ```

For deeper detail on key management and connection options, see [{{ cluster.name }}'s SSH documentation]({{ cluster.docs_url }}connecting/ssh/).

## Step 4: Connect

{% include "username-input.md" %}

Once your key is loaded, connect to the cluster:

```bash
ssh your_{{ institution.username_label | lower }}{{ institution.username_suffix }}@{{ cluster.login_node }}
```

Replace `your_{{ institution.username_label | lower }}` with your actual {{ institution.username_label }}.
{: .personalize-hint }

!!! tip "Create a shell alias"
    Add this to `~/.bashrc` or `~/.zshrc` so you can simply type `unity` to connect:

    ```bash
    alias unity='ssh your_{{ institution.username_label | lower }}{{ institution.username_suffix }}@{{ cluster.login_node }}'
    ```

{{ cluster.name }} has **{{ cluster.login_node_count }} login nodes**. The cluster assigns you to one automatically, but if you want to return to a specific node (for example, to reattach a `screen` or `tmux` session), you can SSH directly to `login1` through `login{{ cluster.login_node_count }}` once you've logged in once.

For the full SSH walkthrough including running graphical applications and troubleshooting, see [Connecting to the Cluster](connecting.md).

{% include "site/account-details.md" %}

## Managing disk quotas

Every directory you can write to on {{ cluster.name }} has a **quota**, a limit on how much space it can use. Quotas exist to make sure no single user (or runaway program) consumes more than their fair share of a shared resource.

Use `df` (disk free) to see how much space is left under the quota of any directory you have access to:

```bash
df -h ~
```

Output looks like:

```text
Filesystem      Size  Used Avail Use% Mounted on
vast2:/home      100G   29G   71G  29% /home
```

If you're running low on space, here are some strategies:

**1. Find what's using space.** The `du` command (disk usage) walks a directory and reports per-file or per-subdirectory size:

```bash
du -h --max-depth=1 ~ | sort -hr | head -20  # (1)!
```

1. This lists the 20 largest directories in your home, sorted by size. It's a quick way to find where space is going.

For an interactive view, `ncdu` lets you navigate the tree with arrow keys and delete with `d`:

```bash
ncdu ~
```

**2. Remove what you don't need.** Old output files, logs from completed jobs, and stale `~/.cache/` entries (especially `~/.cache/huggingface` and `~/.cache/pip`) are common culprits.

**3. Compress files you want to keep but aren't actively using:**

```bash
gzip large_output.csv           # (1)!
tar -czf old_results.tar.gz old_results/  # (2)!
```

1. Compresses a single file in-place. The original is replaced by `large_output.csv.gz`.
2. Archives and compresses an entire directory into one file.

**4. Move large datasets to a more appropriate storage tier.** Your home directory is for small, frequently accessed files. Large research data belongs on `{{ storage.work_path }}` (shared with your PI group) or `{{ storage.scratch_path }}` (fast, temporary). See [Storage Fundamentals](../fundamentals/storage.md) for guidance on choosing the right tier.

??? failure "Disk quota exceeded"
    If you see errors like `Disk quota exceeded` or `No space left on device`, the filesystem you're writing to is full. Run `df -h ~` (or `df -h {{ storage.work_path }}/pi_<your_pi_group>`) to confirm which quota you've hit, then follow the strategies above to free up space. If you need a temporary workaround to unblock yourself, you can work from `{{ storage.scratch_path }}` while you clean up.

## What's next?

With your account in hand, you're ready to put the cluster to work:

- [**Connect to the cluster**](connecting.md) for the full SSH walkthrough, graphical applications, and troubleshooting.
- [**Submit your first job**](first-job.md) to run a simple batch job with {{ cluster.scheduler }}.
- [**Storage Fundamentals**](../fundamentals/storage.md) for a tour of the different storage tiers and when to use each one.
