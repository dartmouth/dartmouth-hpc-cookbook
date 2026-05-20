---
Title: Quick Start
weight: 5
aliases:
- /quickstart
blurb: >
    Quick Start Guide to HPC and Unity
---
# Quick Start Guide

## 0\. Using this guide
This guide frames some of the rest of the documentation. Although not necessary, you may want to go through these preliminaries:
* [Request your account]({{< relref "getting-access" >}})
* [Connect]({{< relref "connecting" >}}) to Unity
* [Install your software]({{< relref "software" >}}), but also see below.
* Read some of the basics of [writing batch job scripts]({{< relref "sbatch" >}}), but finish the rest of this guide before submitting a job.

If you are unfamiliar with using the command line, there are some [external resources]({{< relref "hpc-resources" >}}) that can help.

## 1\. Understanding Your Computational Needs

* **Define Objectives:**
  * Clearly understand your *computational needs*—whether it’s for large-scale simulations, data analysis, machine learning training, etc.
  * It is important that you understand whether your code can take advantage of *parallelism* on multiple CPUs, and/or on a single or multiple GPUs.
  * Only codes that have been *explicitly* written to run in parallel on multiple CPUs or multiple GPUs can take advantage of these resources. Be sure to check\!
* **Scaling:** Before launching production analyses for a *parallel* CPU or GPU code you should study how the execution time of your code scales with the allocated resources (number of CPU cores, number of GPUs). Some advice on doing so is available [here](https://researchcomputing.princeton.edu/support/knowledge-base/scaling-analysis).
* **Time to solution:** Understand that the *time to solution* is the sum of the time your job is waiting in the queue plus the time it takes to run it. For a parallel code, allocating more CPU / GPU resources should speed up *execution time* if it scales well, but, at the same time, this generally increases the *queue time*, depending on how busy the cluster is. Aim for balance to reduce time to solution\! See the figure below for a sketch.

{{< figure src="queue_execution_total_times.png" title="Time To Science" alt="Graphs showing the relationship between resources requested, queueing time, execution time, and total time" >}}
\[Credit: [https://researchcomputing.princeton.edu/support/knowledge-base/slurm](https://researchcomputing.princeton.edu/support/knowledge-base/slurm)\]

## 2\. Choosing CPU Resources

* **Serial jobs:**
  * Code uses only a single CPU-core.
  * Opt for higher CPU clock speeds (GHz). E.g., use `--prefer=x86_64_v4`
* **Multi-threaded jobs:**
  * Code uses multiple CPU-cores via a shared-memory parallel programming model (`OpenMP`, `pthreads`). For instance, the Python library `NumPy` uses this.
  * Empirically determine the optimal number of cores through a *scaling analysis*.
* **Multi-node jobs:**
  * Code uses distributed-memory parallelism based on `MPI` (Message Passing Interface) and uses multiple CPU-cores on multiple nodes simultaneously.
  * Only codes explicitly written to run in parallel can utilize multiple cores across nodes.
  * You must empirically determine the optimal number of nodes and cores through a *scaling analysis*.
  * Your code is likely to benefit from a fast interconnect between nodes: if applicable, run on nodes with **Infiniband** by adding `--constraint=ib` to your batch script.
* **Memory Requirements:**
  * Select CPU nodes according to the amount of RAM required. See the [list of nodes]({{< relref "documentation/cluster_specs/nodes" >}}). You can specify e.g. `--mem=30G`.

## 3\. Choosing GPU Resources

* **GPU support:**
  * Only codes which have been explicitly written to run on GPUs can take advantage of GPUs.
  * Submitting a CPU-only code to a GPU queue does *not* speed-up the execution time but it does *waste* GPU resources. It also increases your queue time and lowers the priority of your next job submission, making you and other users wait longer\! Please don’t do this\!
* **Multi-GPU jobs:**
  * Many codes only use a *single* GPU. Please avoid requesting multiple GPUs unless you are *certain* that your code can use them efficiently\!
  * Even if your code supports multiple GPUs, you must first conduct a *scaling analysis* to find the optimal number of GPUs to use.
* **GPU type selection:**
  * Read through [available GPU resources]({{< relref "documentation/tools/gpus">}}) and find a suitable GPU type for your code based on compute capability and required GPU memory (VRAM). Note that not all GPU types are available in every partition.
  * Use `unity-slurm-gpu-usage` to see the available GPU resources on the cluster.
  * Select less powerful GPUs if possible (e.g. `M40, A40, V100, L40S`)\!

## 4\. Resource Allocation

* **Job Scheduling:** Unity uses the `SLURM` job scheduler. Refer to the documentation [here]({{< relref jobs >}}) to efficiently manage and allocate resources. Clearly specify your resource requirements in your `Slurm` job batch scripts.
* **Resource Requests:** Request the *minimum* necessary resources to avoid wasting compute power and ensure fair access for all users.
* **Selecting a appropriate partition for your job:**
  * A list of partitions available on Unity is available [here]({{< relref partitions >}}).
  * Use `unity-slurm-partition-usage` to see how busy partitions are.
  * **Short:** For jobs which are 2 days or less, specify `--partition=cpu` (or `--partition=gpu` if requesting a GPU)
  * **Long:** For jobs which are more than 2 days, specify `-q long` as well
  * **Preempt:** For jobs which require less than 2 hours, specify `--partition=cpu-preempt` (or `--partition=gpu-preempt` if requesting a GPU). If your jobs run longer than two hours, higher priority job may preempt (terminate and requeue) it after two hours.
  * **QoS:** For jobs shorter than 4 hours, you can boost the job priority for one small job by adding the parameter `--qos=short` to your job batch script or `salloc` / `sbatch` command. See [this page]({{< ref "news/2023/07/feature-announcements/#new-short-qos" >}}) for details.
  * Note that not all GPU types are available in every partition. Modify the suggestions for partitions as needed.

{{< callout tip "Priority Partitions" >}}
For users of Priority Partitions, you should specify those partitions in the `--partition` list, if appropriate, for example `--partition=gpu,superpod-a100` or `--partition=gpu,gpu-preempt,uri-gpu`, etc. Note that the scheduler will prefer the priority partition over the general access partitions, and the general access over the preempt. See the [Partition list]({{< relref "partitions" >}}) for access requirements.
{{< /callout >}}

## 5\. Monitoring and Debugging

* **Resource Utilization:**
  * Monitor CPU/GPU usage, memory consumption, and job progress using cluster monitoring tools.
  * Use `seff <job_id>` to get statistics, including:
    * CPU efficiency: actual core time / (\# of cores \* run time)
    * Memory efficiency: percentage of requested memory used
    * Both efficiencies should ideally be close to 100%.
  * Use Unity tools to monitor resources:
    * E.g. `echo gpu001 | unity-slurm-node-usage`
  * Access a compute node to monitor memory, CPU and GPU usage for a running job:
    * You can log into a compute node via srun (see [this page]({{< relref monitoring >}}))
    * Use `htop` to monitor CPU and memory usage of the compute node; look at your processes, as you may be sharing the node with other users.
    * Use `nvidia-smi` or `nvitop` to monitor GPU compute and memory loads (see [here]({{< relref "documentation/tools/gpus" >}}))
* **Profile your code:**
  * Profiling can identify bottlenecks in your code where code is inefficient and optimization is possible. Several tools are available for different programming languages.
  * Python: [cProfile](https://docs.python.org/3/library/profile.html) or [line\_profiler](https://github.com/pyutils/line\_profiler)
  * Deep learning, CUDA: [TensorFlow Profiler](https://www.tensorflow.org/tensorboard/tensorboard\_profiling\_keras), [PyTorch Profiler](https://pytorch.org/tutorials/recipes/recipes/profiler\_recipe.html), [CUDA profiling tools](https://docs.nvidia.com/cuda/profiler-users-guide/index.html)
  * C/C++/Fortran: [gprof](https://web.eecs.umich.edu/\~sugih/pointers/gprof\_quick.html), [Intel VTune](https://www.intel.com/content/www/us/en/docs/vtune-profiler/user-guide/2024-2/introduction.html)

## 6\. Storage and Compute Environments

* **Use appropriate storage:**
  * Your `/home` directory is for configuration files and code installations. It has a set quota of 50G.
  * Write results from your codes to your subdirectory in `/work`. If you run out of disk space, discuss with your PI and use `/scratch` and `/project` as appropriate. Read about [storage documentation]({{< relref storage >}}).
* **Use conda environments:**
  * Use `conda` environments when possible to install packages without having to request installation from a Unity administrator (make sure that the package that you want isn’t already available as a software module: search using `module spider <package-name>`)
  * The hidden `.conda` directory in your home directory can grow very large and exceed the quota on your `/home` directory. You can move it to your subdirectory in your PI's `/work` directory and create a symbolic link (with `ln -s`) back to your home directory, or follow one of the suggestions on [this page]({{< relref quotas >}}).

## 7\. Documentation and Support

* **Cluster Documentation:** Familiarize yourself with the cluster's documentation for frequently asked questions, specific guidelines and best practices: [TOC]({{< relref documentation >}})
* **Support Channels:**
  * Join Slack: [Unity Community Slack]({{< relref community >}}) to chat with staff & other users and get quick help.
  * Join Unity office hours: Tue 2:30-4 PM EST/EDT: [Zoom]({{< param officehours-url >}})

{{< callout tip "How to Ask for Help" >}} For a faster resolution, follow these [guidelines on how to ask for help]({{< relref "documentation/help/asking-questions" >}}).{{< /callout >}}
