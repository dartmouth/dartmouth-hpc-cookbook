---
title: Unity GPUs
---

# GPUs on Unity

**Graphics Processing Units (GPUs)** provide a powerful tool to run code in
parallel at a larger scale than traditional CPU parallel workload. However,
this large-scale parallel workload comes at a tradeoff with slower communication times. It is important to note that
using one or more GPUs does not guarantee that code will run faster, although
many popular software packages have been modified to incorporate GPUs for
better performance.


## Available GPU resources

| Device | Arch | Max Compute Capability* | Max VRAM | Constraint name |
| --- | --- | --- | --- | --- |
| NVIDIA GeForce GTX TITAN X | Maxwell | sm_52 | vram12 | titanx |
| Tesla M40 24GB | Maxwell | sm_52 |  vram23 | m40 |
| NVIDIA GeForce GTX 1080 Ti | Pascal | sm_61 |  vram11 | 1080ti |
| Tesla V100-PCIE-16GB | Volta | sm_70 |  vram16 | v100 |
| Tesla V100-SXM2-16GB | Volta | sm_70 | vram16 | v100 |
| Tesla V100-SXM2-32GB | Volta | sm_70 | vram32 | v100 |
| NVIDIA GeForce RTX 2080 | Turing | sm_75 | vram8 | 2080 |
| NVIDIA GeForce RTX 2080 Ti |  Turing |sm_75 | vram11 | 2080ti |
| Quadro RTX 8000 | Turing | sm_75 | vram48 | rtx8000 |
| NVIDIA A100-PCIE-40GB | Ampere | sm_80 | vram40 | a100, a100-40g |
| NVIDIA A100-SXM4-80GB | Ampere | sm_80 | vram80 | a100, a100-80g |
| NVIDIA A4000 | Ampere | sm_86 | vram16 | a4000 |
| NVIDIA A16 | Ampere | sm_86 | vram16 | a16 |
| NVIDIA A40 | Ampere | sm_86 | vram48 | a40 |
| NVIDIA GH200 | Hopper | sm_90 | vram102 | gh200 |
| NVIDIA L40S | Ada Lovelace | sm_89 | vram48 | l40s |
| NVIDIA L4 | Ada Lovelace | sm_89 | vram23 | l4 |

{{< callout note >}}
Max compute capability and max VRAM represent the largest constraint that the gpu can satisfy. Most constraints with a lower compute capability and lower VRAM will be satisfied by GPUs with a minimum of the specified requirement.
{{< /callout >}}

