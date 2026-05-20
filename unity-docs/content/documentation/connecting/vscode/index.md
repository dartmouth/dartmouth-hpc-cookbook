---
title: Connecting to Desktop VS Code
weight: 20
---

#  Connecting Desktop VS Code
If you prefer to use [Visual Studio Code](https://code.visualstudio.com/) (VS Code) as your editor, you can connect VS Code to Unity and run your Jupyter Notebooks through VS Code. In order to do so, you need to establish an SSH connection to Unity using an SSH client first. If you haven't already, follow the steps in the [SSH Connection](/documentation/connecting/ssh/) guide.

Once you have established an SSH connection to Unity, you need to [configure SSH](#configure-ssh) and [start an interactive job](#start-an-interactive-job). Then, you can [connect the VS Code Desktop App to Unity](#connect-vs-code). Once connected, you can also [install additional VS Code extensions remotely](#install-additional-vs-code-extensions-remotely). The following sections will guide you through these processes.

## Configure SSH
To connect VS Code to Unity you need to install VS Code's [Remote-SSH](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-ssh) extension and configure your SSH client to hop through the login node to a compute node.

To configure your SSH client, add the following lines to your ` ~/.ssh/config` file:

```
Host unity
Hostname {{< param login-hostname >}}
User unity_user_name
ForwardAgent yes
IdentityFile ~/.ssh/id_privkey.key

Host *.unity.rc.umass.edu
User unity_user_name
IdentityFile ~/.ssh/id_privkey.key
ProxyJump unity
```

{{< callout note >}}
Be sure to change:
- `unity_user_name` to your own Unity username
- `~/.ssh/id_privkey.key` to the name of the key you are using (which should also be in `~/.ssh`)
{{< /callout >}}

{{< callout "warning" >}} **Windows users using PowerShell SSH only** must add `MACs hmac-sha2-512-etm@openssh.com` to their `~/.ssh/config` file, or use the flag option in your SSH command so that it reads `ssh -m hmac-sha2-512-etm@openssh.com <rest of the cmd>`.

This is necessary due to a [known bug](https://github.com/PowerShell/Win32-OpenSSH/issues/2078) in Microsoft's SSH library which causes problems connecting to newer OpenSSH installs from Microsoft's SSH client included in PowerShell.
{{< /callout >}}


## Start an interactive job
After configuring your SSH client, you must start an interactive job with the resources you need. Make note of the hostname since you will need it for the next step.

For example, for CPU only (note `ood-shared` is designed for small requests of up to 8 cores, and 16GB):
```shell
$ salloc --gpus=1 --partition=ood-shared,cpu -q short -t 4:00:00
salloc: Granted job allocation ...
salloc: Waiting for resource configuration
salloc: Nodes cpu001 are ready for job
$ hostname -f
cpu001.unity.rc.umass.edu
```
In the example above, the hostname is `cpu001.unity.rc.umass.edu`.

Or, if you need a GPU
```shell
$ salloc --gpus=1 --partition=gpu-preempt -q short -t 4:00:00
salloc: Granted job allocation ...
salloc: Waiting for resource configuration
salloc: Nodes gpu001 are ready for job
$ hostname -f
gpu001.unity.rc.umass.edu
```
In the example above, the hostname is `gpu001.unity.rc.umass.edu`.

{{< callout caution >}}
The editor will lose its connection to Unity when your job ends
{{< /callout  >}}

## Connect VS Code
Once you have started your interactive job, you can connect VS Code to Unity.

To do so, select **Remote-SSH: Connect to host** from the command palette and type in the hostname from above (e.g., `cpu001.unity.rc.umass.edu`).

{{< callout note >}}
You must have a job on the node for this to work.
{{< /callout >}}

{{< callout note >}}
 If you're connecting to Unity and experience issues with disconnections or lockfiles (due to the NFS-based home directories), you may want to enable the Remote SSH: Lockfiles in Tmp setting. This option stores lockfiles in /tmp instead of the server’s install folder, which can help resolve both disconnection and locking issues.
 {{< /callout >}}

## Install additional VS Code extensions remotely
For some extensions to work properly, you must install them on the server even if you already have them installed locally.

1. In VS Code, choose **View** and then **Extensions** from the menu. The Extensions panel appears on the left.

2. Scroll through your extensions and click buttons that say **Install on SSH: ...**

3. To run Jupyter Notebooks, install the extensions [Jupyter](https://marketplace.visualstudio.com/items?itemName=ms-toolsai.jupyter), [Jupyter Renderers](https://marketplace.visualstudio.com/items?itemName=ms-toolsai.jupyter-renderers), and [Python](https://marketplace.visualstudio.com/items?itemName=ms-python.python) on SSH.
