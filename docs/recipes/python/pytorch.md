---
title: "PyTorch with GPU Support"
description: "How to set up and manage PyTorch using uv on {{ cluster.name }}"
tags:
  - python
  - pytorch
  - gpu
---

# PyTorch with GPU Support

!!! abstract "What you'll learn"
    How to install PyTorch with GPU acceleration on {{ cluster.name }} using
    [`uv`](uv.md), how to pick the right CUDA index for your target GPU, and
    how to verify that everything works in a batch job.

PyTorch bundles its own CUDA libraries for GPU support, so there is no need
to rely on system CUDA or to install your own CUDA separately. We recommend
using [`uv` to manage projects](uv.md) involving PyTorch.

There is a major footgun, however: **PyTorch distributes its GPU-enabled
packages through a custom package index that is specific to a CUDA version.**
Using the wrong CUDA version can result in silent failures, degraded
performance, or crashes.

## Step 1: Check the CUDA Version for Your Target GPU

| Generation | GPUs | Supported CUDA versions |
|---|---|---|
| Volta | V100 | ≥ 9.0, < 13.0 |
| Ampere | A100, A5500, A5000 | ≥ 11.0 |
| Hopper | H200 | ≥ 12.0 |
| Lovelace | L40S | ≥ 12.0 |

!!! warning "Multiple GPU generations? Pick a common CUDA version"
    If you want your code to run on different GPUs with minimal friction,
    consider maintaining separate projects or using a CUDA version that is
    supported by all targeted GPUs (e.g., CUDA 12.8).

    If you update the CUDA index URL later, re-resolve your dependencies
    with:

    ```bash
    uv lock --upgrade-package torch
    ```

## Step 2: Add the Matching PyTorch Index to Your `pyproject.toml`

For example, if your target GPU supports CUDA 12.8:

```toml
[[tool.uv.index]]
name = "pytorch-cu128"
url = "https://download.pytorch.org/whl/cu128"
explicit = true
```

Or for a GPU that requires CUDA 11.8:

```toml
[[tool.uv.index]]
name = "pytorch-cu118"
url = "https://download.pytorch.org/whl/cu118"
explicit = true
```

Setting `explicit = true` means only packages that you explicitly assign to
this index will be fetched from it — everything else comes from PyPI as
usual.

## Step 3: Pin Packages to the Index and Install

You also need to tell `uv` *which* packages should come from the PyTorch
index. Add a `[tool.uv.sources]` section to your `pyproject.toml`:

```toml
[tool.uv.sources]
torch = [{ index = "pytorch-cu128" }]
torchvision = [{ index = "pytorch-cu128" }]
torchaudio = [{ index = "pytorch-cu128" }]  # (1)!
```

1. Only include the packages you actually need. `torchaudio` is shown
   here for completeness.

Then install as usual:

```bash
uv add torch torchvision
```

`uv` resolves versions from the custom index for `torch` and `torchvision`,
and fetches everything else (NumPy, Pillow, etc.) from PyPI.

## Test Your Environment

Save the following as `smoke_test.py`:

```python
import torch

print(f"PyTorch version: {torch.__version__}")
print(f"CUDA available:  {torch.cuda.is_available()}")
print(f"CUDA version:    {torch.version.cuda}")
print(f"cuDNN version:   {torch.backends.cudnn.version()}")
print(f"GPU count:       {torch.cuda.device_count()}")

for i in range(torch.cuda.device_count()):
    props = torch.cuda.get_device_properties(i)
    print(
        f"  [{i}] {props.name}"
        f" — {props.total_mem / 1024**3:.1f} GB,"
        f" compute capability {props.major}.{props.minor}"
    )

# Quick tensor operation on GPU to verify it actually works
x = torch.randn(1000, 1000, device="cuda")
y = x @ x.T
print(f"\nSmoke test passed: matmul on {x.device} produced shape {y.shape}")
```

Run it on the partition of your choice:

{{ sbatch_template(
    job_name="torch-smoke",
    partition="gpuq",
    time="00:05:00",
    cpus=1,
    mem="8G",
    gpus=1,
    modules=["uv"],
    commands="nvidia-smi\necho '---'\ncd /path/to/myproject\nuv run python smoke_test.py"
) }}

!!! warning "Remember to load `uv` in every batch job"
    The `module load uv` line is essential. Without it, `uv run` won't be
    found and your job will fail immediately. See
    [Use in a Batch Job](uv.md#6-use-in-a-batch-job) for details.

A successful run should produce output that looks something like this:

```
Wed Mar 11 21:36:46 2026
+-----------------------------------------------------------------------------------------+
| NVIDIA-SMI 580.65.06              Driver Version: 580.65.06      CUDA Version: 13.0     |
+-----------------------------------------+------------------------+----------------------+
| GPU  Name                 Persistence-M | Bus-Id          Disp.A | Volatile Uncorr. ECC |
| Fan  Temp   Perf          Pwr:Usage/Cap |           Memory-Usage | GPU-Util  Compute M. |
|                                         |                        |               MIG M. |
|=========================================+========================+======================|
|   0  Tesla V100-SXM2-32GB           Off |   00000000:18:00.0 Off |                    0 |
| N/A   32C    P0             41W /  300W |       0MiB /  32768MiB |      0%   E. Process |
|                                         |                        |                  N/A |
+-----------------------------------------+------------------------+----------------------+

+-----------------------------------------------------------------------------------------+
| Processes:                                                                              |
|  GPU   GI   CI              PID   Type   Process name                        GPU Memory |
|        ID   ID                                                               Usage      |
|=========================================================================================|
|  No running processes found                                                             |
+-----------------------------------------------------------------------------------------+
---
PyTorch version: 2.10.0+cu128
CUDA available:  True
CUDA version:    12.8
cuDNN version:   91002
GPU count:       1
  [0] Tesla V100-SXM2-32GB — 31.7 GB, compute capability 7.0

Smoke test passed: matmul on cuda:0 produced shape torch.Size([1000, 1000])
```

!!! info "Need a custom CUDA toolkit or other compiled libraries alongside PyTorch?"
    In most cases PyTorch's bundled CUDA libraries are sufficient. If you
    have unusual requirements — such as a specific system CUDA version for
    interoperability with other compiled code — consider using a conda-based
    environment manager or a container-based workflow instead.

## See Also

- [Getting Started with uv](uv.md) — The recommended way to manage Python projects on {{ cluster.name }}
