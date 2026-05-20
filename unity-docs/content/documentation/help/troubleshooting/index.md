---
title: Troubleshooting
blurb: >
    Solutions to common errors that users run into on Unity.
---
# Troubleshooting
If you are running into errors that are not included in this page or in the rest of the documentation, please email [{{< param "help-email" >}}](mailto:{{< param "help-email" >}}) or join the [Unity User Community Slack]({{< ref "contact/community" >}}) to chat with the Unity team and fellow Unity users.

## SSH Connection to Unity

Unity relies on matching the public key stored in your Unity account to the private key on your host machine to authenticate SSH connections. Most connection errors come from not being able to match the keys appropriately.

### Error 1: `ssh: Could not resolve hostname unity: Name or service not known`

This error occurs when your connection doesn’t understand what you mean by `unity`. This usually happens for one of two reasons:
1. You haven’t yet set up your SSH config file (if that’s the case, see the [SSH Documentation]({{< relref "ssh" >}})).
2. You did set it up, but it's misplaced or misnamed.

If you have created your SSH config, verify:
1. It is a file (not directory) named `config` with no extension.
2. It is located in the directory `~/.ssh/`.

### Error 2: `permission denied (public key)`
This problem means your SSH client and Unity can’t match the public key on Unity to the private key on your desktop.

First, verify that you’ve created [SSH keys]({{< relref "ssh" >}}) on the [Unity portal]({{< param account-base-url >}}) or added an existing key to your Unity account. If you have done that, your SSH client must be configured to use your private key by specifying its location.

Additionally, ensure the following:
* You are assigned to at least one PI group. We require at least one PI to endorse your account before you can use Unity. [Request to join a PI]({{< relref "getting-access.md" >}}) on the My PIs page if needed.
* Your login shell is valid. In [Account Settings]({{< param account-base-url >}}panel/account.php), try setting it to "/bin/bash" or "/bin/zsh".
* If you are a PI, do not use your PI group name as your login username (your login username should not start with `pi_`).

SSH can find keys with three methods:
1. For keys with default names `id_rsa`, `id_ecdsa`, `id_ed25519`: Inside the standard `~/.ssh` directory.
2. From the `IdentityFile <path to key> line` in your SSH config file.
3. With the `ssh -i <path to key>...` option on the command line.

{{< callout "tip" >}}If you’re using the first two options but still get a permission denied error, try using the third option to verify that it’ll recognize the key. If this works, something’s wrong with your setup but not your key.{{< /callout >}}

### Error 3: `Corrupted MAC on input`
This issue affects Windows PowerShell users due to [a known bug](https://github.com/PowerShell/Win32-OpenSSH/issues/2078) in PowerShell’s version of SSH. This bug causes connection issues with newer OpenSSH installations when using Microsoft's SSH client included in PowerShell.

To fix this, Windows users using PowerShell SSH must add `MACs hmac-sha2-512-etm@openssh.com` to their ~/.ssh/config file, or use the flag option in your SSH command so that it reads `ssh -m hmac-sha2-512-etm@openssh.com <rest of the cmd>`.

## Job Management and File Storage
### I got an error that said "disk quota exceeded." What should I do?
Move or delete some files to reduce your storage usage. For more information, see our [documentation on disk quota management]({{< relref "quotas" >}}).

### When I try to queue a job, I get denied for MaxCpuPerAccount.
Resource limits are set per lab, with 1000 concurrent CPUs and 64 concurrent GPUs shared across your entire PI group. If you encounter this error, adjust your usage or discuss resource allocations with your PI or the Unity team.

### I have jobs in the queue, but I need to prioritize a specific job now. Can I do this without canceling the queued jobs?
You can de-prioritize your other queued jobs with `scontrol update jobid=.... nice=100`.

If it’s a short job, you can try the Quality of Service
(QOS) to “jump the line” with a higher priority for a small, short job. (This does not always mean no wait, just a shorter wait, and depends on resource availability.) See [the QOS announcement]({{< ref "news/2023/07/feature-announcements/#new-short-qos" >}}) for details.

### I have too many jobs to run, and slurm won't let me submit them all. I get an error for MaxJobCount or MaxJobSubmit. How can I work around this?
Slurm has limits that are set to avoid either too many jobs being submitted at once or too many jobs running at once. To work around this, submit jobs as an [array job]({{< relref "documentation/jobs/sbatch/arrays">}}) instead.

## OnDemand Shell
### Why does the OnDemand Shell crash when I try to use modules like `anaconda` or `miniconda`?
If you are using self-installed versions of `anaconda`, `miniconda`, or other modules, the shell will crash. To prevent future crashes, use the pre-installed Unity modules and do not use `conda init`.

### When I try to add an environment module, it doesn't work. What should I do?
Make sure that you have included the version in your module. For example, instead of `python`, enter `python/3.12`.

### What do I do if my home directory is full?
If you are running out of space on your home directory, try transferring some files to a new directory, such as a `work` directory. For more information on storage management, see [our documentation on disk quota management]({{< relref "quotas" >}}).