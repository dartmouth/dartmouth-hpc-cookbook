---
title: JupyterLab OnDemand
---

# How to use JupyterLab on Unity OnDemand

Unity OnDemand provides [JupyterLab](https://jupyterlab.readthedocs.io/en/latest/) as a way to manage your software in Unity. JupyterLab is a web-based interactive computational environment for creating your Jupyter notebooks, code, and data.

The following sections will guide you through how to access and set up JupyterLab, and how to run a job non-interactively to avoid disconnection issues.

## Access and set up JupyterHub

The following steps will guide you through how to access and set up JupyterLab through Unity OnDemand.

1. Go to [Unity OnDemand]({{< param ood-url >}}) and sign in.

2. From the top menu, click **Interactive Apps**.

3. In the dropdown menu that appears, click **JupyterLab**.

4. On the JupyterLab page, fill in the following fields:
   - **Partition**: the type of compute nodes you want to run your interactive session on. For more information on partitions, see [the partition list]({{< relref partitions >}}).
   - **Maximum job duration**: how long the interactive session with JupyterLab runs for in the format `Hours:Minutes:Seconds` (e.g., `1:00:00` for one hour). **Interactive sessions are limited to 8 hours (`8:00:00`)**. For information on running a Jupyter Notebook non-interactively, see [the section below]({{< relref "#non-interactive" >}}).
   - **Memory (in GB)**: the amount of memory, in gigabytes, allocated to your interactive session.
   - **GPU count**: the number of GPUs allocated to your interactive session. You must specify a [GPU-enabled partition]({{< relref partitions >}}) in the partition field to use a GPU.
   - **Modules**: which [Lmod environment modules]({{< relref modules >}}) should be loaded before the job starts.<br>
{{< callout "warning" >}}
You should not specify Python packages here. Instead, if you need an environment with specific Python packages, create a [conda environment]({{< relref conda >}}) or virtual environment and install the kernel.
{{< /callout >}}
   - **Short QOS checkbox**: For jobs shorter than four hours, you can use the "short" QOS to boost priority for a single job.
   - **Extra arguments for Slurm**: generally, this can be left blank. However, you can use any [`sbatch` options]({{< slurmlink "sbatch.html#SECTION_OPTIONS" >}}) here to customize job submission.

## Run a Jupyter notebook non-interactively {#non-interactive}

When using JupyterLab through Unity OnDemand, it's possible that your computer could get disconnected from the internet, causing the kernel to be interrupted. In addition, interactive sessions are limited to eight hours. One way to avoid this is to use `nbconvert` to run your job non-interactively. Alternatively, you can use the Python package `papermill`, which has more features available.

The following sections will guide you through the `nbconvert` and `papermill` methods, both of which should take place in an `sbatch` file. For a guide on `sbatch`, see [Introduction to batch jobs]({{< relref "sbatch" >}}).

### Non-interactively run a job using `nbconvert`

1. To non-interactively run a job with `nbconvert`, open your `sbatch` file and load the miniconda module using the following command:

    ```
    module load conda/latest
    ```
2. Activate the conda environment using the following command:

    ```
    conda activate jupyterhub-stable
    ```

{{< callout note >}}
If you are using a different conda environment, ensure that `nbconvert` is available. If not, you can install `nbconvert` with

```bash
conda install nbconvert # For conda environments
pip install nbconvert # For venvs
```
{{< /callout >}}

3. To execute the code cells in your notebook and save them back to the same Jupyter Notebook format, use the `--nbconvert`, as shown in the following example:

```bash
jupyter nbconvert --to notebook --execute YOUR_NOTEBOOK.ipynb
```
The new output of the job is created at a new file, called `YOUR_NOTEBOOK.nbconvert.ipynb`.

To rewrite the existing file and save the output to it, add the `--inplace` flag, as shown in the following example:

```bash
jupyter nbconvert --to notebook --execute --inplace YOUR_NOTEBOOK.ipynb
```

### Non-interactively run a job using `papermill`

Alternatively, you can use [Papermill](https://papermill.readthedocs.io/en/latest/index.html) to parameterize and execute your Jupyter Notebooks. Papermill has more features than are available with `nbconvert`.

The following steps will guide you through how to install papermill and parameterize your Jupyter Notebook to support running non-interactively.

1. In your [conda environment]({{< relref conda >}}) or venv, install Papermill using the following command:

```bash
conda install -c conda-forge papermill # for Conda environments
pip install papermill # For venvs
```
2. In your notebook (from the Unity OnDemand JupyerLab interface), select the cell that you want to parameterize.
3. From the left menu of JupyterLab, click the **double gear icon**.
4. Type "parameters" in the **Add Tag** field and click **Enter**.
5. In your `sbatch` file, execute the notebook using the following command:

    ```bash
    papermill YOUR_CODE_INPUT.ipynb YOUR_CODE_OUTPUT.ipynb --autosave-cell-every 20
    ```
    To save the output code to the same file rather than creating a new one, replace `YOUR_CODE_OUTPUT.ipynb` with `YOUR_CODE_INPUT.ipynb`, as shown in the following example:

    ```bash
    papermill YOUR_CODE_INPUT.ipynb YOUR_CODE_INPUT.ipynb --autosave-cell-every 20
    ```

{{< callout note >}}
If you need to skip a cell, add `%%script echo skipping` to the top line of the cell.
{{< /callout >}}


