---
title: Recipes
description: "Task-oriented guides for running real workloads on {{ cluster.name }}"
---

# Recipes

Recipes are self-contained, task-oriented guides. Each one walks you through a specific workflow on {{ cluster.name }} — from setting up a Python environment to running multi-node MPI jobs. Unlike the [Fundamentals](../fundamentals/index.md) section, which builds concepts from the ground up, recipes assume you already have the basics down and need to **get something done**.

<div class="grid cards" markdown>

-   :material-language-python:{ .lg .middle } **Python**

    ---

    Manage environments with uv or Conda, run PyTorch and Hugging Face Transformers workloads, and scale training across multiple GPUs.

    [:octicons-arrow-right-24: Python recipes](python/uv.md)

-   :material-language-r:{ .lg .middle } **R**

    ---

    Load R, install packages with `renv`, and submit R scripts as batch jobs.

    [:octicons-arrow-right-24: R recipes](r/getting-started.md)

-   :fontawesome-solid-calculator:{ .lg .middle } **MATLAB**

    ---

    Run MATLAB scripts as non-interactive batch jobs on the cluster.

    [:octicons-arrow-right-24: MATLAB recipes](matlab/batch-job.md)

-   :material-package-variant-closed:{ .lg .middle } **Containers**

    ---

    Learn when containers make sense on HPC and how to build and run them with Apptainer.

    [:octicons-arrow-right-24: Container recipes](containers/intro.md)

-   :material-monitor-dashboard:{ .lg .middle } **Open OnDemand**

    ---

    Access the cluster through a web browser — launch Jupyter notebooks, RStudio, and other interactive apps without SSH.

    [:octicons-arrow-right-24: Open OnDemand recipes](open-ondemand/getting-started.md)

-   :material-format-list-checks:{ .lg .middle } **Slurm Patterns**

    ---

    Interactive sessions, job arrays, and intermediate submission patterns for more complex workflows.

    [:octicons-arrow-right-24: Slurm recipes](slurm/interactive-jobs.md)

-   :material-lan:{ .lg .middle } **MPI**

    ---

    Compile and run MPI programs across multiple nodes, including a Python example with mpi4py.

    [:octicons-arrow-right-24: MPI recipes](mpi/hello-world.md)

</div>

!!! tip "New to the cluster?"
    If you haven't submitted a job yet, start with [Getting Started](../getting-started/what-is-hpc.md) instead. These recipes assume you're comfortable connecting to {{ cluster.name }}, loading modules, and writing basic Slurm scripts.
