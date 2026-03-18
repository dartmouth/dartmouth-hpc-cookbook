---
title: Linux Basics
description: "Essential Linux command-line skills for working on {{ institution.short_name }}'s HPC cluster"
tags:
  - fundamentals
  - linux
---

# Linux Basics

Every HPC cluster runs Linux. When you SSH into {{ cluster.name }}, you're dropped into a Linux shell: a text-based interface where you control the system by typing commands. There's no file browser, no right-click menu, and you can't use your mouse. Just a prompt, a blinking cursor, and a lot of power.

If you've never used the command line before, this can feel disorienting. This article will give you the vocabulary and hands-on practice you need to navigate confidently.

!!! tip "Interactive first"
    Before reading the reference sections below, try the hands-on terminal tour. You'll practice the most important commands in a guided, story-driven simulation without needing real cluster access.

## The Terminal Tour

You've just been given access to {{ cluster.name }}. The previous grad student left behind some data on a lab volume. Your mission: find it, understand it, and set up your own workspace.

Enter your NetID below to personalize the simulation, then click **SSH into {{ cluster.name }} →** to begin.

<div class="terminal-tour" data-cluster-name="{{ cluster.name }}" markdown="0"></div>

## The Shell Prompt

When you SSH into {{ cluster.name }}, you see something like this:

```
[f00abc@discovery ~]$
```

This is your **shell prompt**. It tells you:

- **`f00abc`**: your username (your NetID)
- **`discovery`**: the name of the host you're logged into
- **`~`**: your current directory (`~` is shorthand for your home directory)
- **`$`**: you're logged in as a regular user (not root)

Everything you type after `$` is a command. Press ++enter++ to run it.

## Navigation

### Where am I? — `pwd`

`pwd` (print working directory) tells you your current location in the filesystem:

```bash
pwd
```

```
/dartfs/rc/home/c/f00abc
```

### What's here? — `ls`

`ls` lists the contents of your current directory:

```bash
ls
```

Add flags to get more detail:

| Command | What it does |
|---------|-------------|
| `ls` | List files and directories |
| `ls -l` | Long format; shows permissions, size, date |
| `ls -a` | Show hidden files (those starting with `.`) |
| `ls -lh` | Long format with human-readable file sizes |
| `ls /some/path` | List a different directory without navigating to it |

### Move around — `cd`

`cd` (change directory) moves you to a new location:

```bash
cd /dartfs/rc/lab/C/ChenLab   # absolute path
cd my_project                  # relative path (inside current dir)
cd ..                          # go up one level
cd ~                           # go home
cd                             # also goes home
```

## Reading Files

### Print a file — `cat`

```bash
cat README.txt
```

`cat` prints the entire file to the terminal. Fine for small files; overwhelming for large ones.

### Peek at the top — `head`

```bash
head results.csv        # first 10 lines (default)
head -n 50 results.csv  # first 50 lines
```

### Peek at the bottom — `tail`

```bash
tail results.csv         # last 10 lines
tail -n 20 results.csv   # last 20 lines
tail -f slurm-12345.out  # follow a file as it grows (useful for job logs)
```

### Page through a file — `less`

```bash
less results.csv
```

`less` opens a scrollable viewer. Use ++arrow-up++ / ++arrow-down++ to scroll, ++space++ to page down, `q` to quit, `/pattern` to search.

## File Management

### Create a directory — `mkdir`

```bash
mkdir my_project
mkdir -p my_project/data/raw   # create nested directories at once
```

### Copy a file — `cp`

```bash
cp source.txt destination.txt          # copy file
cp source.txt /some/other/directory/   # copy into a directory
cp -r my_dir/ backup_dir/              # copy a whole directory (-r = recursive)
```

### Move or rename — `mv`

```bash
mv old_name.txt new_name.txt           # rename
mv file.txt /dartfs/rc/lab/C/ChenLab/ # move to another directory
```

!!! warning "There's no Recycle Bin"
    On Linux, `rm` deletes immediately and permanently. There is no undo. Double-check your paths before running `rm` on a shared filesystem.

### Delete — `rm`

```bash
rm old_file.txt
rm -r old_directory/   # remove a directory and everything inside it
```

## Searching

### Search file contents — `grep`

`grep` searches for a pattern inside files:

```bash
grep "PASS" results.csv           # lines containing "PASS"
grep -i "pass" results.csv        # case-insensitive
grep -n "error" slurm-12345.out   # show line numbers
grep -r "TODO" my_project/        # search recursively through a directory
```

### Find files — `find`

```bash
find . -name "*.csv"              # find all CSV files in current directory
find /dartfs/rc/lab -name "*.bam" # find BAM files in the lab volume
find . -newer reference.txt       # files newer than reference.txt
```

## Getting Help

Every command has built-in documentation:

```bash
man ls        # full manual page; press q to quit
ls --help     # shorter usage summary
```

When in doubt, `man` is your friend.

## Paths and the Filesystem

Linux uses a single unified filesystem tree rooted at `/`. There are no drive letters. Everything hangs off `/`.

```
/
├── dartfs/
│   └── rc/
│       ├── home/
│       │   └── c/
│       │       └── f00abc/      ← your home directory (~)
│       └── lab/
│           └── C/
│               └── ChenLab/     ← a lab storage volume
└── scratch/                     ← fast scratch storage
```

### Absolute vs. relative paths

An **absolute path** starts from `/` and unambiguously identifies a location regardless of where you currently are:

```bash
cd /dartfs/rc/lab/C/ChenLab
cat /dartfs/rc/home/c/f00abc/README.txt
```

A **relative path** is relative to your current directory. If you're already in your home directory:

```bash
cat README.txt          # same file, shorter to type
cd ../..                # go up two levels
```

### Special path shortcuts

| Shortcut | Means |
|----------|-------|
| `~` | Your home directory |
| `.` | Current directory |
| `..` | Parent directory |
| `-` | Previous directory (`cd -` goes back) |

## Quick Reference

| Category | Command | What it does |
|----------|---------|-------------|
| Navigation | `pwd` | Print current directory |
| | `ls` | List files |
| | `ls -la` | List all files, long format |
| | `cd /path` | Change directory |
| | `cd ~` | Go home |
| | `cd ..` | Go up one level |
| Reading | `cat file` | Print whole file |
| | `head file` | First 10 lines |
| | `tail file` | Last 10 lines |
| | `less file` | Scrollable viewer |
| Files | `mkdir dir` | Create directory |
| | `cp src dst` | Copy file |
| | `mv src dst` | Move/rename |
| | `rm file` | Delete file (permanent!) |
| Search | `grep pattern file` | Search in file |
| | `find . -name "*.csv"` | Find files by name |
| Help | `man cmd` | Full manual |
| | `cmd --help` | Short help |

## What's Next

With these fundamentals in hand, you're ready to go deeper:

- [**Editing Files in the Terminal**](editing.md): Edit job scripts and config files with nano or vi
- [**Linux — Permissions, Pipes & the Environment**](linux-advanced.md): File permissions, pipes, redirection, and shell configuration
- [**Storage on {{ cluster.name }}**](storage.md): Understand your home directory, lab volumes, and scratch space
- [**Submitting your first job**](../getting-started/what-is-hpc.md): Put the scheduler to work with `sbatch`
