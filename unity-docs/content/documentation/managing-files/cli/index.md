---
title: Command Line Interface (CLI)
---

# Manage files using the Command Line Interface (CLI)
After successfully [connecting to Unity with OpenSSH]({{< relref "ssh" >}}), you can manage your Unity files using the Command Line Interface (CLI). The CLI is a program that allows you to interact with the computer operating system by inputting lines of text called command-lines.

You can use the CLI to copy or upload files to your Unity home directory. The CLI also allows you to conveniently copy a whole directory (folder).

The instructions below will guide you through opening the CLI, navigating to a directory, and copying files to your Unity home directory using the commands `scp` and `rsync`.

{{< callout note >}}
In order to reference `unity` and copy files to your Unity home directory using `scp` and `rsync`, you must [configure the OpenSSH config file]({{< relref "ssh" >}}) to contain the information for host `unity`.
{{< /callout >}}

{{< callout "warning" >}} **Windows users using PowerShell SSH only** must add `MACs hmac-sha2-512-etm@openssh.com` to their `~/.ssh/config` file, or use the flag option in your SSH command so that it reads `ssh -m hmac-sha2-512-etm@openssh.com <rest of the cmd>`.

This is necessary due to a [known bug](https://github.com/PowerShell/Win32-OpenSSH/issues/2078) in Microsoft's SSH library which causes problems connecting to newer OpenSSH installs from Microsoft's SSH client included in PowerShell.
{{< /callout >}}

## Open CLI and navigate to a directory

1. Go to your computer's application search menu and search for **"Terminal"** or **"Command prompt"**. Once opened, the CLI typically looks like a plain window with a text area that is mostly empty besides one small line of text.

2. Once you have your CLI open, navigate to the directory containing the files you want to upload. Experienced CLI users might choose to use [absolute paths](https://networkencyclopedia.com/absolute-path/) in their commands and skip this step.

To navigate to a directory, in your CLI use the command `cd` followed by the path to the directory:
```bash
# Windows
cd C:/Users/YOUR_NAME/Desktop
# Linux
cd /home/$USER/Desktop
# Mac
cd /Users/YOUR_NAME/Desktop
```
The code example above assumes that the files you want to upload are located in your `desktop` directory. In the Windows example, the drive you want to copy from is the `C drive`. If they are located somewhere else, you must change the path used above.

{{< callout caution >}}
If your file name contains spaces, you will have to put it in quotes.
{{< /callout >}}

## Copy files to your Unity home directory

There are multiple commands you can use to copy your files to your Unity home directory, including `scp` and `rsync`.

For a simple and straightforward copy, you can use the `scp` command without installing anything. For recurring tasks and synchronizing files over a network, you can use the `rsync` command. To use `rsync`, you must install the utility on your Linux or Mac.

### SCP
OpenSSH comes with the `scp` command, which is similar to `cp` (copy) but with the added benefit of referencing the OpenSSH config file
(`~/.ssh/config`).

The `scp` command allows you to use `unity` as part of the command because the OpenSSH config file contains the connection information for host `unity`. If the OpenSSH config file does not contain the connection information for host `unity`, you must [configure the OpenSSH config file]({{< relref "ssh" >}}) to have that information in order to use `unity` in your commands.

The following code example shows how to use `scp` to copy a single file or an entire directory into your Unity home directory:
```bash
# single file
scp FILE_NAME unity:~

# entire directory
scp -r DIRECTORY_NAME unity:~
```
You could also upload the files to a different location on the Unity filesystem as long as you have the correct permissions.

{{< callout note "The recursive flag" >}}
`-r` in many commands is short for 'recursive,' which means that the command will apply to all files and subdirectories under that directory to ensure that all contained files are accounted for.
{{< /callout >}}

{{< callout note "Home directory shortcut" >}}
`~` in the CLI is a shortcut for your home directory path.

Your home directory path, or `~`, is:
* `C:/Users/YOUR_NAME` in Windows
* `/home/YOUR_NAME` in Linux
* `/Users/YOUR_NAME` in [Mac](https://www.cnet.com/tech/computing/how-to-find-your-macs-home-folder-and-add-it-to-finder/).
{{< /callout >}}

### RSYNC
Linux and Mac users can install and use the command `rsync` to copy their files.

Similarly to `scp`, the `rsync` command references the OpenSSH config file. If the OpenSSH config file does not contain the connection information for host `unity`, you must [configure the OpenSSH config file]({{< relref "ssh" >}}) to have that information in order to use `unity` in your commands.

The `rsync` command also comes with many useful options. For example, using the `-tlp` flags ensures that timestamps, relative links, and permissions are preserved, respectively.

The following code example shows how to use `rsync` to copy a single file or an entire directory into your Unity home directory:

```bash
# single file
rsync -tlp FILE_NAME unity:~

# entire directory
rsync -rtlp DIRECTORY_NAME unity:~
```
