---
title: Common Terms
weight: 20
blurb: >
    Definitions for common terms used in the Unity documentation.
---
# Common Terms
The following are definitions of common terms used in this documentation, including general high performance computing (HPC) terms, software-specific terms, and linux-specific terms.

## General HPC Terms

**High Performance Computer Cluster (HPC Cluster)**: A system made up of many smaller computers that behaves like one large computer. HPC allows a user to utilize the power of many computers simultaneously.

**CPU (Central Processing Unit)**: Often referred to as the “brain of the computer.” It is the main processor in a computer that performs most of the computational tasks required by software programs. Handles the instructions and processing necessary for a computer to operate

* **CPU Cores**: The individual processing units within a CPU responsible for executing instructions.

{{< callout tip >}} CPUs are typically multi-core, which means they have multiple cores within a single processor, allowing for simultaneous execution of tasks, known as **parallel processing**.{{< /callout >}}

**GPU (Graphics Processing Unit)**: A specialized processor designed to run computational tasks in parallel at a larger scale than traditional CPU parallel workload. They are designed with many, often thousands of smaller cores, whereas GPU cores are typically associated with having a few powerful cores. GPUs are widely used for rendering graphics and in fields like AI, ML, and scientific simulations because they can perform large-scale, parallel computations efficiently. See [available GPU resources]({{< relref "documentation/tools/gpus">}}) on Unity.

* **GPU Cores**: The individual, specialized processing units within a GPU. Typically responsible for handling computation tasks such as rendering graphics or AI.

{{< callout note >}} GPUs’ large-scale parallel workload comes at a tradeoff with slower communication times. It is also important to note that using one or more GPUs does not guarantee that code will run faster, although many popular software packages have been modified to incorporate GPUs for better performance.{{< /callout >}}

**Scheduler**: Distributor of resources (such as CPU cores, memory, etc.). If you request 2 CPU cores for your **job**, the scheduler will reserve those cores and connect you to them. The Scheduler for the Unity cluster is called [Slurm]({{< relref jobs >}}).

{{< callout note >}} In a **multi-threaded computer**, each core can handle multiple tasks simultaneously by dividing them into smaller units called **threads**. This allows the operating system to more efficiently distribute resources and manage tasks, much like a job scheduler.{{< /callout >}}

**Job**: The task that you request the cluster to execute, including the resources that need to be allocated for that task.

**Node**: A single computer within an **HPC cluster**, which consists of its own CPUs, memory, and sometimes specialized hardware like GPUs. Nodes work together as part of the cluster ro perform the large-scale computations users need. See the [list of nodes]({{< relref "documentation/cluster_specs/nodes" >}}) for details about the nodes available in the Unity cluster. There are different types of nodes, each with a specific role:

* **Login Node**: When you first [log in to Unity via SSH]({{< relref "documentation/connecting/ssh" >}}), you are connecting to a login node. Login nodes are designed for small tasks (like editing files, managing data, and submitting jobs) because they have strict CPU and memory limits to prevent users from running large tasks that could slow the login node responsiveness for all users. Sometimes referred to as **Head Nodes** in other HPC clusters.
* **Compute Node**: These are nodes designated for running your large, resource-intensive tasks. Access to compute nodes is managed by [the Slurm job scheduler]({{< relref jobs >}}), which allocates resources based on your job’s requirements

**Partition**: A group of nodes. Partitions are used to organize and manage nodes based on their hardware capabilities, intended use, or access policies. Some partitions might be dedicated to GPU nodes, others to high-memory nodes, or specific research groups. When submitting a job, you can specify a partition to ensure your job runs on nodes with the appropriate resources for your needs. See the [Partition list]({{< relref "partitions" >}}).

**Queue**: Often used interchangeably with **partition**.

