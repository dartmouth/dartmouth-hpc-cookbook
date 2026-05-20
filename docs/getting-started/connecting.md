---
title: Connect to the Cluster
description: "How to connect to {{ institution.short_name }}'s HPC systems"
tags:
  - getting-started
---

# Connecting to the Cluster

Your HPC cluster is a remote machine. That means it doesn't have a monitor, keyboard, or mouse
plugged into it the way your laptop does. To use it, you open a connection from your
local machine over the network and interact with the cluster through a terminal. The
tool that makes this possible is called **SSH** (Secure Shell).

This page will walk you through:

1. Getting an SSH client ready on your machine
2. Connecting to the cluster for the first time
3. What you're looking at once you're in

## What is SSH?

SSH (Secure Shell) is a protocol for securely connecting to a remote computer over a
network. When you "SSH into" a cluster, you're opening an encrypted channel between
your machine and one of the cluster's login nodes. Once connected, you get a terminal
session on that remote machine. You can type commands just as if you were sitting in
front of it.

The basic SSH command looks like this:

```bash
ssh username@hostname
```

- **`username`** is your account name on the cluster.
- **`hostname`** is the network name or address of the machine you're connecting to.

!!! tip "Your First Mental Model"
    Think of SSH as making a phone call with caller ID. You need a phone (your SSH client), you need
    to know the number (the hostname), and the person on the other end needs to
    recognize you (by your username and credentials) to decide whether to accept the connection.
    The connection is encrypted, so nobody listening on the wire can eavesdrop.

## Step 1: Open a Terminal with an SSH Client

SSH is a command-line tool, so you'll need a terminal application to use it. What you
need depends on your operating system.

=== "macOS"

    Good news: You already have everything you need. macOS ships with a built-in
    terminal that includes an SSH client.

    **To open it:** Applications → Utilities → Terminal

    You can also search for "Terminal" in Spotlight (++cmd+space++).

=== "Linux"

    Like macOS, Linux distributions come with SSH built in. Open your distribution's
    terminal emulator (often called Terminal, Konsole, or GNOME Terminal) and you're
    ready to go.

