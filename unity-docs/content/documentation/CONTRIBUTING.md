---
Title: Contributing to these docs
weight: 1000
menu:
    - docs
blurb: >
    Have a suggestion on how to improve these docs?
icon: key
---

# How to contribute to the Unity documentation

If you find an issue with the documentation or would like something to be added or improved, feel free to [open a new issue](#open-an-issue) and follow [these general guidelines](#general-guidelines-for-opening-an-issue).

If you are contributing to the documentation yourself and have the correct permissions to do so, use the following sections to guide yourself through the GitLab workflow.

## GitLab workflow for Unity documentation

When making a change to the documentation, you can use the following GitLab workflow:

1. [Open an issue](#open-an-issue)
2. [Install and configure Git](#install-and-configure-git)
3. [Set up SSH keys](#set-up-ssh-keys)
4. [Clone the `unity-website` repository](#clone-the-unity-website-repository)
5. [Create a branch and merge request](#create-a-branch-and-merge-request)
6. [Make changes and push them to GitLab](#make-changes-and-push-them-to-gitlab)
7. [Wait for review](#wait-for-review)

If you are unsure about how to complete any of these steps, the following sections will thoroughly guide you through these processes using detailed step-by-steps.

### Open an issue

To keep an organized workflow, you should open a new issue in the GitLab repository that describes what changes you want to make to the Unity documentation and why. This is the main way that we keep track of what changes to make to the documentation.

To open an issue in GitLab, go to [Issues](https://gitlab.rc.umass.edu/unity/education/documentation/unity-website/-/issues) and select **New issue**.

#### General guidelines for opening an issue

-   Add a clear and concise title.
-   Add a detailed description of the issue or idea for improvement. Do not worry about the description being too lengthy; the more detail, the better.
-   Include links to helpful resources about the technical information you would like to be documented.
-   Write a quick outline of what the potential document should include in the form of a bulleted list in the description box. This will ensure that no important information will be left out.
-   If the documentation idea is based on user questions and difficulties, include that information or link to the help-desk thread that it came from.
-   If you don't plan to work on this issue yourself, feel free to assign the issue to **@lsaloio** under **Assignee**, especially if it is a high-priority issue.
-   If the issue is strictly documentation-based, feel free to label it with the **documentation** tag under **Labels**.

If you don't plan on working on this issue yourself, you can stop here and someone will take over the issue. If you _are_ working on this issue yourself and are unsure of how to proceed, continue reading the following sections.

### Install and configure Git

If you don't already have Git installed on your computer, you need to install and configure Git in order to interact with GitLab and make changes to the documentation.

1. In your command window, check if you already have Git installed on your computer using the command `git --version`. If you don't have Git installed, it indicates that `git` is not recognized as an internal or external command,
   operable program or batch file.

2. To install Git, use one of the following methods depending on your operating system:

    - **Windows**: [Download the Git installer](https://git-scm.com/download/win). To open a command window, go to the **Programs directory > Git folder > Git Bash.vbs**.
    - **Mac**: [Download the Git installer](https://git-scm.com/download/mac). To open a command window, search for the Terminal.
    - **Linux**: In the command line, enter `sudo apt-get install git` or the equivalent in your distribution's package manager. To verify installation was successful, enter `which git`.

3. To configure Git with your [Unity GitLab account](https://gitlab.rc.umass.edu), enter the following two commands in your command window:

    ```
    git config --global user.name "USER_NAME"
    git config --global user.email "EMAIL_ADDRESS"
    ```

4. To confirm the configuration, enter the following command in your command window:
    ```
    git config --global --list
    ```
    If the configuration was successful, it lists your username and email address.

### Set up SSH keys

If you want to clone the Unity repositories using SSH (recommended method), you need to generate an SSH key pair, and then add it to your GitLab account. Note that if you clone with HTTPS, you don't need to set up SSH keys, but the HTTPS method requires you to use a [personal access token](https://docs.gitlab.com/ee/user/profile/personal_access_tokens.html) for authentication.

The following instructions will guide you through generating an SSH key pair and adding it to your GitLab account:

1. In your command window, generate your SSH keys:

    ```
    ssh-keygen -t ed25519 -C "OPTIONAL_COMMENT"
    ```

    Some situations may require you to generate [a different key type](https://docs.gitlab.com/ee/user/ssh.html#supported-ssh-key-types), in which case you would replace `ed25519` with that key type, but that is likely not required in this case.

    Output similar to the following is displayed:

    ```
    Generating public/private ed25519 key pair.
    Enter file in which to save the key (/home/user/.ssh/id_ed25519):
    ```

2. To accept the suggested filename and directory, press **Enter**. If you need to save the keys in a different location, type the path to that file and press **Enter**.
3. To bypass using a passphrase, press **Enter**. If you want to use a password, type the password and press **Enter**. A public and private key are generated.
4. To copy the contents of your key file so that you can add it to your GitLab account, use one of the following commands, depending on your operating system:
    - Git Bash on Windows: `cat ~/.ssh/id_ed25519.pub | clip`
    - MacOS: `tr -d '\n' < ~/.ssh/id_ed25519.pub | pbcopy`
    - Linux (requires the `xclip` package): `xclip -sel clip < ~/.ssh/id_ed25519.pub`
5. Sign into GitLab and select your profile avatar.
6. Select **Edit profile**.
7. On the left sidebar, select **SSH keys**.
8. Select **Add new key**.
9. In the **Key** box, paste the contents of your key file.
10. Fill in any other required fields.
11. Select **Add new key**.

### Clone the `unity-website` repository

To contribute to the documentation and edit locally, you need to clone the [`unity-website` repository](https://gitlab.rc.umass.edu/unity/education/documentation/unity-website). To do so, use the following steps:

1. Go to the [Unity Documentation Website repository](https://gitlab.rc.umass.edu/unity/education/documentation/unity-website) GitLab page.
2. Click the blue **Code** button. A drop-down menu appears with the following options:

    - **Clone with SSH**: This option allows you to use public key authentication. If you haven't done so already, you must set up [SSH keys for GitLab](https://docs.gitlab.com/ee/user/ssh.html) for this method.

    - **Clone with HTTPS**: With this option, you must authenticate with a [personal access token](https://docs.gitlab.com/ee/user/profile/personal_access_tokens.html) since our GitLab setup enables two-factor authentication. Follow the GitLab instructions on [how to create a personal access token](https://docs.gitlab.com/ee/user/profile/personal_access_tokens.html#create-a-personal-access-token) before cloning with HTTPs.

    Both methods allow you to work on the repository locally and interact with the remote repository in the same way.

3. Copy the URL displayed next to whichever cloning method you choose.
4. In your command window, type the command `git clone <URL>`. The following is an example of what this command looks like with the SSH cloning method:

    ```
    git clone git@gitlab.rc.umass.edu:unity/education/documentation/unity-website.git
    ```

    Output similar to the following is displayed:

    ```
    Cloning into 'unity-website'...
    remote: Enumerating objects: 2319, done.
    remote: Counting objects: 100% (528/528), done.
    remote: Compressing objects: 100% (355/355), done.
    remote: Total 2319 (delta 284), reused 286 (delta 158), pack-reused 1791
    Receiving objects: 100% (2319/2319), 8.19 MiB | 570.00 KiB/s, done.
    Resolving deltas: 100% (1112/1112), done.
    ```

5. To build the development website so that you can preview your changes to the documentation website, see the [`unity-website` README](https://gitlab.rc.umass.edu/unity/education/documentation/unity-website#building-the-development-website) and follow the instructions there.

### Create a branch and merge request

In order to work on your own version of the documentation without making any official changes to the website, you need to create a **branch** to work on your changes and a **merge request** to get those changes merged.

In Git, a **branch** is like your own duplicate version of the main work (the documentation files in this case) where you can make changes as you please. Those changes are not implemented into the main version or made public until your merge request gets it reviewed, approved, and merged. A **merge request** is a way of requesting that your work gets merged into the main documentation website. Collaborators can add comments to your merge request, review the changes that you want to merge, approve them, and eventually merge them into the website.

Note that you need to have a **Developer role** in GitLab in order to create a branch and merge request. If you don't have those permissions for our repository, you can simply [open an issue](#open-an-issue) instead, assuming you have at least Guest permissions.

The following steps will guide you through the simplest and most efficient way to create a branch and merge request.

1. In GitLab, go to **[Issues](https://gitlab.rc.umass.edu/unity/education/documentation/unity-website/-/issues)** and select the issue that you are creating a branch for.
2. In the issue page that opens, select the downwards arrow next to the **Create merge request** button.
3. In the drop-down menu that appears, name your branch or use the default name. It is common practice to name a branch based on the issue number and what types of changes you plan to make on that branch. For example, if you are on issue #77 and plan to edit documentation on batch jobs, you might name the branch `77-edit-batch-jobs-doc`.
4. Click **Create merge request**.

You can also create a branch in the command line, or wait to create a merge request until you are done working on your branch. For those methods, see GitLab's documentation on [branches](https://docs.gitlab.com/ee/user/project/repository/branches/) and [merge requests](https://docs.gitlab.com/ee/user/project/merge_requests/creating_merge_requests.html).

### Make changes and push them to GitLab

To make changes to the documentation locally and on the branch that you created, you need to make sure you are working on the correct directory and branch. To actually edit the text, we recommend downloading [Visual Studio Code (VSCode)](https://code.visualstudio.com/download) if you do not have it already.

1. If you haven't done so already, move to the correct directory and switch to the branch that you need to make changes on:

    ```
    cd PATH/TO/unity-website
    git checkout BRANCH_NAME
    ```

    Be sure to replace `PATH/TO/unity-website` with the correct path to your local `unity-website` repository and `BRANCH_NAME` with the actual name of your branch.

2. In VSCode or the text editor of your choice, navigate to the `unity-website` repository and open the files that you want to edit.
3. Make changes and save them as you go.

#### Push changes in the command line

1. Once you are done with a batch of changes and have saved them, open your command line and commit the changes to your branch:

    ```
    git add FILE_NAME
    git commit -m "Update instructions on batch jobs"
    ```

    Be sure to replace `FILE_NAME` with the name of the file that you made changes to and `"Update instructions on batch jobs"` with a message that reflects the changes you made.

2. Push your changes to the remote repository:
    ```
    git push
    ```

#### Push changes in VSCode

1. In VSCode, when you save your changes, a number appears on the side menu next to the **Source Control** panel icon. To open that panel, click the icon.
2. Under **Changes**, the files that you have made changes to are listed. To stage those changes, click the **"+"** icon next to each file.
3. To commit and push your changes, add a commit message in the **Message** field.
4. Click the downwards arrow next to **Commit**. A dropdown menu appears.
5. To commit and push your changes to the remote GitLab Unity website repository, click **Commit & Push**. Or, if you want to commit, push, and sync your changes so that your local branch is caught up with any changes made remotely, click **Commit & Sync**.

### Wait for review

Once your work is ready for review, go to your merge request and add a user in the side menu under **Reviewer**. For a review of technical details, the reviewer depends on the content. For a review of language and formatting, add @lsaloio as the reviewer.

After you create your merge request and add a reviewer, you then need to wait for the merge request to be reviewed. Once the reviewer submits their review, you should take a look at any suggestions and edit accordingly (unless they are editing the document directly).

Once the merge request is ready, it will be approved and merged into the documentation website!

#### Merge conflicts

Sometimes there are **merge conflicts** that need to be resolved before your work can be merged into the website. Merge conflicts can happen when someone commits changes to a file that conflict with the changes you or someone else have committed to the file. Before merging, you need to resolve these conflicts so that Git knows which changes are the right ones to merge into the final version. A simple way to resolve merge conflicts is in [VSCode using the Merge Editor](https://code.visualstudio.com/docs/sourcecontrol/overview#_merge-conflicts).

#### What if you are asked to review a merge request?

If someone requests a review from you on a merge request, the simplest way to review the content is via the GitLab interface. The following steps will guide you through how to do this:

1. In the GitLab Unity Website repository, go to **Merge Requests** and find the merge request that you need to review.
2. In the merge request, go to **Changes**.
3. To add a comment on a line, hover over a line and click the **comment icon** that appears next to the line. To select and comment on **multiple lines**, click and hold the **comment icon**, and drag it over the lines you want to select.
4. In the **Comment box**, type your comment.
5. If you want to make a suggestion instead, click the **Insert Suggestion** icon that is next to the **Preview** button. The lines that you selected appear in the **Comment box** for you to make your suggested changes to. This is a convenient way for the writer to smoothly incorporate your changes.
6. Once you are done with the first comment or suggestion, click **Start a review**. By starting a review, you can make all the comments and suggestions you want and the merge request writer won't see them until you submit your review at the end.
7. To submit your review, click **Finish review** > **Submit review**.