*: **CUDA Compute Capability** provides some details on which features may or may not be available for particular GPUs. More details about compute capabilities for all NVIDIA GPUs can be found on the [NVIDIA Compute Capability page](https://developer.nvidia.com/cuda-gpus) and a complete list of features availble with each compute capability can be found in the [CUDA Documentation](https://docs.nvidia.com/cuda/cuda-c-programming-guide/index.html#features-and-technical-specifications-feature-support-per-compute-capability). As new features come out, older GPUs on Unity may become deprecated, which will be included on this page as new versions are released.

## Request GPU resources

You can request GPU access on Unity through Slurm either for an interactive job or using a batch script, as shown in the following examples.

{{< callout note >}}
Not all software is able to use GPUs, and some software will require
special options, dependencies, or alternate versions to be able to run with
GPUs. Please ensure your software supports GPU use before requesting these
resources.
{{< /callout >}}

### Interactive job

```bash
salloc -p gpu-preempt -t 02:00:00 --gpus=1 --mem=8G
```


### Batch script

```bash
#!/bin/bash

#SBATCH -p gpu-preempt # Submit job to gpu-preempt partition
#SBATCH -t 02:00:00    # Set max job time for 2 hours
#SBATCH --gpus=1       # Request access to 1 GPU
#SBATCH --constraint=2080ti # Request access to a 2080ti GPU

./myscript.sh
```

To select specific GPUs, use the `--constraint` flags with Slurm,
or add the gpu type to `--gpus`.

{{< callout tip >}}
Using `--constraint` allows you to select multiple possible GPUs that fulfill the requirements.

You can use:
-  `--constraint=[2080|2080ti]`, which is best if you are using GPUs across more than one node to ensure the same model is used across all entire job
- or `--constraint=sm_70&vram12`
{{< /callout >}}

{{< callout tip >}}
Not all GPU types are available in every [Partition]({{< relref "partitions" >}})
{{< /callout >}}


### Batch script with specific GPU

```bash
#!/bin/bash

#SBATCH -p gpu-preempt # Submit job to gpu-preempt partition
#SBATCH -t 02:00:00    # Set max job time for 2 hours
#SBATCH --gpus=2080ti:1       # Request access to 1 2080tiGPU

./myscript.sh
```

### Batch script with constraint

```bash
#!/bin/bash

#SBATCH -p gpu-preempt # Submit job to gpu-preempt partition
#SBATCH -t 02:00:00    # Set max job time for 2 hours
#SBATCH --gpus=1       # Request access to 1 2080tiGPU
#SBATCH --constraint=2080ti

./myscript.sh
```

### Batch script with constraint specifying multiple options

```bash
#!/bin/bash

#SBATCH -p gpu-preempt # Submit job to gpu-preempt partition
#SBATCH -t 02:00:00    # Set max job time for 2 hours
#SBATCH --gpus=1       # Request access to 1 2080tiGPU
#SBATCH --constraint=2080ti|1080ti|2080

./myscript.sh
```

### How to choose a GPU

To reduce time a job is spent waiting in the queue, select the least powerful GPU that can run your code. The choice of GPU is typically limited by the amount of available GPU memory.

The following are some general guidelines for choosing GPUs:

- GeForce GPUs are good for any lower memory tasks or prototyping.
- Select the minimum amount of vram that can fit your needs.
- The large vram GPUs are often in high demand. Be prepared for your jobs to spend some time in the queue before being able to launch.
- Whenever possible, use constraints to specify the necessary GPUs.

### How to choose a partition

Partitions are a required option for **all** GPU jobs and can be specified using either `-p` or `--partition=`. When listing a partition, more than one may be specified and listed in a comma-separated list. Slurm will attempt to use these partitions in priority order to allocate the specified resources.

- Jobs that require less than 2 hours: *gpu-preempt*, *priority partitions*
- Jobs that cannot be preempted, and require up to 48 hours: *gpu*, *priority partitions*
- Jobs that cannot be preempted, and require more than 48 hours: additionally specify `--qos=long`


{{< callout note >}}
Use checkpointing in the gpu-preempt partition for your job needs more than 2 hours.
{{< /callout >}}

For an informative list of partitions on Unity, see [Unity Partitions]({{< relref "partitions" >}}). For a quick guide to for how many GPUs are in each partition, see the [GPU Summary table]({{<  relref "gpu_summary" >}}).

## GPU-enabled software

The following sections include useful information about GPU-enabled software, such as [CUDA](#cuda), [cuDNN](#cudnn), and [OpenMPI](#openmpi). Some software, such as TensorFlow, requires setting up the environment in a specific way. The [Set up a Tensorflow GPU environment](#set-up-a-tensorflow-gpu-environment) section will guide you through how to use a conda environment to set up a TensorFlow GPU environment.


{{< callout note >}}
When using multiple GPUs on a node, be sure to use the Slurm variable SLURM_GPUS_ON_NODE to ensure that ALL allocated GPUs on a node can be accessed by your software. This is especially critical with software such as pytorch that allows you to specify the --nproc-per-node at runtime.
{{< /callout >}}

### CUDA

CUDA is NVIDIA's parallel computing platform. A version of CUDA will typically be required to be loaded for most GPU jobs because it allows access to the NVIDIA compiler suite (nvcc, nvfortran) and the NVIDIA GPU profiling tool (nsys).

Available versions of cuda can be be listed using `module spider cuda`

{{< callout note >}}Be sure to check which version(s) of cuda are compatible with the software that is being used.{{< /callout >}}

### cuDNN

cuDNN is the Cuda Deep Neural Network library, often used to accelerate deep learning frameworks in Keras, PyTorch, TensorFlow, and others.

### OpenMPI

OpenMPI includes the OpenMPI compilers for MPI compiled against the cuda compilers. OpenMPI is necessary to use if software that uses both MPI and GPU acceleration.

Many programming languages are able to use one or more GPUs, including:

- Python
- Matlab
- Julia
- C++ (using Cuda or OpenACC)
- Fortran (using Cuda or OpenACC)
- C (using Cuda or OpenACC)


### Set up a TensorFlow GPU environment

Some software, especially with python, requires setting up the environment in a specific way. For python programs that can use GPU, such as TensorFlow, it is best to use a conda environment.

{{< callout warning >}}See our [Conda]({{< relref conda >}}) documentation on how to change where the environment is built. This is important because TensorFlow environments are large. {{< /callout >}}

The following steps will show you how to set up a conda environment for TensorFlow:

1. Request an interactive session with a GPU node using the following command:

    ```bash
    srun -t 01:00:00 -p gpu-preempt --gpus=1 --mem=16G --pty /bin/bash
    ```

2. Load modules using the following commands:

    ```bash
    module load conda/latest
    module load cuda/12.6
    module load cudnn/8.9.7.29-12-cuda12.6
    ```

3. Create and activate the environment using the following commands:

    ```bash
    conda create --name TensorFlow-env python=3.9
    ```

    ```bash
    conda activate TensorFlow-env
    pip install TensorFlow
    pip install tensorrt
    conda install ipykernel
    ```

{{< callout note >}}
* TensorFlow 2 requires a python version of at least 3.9
* If you do not request enough memory, TensorRT will fail to install.
{{< /callout >}}

4. Add the environment to Jupyter using the following command:

    ```bash
    python -m ipykernel install --user --name TensorFlow-env --display-name="TensorFlow-Env"
    ```

    A new kernel with the name **TensorFlow-Env** appears with new Open OnDemand sessions.

{{< callout tip >}} A similar procedure can be used for PyTorch. See the [PyTorch docs](https://pytorch.org/get-started/locally/) for the correct `pip` invocation. Always use the latest CUDA version.  {{< /callout >}}

## Track GPU power usage

To track the power usage of GPUs being used by your jobs, use the following command:

```bash
nvidia-smi --query-gpu=power.draw --format=csv --loop-ms=100
```

## Troubleshoot problems with GPUs

The first two options require connecting to the node(s) on which your job is running. See [Monitoring a batch job]({{< relref "monitoring" >}}) for details on how to do that.

### Nvidia-smi
To view ongoing GPU processes, use `nvidia-smi pmon`. This command can run on any GPU node without needing to install any additional software.


If you are getting error messages, add the following command
to your scripts to find out which GPU is being used:

```bash
nvidia-smi -L
```

### Nvitop

Nvitop offers an interactive view of ongoing process for NVIDIA GPUs. It is available in the default PATH for x86 architecture.

{{< callout note >}}
If installing nvitop locally for power9 or arm, it is highly recommended to use an isolated conda environment or python virtual environment.
{{< /callout >}}

To install nvitop via pip, use the command `pip install nvitop`. Once nvitop is installed, it can be used either as a standalone process or within a python script for a more detailed analysis.

### Common errors

**Out of Memory**: (ex. `CUDA_ERROR_OUT_OF_MEMORY`, torch.cuda.OutOfMemory) means that a GPU with more available VRAM may be necessary, or that the code being run should be modified to reduce the memory usage. For machine learning models running out of memory, try reducing the batch size or ensuring your data management is optimized.
For other software, check the documentation on controlling GPU memory usage.
