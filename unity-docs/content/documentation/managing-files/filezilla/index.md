---
title: FileZilla
---

# FileZilla

**FileZilla** is an open-source FTP (File Transfer Protocol) client that allows users to upload and download files to and from FTP servers. It supports various file transfer protocols, including FTP, FTPS (FTP Secure), and **SFTP (SSH File Transfer Protocol)**. When you set up FileZilla, the default remote directory will be incorrect and you'll need to set up the correct one. This page will guide you through how to [set up SFTP](#set-up-sftp-in-filezilla) and [set up a default remote directory](#set-up-default-remote-directory-in-filezilla) in FileZilla.

## Set up SFTP in FileZilla

The following steps will guide you through how to set up SFTP in FileZilla. Since SFTP relies on SSH keys for authentication, you must [set up SSH keys]({{< relref "ssh" >}}) before following these steps.

1. [Install FileZilla from FileZilla's website.](https://filezilla-project.org/download.php?show_all=1)
{{< callout note >}}
* FileZilla may ask you if you want to install McAfee, which is likely unnecessary. However, if you don't have an antivirus already, consider installing McAfee.
* The FileZilla installer executable can sometimes be marked as a virus, but it is not. Avoid download links for it that include "sponsored" in the filename to avoid this.
{{< /callout >}}
2. Open FileZilla.
3. From the top menu, click the **Site Manager** icon. The **Site Manager** window appears.

    {{< figure src="select-site-manager.png" title="FileZilla Site manager" alt="FileZilla Site manager" >}}

4. In the **Site Manager** window, click **New site**. A new site appears below **My Sites**.

    {{< figure src="select-new-site.png" title="FileZilla New Site" alt="FileZilla New Site" >}}

5. Type an appropriate file name for the new site.
6. Fill in the fields with the following information:

    * **Protocol:** `SFTP - SSH File Transfer Protocol`
    * **Host:** `{{< param login-hostname >}}`
    * **Logon Type:** `Key file`
    * **User:** your email but replace the `@` symbol and `.` with `_`. For example, netid@umass.edu is replaced with `netid_umass_edu`.
    * **Key File:** `/PATH/TO/YOUR/KEYFILE`. FileZilla can use either an `.rsa` or a `.ppk` private key, but the `Browse...` button only shows `.ppk` files. To use an `.rsa` key, you have to type in the path to the key file by hand.

    {{< figure src="site-config.png" title="Configure FileZilla for Unity" alt="Configure FileZilla for Unity" >}}

    The information for your new site saves automatically.

{{< callout tip >}}
The example in the screenshot above assumes that your key lives at `~/.ssh/KEYFILE`, but you can substitute this path.
{{< /callout >}}


## Set up default remote directory in Filezilla

**This section is *not* optional.** When you set up FileZilla, the default remote directory will be incorrect. This section will show you how to change the default remote directory to the correct directory. If you still have the Site Manager open, skip to step 4.

1. Open FileZilla.
2. From the top menu, click the **Site Manager** icon. The **Site Manager** window appears.

    {{< figure src="select-site-manager.png" title="FileZilla Site manager" alt="FileZilla Site manager" >}}

3. Click the site you created in the left panel.
4. Click the **Advanced Tab**.

5. Click into the **Default remote directory**.

6. Open Unity. Find the line that starts with `/work/your_pi_group` where `your_pi_group` is replaced with your PI group's working directory.

7. Use the command `cd /work/your_pi_group` and ensure that the directory matches with the directory in step 9.

8. Use the command `cd <your_subdirectory>`. If you do not know the name of your subdirectory, contact your PI group for more information. Alternatively, use the command `ls your_pi_group`. A list of contents is displayed, find your subdirectory in the list of contents and use the command `cd <your_subdirectory>`.

9. Use the command `pwd`. Your current working directory is displayed.

10. Copy the working directory. In FileZilla, paste the directory into **Default remote directory**.

11. To open an explorer on the Unity Filesystem and drag/drop your files across the two panels, click **Connect**. Once properly connected, FileZilla shows a successful status note, and your two local and remote site panels appear.

    {{< figure src="done.png" title="FileZilla connected to Unity" alt="FileZilla connected to Unity" >}}

12. In the local directory panel on the left, select the files you want to upload to the remote server. Once you've selected the files, drag them from the local directory panel to the remote directory panel. Alternatively, right-click on the selected files and choose **Upload** from the context menu.

{{< callout tip >}}
When uploading files, make sure that the **Remote site** panel is `/work/pi_group/your_username`.
{{< /callout >}}