=== "Windows"

    Modern Windows (10 and later) includes an SSH client you can use from **PowerShell**
    or **Command Prompt**. Open either one and try typing `ssh`. If you see usage
    information, you're all set.

    If you prefer a dedicated application, two popular free options are:

    - [**MobaXterm**](https://mobaxterm.mobatek.net/): Recommended. Bundles a
      terminal, file transfer client, and X11 server in one package.
    - [**PuTTY**](https://www.chiark.greenend.org.uk/~sgtatham/putty/): A lightweight, long-established SSH
      client.

    !!! note
        Most graphical work on {{ cluster.name }} should go through
        [Open OnDemand](#running-graphical-applications) in your browser, no SSH
        client setup needed. If you do plan to use X11 forwarding, MobaXterm bundles
        an X11 server and is the easier choice.

## Step 2: Connect to the Cluster

Before you can connect, make sure you meet two requirements:

1. **You have a cluster account.** If you haven't yet, see [Request an Account](account.md) to learn how to get one.
2. **You're on the right network.** As a security measure, most HPC centers don't expose their clusters to the open internet. Make sure you are on {{ institution.short_name }}'s network or connected through a VPN before you try to SSH in.

{% include "username-input.md" %}

{% include "site/connecting-details.md" %}

### The First Connection: Host Key Verification

The very first time you connect to a new remote machine, your SSH client won't recognize it. It will stop and show you a message similar to this:

```text
The authenticity of host '{{ cluster.login_node }} (x.x.x.x)' can't be established.
ED25519 key fingerprint is SHA256:abc123xyz...
Are you sure you want to continue connecting (yes/no/[fingerprint])?
```

This is SSH protecting you from "man-in-the-middle" attacks. The remote server presents a unique "fingerprint." Type `yes` and press ++enter++. Your client will save this fingerprint and won't ask you again unless the server's identity changes (which occasionally happens during major system upgrades).

### Authenticating

Once the connection is established, you'll be authenticated using your SSH key. If your key is properly configured (see [account setup](account.md)), you'll be logged in automatically. If you set a passphrase on your key, you may be prompted to enter it.

!!! tip "SSH key not working?"
    If you're asked for a password instead of being authenticated by key, make sure you've added your private key with `ssh-add` and that the corresponding public key is uploaded in the {{ cluster.name }} portal. See the [account setup instructions](account.md) for details.

## Step 3: Verify You're Connected

If everything worked, your terminal prompt will change. Instead of showing your local
machine's name, it will show the name of the cluster node you've connected to.
Something like:

```
[your_username@login-node ~]$
```

Congratulations! You're on the cluster. The commands you type now are running on the
remote machine, not your laptop.

!!! info "What's a Login Node?"
    On a cluster like {{ cluster.name }}, the machine you land on when you SSH in is
    called a **login node**. It's a shared gateway: a place to manage files, write
    scripts, and submit jobs. It is **not** where you run heavy computations! Those
    happen on separate compute nodes managed by the job scheduler. We'll cover job
    submission in a later section.


## Running graphical applications

Most of your work on {{ cluster.name }} will be through the command line, but you'll
occasionally need a real graphical interface: a plotting tool, an IDE, MATLAB's
desktop, a visualization app.

For that, **use [Open OnDemand]({{ cluster.ondemand_url }})**, {{ cluster.name }}'s
web portal. It runs your graphical application as a batch job on a compute node and
streams the desktop to your browser over VNC. No SSH client, no X11 server, no setup
on your laptop. See the [Open OnDemand recipes](../recipes/open-ondemand/getting-started.md)
for a walkthrough.

!!! tip "What you can launch from Open OnDemand"
    JupyterLab, RStudio, VS Code, MATLAB, Mathematica, and a full Linux Virtual
    Desktop. If your tool isn't on that list, the Virtual Desktop will run almost
    anything you'd otherwise reach for X11 to use.

### When you really need X11

The old way to run a remote GUI is **X11 forwarding**: SSH carries the graphical
output back to a local X server on your laptop. It still works, but it's the wrong
tool for most jobs on a modern cluster (see the warning below).

If you do need it, two rules:

1. **Don't run GUIs on the login node.** The login node is a shared gateway. Heavy
   processes there get killed and they slow the node down for everyone.
2. **Launch the GUI from a compute node** by combining `ssh -Y` with an interactive
   Slurm allocation:

    ```bash
    ssh -Y your_{{ institution.username_label | lower }}{{ institution.username_suffix }}@{{ cluster.login_node }}
    salloc -c 2 -p {{ cluster.default_partition }} --x11 xclock
    ```

    The `--x11` flag tells Slurm to forward X back through your SSH session. You
    cannot do this with `sbatch`, only `salloc`.

For this to work, your local machine also needs an **X11 server**, which is the
software that draws the remote windows on your screen.

=== "macOS"

    macOS does not ship with an X11 server. Install
    [**XQuartz**](https://www.xquartz.org/) (free), then log out and back in (or
    reboot) for it to take effect. After that, `ssh -Y` will work from your regular
    Terminal.

=== "Linux"

    Most Linux desktops already include an X11 server. `ssh -Y` should work out of the
    box.

=== "Windows"

    - **MobaXterm** includes a built-in X11 server. Just connect as usual and
      graphical applications will forward automatically.
    - **PuTTY** users will need to install a separate X11 server such as
      [VcXsrv](https://sourceforge.net/projects/vcxsrv/) or
      [Xming](http://www.straightrunning.com/XmingNotes/), and enable X11 forwarding
      in PuTTY's configuration.

!!! warning "Why Open OnDemand exists"
    X11 forwarding sends every screen update over the network, one round-trip at a
    time. A small `xclock` or a quick plot window is fine. A full IDE, MATLAB's
    desktop, RStudio, or any visualization tool feels painfully sluggish and often
    unusable. That isn't a network problem, it's the X11 protocol itself, which is
    why {{ cluster.name }}'s recommendation is OnDemand for any non-trivial GUI.

## Troubleshooting

!!! tip "Use verbose mode to diagnose problems"
    Add `-v` to your SSH command for detailed diagnostic output:
    ```bash
    ssh -v username@hostname
    ```
    This shows every step of the connection handshake and is the first thing support
    staff will ask for when helping you debug.

**"Connection refused" or "Connection timed out"**
:   You're probably not on the right network. Make sure you're on
    {{ institution.short_name }}'s network or connected to the VPN, then try again.

**"Permission denied"**
:   Double-check your username and password. Remember that both are case-sensitive.

**"Host key verification failed"**
:   This usually means the cluster's SSH key has changed (for example, after
    maintenance). Follow {{ institution.short_name }}'s instructions for updating your known hosts
    file, or contact [{{ institution.support_team }}](mailto:{{ institution.support_email }}).

**Password prompt doesn't appear / connection hangs**
:   This is often a network or firewall issue. Verify your VPN connection is active and
    try again.

## Summary

| Concept | What It Means |
|---------|---------------|
| SSH | Encrypted protocol for remote terminal access |
| SSH client | The program on your machine that initiates the connection |
| Login node | The shared machine you land on after connecting |
| Open OnDemand | Web portal that runs graphical apps on compute nodes, streamed to your browser |

## Next Steps

## Practice SSH Connections

Ready to try it out? This interactive widget simulates a local terminal on your machine. You can practice logging in and dealing with common errors before you try the real thing.

<div class="ssh-simulator" data-cluster-name="{{ cluster.name }}" data-username-suffix="{{ institution.username_suffix }}" markdown="0"></div>

## Next Steps

Now that you can connect to the cluster, it's time to put it to work. Head to
[Submit Your First Job](first-job.md) to continue.
