---
title: "Transformers & HuggingFace on the Cluster"
description: "How to install Transformers, manage the model cache, and run multi-GPU inference on {{ cluster.name }}"
tags:
  - python
  - transformers
  - gpu
  - huggingface
---

# Transformers & HuggingFace on the Cluster

!!! abstract "What we're cooking"
    How to install [`transformers`](https://huggingface.co/docs/transformers) and
    its companions using [`uv`](uv.md), redirect the HuggingFace Hub cache away
    from your home directory (the biggest footgun), and run a single-GPU and
    multi-GPU inference job.

!!! note "GPU compatibility"
    The default PyTorch wheels require compute capability ≥ 7.5 (Turing or
    newer). If you need to target V100 or older GPUs, see the
    [GPU compatibility table](pytorch.md#step-1-know-your-gpus-compute-capability)
    in the PyTorch recipe first. All the batch jobs on this page include a
    `--constraint=sm_75` flag so Slurm only schedules you on compatible nodes.

## Set up a project with Transformers

This walkthrough starts from scratch. You'll create a project directory,
install PyTorch and Transformers, redirect the model cache, and run a
single-GPU inference job, all step by step.

**1. Create a project directory and initialize it:**

```bash
mkdir ~/hf-test && cd ~/hf-test
module load uv/latest
uv init
```

**2. Add PyTorch, Transformers, and Accelerate:**

```bash
uv add torch transformers accelerate
```

[`accelerate`](https://huggingface.co/docs/accelerate) is a companion library
that handles the low-level work of distributing a model across multiple devices.
It is required for `device_map="auto"` (covered later) and is generally useful
for any multi-GPU or mixed-precision workflow, so it is worth installing from
the start.


**3. Redirect the HuggingFace Hub cache:**

This is the most important thing to get right on a shared cluster.

When `transformers` downloads a model for the first time, it saves the weights
to `~/.cache/huggingface/hub/` by default. A single large language model can
easily be 10–70 GB. Your home directory on {{ cluster.name }} has a strict
quota, so a single download can fill it completely, causing jobs to fail with
cryptic I/O errors or out-of-space messages.

The fix is to redirect the cache to [scratch storage](../../fundamentals/storage.md)
before any Python code runs. Create a directory on scratch for your HuggingFace
cache (see the [storage guide](../../fundamentals/storage.md) for how scratch
works on {{ cluster.name }}), then point `HF_HOME` at it:

```bash
mkdir -p /path/to/your/scratch/huggingface
export HF_HOME=/path/to/your/scratch/huggingface
```

HuggingFace reads `HF_HOME` at import time. Set it *before* your Python
process starts. You can confirm the active location from inside Python:

```python
from huggingface_hub import constants
print(constants.HF_HUB_CACHE)
# should print /path/to/your/scratch/huggingface/hub
```

!!! warning "Set this before every job"
    If you forget to export `HF_HOME`, the download will silently go to your
    home directory instead of scratch. A single missed job can exhaust your
    quota. Adding the export to your `~/.bashrc` means it is inherited
    automatically by all batch jobs. Just remember that scratch may be purged
    periodically; any cached weights will need to be re-downloaded if that
    happens.

**4. Create the inference script:**

[Create a file](../../fundamentals/editing.md) called `inference.py` with the
following contents:

```python
from transformers import T5Tokenizer, T5ForConditionalGeneration

tokenizer = T5Tokenizer.from_pretrained("google/flan-t5-base")   # (1)!
model = T5ForConditionalGeneration.from_pretrained("google/flan-t5-base", device_map="auto")

input_text = "translate English to German: How old are you?"
input_ids = tokenizer(input_text, return_tensors="pt").input_ids.to("cuda")

outputs = model.generate(input_ids)
print(tokenizer.decode(outputs[0]))
```

1. `flan-t5-base` is small (~250 MB) and publicly accessible, ideal for
   a first test. Swap in your actual model once you have confirmed the
   environment works.
2. `device=0` sends the model to the first GPU. Use `device="cpu"` if you
   are testing without a GPU allocation.

**5. Create the job script:**

[Create a file](../../fundamentals/editing.md) called `inference.sh`:

{{ sbatch_template(
    job_name="hf-inference",
    partition="gpu",
    time="00:10:00",
    cpus=1,
    mem="8G",
    gres="gpu:1  (1)",
    constraint="sm_75  (2)",
    modules=["uv/latest  # (3)!"],
    commands="export HF_HOME=/path/to/your/scratch/huggingface  # (4)!\n\nnvidia-smi  # (5)!\necho '---'\nuv run python inference.py  # (6)!",
    annotations=[
        "Request one GPU. Slurm won't allocate a GPU unless you ask.",
        "Only schedule on nodes with compute capability ≥ 7.5 (Turing or newer), which the default PyTorch build requires.",
        "Makes `uv` available in the job. See [Use in a Batch Job](uv.md#6-use-in-a-batch-job).",
        "Set this to your actual scratch path. See Step 3 above.",
        "Prints GPU info so you can confirm which GPU you got.",
        "Runs your script inside the project's virtual environment. `uv run` automatically syncs dependencies before executing.",
    ]
) }}

**6. Submit the job:**

```bash
sbatch inference.sh
```

Check on it with `squeue --me`. When it finishes, look at the output file
(`hf-inference_<jobid>.out`).

**7. Check the output:**

A successful run should produce something like this:

```
<pad> Wie old sind Sie?</s>
```

As in this example, the small model is likely to produce inaccurate outputs.
Larger models generally tend to be more accurate, but fill up your GPUs VRAM
much more quickly.

If you see a `CUDA out of memory` error instead, your model is too large
for a single GPU. The next section covers how to spread it across multiple
devices.

## Multi-GPU inference with `device_map="auto"`

For large models that exceed a single GPU's memory, `accelerate`'s
`device_map="auto"` automatically partitions the model layers across all
available GPUs (and falls back to CPU or disk for any layers that don't fit).

### Choosing the right GPUs for your model

Slurm lets you request a *number* of GPUs (`--gres=gpu:2`), but there is
no way to request GPUs with a minimum amount of VRAM. A job that asks for
two GPUs might land on nodes with 12 GB cards or 80 GB cards, and the
difference matters enormously for large models.

You need to do this math yourself:

1. **Estimate your model's memory footprint.** A rough rule of thumb: a
   model with *B* billion parameters needs roughly *2·B* GB in 16-bit
   (fp16/bf16) precision, or *B* GB in 8-bit quantization. Check the
   model card on HuggingFace for specific recommendations.
2. **Check what GPUs are available.** The [documentation](https://docs.unity.rc.umass.edu/documentation/tools/gpus/)
   lists every GPU generation available on {{ cluster.name }}. You can also run
   `sinfo -p gpu -o "%20N  %30f  %40G"` to see GPU types and counts per node.
3. **Use `--constraint` to target the right hardware.** For example,
   `--constraint=a100` ensures you get A100s (40 or 80 GB each), while
   `--constraint=l40s` targets L40S cards (48 GB each). Without a
   constraint, Slurm may schedule you on any available GPU node.

```bash
#SBATCH --nodes=1            # Keep both GPUs on the same node
#SBATCH --constraint=a100    # Target A100 nodes (40-80 GB VRAM each)
#SBATCH --gres=gpu:2         # Request two of them
```

!!! tip "Targeting a specific generation"
    GPU-specific feature tags like `a100`, `l40s`, or `h100` request a
    particular model. The broader `sm_XX` tags (e.g., `sm_80` for Ampere
    and newer) accept any GPU at or above that compute capability. Run
    `sinfo -o "%N %f" -p gpu` to see which features are available on each
    node.

!!! warning "Match your GPU request to the model"
    `device_map="auto"` will only see the GPUs that Slurm has allocated to
    your job. If you request fewer GPUs than the model needs to fit entirely
    in GPU memory, `accelerate` will spill layers onto CPU RAM, which is
    drastically slower. If you request small GPUs when the model needs large
    ones, you'll hit the same problem. Always match both the *number* and
    *size* of GPUs to your model's actual memory footprint.

Let's verify multi-GPU inference works end to end, using the same project
you set up above.

**1. Create the inference script:**

[Create a file](../../fundamentals/editing.md) called `multi_gpu_inference.py`:

```python
import torch
from transformers import T5Tokenizer, T5ForConditionalGeneration

print(f"GPUs visible: {torch.cuda.device_count()}")

tokenizer = T5Tokenizer.from_pretrained("google/flan-t5-large")  # (1)!
model = T5ForConditionalGeneration.from_pretrained("google/flan-t5-large", device_map="auto")

# Print which device each part of the model landed on
if hasattr(model, "hf_device_map"):
    for name, device in model.hf_device_map.items():
        print(f"  {name}: {device}")

input_text = "translate English to German: How old are you?"
input_ids = tokenizer(input_text, return_tensors="pt").input_ids.to("cuda")

outputs = model.generate(input_ids)
print(tokenizer.decode(outputs[0]))
```

1. `flan-t5-large` (~3 GB) is large enough to demonstrate multi-GPU
   splitting while still being publicly accessible and quick to download.
   Swap in your actual model once you have confirmed the environment works.

**2. Create the job script:**

[Create a file](../../fundamentals/editing.md) called `multi_gpu_inference.sh`:

{{ sbatch_template(
    job_name="hf-multigpu",
    partition="gpu",
    time="00:10:00",
    nodes="1  (1)",
    cpus=4,
    mem="48G",
    gres="gpu:2  (2)",
    constraint="sm_75  (3)",
    modules=["uv/latest  # (4)!"],
    commands="export HF_HOME=/path/to/your/scratch/huggingface  # (5)!\n\nnvidia-smi  # (6)!\necho '---'\nuv run python multi_gpu_inference.py",
    annotations=[
        "On {{ cluster.name }}, you have to be explicit about the number of nodes when requesting more than one GPU.",
        "Request two GPUs for multi-device inference.",
        "Turing (7.5) or newer. See the [PyTorch GPU table](pytorch.md#step-1-know-your-gpus-compute-capability).",
        "Makes `uv` available in the job. See [Use in a Batch Job](uv.md#6-use-in-a-batch-job).",
        "Set this to your actual scratch path. See Step 3 in [Set up a project](#set-up-a-project-with-transformers) above.",
        "Prints GPU info so you can confirm which devices you got.",
    ]
) }}

**3. Submit the job:**

```bash
sbatch multi_gpu_inference.sh
```

Check on it with `squeue --me`. When it finishes, look at the output file
(`hf-multigpu_<jobid>.out`).

**4. Check the output:**

A successful run should produce something like this:

```bash
GPUs visible: 2
  shared: 0  # (1)
  decoder.embed_tokens: 0
  encoder: 0
  lm_head: 0
  decoder.block.0: 0
  decoder.block.1: 1 # (2)
  # [...]
<pad> Wie alt sind Sie?</s>
```

1. Listing all layers on device number `0`
2. These layers are moved to device number `1`

The key things to check: two GPUs visible, model layers split across
devices, and a successful translation at the end. Note that with the
larger model the translation is more likely to be correct now!

!!! tip "Gated models require a token"
    Some models (like Meta's Llama family) require you to accept a license
    agreement on HuggingFace and authenticate with a personal access token.
    Set it once in your environment:

    ```bash
    export HF_TOKEN=hf_...
    ```

    Or log in interactively before submitting batch jobs:

    ```bash
    uv run huggingface-cli login
    ```

    The token is cached in `$HF_HOME/token`, so it carries over to batch jobs
    as long as `HF_HOME` points to the same location.

## See also

- [Getting Started with uv](uv.md) — Recommended Python environment manager on {{ cluster.name }}
- [PyTorch with GPU Support](pytorch.md) — Prerequisites: GPU-enabled PyTorch, CUDA index selection, and GPU compatibility table
- [Multi-GPU Training with PyTorch](multi-gpu.md) — Distributed training with `torchrun` and DDP
- [HuggingFace `accelerate` docs](https://huggingface.co/docs/accelerate) — Full documentation for `device_map` and distributed training
- [HuggingFace Hub docs](https://huggingface.co/docs/huggingface_hub) — Managing tokens, cache, and model downloads
