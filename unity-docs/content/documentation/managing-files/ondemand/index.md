---
title: Unity OnDemand File Browser
---

# Unity OnDemand File Browser

[Unity OnDemand]({{< param ood-url >}}) provides a simple and convenient way to manage your Unity files with a graphical user interface (GUI) rather than the command line interface (CLI), making it a great option for less experienced CLI users.  The OnDemand interface can replace your terminal, FTP client, and JupyterHub.

Unity OnDemand allows you to:
* Navigate the Unity filesystem
* Copy, move, create, and delete files and directories (folders)
* Upload and download files from/to your local machine
* Edit text files
* View images
* Open a given directory in an interactive session on a compute node

## Part 1: Open the Unity OnDemand File Explorer

Unity OnDemand allows you to **sign in on your browser using your organization's identity provider**, so you don't need to install SSH/FileZilla, configure SSH, or set up any public and private keys. To open the Unity OnDemand file explorer, follow the steps outlined below:

1. Login to [Unity OnDemand]({{< param ood-url >}}) with your 
organization's identity provider.
2. From the top menu, click `Files`. A dropdown menu opens.
3. Click `Home Directory`

{{< figure src="ood-file-explorer-button.png" title="OnDemand File Explorer menu" alt="OnDemand File Explorer menu" >}}

Your Unity file explorer Home Directory appears, which displays your files and directories:

{{< figure src="ood-file-explorer.png" title="OnDemand File Explorer" alt="OnDemand File Explorer" >}}

## Part 2: Manage and navigate files
To interact with the Unity filesystem, click on the directory, image, or file name that you want to open or edit. For example:
* To **open a directory**, click on its name.
* To **go back to a parent directory**, click on different parts of your current working directory to go back. For example, with 
`/home/simonleary_umass_edu` as my current working directory, I can go back to `/home` by clicking on it.
* To **edit a text file**, click on its name.
* To **view an image**, click on its name.

The Unity OnDemand interface also includes a taskbar at the top of the page with options such as:
* `Open in Terminal` to open your current working directory in an interactive session.
* `Refresh` to refresh you current working directory.
* `New File` to add a new file to your current working directory.
* `New Directory` to add a new directory.
* `Upload` and `Download` to upload or download files from/to your local machine.
* `Copy/Move` to copy or move files to another location.
* `Delete` to delete a file or directory.

Click on any one of the taskbar options to complete that action.



