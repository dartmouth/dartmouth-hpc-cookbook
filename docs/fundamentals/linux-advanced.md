---
title: Advanced Linux
description: "File permissions, pipes, redirection, environment variables, dotfiles, and modules on {{ institution.short_name }}'s HPC cluster"
tags:
  - fundamentals
  - linux
---

# Advanced Linux: Permissions, Pipes & the Environment

This article picks up where [Linux Basics](linux-basics.md) left off. You should already be comfortable navigating the filesystem and managing files. Here you'll learn how Linux controls access to files, how to chain commands together with pipes, and how to configure your shell environment.

!!! tip "Interactive first"
    Try the hands-on terminal tour below before reading the reference sections. You'll practice permissions, pipes, redirection, and modules in a guided simulation without needing real cluster access.

## The Terminal Tour

You've already set up your workspace from the basic tour. Now it's time to go deeper: control who can access your files, chain commands together, and manage software modules.

Enter your {{ institution.username_label }} below, then click **SSH into {{ cluster.name }} →** to begin.

<div class="terminal-tour" data-tour="advanced" data-cluster-name="{{ cluster.name }}" markdown="0"></div>

## File Permissions

Every file on Linux has a set of **permissions** that control who can read, write, or execute it. When you run `ls -l`, the leftmost column shows them:

```
-rw-r--r--  1 f00abc f00abc  312 Mar 10 14:22 README.txt
drwxr-xr-x  2 f00abc f00abc 4096 Mar 10 14:22 my_project/
```

The permission string has 10 characters:

```
- rw- r-- r--
│ │   │   └── others: read only
│ │   └────── group: read only
│ └────────── owner: read + write
└──────────── file type (- = file, d = directory)
```

Each group of three characters is `rwx`: **r**ead, **w**rite, e**x**ecute.

### Why this matters on HPC

On a shared cluster, files in your home directory are typically readable only by you. Files in a shared lab volume may be readable by your whole group. Scripts you want to run must be executable:

```bash
chmod +x run_analysis.sh   # make a script executable
chmod 750 my_project/      # owner: rwx, group: r-x, others: ---
```

!!! tip "Check before you share"
    Before copying sensitive data to a lab volume, check the permissions on that volume with `ls -la`. By default, new files inherit the permissions of their parent directory.

## Pipes and Redirection

One of Linux's most powerful ideas: the output of one command can become the input of another.

### The pipe `|`

```bash
cat results.csv | grep "PASS" | wc -l   # count passing variants
ls -l | sort -k5 -rn | head             # 10 largest files
```

### Redirect output to a file `>`

```bash
grep "PASS" results.csv > passing_variants.csv   # overwrite
grep "FAIL" results.csv >> all_variants.csv      # append
```

### Redirect input from a file `<`

```bash
sort < unsorted.txt
```

### Discard output

```bash
some_noisy_command > /dev/null 2>&1   # throw away stdout and stderr
```

## Environment and Dotfiles

### Environment variables

Your shell has **environment variables** — named values that affect how programs run. The most important one is `$PATH`:

```bash
echo $PATH
/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin
```

`$PATH` is a colon-separated list of directories. When you type a command like `python`, the shell searches these directories from left to right looking for an executable with that name. If it finds one, it runs it. If it doesn't find one in any of them, you get the familiar error:

```
-bash: python: command not found
```

This is what people mean when they say something is "not on your `PATH`": The software may be installed on the system, but the directory containing its executable isn't in your `$PATH`, so your shell doesn't know where to find it. You'll run into this often on a cluster where hundreds of software packages are installed but only a handful are available by default, managed through [environment modules](modules.md).

Other common environment variables:

```bash
echo $HOME    # your home directory
echo $USER    # your username
```

`$HOME` and `$USER` are useful when writing scripts that need to work across different machines or different users. Instead of hardcoding a path like `/home/c/f00abc/results`, you can write `$HOME/results`, which resolves correctly regardless of who runs the script or what the home directory convention is on that system. This matters on HPC clusters especially: Your labmate's home directory is in a different location than yours, and other institutions structure their paths differently than {{ institution.short_name }}. Scripts that lean on environment variables instead of hardcoded paths require fewer modifications to run on a different system or under a different account.

### Dotfiles

Files starting with `.` are hidden from plain `ls`. Your home directory contains several of these **dotfiles** — configuration files that are loaded every time you open a shell:

| File | Purpose |
|------|---------|
| `~/.bashrc` | Runs every time you open a new shell. Put aliases, module loads, and `$PATH` additions here. |
| `~/.bash_profile` | Runs at login. Often just sources `~/.bashrc`. |
| `~/.profile` | Login config for non-bash shells. |

To apply changes after editing `~/.bashrc` without logging out:

```bash
source ~/.bashrc
```

### Environment modules on {{ cluster.name }}

Now that you know about `$PATH`, here's the practical payoff: {{ cluster.name }} uses an **environment modules** system so you don't have to edit `$PATH` by hand. When you load a module, the system updates your environment variables automatically:

```bash
module load openmpi/5.0    # makes Open MPI available in version 5.0
module list                # see what's currently loaded
```

That's all you need for now. Modules are central to working on the cluster: Loading software, managing versions, and keeping your jobs reproducible are all important concerns in HPC land, so they have [their own dedicated article](modules.md).


## Quick Reference

| Category | Command | What it does |
|----------|---------|-------------|
| Permissions | `ls -l` | Show permissions |
| | `chmod +x file` | Make file executable |
| | `chmod 750 dir/` | Set numeric permissions |
| Pipes | `cmd1 \| cmd2` | Pipe output to next command |
| Redirection | `cmd > file` | Write output to file (overwrite) |
| | `cmd >> file` | Append output to file |
| | `cmd < file` | Read input from file |
| | `cmd > /dev/null 2>&1` | Discard all output |
| Environment | `echo $VAR` | Print variable |
| | `source ~/.bashrc` | Reload shell config |
| Modules | `module avail` | List available software |
| | `module load name` | Load software module |
| | `module list` | List loaded modules |
| | `module purge` | Unload everything |

## What's Next

- [**Storage on {{ cluster.name }}**](storage.md): Understand your home directory, lab volumes, and scratch space
- [**Submitting your first job**](../getting-started/what-is-hpc.md): Put the scheduler to work with `sbatch`
- [**All about modules**](modules.md): Setting the stage by loading the right software for the job
