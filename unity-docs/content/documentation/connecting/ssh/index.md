---
title: SSH
icon: key
blurb: >
    How to connect to Unity via a terminal and SSH key authentication.
---

# SSH Connection
The most traditional method of connecting to Unity is using an **SSH connection**. SSH stands for "secure shell". A **shell** is the terminal, or Command Line Interface (CLI), that you type commands into. The most common shell in Linux is bash, which is most likely what you will be using in Unity.

This guide will show you how to [generate your SSH keys](#part-1-generate-ssh-keys), [store your SSH keys](#part-2-store-ssh-private-key) in the correct location, and use them to [connect to Unity](#part-3-connect-to-unity-with-ssh-connection) through either the [Command Line Interface (CLI)](#option-a-connect-to-unity-using-the-cli) or [PuTTy for Windows users](#option-b-connect-to-unity-using-putty-windows-users-only).

## Part 1: Generate SSH Keys
The authentication method we use for SSH connections is with public/private RSA
keys. You can read more about the public/private key exchange
[here](https://ssd.eff.org/en/module/deep-dive-end-end-encryption-how-do-public-key-encryption-systems-work).

There is a **public SSH key** that is stored on the server, and a **private SSH key** that you keep on your local computer. Think of them like your name and your social security number, respectively. In order to login to Unity, you need to authenticate the public key with your private key.

Use the following instructions to generate and save your public key on Unity:
1. Go to [Account Settings in Unity]({{< param account-base-url >}}panel/account.php).
2. Under SSH Keys, click the **Generate Key** icon, or **'+'**. The public key is added to our database, and the private key downloads to your computer.

{{< callout "warning" >}}
The **MacOS Safari web browser** often does not download the private key. If you
generate a key in Safari and don't get a private key download, redo the key generation
through another browser like Chrome or Firefox.
{{< /callout >}}

## Part 2: Store SSH Private Key
Once you have generated your public and private keys, move the downloaded private key into your home
directory's `.ssh` folder. The `.ssh` folder path name is:
* `C:/Users/YOUR_NAME/.ssh` in Windows
* `/home/YOUR_NAME/.ssh` in Linux
* `/Users/YOUR_NAME` in [Mac](https://www.cnet.com/tech/computing/how-to-find-your-macs-home-folder-and-add-it-to-finder/)

In the terminal, a shortcut for this directory is the `~` symbol.

1. To move the private key to the appropriate directory, use the following command:

     ```
     mv ~/Downloads/privkey.key ~/.ssh/unity-privkey.key
     ```
     This command works for any operating system since it uses the `~` symbol as the directory shortcut.

2. *Linux and Mac users*: use the following command to change the permissions on the file due to its importance to security.

     ```
     chmod 600 ~/.ssh/unity-privkey.key
     ```

3. *Recommended*: add a password to this file using the following command.

     ```
     ssh-keygen -p -f ~/.ssh/unity-privkey.key
     ```


## Part 3: Connect to Unity with SSH connection
The following instructions will show you how to connect to Unity using the SSH keys that you generated and stored. There are two different methods outlined below:

* **Option A**: CLI users can connect to Unity through the terminal, or Command Line Interface (CLI), on any operating system. This option is the recommended method.

* **Option B**: Windows users can also use PuTTy to connect to Unity.

For both methods, you will need the following information about your Unity account:
* Hostname/Address: `{{< param login-hostname >}}`
* Username: `username_school_edu`

{{< callout note >}}
Your username is in the format `<organization username>_<organization>_edu`.
View your username [here]({{< param account-base-url >}}panel/account.php).
{{< /callout >}}

### Option A: Connect to Unity using the CLI
We recommend connecting to Unity through the CLI, or terminal. Windows, Mac, and most distributions of Linux come with the OpenSSH client, which you can use to connect to Unity in your terminal. The following sections include instructions on how to connect to Unity in your terminal using the SSH connection established in [Part 1: Generate SSH keys](#part-1-generate-ssh-keys) and [Part 2: Store SSH private key](#part-2-store-ssh-private-key).

First, make sure that the OpenSSH config file exists and contains the correct information using the following steps:
1. If the file `~/.ssh/config` doesn't exist, create it.
2. Copy the following contents to your Notepad if it is not already there:
     ```
     Host unity
          HostName {{< param login-hostname >}}
          User <username>_<ORGANIZATION>_edu
          IdentityFile <PATH_TO_PRIVATE_KEY>
     ```

{{< callout "warning" >}} **Windows users using PowerShell SSH only** must add `MACs hmac-sha2-512-etm@openssh.com` to their `~/.ssh/config` file, or use the flag option in your SSH command so that it reads `ssh -m hmac-sha2-512-etm@openssh.com <rest of the cmd>`.

This is necessary due to a [known bug](https://github.com/PowerShell/Win32-OpenSSH/issues/2078) in Microsoft's SSH library which causes problems connecting to newer OpenSSH installs from Microsoft's SSH client included in PowerShell.
{{< /callout >}}

3. Be sure to replace `<username>` and `<PATH_TO_PRIVATE_KEY>`
to your specifications and save the file in a directory of your choosing, without an extension.

#### Move and rename the OpenSSH config file

You may need to move and rename the config file, which can be challenging since the user-friendly methods are less cooperative with files that don't have an extension, and the ssh config file cannot have an extension. The most reliable way to rename or move your OpenSSH config file to the correct location is to use the `mv` command, as demonstrated in the instructions below.

{{< callout note >}}
- Windows Notepad adds the `.txt` extension even if you choose the 'All Files' option when saving.
- Mac TextEdit doesn't include the option to save a file as `.txt`. To make your current file plain-text formatted,
use `⌘-⇧-T`. Then, [you can add plain-text as a 'Save as' option in the config.](https://macreports.com/how-to-create-a-text-txt-file-on-a-mac/)
{{< /callout >}}

To move your OpenSSH config file to the correct location with the `mv` command, use the following instructions:
1. Open your terminal.
2. To move and rename the Open SSH config file successfully, use the `mv` (move) command as shown in the following example:

     ```
     mv path/to/source-file path/to/destination-file
     ```
     With the source and destination file paths filled in, the command might look something like this:
     ```
     mv ~/Desktop/ssh-config.txt ~/.ssh/config
     ```
     The `mv ~/Desktop/ssh-config.txt ~/.ssh/config` example above assumes that the SSH config file is in the Desktop folder, and needs to be moved and renamed to `~/.ssh/config`.

#### Connect to Unity in the terminal

Once the OpenSSH config file contains the information for Unity and is in the correct location, you can connect to Unity through the terminal using the following instructions:
1. To begin connecting, type the command `ssh unity` into your terminal.
2. As shown in the image below, the system asks you if you are sure you want to continue connecting. To continue, type `yes`. The large Unity logo appears to show you that you have successfully connected to Unity.

{{< figure src="unity_ssh.PNG" caption="Using SSH to connect to unity" alt="Using SSH to connect to unity" >}}

### Option B: Connect to Unity using PuTTy (Windows users only)
Windows users can use [PuTTY](https://www.chiark.greenend.org.uk/~sgtatham/putty/latest.html) to connect to Unity.
[Download and install PuTTy](https://www.chiark.greenend.org.uk/~sgtatham/putty/latest.html) to get started.

{{< callout note >}}
Be sure to select the 64 bit / 32 bit download depending on your system. Most systems are
64 bit, but if you are unsure, 32 bit always works.
{{< /callout >}}

#### Connect using PuTTy
1. After PuTTy is downloaded, open PuTTY and enter the hostname `{{< param login-hostname >}}` on the main page.

{{< figure src="putty-host.png" caption="Configuring Host in PuTTY" alt="Configuring Host in PuTTY" >}}

2. On the left sidebar, click **Connection > Data**.
3. In the box next to **Auto-login username**, enter your Unity username.

{{< figure src="putty-username.png" caption="Configuring Username in PuTTY" alt="Configuring Username in PuTTY" >}}

4. On the left sidebar, click **Connection > SSH > Auth**.
5. Click **Browse...** and locate your private key location.

{{< figure src="putty-ssh-key.png" caption="Configuring SSH Key in PuTTY" alt="Configuring SSH Key in PuTTY" >}}

6. On the left side bar, click **Session** to go back to the main page.
7. Under **Saved Sessions**, type **Unity** as the profile name.
8. To save the profile you created, click **Save**. Your profile saves so you don't have to enter this information every time you want to connect to Unity.

{{< figure src="putty-save.png" caption="Saving PuTTY Settings" alt="Saving PuTTY settings" >}}

<!-- The server's ssh-ed25519 key fingerprint is:

```ssh-ed25519 255 SHA256:jC7BF7h5/RJo5Svx1v+lufdf+I/ogu5dQV2sUe+y8ek```

![PuTTY Fingerprint](res/putty_fingerprint.PNG)

If this key matches what is on your terminal, go ahead and click "Accept". -->

## Recommended: Configure an SSH agent
We recommend configuring an **SSH agent**, a program that stores your SSH keys in memory, so you don't need to enter your password every time you use those keys for SSH connection. The following instructions will guide you through how to configure an SSH agent as a [macOS user](#macos), a [Windows user using the CLI](#windows-cli), or a [Windows user using PuTTy](#windows-putty).

### MacOS
The **macOS Keychain app** acts as an SSH agent. To enable it, add the following lines to your `~/.ssh/config` file:

```config
UseKeychain yes
ForwardAgent yes
```

### Windows (CLI)
Windows provides the SSH agent as a service. You can enable the agent via the [PowerShell CLI](#option-a-powershell-cli) or the [Services application](#option-b-services-application).

{{< callout warning >}}
You need administrator access to enable the SSH agent on a windows computer.
{{< /callout >}}

#### Option A: PowerShell CLI
1. Start **PowerShell** as an administrator.
2. Run `Get-Service ssh-agent | Set-Service -StartupType Automatic -PassThru | Start-Service`.

#### Option B: Services application
1. Search for and run the **Services application**.
2. Find `OpenSSH Authentication Agent`
3. Right click and select `Properties`.
4. Change the `Startup type` to `Automatic`.
5. Press `Start`.

### Verify that the SSH agent is working
In a macOS Terminal or a Windows PowerShell, use these commands to make sure the agent is running. Adjust the name of the key to match the name you used in [Part 2](#part-2-store-ssh-private-key):

```shell
ssh-add ~/.ssh/id_rsa
ssh-add -l
```

If it says `Error connecting to agent`, then it has not started properly.


### Windows (PuTTY)
PuTTY uses its own Putty Agent and is not compatible with the `ssh-agent` service.
1. To launch the **Putty Agent** (`pageant.exe`) and load the key, double-click on the `.ppk` key file.
2. On the configuration screen, go to **Connection** > **SSH** > **Auth**.
3. Select **Attempt authentication using Pageant** and **Allow agent forwarding** to enable those options.
3. Back on the **Sessions** screen, select **Unity**.
4. Click **Save**.

To start the Putty Agent at startup:
1. Press `Windows+R` to bring up the **Run** dialog.
2. Type `shell:startup` and press `Enter`.
3. While holding `Ctrl+Shift`, drag your `.ppk` key file into the **Startup** folder. It should say "Create link..." in the tooltip.

{{<callout "note">}}
If your SSH key is secured with a passphrase, a password prompt will appear at login.
{{</callout>}}
