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
        If you plan to run graphical applications on the cluster (see
        [X11 Forwarding](#x11-forwarding-graphical-applications) below), MobaXterm is
        the easier choice because it handles the X11 setup for you.

## Step 2: Connect to the Cluster

Before you can connect, make sure you meet two requirements:

1. **You have a cluster account.** If you haven't yet, see [Request an Account](account.md) to learn how to get one.
2. **You're on the right network.** As a security measure, most HPC centers don't expose their clusters to the open internet. Make sure you are on {{ institution.short_name }}'s network or connected through a VPN before you try to SSH in.

{% include "site/connecting-details.md" %}

### The First Connection: Host Key Verification

The very first time you connect to a new remote machine, your SSH client won't recognize it. It will stop and show you a message similar to this:

```text
The authenticity of host 'discovery.dartmouth.edu (129.170.x.x)' can't be established.
ED25519 key fingerprint is SHA256:abc123xyz...
Are you sure you want to continue connecting (yes/no/[fingerprint])?
```

This is SSH protecting you from "man-in-the-middle" attacks. The remote server presents a unique "fingerprint." Type `yes` and press ++enter++. Your client will save this fingerprint and won't ask you again unless the server's identity changes (which occasionally happens during major system upgrades).

### Entering Your Password

Once the connection is established, you'll be prompted for your password. Type it in, but note that the cursor won't move and no characters will appear. This is normal! It's a security feature, not a bug. Press ++enter++ when you've finished typing.

!!! warning "Nothing Shows When I Type My Password!"
    This catches almost everyone the first time. When you type your password at an SSH
    prompt, the terminal deliberately shows nothing. No dots, no asterisks, no cursor
    movement. Just type your password and press ++enter++.

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

    On shared-memory systems, there typically is no separate login node.
    You SSH directly into the machine itself and run your work there. Be mindful of
    other users who may be sharing the same system.

## X11 Forwarding: Graphical Applications

Most of your work on the cluster will be through the command line. But occasionally you
may need to run an application with a graphical interface: A plotting tool, MATLAB's desktop, or maybe a config tool.

**X11 forwarding** lets the cluster send graphical output back to your local screen
over the SSH connection. You enable it by adding the `-Y` flag:

```bash
ssh -Y username@hostname
```

For this to work, your local machine needs an **X11 server**, which is the software that knows
how to draw those remote windows on your screen.

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

!!! warning "Complex GUI applications will be slow"
    X11 forwarding works by sending every screen update over the network, one
    round-trip at a time. Simple, lightweight GUIs (an `xterm`, a small plot window)
    are usually fine, but complex applications like MATLAB's desktop, Jupyter notebooks
    in a browser, RStudio, or heavy visualization tools will feel painfully sluggish
    and often unusable. This is a fundamental limitation of the X11 protocol, not
    something a faster network alone can fix.

{% include "site/x11-alternatives.md" %}

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
| X11 forwarding | Sending graphical output from the cluster to your screen |

## Next Steps

## Practice SSH Connections

Ready to try it out? This interactive widget simulates a local terminal on your machine. You can practice logging in, handling X11 forwarding, and dealing with common errors before you try the real thing.

<div class="ssh-simulator" data-cluster-name="{{ cluster.name }}" markdown="0"></div>

## Next Steps

Now that you can connect to the cluster, it's time to put it to work. Head to
[Submit Your First Job](first-job.md) to continue.