**Principal Investigator (PI)**: The individual responsible for a research grant. All users on Unity must be tied to a PI. [Learn more about PI's and other research roles and responsibilities](https://www.umass.edu/research/pre-award/roles-responsibilities-research).

## Software Terms

**Package**: A collection of software bundled together for installation. Includes binaries (executable files), libraries (collections of pre-written code that can be used by programs), and other necessary files. Once installed, packages are typically placed in a specific directory and cannot be moved around the filesystem.

**Binary**: An executable file. Unlike source code (which is human-readable and must be compiled), binaries contain code formatted to be machine-readable and ready to be directly executed by a computer’s CPU. Examples include applications, programs, and system utilities.

**Library**: Collections of pre-written code that can be used by programs. These functions handle common tasks such as reading files, performing mathematical operations, or interacting with hardware, which allows developers to avoid having to write that code from scratch. Allows distribution of C code about the filesystem. [Learn more about libraries](https://2066.medium.com/what-is-a-c-library-d5501c4a56fc).

**Module**: Script that modifies your **environment** to include a package. Provides a way for users to load, unload, or switch between different software packages or versions without conflict, ensuring that the right software configuration is available for a specific task or job. See [environment modules]({{< relref "documentation/software/modules" >}}).

**Environment**: Set of environment variables that define the configuration of your **current shell session**, determining how programs run and interact with your system. See [environment modules]({{< relref "documentation/software/modules" >}}).

**Conda environment**: Set of installed packages created by Conda, a package and environment management system. Commonly used in Python programming to manage dependencies, libraries, and tools needed for specific projects without interfering with other projects of system-wide configurations. Activating a conda environment modifies your **shell** environment to include these packages. [Learn more about conda environments]({{< relref "documentation/software/conda" >}}).

**Compiler**: A compiler takes source code and translates it into binaries and libraries that can be read and executed by a computer. Source code alone cannot be run by an operating system, it must be compiled into machine code or interpreted by an interpreter. For example: C is compiled, while Python is interpreted (sort of). [Learn more about compilers](https://www.freecodecamp.org/news/what-is-a-compiler-in-c/) or [compiled vs interpreted languages](https://www.freecodecamp.org/news/compiled-versus-interpreted-languages/).

## Linux Terms

**Interface**: The connection between you and your program. The interface allows users to interact with a program or system, defining how inputs (like a keyboard, mouse, or touch) are provided and how the program responds (through visual elements like windows or buttons, or by text-based outputs)

* **Graphical User Interface (GUI)**: The general term for visual components of a program that allow users to interact with it through graphical elements like buttons, text boxes, icons, menus, and windows. Anything that uses the mouse or touchpad, or sometimes with keyboard shortcuts.
* **Command Line Interface (CLI)**: Type of interface where users interact with the program by typing text-based commands into a terminal or console. The program then processes the command and outputs results in text form. Uses only the keyboard.

**Console**: Often used interchangeably with **terminal**. Text-based interface window where you enter CLI commands.

**Terminal**: Often used interchangeably with **console**. Text-based interface window where you enter CLI commands. This might be the Command Prompt (`cmd`) or the [Windows Terminal App](https://apps.microsoft.com/store/detail/windows-terminal/9N0DX20HK701) (recommended). In Mac, it's just called **Terminal**. The terminal runs the shell.

{{< callout tip >}} You can think of the terminal as just the borders of the window where you type commands. You can think of the shell as what's inside those borders.{{< /callout >}}

**Shell**: The shell is a program that provides a user interface to interact with the operating system through the CLI. It interprets your commands and starts processes on the operating system. The shell depends on the terminal to take input from the user and to display output to the user. The shell stores your environment and allows you to write shell scripts. [Learn more about shells](https://www.educba.com/what-is-shell-in-linux/).

**SSH**: “Secure Shell.” The protocol used to securely connect to a remote computer or server over a network, allowing users to perform various tasks on the remote system while ensuring the connection is encrypted and secure. The Shell is the Terminal or Command Line Interface.

## Linux Filesystem Terms ##
**Symlink**: “Symbolic link”. You can create a symlink as a shortcut or reference to a file/directory in the filesystem. For example, if you create a symlink `ln -s /path/to/original/file.txt /shortcut/file.txt`, now, accessing `/shortcut/file.txt` will direct you to `/path/to/original/file.txt`.

**Directory**: Folder that contains files and/or other subdirectories, such as your home directory in Unity (`/home/user`)

* **Current Working Directory (CWD)**: The directory that is currently open in your shell or program. When you’re navigating the filesystem via the command line, the CWD represents where you are. In a **path**, the CWD can be referenced with the `.` symbol. For example, if you're in your home directory in Unity, `/home/user`, `.` refers to `/home/user`.

* **Parent Directory**: The parent is the directory that is one level above your current directory (your CWD). Every directory has a parent, except the **root**. In a **path**, the parent directory can be referenced with the `..` symbol. For example, if your CWD is `/home/user`, the parent directory would be `/home`.

**Path**: A path is a sequence of directories separated by `/` slashes, which leads to a file or directory. If the filesystem were a city, a path would be the directions to your apartment. It tells you how to reach a specific file or folder in the filesystem, starting from a particular point. For example, a path to the file.txt folder might look like this: `/home/work/file.txt`

* **Relative Path**: A path that does not start from a known landmark but from your current location `CWD`. For example, `./.conda/envs/testName/bin/activate` is a relative path. `./` means that you’re starting from your current location (CWD).
* **Absolute Path**: A path that starts from a known landmark, the **root** directory, or `/`. It specifies the full path to a file or directory, such as `/home/user/.conda/envs/testName/bin/activate`.

**Root**: The topmost directory in the filesystem hierarchy. The filesystem can be visualized like a tree (not the plant, the [data structure](https://en.wikipedia.org/wiki/Tree_%28abstract_data_type%29). The root of the tree is the directory from which all others descend from.

