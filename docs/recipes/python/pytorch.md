---
title: "PyTorch with GPU Support"
description: "How to set up and manage PyTorch using uv on {{ cluster.name }}"
tags:
  - python
  - pytorch
  - gpu
---

# PyTorch with GPU Support

!!! abstract "What we're cooking"
    How to install PyTorch with GPU acceleration on {{ cluster.name }} using
    [`uv`](uv.md) and how to verify that everything works in a batch job.

PyTorch bundles its own CUDA libraries for GPU support, so there is no need
to rely on system CUDA or to install your own CUDA separately. We recommend
using [`uv` to manage projects](uv.md) involving PyTorch.

Recent versions of `uv` can automatically detect your GPU and install the
right PyTorch build. For most users, this is all you need.

## Step 1: Know your GPU's compute capability

Every NVIDIA GPU has a *compute capability* version that determines which
software features it supports. PyTorch drops support for older compute
capabilities over time, so check whether your target GPU is supported
before setting up your environment.

| Generation | GPUs on {{ cluster.name }} | Compute Capability | Default PyTorch | Notes |
|---|---|---|---|---|
| Maxwell | GTX TITAN X, Tesla M40 | 5.2 | :material-close: No | Dropped in PyTorch 2.x |
| Pascal | GTX 1080 Ti | 6.1 | :material-close: No | Dropped in PyTorch 2.x |
| Volta | V100 | 7.0 | :material-alert: No | Needs `cu126` index (see below) |
| Turing | RTX 2080 :material-lock:, RTX 2080 Ti, Quadro RTX 8000 | 7.5 | :material-check: Yes | |
| Ampere | A100, A40, RTX A4000, A16 :material-lock: | 8.0 / 8.6 | :material-check: Yes | |
| Ada Lovelace | L40S, L4 | 8.9 | :material-check: Yes | |
| Hopper | H100, Grace Hopper | 9.0 | :material-check: Yes | |

:material-lock: = PI-owned partition only. See the [Unity GPU list](https://docs.unity.rc.umass.edu/documentation/tools/gpus/) for current availability.

!!! warning "Maxwell, Pascal, and Volta GPUs need special handling"
    The default PyTorch wheels from PyPI require compute capability ≥ 7.5
    (Turing or newer). Maxwell and Pascal GPUs (CC 5.x and 6.x) are
    fully dropped. Volta GPUs like the V100 (CC 7.0) are no longer
    supported by the default build either.

    To use a V100, install PyTorch from the `cu126` index instead of PyPI
    (see [Pinning a specific CUDA version](#pinning-a-specific-cuda-version)
    below). For Maxwell/Pascal, you would need PyTorch 1.x.

### Requesting a compatible GPU with `--constraint`

The `gpu` partition on {{ cluster.name }} includes GPUs from every
generation in the table above. If you submit a job without specifying
which GPU you want, Slurm may schedule you on an older node where
PyTorch will crash or fail with a cuDNN compatibility error.

Use Slurm's `--constraint` flag to request a GPU with at least a certain
compute capability. The feature tags follow the pattern `sm_XX`, where
`XX` maps to the compute capability (e.g., `sm_75` for Turing, `sm_80`
for Ampere):

```bash
#SBATCH --constraint=sm_75   # Turing (7.5) or newer
```

This ensures your job lands on a node with a GPU that the default
PyTorch build supports. All the `sbatch` examples in this recipe
include this constraint.

!!! tip "Targeting a specific generation"
    You can also use GPU-specific feature tags like `v100`, `a100`,
    `l40s`, or `h100` to request a particular model. Run
    `sinfo -o "%N %f" -p gpu` to see which features are available on
    each node.

## Step 2: Install PyTorch

PyTorch publishes CUDA-enabled wheels on PyPI, so a plain `uv add`
gets you GPU support on Linux without any extra configuration:

```bash
uv add torch torchvision
```

That's it for GPUs with compute capability 7.5 and above (Turing
onward). The default wheel bundles the latest CUDA runtime PyTorch
supports.

### Pinning a specific CUDA version

If you need V100 support or need to interoperate with other compiled
CUDA code, configure a PyTorch index explicitly in your `pyproject.toml`.
For V100 GPUs, use the `cu126` index (the last version to support CC 7.0):

```toml
[[tool.uv.index]]
name = "pytorch-cu126"
url = "https://download.pytorch.org/whl/cu126"
explicit = true

[tool.uv.sources]
torch = [{ index = "pytorch-cu126" }]
torchvision = [{ index = "pytorch-cu126" }]
```

For other cases where you want a specific CUDA version:

```toml
[[tool.uv.index]]
name = "pytorch-cu130"
url = "https://download.pytorch.org/whl/cu130"
explicit = true

[tool.uv.sources]
torch = [{ index = "pytorch-cu130" }]
torchvision = [{ index = "pytorch-cu130" }]
```

Setting `explicit = true` means only packages that you explicitly
assign to this index will be fetched from it; everything else comes
from PyPI as usual.

If you change the CUDA index URL later, re-resolve your dependencies
with:

```bash
uv lock --upgrade-package torch
```

!!! tip "Using `uv pip` instead of a project?"
    If you're installing into a virtual environment without a
    `pyproject.toml`, `uv pip install` supports automatic GPU detection:

    ```bash
    uv pip install torch torchvision --torch-backend=auto
    ```

    Or set `UV_TORCH_BACKEND=auto` in your shell profile to make it the
    default.


## Test your environment

Let's walk through a complete smoke test to verify that PyTorch, CUDA,
and GPU access all work together. This is a good habit any time you set
up a new environment.

**1. Create a project directory and initialize it:**

```bash
mkdir ~/torch-test && cd ~/torch-test
module load uv/latest
uv init
```

**2. Add PyTorch as a dependency:**

```bash
uv add torch
```

**3. Create the smoke test script:**

[Create a file](../../fundamentals/editing.md) called `smoke_test.py` with the following contents:

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
        f" — {props.total_memory / 1024**3:.1f} GB,"
        f" compute capability {props.major}.{props.minor}"
    )

