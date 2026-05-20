---
title: "2024 Annual Maintenance Complete"
published: "2024-05-24T17:00:00-04:00"
author: georgia
draft: false
---

We are pleased to announce Unity is now open for use again following our May 20 through 24, 2024 maintenance. Thank you for your patience as we performed necessary upgrades and maintenance to keep Unity running smoothly.

As of today (Friday, May 24, 2024), Unity `/project` directories hosted on the Northeast Storage Exchange (NESE) remain offline. **Unfortunately, NESE maintenance will not conclude until Wednesday, May 29th.** Until the NESE team gives the go-ahead to reconnect, `/project` directories will not be accessible from Unity. This only applies to directories under the `/project` directory. Work, home, and scratch directories are unaffected.

Please see below for a list of updates that may impact your Unity use. If you run into any problems, we invite you to join us on our [Unity User Community Slack]({{< relref community >}}), where you can get support in the `#help-desk` channel, or send a ticket to {{< help-email >}}. Sign up with your University credentials to join the Slack. If you’re unable to join automatically with your University email, please send a ticket to {{< help-email >}} for a direct invite.

## SuperPod partition complete (formerly `hgx-alpha`)

The five A100 nodes that were previously named `superpod-gpu[001-005]` have been renamed to `gpu[013-017]` and connected to the rest of the NVIDIA HGX A100 nodes with InfiniBand interconnects. In addition, the priority partition hgx-alpha is now `superpod-a100` to celebrate the completion of the InfiniBand network, which tightly couples all 96 A100 GPUs in the pod! If you use `hgx-alpha` as a priority user or specify the SuperPod nodes by name in `gpu-preempt` batch scripts, please update your scripts accordingly.

## SSH library updates
As part of the SSH library updates on Unity, the login node signature has changed and may warn you upon connecting. In addition, there's a [known bug](https://github.com/PowerShell/Win32-OpenSSH/issues/2078) in Microsoft's SSH library which causes problems connecting to newer OpenSSH installs from Microsoft's SSH client included in PowerShell. If you use the Microsoft PowerShell SSH client, add the following line to your `~/.ssh/config` file:

```
MACs hmac-sha2-512-etm@openssh.com
```

or use the following flag option in your SSH command:
```
ssh -m hmac-sha2-512-etm@openssh.com <rest of the cmd>
```

## Microarch modules deprecated
We've concluded the year-long process of deprecating the `microarch` modules (e.g., `microarch/x86_64`, `microarch/cascadelake`). Please update your scripts to remove the `microarch` module load. If you run into errors after removing the `microarch` module, please send a ticket to {{< help-email >}} for help.
