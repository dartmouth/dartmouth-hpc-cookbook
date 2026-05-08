---
title: "Scratch: HPC Workspace"
aliases:
    - /scratch
---

# High performance scratch space: HPC Workspace

Unity provides a tool called
[HPC Workspace](https://github.com/holgerBerger/hpc-workspace) that allows you to
create and manage high performance scratch space in a sustainable fashion. The following instructions describe how to create workspaces and manage them with a few key features.

{{< callout warning >}}
Scratch spaces do not have snapshots and no recovery of deleted data is possible. Do not place the only copy of valuable files in scratch.
{{< /callout >}}

{{< callout warning >}}
Due to storage limitations, the scratch workspaces have a storage limit of 15TB per user. For unique use cases, some exceptions may apply. If you would like to request more storage space on scratch, please reach out to us via the [Contact]({{< relref "contact" >}}) page.
{{< /callout >}}

## Create a workspace

Use the `ws_allocate` command to create a workspace. There are several different options for creating a workspace.
To view all options, run `ws_allocate -h`.

The following code sample shows how to create a workspace for a single user with a given number of days. **The maximum duration for a workspace is 30 days.**

{{< callout note >}}
The number of extensions is essentially unlimited, however is not meant for long term storage, and should be limited to related jobs.
{{< /callout >}}

```
username@login2:~$ ws_allocate simple 14
Info: creating workspace.
/scratch/workspace/username-simple
remaining extensions  : 3
remaining time in days: 14
```

After running the `ws_allocate` command to create a workspace, the following code shows up to let you know that the directory that was created.

```
username@login2:~$ ls -ld /scratch/workspace/username-simple
drwx------ 2 username username 4096 Mar  2 17:48
```

### Send an email reminder before workspace expiration

Use the `-m` option to specify an email address that you want to notify before the workspace expires. Defaults to the email associated with your account.
This option requires you to specify the number of days before expiration using the `-r` option.

For example:
```
username@login2:~$ ws_allocate -m username@umass.edu -r 1 workspacename 2
Info: creating workspace.
/scratch/workspace/username-workspacename
remaining extensions  : 3
remaining time in days: 2
```

#### Configure default mail parameters
If you wish to change the default settings for reminder timing or the email address, create a configuration file at `~/.ws_user.conf`. By default, reminders are sent 3 days in advance, and notifications are sent to your account email address.

Sample `~/.ws_user.conf`:
```yaml
reminder: 3
mail: preferred@example.org
```

### Create a shared workspace

The HPC Workspace utility allows you to create **shared** workspaces, which are useful for collaborating on a project.
To create a shared workspace, all members must be members of a common group, such as the members of a particular PI group.

The following code sample shows how to create a workspace that can be shared with a particular PI group.

```
username@login2:~$ ws_allocate -G pi_pi-username shared
Info: creating workspace.
/scratch/workspace/username-shared
remaining extensions  : 3
remaining time in days: 0
```

After creating a shared workspace, the following code shows up to let you know that the directory was created with group sharing permissions.

```
username@login2:~$ ls -ld /scratch/workspace/username-shared
drwxrws--- 2 username pi_pi-username 4096 Mar  3 19:08
```

## Manage workspaces
HPC Workspace provides many useful features for managing your workspaces after they are created. The following instructions show you how to **list** your workspaces, **share** a workspace with another user, **release** a workspace, and **extend** a workspace.

### List workspaces
Use the `ws_list` command to view a **list** of your workspaces along with key information about them.

For example:
```
username@login2:~$ ws_list -v
id: username-workspacename
     workspace directory  : /scratch/workspace/username-workspacename
     remaining time       : 1 days 23 hours
     creation time        : Fri Mar  3 16:56:51 2023
     expiration date      : Sun Mar  5 16:56:50 2023
     filesystem name      : workspace
     available extensions : 3
     acctcode             : username
     reminder             : Sat Mar  4 16:56:50 2023
     mailaddress          : username@umass.edu
id: username-simple
     workspace directory  : /scratch/workspace/username-simple
     remaining time       : 0 days 23 hours
     creation time        : Fri Mar  3 16:56:44 2023
     expiration date      : Sat Mar  4 16:56:44 2023
     filesystem name      : workspace
     available extensions : 3
     acctcode             : username
     reminder             : Sat Mar  4 16:56:44 2023
     mailaddress          : None
```

### Check scratch space usage
There are multiple `/scratch*` directories, and the 15TB quota applies separately to each, however new workspaces are automatically assigned to whichever has the most space available and cannot be selected.
The `squota` command will give the amount of quota used on each of the spaces. If you have no data in any of them, then it will look like this:

```text
Space              Used       Soft      Quota  %Full
scratch              0B       14TB       15TB   0.0%
scratch3             0B         0B       15TB   0.0%
scratch4             0B         0B       15TB   0.0%
```

### Release a workspace

Use the `ws_release` command to **release** a workspace once you are done with it.
Releasing a workspace means that the ID can be reused, and the directory is no longer accessible.

For example:
```
username@login2:~$ ws_release workspacename
username@login2:~$ ws_release simple
username@login2:~$ ws_list
username@login2:~$
```

{{< callout tip "Please release workspaces" >}}
Releasing workspaces when they are no longer needed helps optimize
scratch space for all Unity users.
{{< /callout >}}

{{< callout warning >}}
Releasing a workspace does not delete the data immediately.
The deletion of the workspace can take place at any time once it's released.
{{< /callout >}}

### Extend a workspace

HPC Workspace allows a limited number of opportunities to **extend** a workspace.
Use `ws_list` to see the available number of extensions.

The following code sample shows how to create a workspace and extend it for 30 days.

```
username@login2:~$ ws_extend simple 30
Info: extending workspace.
/scratch/workspace/username-simple
remaining extensions  : 2
remaining time in days: 30
```

### Share a workspace with another user

HPC Workspace also allows you to **share** a workspace with another user whether or not they are in your PI group.
Use the `ws_share` command to share a workspace with a user.

For example:
```
ws_share share simple username2_umass_edu
```

{{< callout tip >}}
- Replace `share` with `unshare` to remove the share.
- Replace `share` with `list` to see which users the workspace is currently shared with.
{{< /callout >}}
