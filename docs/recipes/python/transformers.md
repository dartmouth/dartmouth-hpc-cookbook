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
    from your home directory (the biggest footgun), and run multi-GPU inference
    with `device_map="auto"` in a batch job.

The HuggingFace ecosystem is built on top of PyTorch, so this recipe
assumes you have already followed the [PyTorch recipe](pytorch.md) to set
up a `uv` project with GPU-enabled PyTorch. The steps here add
`transformers` and `accelerate` on top of that foundation.

## Step 1: Install `transformers` and `accelerate`

!!! tip "Starting a brand new project?"
    If you haven't set up a project yet, follow [Getting Started with uv](uv.md)
    first, then the [PyTorch recipe](pytorch.md) to get GPU-enabled PyTorch,
    then come back here.

From inside your existing `uv` project:

```bash
uv add transformers accelerate
```

[`accelerate`](https://huggingface.co/docs/accelerate) is a companion library
that handles the low-level work of distributing a model across multiple devices.
It is required for `device_map="auto"` (covered below) and is generally useful
for any multi-GPU or mixed-precision workflow, so it is worth installing from
the start.



## Step 2: Manage the HuggingFace Hub Cache

This is the most important thing to get right on a shared cluster.

When `transformers` downloads a model for the first time, it saves the weights
to `~/.cache/huggingface/hub/` by default. A single large language model can
easily be 10–70 GB. Your home directory on {{ cluster.name }} has a strict
quota, so a single download can fill it completely, causing jobs to fail with
cryptic I/O errors or out-of-space messages.

The fix is to redirect the cache to scratch storage before any Python code runs:

```bash
export HF_HOME={{ storage.scratch_path }}/$USER/huggingface
```

HuggingFace reads `HF_HOME` at import time. Set it *before* your Python
process starts. You can confirm the active location from inside Python:

```python
from huggingface_hub import constants
print(constants.HF_HUB_CACHE)
# should print {{ storage.scratch_path }}/<your_username>/huggingface/hub
```

!!! warning "Set this before every job"
    If you forget to export `HF_HOME`, the download will silently go to your
    home directory instead of scratch. A single missed job can exhaust your
    quota. Adding the export to your `~/.bashrc` means it is inherited
    automatically by all batch jobs. Just remember that scratch may be purged
    periodically — any cached weights will need to be re-downloaded if that
    happens.

### Putting it together in a batch job

{{ sbatch_template(
    job_name="hf-inference",
    partition="gpuq",
    time="00:30:00",
    cpus=4,
    mem="32G",
    gpus=1,
    modules=["uv"],
    commands="export HF_HOME={{ storage.scratch_path }}/$USER/huggingface\n\ncd /path/to/myproject\nuv run python inference.py"
) }}

## Multi-GPU Inference

Cluster GPU partitions can provide more than one GPU per job. Large models
that don't fit in a single GPU's memory — or that benefit from parallelism —
can be spread across multiple devices automatically.

### Single-GPU: using `pipeline()`

For models that fit on one GPU, `pipeline()` is the simplest path:

```python
from transformers import pipeline

classifier = pipeline(
    "text-generation",
    model="google/flan-t5-base",
    device=0,  # (1)!
)
result = classifier("Translate to French: The weather is nice today.")
print(result)
```

1. `device=0` sends the model to the first GPU. Use `device="cpu"` if you
   are testing without a GPU allocation.

### Multi-GPU: using `device_map="auto"`

For large models that exceed a single GPU's memory, `accelerate`'s
`device_map="auto"` automatically partitions the model layers across all
available GPUs (and falls back to CPU or disk for any layers that don't fit):

```python
from transformers import AutoTokenizer, AutoModelForCausalLM

model_id = "google/flan-t5-large"

tokenizer = AutoTokenizer.from_pretrained(model_id)
model = AutoModelForCausalLM.from_pretrained(
    model_id,
    device_map="auto",  # (1)!
)

inputs = tokenizer("Translate to French: The weather is nice today.", return_tensors="pt")
inputs = {k: v.to(model.device) for k, v in inputs.items()}  # (2)!
outputs = model.generate(**inputs, max_new_tokens=50)
print(tokenizer.decode(outputs[0], skip_special_tokens=True))
```

1. `device_map="auto"` requires `accelerate` to be installed. It inspects
   all visible GPUs and CPU memory, then assigns each layer to a device to
   minimize transfers. With two 32 GB GPUs and a 60 GB model, it will split
   the model roughly in half automatically.
2. When using `device_map`, the model has no single `.device`; use
   `model.device` to get the device of the first parameter, which is where
   you should send input tensors.

!!! warning "Request as many GPUs as your `device_map` needs"
    `device_map="auto"` will only see the GPUs that Slurm has allocated to
    your job (via `--gres=gpu:N`). If you request fewer GPUs than the model
    needs to fit entirely in GPU memory, `accelerate` will spill layers onto
    CPU RAM, which is drastically slower. Always match your `--gres` request
    to the model's actual memory footprint.

    A rough rule of thumb: a model with *B* billion parameters needs roughly
    *2·B* GB in 16-bit (fp16/bf16) precision, or *B* GB in 8-bit. Check the
    model card on HuggingFace for specific recommendations.

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

### Multi-GPU smoke test batch job

{{ sbatch_template(
    job_name="hf-multigpu",
    partition="gpuq",
    time="00:10:00",
    cpus=4,
    mem="48G",
    gpus=2,
    modules=["uv"],
    commands="export HF_HOME={{ storage.scratch_path }}/$USER/huggingface\n\nnvidia-smi\necho '---'\ncd /path/to/myproject\nuv run python smoke_test.py"
) }}

Save the following as `smoke_test.py`:

```python
import torch
from transformers import AutoTokenizer, AutoModelForSeq2SeqLM

model_id = "google/flan-t5-base"  # (1)!

print(f"GPUs visible: {torch.cuda.device_count()}")

tokenizer = AutoTokenizer.from_pretrained(model_id)
model = AutoModelForSeq2SeqLM.from_pretrained(model_id, device_map="auto")

# Print which device each part of the model landed on
if hasattr(model, "hf_device_map"):
    for name, device in model.hf_device_map.items():
        print(f"  {name}: {device}")

inputs = tokenizer(
    "Translate to French: The weather is nice today.",
    return_tensors="pt",
).to(model.device)

outputs = model.generate(**inputs, max_new_tokens=50)
result = tokenizer.decode(outputs[0], skip_special_tokens=True)
print(f"\nSmoke test passed: '{result}'")
```

1. `flan-t5-base` is small (~250 MB) and publicly accessible — ideal for
   smoke tests. Swap in your actual model once you have confirmed the
   environment works.

A successful run should produce output along these lines:

```
GPUs visible: 2
  decoder.embed_tokens: 0
  encoder: 0
  decoder: 1
  lm_head: 1

Smoke test passed: 'Le temps est beau aujourd'hui.'
```

## See Also

- [Getting Started with uv](uv.md) — Recommended Python environment manager on {{ cluster.name }}
- [PyTorch with GPU Support](pytorch.md) — Prerequisites: GPU-enabled PyTorch and CUDA index selection
- [HuggingFace `accelerate` docs](https://huggingface.co/docs/accelerate) — Full documentation for `device_map` and distributed training
- [HuggingFace Hub docs](https://huggingface.co/docs/huggingface_hub) — Managing tokens, cache, and model downloads
