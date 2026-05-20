---
title: Conda
---

# Conda environments #

The **conda package manager** allows users to easily install software without admin privileges. **Conda environments** can be created for any software set. Similarly to modules, they can be enabled and disabled dynamically.

A conda environment can be easily confused with [the environment of your login shell]({{< relref "modules" >}}). However, the package tied to an environment module is compiled by hand by the Unity admins, whereas conda packages can be installed by any user with a simple command. A conda environment can contain any number of packages, whereas a module usually only contains one. Despite their differences, modules and conda environments can be used together efficiently.

Unity uses **Miniforge**, as opposed to Anaconda. From a user's perspective, they can be considered the same.

{{< callout warning >}}
When working in a conda environment, **make sure you activate it!** Without a currently active environment, conda will attempt to modify the global Unity environment, and you will get `permission denied`.
{{< /callout >}}

## Access and manage conda environments ##

The following sections will show you how to access conda for the first time, create an environment, and activate it. These sections will also guide you through how to add packages to your conda environment, list available environments, list packages installed in your current environment, and delete an environment.

### Set up conda ###

You must load the `conda/latest` module for the <red>`conda`</red> command to become available. If `conda/latest` is not loaded, the terminal tells you that the `conda` command was not found, as shown in the following example:

```
conda: Command not found
```

To make the `conda` command available, use the following command:

```
module load conda/latest
```

### Create a conda environment ###

You can create as many conda environments as you need, limited only by our [disk quotas]({{< relref "storage" >}}). To create a conda environment, use the following command:

```
conda create --name testName python=3.12
```

This command creates an environment in your home folder, specifically `/home/$USER/.conda/envs/<name>`.

To create environments in other directories, such as your PI's work directory, use the following example:

```
mkdir -p /work/pi_name/$USER-conda/envs
conda create --prefix /work/pi_name/$USER-conda/envs/testName python=3.12

# OPTIONAL, make a symlink (shortcut) to home directory
ln -s /work/pi_name/$USER-conda/envs/testName ~/testName
```

Be sure to replace:
* `$USER` with your username
* `testName` with the name of your choice
* `3.12` with your Python version of choice

{{< callout tip >}}
To make `conda` create environments and store its caches in a specific directory by default, add the following line to your `.bashrc`:

```bash
export CONDA_ENVS_PATH=/path/to/.conda/envs
export CONDA_PKGS_DIRS=/path/to/.conda/pkgs

```

Or run the following commands in your terminal:

```bash
module load conda/latest
conda config --add envs_dirs /path/to/.conda/envs
conda config --add pkgs_dirs /path/to/.conda/pkgs
```
{{< /callout >}}

### Activate a conda environment ###

To activate an environment created with `--name`, use:

```
conda activate testName
```

To activate an environment created with `--prefix`, use:

```
conda activate /work/pi_name/$USER-conda/envs/testName
# OR
cd /work/pi_name/$USER-conda/envs/
conda activate ./testName
```

The currently active conda environment appears in parentheses next to your command line prompt, as shown in the following example:

```
user@login2:~$ conda activate ./testName
(testName) user@login2:~$
```

### Add packages to your conda environment ###

To add packages to your conda environment, use the command `conda install` followed by the package. The following code sample shows how to use `conda install` to install `numpy`:

```
conda install numpy
```

The install asks you to confirm installing numpy as well as any other additional required packages.

### List available conda environments ###

To list all available conda environments, use the following command:

```
conda info --envs
```

### List packages installed in the current environment ###

To list all the packages that are installed in the current conda environment, use the following command:

```
conda list
```

### Delete a conda environment ###

To delete a conda environment, use the following command:

```
conda remove --name testName --all
```
If your environment was added to JupyterHub, you need to manually remove it using the following command:
```
rm -rf ~/.local/share/jupyter/kernels/testName
```

## Conda environments and Jupyter ##

You can create many **custom conda environments** in the command line interface, or terminal, and then use them within **JupyterHub**. JupyterHub provides a convenient command line interface in its **Terminal** app. The following section will guide you through how to create a custom conda environment for use within JupyterHub.

### Add your conda environment to JupyterHub ###

Before adding your conda environment to JupyterHub, **make sure that your environment is activated**.
{{< callout warning >}}
Without a currently active environment, conda will attempt to modify the main default environment, and you will get `permission denied`.
{{< /callout >}}

The following steps will guide you through how to add your conda environment to JupyterHub in the terminal.
1. To install `ipykernel`, use the following command:

    ```
    conda install ipykernel
    ```
2. To add a `kernelspec` (Kernel Specification) to your JupyterHub, use the following command:

    ```
    python -m ipykernel install --user --name testName --display-name="Display Name Within JupyterHub"
    ```
3. If the previous steps were done within the JupyterHub terminal, reload the page. If that doesn't work, restart your JupyterHub server.


## Conda environment presets ##

As a way to make conda even more accessible, a set of conda presets are now available to use. Two scripts, `unity-conda-create` and `unity-conda-list`, are also available to help work with the presets.
They serve as wrappers to help build from the presets.

### Create a conda environment from presets

The `unity-conda-create` script creates a conda environment from one of the preset environments found in `/modules/user-resources/unity-conda/unity-conda-presets`. All this script needs is a **required environment name** and an **optional environment prefix**.

An example of the script is shown in the following code sample:

```bash
unity-conda-create -n pytorch-latest -p /work/pi_alovelace_umass_edu/conda/pytorch
```
In this example, `pytorch-latest` is the environment name as specified by the `-n` flag, and `/work/pi_alovelace_umass_edu/conda/pytorch` is the environment prefix as specified by the `-p` flag.

### List available presets or environment packages

The `unity-conda-list` script has two uses:
- If no arguments are provided, it displays all available presets.

- If one or more conda preset environments are specified, it displays environment packages.

To add this script to your environment, add the following line to your `.bash_profile` or `.bashrc`:

```bash
export PATH=/modules/user-resources/unity-conda:$PATH
```

## Learn more ##
[Conda documentation](https://docs.conda.io/projects/conda/en/latest/user-guide/tasks/manage-environments.html)