# Quick tensor operation on GPU to verify it actually works
x = torch.randn(1000, 1000, device="cuda")
y = x @ x.T
print(f"\nSmoke test passed: matmul on {x.device} produced shape {y.shape}")
```

**4. Create the job script:**

[Create a file](../../fundamentals/editing.md) called `smoke_test.sh`:

{{ sbatch_template(
    job_name="torch-smoke",
    partition="gpu",
    time="00:05:00",
    cpus=1,
    mem="8G",
    gres="gpu:1  (1)",
    constraint="sm_75  (2)",
    modules=["uv/latest  # (3)!"],
    commands="nvidia-smi  # (4)!\necho '---'\nuv run python smoke_test.py  # (5)!",
    annotations=[
        "Request one GPU. Slurm won't allocate a GPU unless you ask.",
        "Only run on nodes with compute capability ≥ 7.5 (Turing or newer), which the default PyTorch build supports.",
        "Makes `uv` available in the job. Without this, `uv run` will fail. See [Use in a Batch Job](uv.md#6-use-in-a-batch-job).",
        "Prints GPU info so you can confirm which GPU you got.",
        "Runs your script inside the project's virtual environment. `uv run` automatically syncs dependencies before executing.",
    ]
) }}

**5. Submit the job:**

```bash
sbatch smoke_test.sh
```

Check on it with `squeue --me`. When it finishes, look at the
output file (`torch-smoke_<jobid>.out`).

**6. Check the output:**

A successful run should produce something like this:

```
+-----------------------------------------------------------------------------------------+
| NVIDIA-SMI 580.65.06              Driver Version: 580.65.06      CUDA Version: 13.0     |
+-----------------------------------------+------------------------+----------------------+
| GPU  Name                 Persistence-M | Bus-Id          Disp.A | Volatile Uncorr. ECC |
| Fan  Temp   Perf          Pwr:Usage/Cap |           Memory-Usage | GPU-Util  Compute M. |
|                                         |                        |               MIG M. |
|=========================================+========================+======================|
|   0  NVIDIA A100-SXM4-80GB          On |   00000000:18:00.0 Off |                    0 |
| N/A   30C    P0             62W /  400W |       0MiB /  81920MiB |      0%   E. Process |
|                                         |                        |             Disabled |
+-----------------------------------------+------------------------+----------------------+
---
PyTorch version: 2.11.0+cu130
CUDA available:  True
CUDA version:    13.0
cuDNN version:   92000
GPU count:       1
  [0] NVIDIA A100-SXM4-80GB — 79.1 GB, compute capability 8.0

Smoke test passed: matmul on cuda:0 produced shape torch.Size([1000, 1000])
```

The key things to check: `CUDA available: True`, a GPU listed with the
expected compute capability, and a successful matmul at the end.

!!! info "Need a custom CUDA toolkit or other compiled libraries alongside PyTorch?"
    In most cases PyTorch's bundled CUDA libraries are sufficient. If you
    have unusual requirements, such as a specific system CUDA version for
    interoperability with other compiled code, consider using a conda-based
    environment manager or a container-based workflow instead.

## Managing the PyTorch cache

When downloading pre-trained model weights, PyTorch
needs a place to store them. By default, it uses `~/.cache/torch/` in your home
directory.
Your home directory on {{ cluster.name }} has a strict quota, though. Multi-gigabyte
model weights can fill it quickly, causing jobs to
fail with cryptic I/O or out-of-space errors. The fix is to redirect these
caches to [scratch storage](../../fundamentals/storage.md) before your job starts.

Functions like `torch.hub.load()` and the pretrained model APIs in
`torchvision.models` download weights on first use and store them under
`$TORCH_HOME/hub/` (default: `~/.cache/torch/hub/`). A single model can
easily be several gigabytes.

Create a directory on scratch for your PyTorch cache (see the
[storage guide](../../fundamentals/storage.md) for how scratch works on
{{ cluster.name }}), then point `TORCH_HOME` at it:

```bash
mkdir -p /path/to/your/scratch/torch
export TORCH_HOME=/path/to/your/scratch/torch
```

PyTorch reads `TORCH_HOME` at import time, so set this *before* your
Python process starts. You can confirm the active location
from inside Python:

```python
import torch
print(torch.hub.get_dir())  # should show your scratch path
```

### Putting it together in a batch job

Add the `export` line to your job script before calling `uv run`:

{{ sbatch_template(
    job_name="torch-train",
    partition="gpu",
    time="04:00:00",
    cpus=4,
    mem="32G",
    gpus=1,
    constraint="sm_75",
    modules=["uv/latest"],
    commands="export TORCH_HOME=/path/to/your/scratch/torch\n\ncd /path/to/myproject\nuv run python train.py"
) }}

!!! tip "Set cache path in your shell profile"
    To avoid repeating this export in every job script, add it to your
    `~/.bashrc`. It will be inherited by all batch jobs automatically.

## See also

- [Getting Started with uv](uv.md) — The recommended way to manage Python projects on {{ cluster.name }}
