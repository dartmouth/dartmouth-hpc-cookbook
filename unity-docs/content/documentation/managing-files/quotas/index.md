---
title: Disk Quotas
---

# Disk quotas
Each directory you have access to on Unity has an upper limit to the amount of data that can be stored within it, called a **quota**. To find out the quotas for different Unity directories, see the [Storage page]({{< relref "storage" >}}).

{{< callout note >}}
"Disk" can refer to any storage medium: solid state, spinning disk, tape. The word "disk" is part of the Unix lexicon, and is commonly found in command names and error messages.
{{< /callout >}}

The following guide will discuss how to manage your quota usage, reduce disk usage, and address common causes of home directory clogging.

## How to manage your quota usage

When you exceed your quota, you may find that your software makes strange and confusing error messages. `Quota exceeded` is one possible value of the integer return code from the `write` system call, and every software handles that error a bit differently. **If your home directory (`~`) is full, you will need to create space before you can expect any software to work properly.**

The following sections will guide you through how to check your quota usage, check which files are taking up your space, and explore your directory tree through an interactive interface.

### Check quota usage
To check the amount of free space under the quota for a given directory, use the `df` (disk free) command, as shown in the following example:
```
$ df -h ~
Filesystem      Size  Used Avail Use% File
vast2:/home      50G   29G   22G  58% ~
```
To learn more about the `df` command, see the [`df` manual](https://manpages.ubuntu.com/manpages/focal/en/man1/df.1.html).

### Check which files are using up all of your space

To check which files are using up your space, use the `du` (disk usage) command.
The `du` command recursively explores a directory to find out how much space each file within it is taking up, as shown in the following example:
```
$ du -sh ~/.cache/*
120M    ansible
19K     black
512     dconf
21M     epiphany
3.5K    fontconfig
353K    gstreamer-1.0
64K     gvfs-metadata
92M     mozilla
78M     pip
16M     rclone
1.0K    rstudio
255K    thumbnails
```
To learn more about the `du` command, see the [`du` manual](https://manpages.ubuntu.com/manpages/focal/en/man1/du.1.html).

### Explore a directory tree through an interactive interface

To explore the directory tree through an interactive interface, use the `ncdu` (ncurses disk usage) command, as shown in the following example:
```
ncdu 1.14.1 ~ Use the arrow keys to navigate, press ? for help
--- ~/.cache ---------------------------------------------------
  119.4 MiB [##########] /ansible
   91.4 MiB [#######   ] /mozilla
   78.0 MiB [######    ] /pip
   20.3 MiB [#         ] /epiphany
   15.1 MiB [#         ] /rclone
  352.5 KiB [          ] /gstreamer-1.0
  254.5 KiB [          ] /thumbnails
   64.0 KiB [          ] /gvfs-metadata
   19.0 KiB [          ] /black
    3.5 KiB [          ] /fontconfig
    1.0 KiB [          ] /rstudio
  512.0   B [          ] /dconf
```

To exit `ncdu`, press the `Q` key.

To learn more about the `ncdu` command, see the [`ncdu` manual](https://manpages.ubuntu.com/manpages/focal/en/man1/ncdu.1.html).

## How to reduce disk usage

The following sections will guide you through how to reduce disk usage by moving your files, deleting them, compressing your directories, or simply requesting more storage.

{{< callout note >}}
Our VAST storage can be slow when it comes to handling large numbers of small files. Consider using `tmux` or a batch job for large I/O operations.
{{< /callout >}}

### Move your files to a different directory
If your home directory is full, consider moving files to a `/work` directory. The quotas on `/work` are much larger than on `/home`, and quotas on `/project` can be much larger than on `/work`.

### Delete your files

The simplest way to reduce usage is to delete files. For example, files under `~/.cache` can usually be deleted without consequence, as shown in the following example:
```sh
$ rm -rfv ~/.cache/pip
removed '~/.cache/pip/http/0/4/3/a/f/043af0e61354014271f4c428aa69629aa0232679e0c55e2775d12f6d'
removed directory '~/.cache/pip/http/0/4/3/a/f'
removed directory '~/.cache/pip/http/0/4/3/a'
removed directory '~/.cache/pip/http/0/4/3'
removed directory '~/.cache/pip/http/0/4'
removed directory '~/.cache/pip/http/0'
removed directory '~/.cache/pip'
```

{{< callout note >}}
The `-v --verbose` argument is useful for transparency, but should not be used when handling large numbers of files. A program runs much slower when it's constantly printing to `stdout` (standard output).
{{< /callout >}}

To learn more about the `rm` command, see the [`rm` manual](https://manpages.ubuntu.com/manpages/focal/en/man1/rm.1posix.html).

### Compress your directory

Compressing your directory is a great way to keep the same amount of data using less space. However, when you need to extract that compressed data to work with it again later on, you will likely hit the disk quota again. This problem can be avoided by allocating some temporary scratch space for your job and extracting the data there. To learn more about how to create temporary scratch space for your job, see [Scratch: HPC Workspace](/documentation/managing-files/hpc-workspace/).

To reduce the size of a directory by turning it into a compressed archive, use the `zip` command, as shown in the following example:

```sh
zip -r output.zip /path/to/directory
```

When you create an archive, it takes up more space. If a quota is already exceeded, you must create an archive somewhere else. Then, you can delete the original directory and move the archive back into its place, as shown in the following code sample:
```sh
zip -r /somewhere/else/output.zip /path/to/directory
rm -rf /path/to/directory
mv /somewhere/else/output.zip /path/to/directory.zip
```

To learn more about the `zip` command, see the [`zip` manual](https://manpages.ubuntu.com/manpages/focal/en/man1/zip.1.html).

The `unzip` command can be used to extract a zip archive. To learn more about the `unzip` command, see the [`unzip` manual](https://manpages.ubuntu.com/manpages/focal/en/man1/unzip.1.html).

### Request more storage

To explore storage expansion options, PIs can email [{{< param help-email >}}](mailto:{{< param help-email >}}).

## Common causes of home directory clogging

There are a few reasons why your home directory could be getting backed up. The following sections discuss reasons involving both HuggingFace and Conda. 

### HuggingFace

HuggingFace places many large files in `~/.cache/huggingface` by default. To change the cache directory, see the [HuggingFace cache management manual](https://huggingface.co/docs/datasets/cache#cache-directory).

### Conda
Conda could be causing your home directory to get clogged due to the default locations of the package cache and/or environments. The following sections discuss solutions to both cases.

#### Manage package cache
Conda stores its package cache in `~/.conda/pkgs` by default. This location is only needed at build time and can be safely deleted. 

To make Conda use another directory in the future, you can set the `CONDA_PKGS_DIRS` environment variable. Note that this variable is delimited by commas, unlike most other path list variables which are delimited by colons. The following directories are automatically used if they exist:

* `/work/pi_<your-pi-username>/<your-username>`

#### Manage environments
Conda stores its environments in `~/.conda/envs` by default. These environments should not be moved or deleted. 

To make Conda use another directory in the future, you can set the `CONDA_ENVS_PATH` environment variable. The following directories are automatically used if they exist:

* `/work/pi_<your-pi-username>/.conda`

* `/work/pi_<your-pi-username>/<your-username>`

To migrate a conda environment to another directory, you can clone it and then delete it as long as there are no custom edits or `pip` installs, as shown in the following example:
```sh
conda create --prefix /PATH/TO/NEW/ENV --clone /PATH/TO/OLD/ENV 
rm -rf /PATH/TO/OLD/ENV
```

To learn more about conda, see [Conda's documentation on managing environments](https://conda.io/projects/conda/en/latest/user-guide/tasks/manage-environments.html).
