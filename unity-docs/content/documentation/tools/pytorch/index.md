---
title: PyTorch
---

# Installing PyTorch

## Quick Start

Before installing PyTorch on Unity, create and activate an environment (venv, conda, or your preferred Python package manager). If using conda, ensure you run `conda install pip` to allow installation of pip packages into your conda environment. Once your environment is set up, run:

```bash
pip3 install torch torchvision --index-url https://download.pytorch.org/whl/cu126
```

This command installs PyTorch into your environment.

Do **not** run this command (or any other `pip install`) outside of a virtual environment. Installing PyTorch globally can interfere with existing workflows.
The command above installs PyTorch with CUDA 12.6, which is compatible with Unity. The section below provides additional details on how the selected CUDA version impacts PyTorch.

## PyTorch and the CUDA version


Let’s build a high-level understanding of how PyTorch interacts with GPU hardware.

1. PyTorch operations invoke
2. CUDA libraries such as the CUDA runtime, cuDNN, cuBLAS, and NCCL.
3. These libraries generate CUDA kernel calls.
4. The NVIDIA driver translates those kernel calls into low-level GPU hardware function calls.

For this call stack, there are four versions to keep in mind:

- The PyTorch version
- The CUDA version bundled with PyTorch
- The NVIDIA driver version
- The GPU hardware version (compute capability)

On Unity, the GPU hardware and the NVIDIA driver are fixed. The only versions you control are:

- Which **PyTorch version** you install
- Which **CUDA bundle** that PyTorch wheel uses

The PyTorch version determines which high-level Python features are available and is usually driven by your application requirements. Here, we focus on the impact of the CUDA version.

As a general rule, older CUDA versions will work with newer NVIDIA drivers. However, newer CUDA versions may not work with older NVIDIA drivers. Because the NVIDIA driver on Unity is fixed, you must ensure that the CUDA version you choose is supported by the system.

**View which CUDA versions are natively supported on Unity by running:** `module available cuda`

{{< figure src="cudamodules.PNG" title="CUDA Modules" alt="PyTorch CUDA Modules Diagram" >}}

Using a newer CUDA version than those listed may cause compatibility issues with the NVIDIA drivers on Unity.

A second source of incompatibility is GPU **compute capability (CC)**. Compute capability is NVIDIA’s architectural version that defines which hardware features the GPU supports, such as Tensor Cores, BF16, and ultimately which CUDA kernels can execute on that device. You can think of CC as a hardware capability across the GPU generations.

**Each CUDA version only supports a limited range of compute capabilities, as shown:**

{{< figure src="cudaversions.PNG" title="CUDA Versions" alt="PyTorch CUDA Versions Diagram" >}}

Unity includes a wide range of GPUs, from older Maxwell cards to newer architectures such as Ada, Ampere, and Hopper. CUDA 12.6 is the recommended version and is compatible with all GPUs on Unity; however, it may result in reduced performance on older Maxwell-series cards.

If your workloads rely heavily on older GPUs, consider using CUDA 11.8 to improve performance on those systems.

{{< callout note >}}
Certain PyTorch features, such as reduced-precision operations, are not supported on older GPUs due to compute capability limitations.
{{< /callout >}}

