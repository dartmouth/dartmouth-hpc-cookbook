---
Title: Git Guide
weight: 50
blurb: >
    An introductory quick guide to version control and git.
---

# Git Guide

[Git](https://git-scm.com/) is a version control tool to help you manage and track changes to files. It is especially useful for coding projects, but also works with files such as documents or images.

Users often use Git in combination with [GitHub](https://github.com/) or [GitLab](https://about.gitlab.com/), which are online places to store your Git projects so that others can see and collaborate on your project.

## Key terms and concepts
- **Repository (Repo)**: This is where your project lives. It is a large folder that Git tracks and every version of your work is saved in.
- **Commit**: A snapshot of your project at a specific point in time. Whenever you finish making changes, you commit your work to save your progress.
- **Branch**: A separate line or version of your work. For example, if you’re testing out an idea – you can create a branch, work on it without affecting the main project, and later merge the changes into the main project if they work.
- **Push & Pull**:
    - **Push**: Upload your work to a shared place, like GitLab, so others can see.
    - **Pull**: Download other people’s changes to your local project.
- **Merge**: Integrate or combine changes from different branches into one.

## Why use version control?
Version control tools like Git are useful for managing projects, generally or in research. They enable you to:
- **Track Changes**: Maintain a complete history of your project, revert to previous versions, and see who made specific changes.
- **Collaborate Seamlessly**: Allow multiple contributors to work on the same project without conflicts, using branching to merge changes smoothly.
- **Experiment Safely**: Test new features or fixes in isolated branches without affecting the main project, and undo mistakes by returning to earlier versions.

In research, Git is essential for reproducibility and efficiency. It tracks every step of your project, saves past versions for easy rollback, encourages clear documentation through commit messages, and streamlines collaboration. Additionally, it offers automated backups on platforms like GitHub or GitLab and efficient troubleshooting to identify and fix issues quickly.

## Install and configure Git
If you don't already have Git installed on your computer, you need to install it and then configure Git to interact with your GitHub or GitLab account.

1. In your command window, check if you already have Git installed on your computer using the command `git --version`. If you don't have Git installed, it indicates that `git` is not recognized as an internal or external command, operable program, or batch file.

2. To install Git, use one of the following methods depending on your operating system:
   - **Windows**: [Download the Git installer](https://git-scm.com/download/win). To open a command window, go to the **Programs directory > Git folder > Git Bash.vbs**.
   - **Mac**: [Download the Git installer](https://git-scm.com/download/mac). To open a command window, search for the Terminal.
   - **Linux**: In the command line, enter `sudo apt-get install git` or the equivalent in your distribution's package manager. To verify installation was successful, enter `which git`.

3. To configure Git with your GitLab or GitHub account, enter the following two commands in your command window:
   ```bash
   git config --global user.name "USER_NAME"
   git config --global user.email "EMAIL_ADDRESS"
   ```

{{< callout note "Per-project (local)" >}} To configure git individually for each local project, use the following commands:
```bash
git config user.name "USER_NAME"
git config --global user.email "EMAIL_ADDRESS"
```
{{< /callout >}}

4. **Optional:** Set your preferred text editor for Git (e.g. VS Code, Nano, Vim):
    ```bash
    git config --global core.editor “EDITOR NAME”
    ```

5. To confirm the configuration and list current settings, enter the following command in your command window:
   ```bash
   git config --list
   ```
    If the configuration was successful, it displays the correct Git settings, such as your username and email.

## Create a new Git repository
1. Go to your project folder:
    ```bash
    cd /PATH/TO/PROJECT
    ```

2. Initialize git:
    ```bash
    git init
    ```
    Git creates a hidden `.git` folder where it stores its data.

## Clone an existing Git repository
You might want to clone (create a copy of) a project already hosted online (e.g, GitLab or GitHub) so you can collaborate on it with others. To clone an existing repository, run:
```bash
git clone INSERT_REPOSITORY_URL
```
## Start using Git
1. Create a file and use `git status` to check on the status of your working directory (the folder you are working on):
    ```bash
    touch FILE_NAME
    On branch master

    No commits yet

    Untracked files:
    (use "git add <file>..." to include in what will be committed)
            FILE_NAME

    nothing added to commit but untracked files present (use "git add" to track)
    ```

2. To add files to the staging area (prepare them for commit), run:
    ```bash
    git add FILE_NAME
    ```

    Now, if you run `git status`, it displays the staged file:
    ```bash
    git add FILE_NAME
    git status
    On branch master

    No commits yet

    Changes to be committed:
    (use “git rm --cached <file>...” to unstage)
            new file:         FILE_NAME
    ```
{{< callout tip >}} To add all files at once, use `git add .`
{{< /callout >}}

3. To commit your change (save a snapshot of changes), run:
    ```bash
    git commit -m “Initial commit”
    ```

{{< callout tip "Commit messages" >}} Your commit message is what goes in between the quotation marks. The message “initial commit” makes sense here because the example is showing the first commit of your project (commonly called the initial commit). However, for further commits in your project, you should write a message that briefly describes the change you are committing. These should be atomic commits (a single, indivisible set of changes) with a commit message that is short, unambiguous, and in the active voice.

**Example (Recommended):**
`git commit -m “Add defer_batch to handle large job influx”`

**Example (Not recommended):**
`git commit -m “Added feature …”`

[Learn more](https://reflectoring.io/meaningful-commit-messages/) about commit messages or [see an example](https://git-scm.com/book/en/v2/Customizing-Git-Git-Configuration) commit template. Other example commit structures:
- [Conventional commits](https://www.conventionalcommits.org/en/v1.0.0/)
- [Angular convention](https://github.com/angular/angular/blob/main/CONTRIBUTING.md#commit)
{{< /callout >}}

## Learn `git stash`
If you try to switch to a different branch without committing your changes, Git will warn you that there are uncommitted changes, especially if they conflict with the branch you want to switch to. In some cases, Git won't let you switch unless you either commit, discard, or stash your changes.

However, `Git stash` is a command that allows you to temporarily save your changes without committing them. It clears your working directory while safely storing your uncommitted changes in a "stash."

If you don’t want to lose your changes but aren’t ready to commit them officially yet, use `git stash` to “stash” your changes for the time being:

```bash
git stash
```

To see your most recent stashed changes, use the command `git stash list`:
```bash
git stash list
```

To see a summary of changes in your most recent stash:
```bash
git stash show
```

To see a detailed explanation of what was added, removed, or modified:
```
git stash show -p
```

To apply the most recent stashed changes:
```bash
git stash pop
```
## Other Git commands
The following are some other commonly used Git commands.

### Move and/or rename existing files
```bash
git mv FILENAME NEW_FILENAME_OR_LOCATION
```

### Change or correct an existing commit (content and/or a commit message)
```bash
git commit --amend -m “commit message”
```
This command commits any staged changes, and replaces the most recent commit message with the one entered.

### Remove existing file
```bash
git rm FILENAME
```
### Revert existing commit
To undo changes introduced by the most recent commit (HEAD), you can create a new commit that reverses those changes:
```bash
git revert HEAD -m “Revert the last commit”
```
## Useful resources
- [A simple quick guide for Git](https://up1.github.io/git-guide/index.html). Useful for referencing commands and what to use/when; suitable for beginners.
- [A one-page Git cheat sheet](https://up1.github.io/git-guide/files/git_cheat_sheet.pdf). Clear and to-the-point; suitable for more experienced beginners.
