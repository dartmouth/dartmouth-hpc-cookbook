---
title: Managing Files
menu:
  - docs
blurb: >
    Managing data on and transferring data to and from Unity.
icon: folder
weight: 40
---

# Uploading files to the Unity filesystem
The only way to add files to the Unity filesystem is through an SSL encrypted
connection. You can use Unity OnDemand, FileZilla, Globus, or the command line.

* [Unity OnDemand]({{< relref "ondemand" >}}) is the most intuitive
interface, but can't transfer large files.
* [FileZilla]({{< relref "filezilla" >}}) is good for those who have their
SSH keys set up and are familiar with the software already.
* [Globus]({{< relref "globus" >}}) is useful for large file transfers between
Globus endpoints, including your personal computer with Globus Connect.
* [Command-line tools]({{< relref "cli" >}}) like `scp` and `rsync` are good
for quick work via the command line.

{{< callout tip >}}
Uploading files using American residential internet is typically very slow.
UMass Amherst has a fiber line going directly to MGHPCC to improve speeds.
{{< /callout >}}

## Your key file
The FileZilla and Console methods require setting up public/private SSH keys.
This can be the same key you use to SSH to Unity.
`scp` and `rsync` use OpenSSH, and FileZilla prefers `.ppk`
but can work with `.rsa`. Depending on which software you use, you can
generate one of each. You can also
convert between these keys using a program like PuTTYgen.

{{< callout "warning" >}} **Windows users using PowerShell SSH only** must add `MACs hmac-sha2-512-etm@openssh.com` to their `~/.ssh/config` file, or use the flag option in your SSH command so that it reads `ssh -m hmac-sha2-512-etm@openssh.com <rest of the cmd>`.

This is necessary due to a [known bug](https://github.com/PowerShell/Win32-OpenSSH/issues/2078) in Microsoft's SSH library which causes problems connecting to newer OpenSSH installs from Microsoft's SSH client included in PowerShell.
{{< /callout >}}

For more information, see the
[configuring SSH keys]({{< relref "../connecting/ssh.md" >}}) article. To
update SSH keys in your Unity account, visit
[account settings]({{< param account-base-url >}}panel/account.php) in the Unity
portal.
