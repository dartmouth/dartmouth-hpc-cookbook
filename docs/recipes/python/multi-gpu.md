---
title: "Multi-GPU and Multi-Node Training"
description: "Scale PyTorch training across multiple GPUs and nodes on {{ cluster.name }} using DDP, Accelerate, and FSDP"
tags:
  - python
  - pytorch
  - gpu
  - distributed
---

# Multi-GPU and Multi-Node Training

!!! abstract "What we're cooking"
    How to scale PyTorch training beyond a single GPU on {{ cluster.name }}:
    when it's actually worth the extra complexity, how Distributed Data Parallel
    (DDP) works, and how HuggingFace Accelerate makes it dramatically simpler.
    We also cover FSDP and DeepSpeed for when your model doesn't fit in one
    GPU's memory.

This recipe builds on the [PyTorch recipe](pytorch.md). If you haven't set up
a GPU-enabled PyTorch project yet, start there.

---

## Do You Actually Need This?

Multi-GPU training adds real complexity: harder debugging, inter-GPU
communication overhead, trickier batch size math, and Slurm scripts that are
easy to get wrong. Before scaling out, ask:

- **Single GPU is enough?** Many medium-sized models train perfectly well on
  one A100 (80 GB). If your model and a reasonable batch fit in VRAM, start
  there.
- **Gradient accumulation first.** If training is slow because you can't use a
  large batch, try gradient accumulation (`loss / accumulation_steps` per
  micro-step) before adding GPUs. It's free and keeps your code simple.
- **Profile before scaling.** A data pipeline bottleneck or inefficient
  attention implementation won't get faster with more GPUs.

Multi-GPU is worth it when:

| Situation | Strategy |
|-----------|-----------|
| Model fits on one GPU but training is slow on large datasets | Data-parallel (DDP) |
| Model weights alone exceed one GPU's VRAM | Model-parallel (FSDP / DeepSpeed) |
| Hyperparameter search across many short runs | Job arrays — see [job arrays](../slurm/job-arrays.md) |

---

## Data Parallel vs. Model Parallel

### Data Parallelism (DDP)

The full model is replicated on **each GPU**. Each GPU processes a different
shard of the batch. After the backward pass, gradients are averaged across all
GPUs (via NCCL all-reduce) before the optimizer step.

- Best for: models that fit on one GPU but training is slow.
- Scaling efficiency is high — communication is a single gradient sync per step.
- PyTorch's `DistributedDataParallel` is the standard implementation.

### Model Parallelism (Tensor / Pipeline)

The model itself is **split across GPUs**. Each GPU holds only a subset of the
parameters.

- Required when: model weights alone exceed one GPU's VRAM.
- More complex to implement; pipeline bubbles and load imbalance are real costs.
- FSDP and DeepSpeed ZeRO automate this — see
  [FSDP and DeepSpeed](#fsdp-and-deepspeed-when-you-need-them) below.

!!! note "What about `device_map=\"auto\"`?"
    `device_map="auto"` from the HuggingFace `transformers` library is
    automatic model parallelism for **inference**. It's covered in the
    [Transformers recipe](transformers.md). It does not support training
    gradients — for training you need DDP, FSDP, or DeepSpeed.

---

## PyTorch DDP

`DistributedDataParallel` is the standard approach for data-parallel training.
It works within a single node (multi-GPU) or across multiple nodes.

### Key Code Pattern

```python
import os
import torch
import torch.distributed as dist
from torch.nn.parallel import DistributedDataParallel as DDP
from torch.utils.data import DataLoader, DistributedSampler

def main():
    # torchrun sets these environment variables automatically
    dist.init_process_group(backend="nccl")
    local_rank = int(os.environ["LOCAL_RANK"])
    torch.cuda.set_device(local_rank)

    # Wrap model in DDP
    model = MyModel().to(local_rank)
    model = DDP(model, device_ids=[local_rank])

    # DistributedSampler ensures each GPU sees a unique data shard
    sampler = DistributedSampler(dataset)
    loader = DataLoader(dataset, batch_size=32, sampler=sampler)

    for epoch in range(num_epochs):
        sampler.set_epoch(epoch)  # shuffle differently each epoch
        for batch in loader:
            ...

    dist.destroy_process_group()

if __name__ == "__main__":
    main()
```

The key ingredients are:

1. [`dist.init_process_group(backend="nccl")`](https://pytorch.org/docs/stable/distributed.html) — initializes the communication backend. NCCL is the right choice for GPU-to-GPU.
2. `DDP(model, device_ids=[local_rank])` — wraps the model so gradients are automatically synchronized.
3. `DistributedSampler` — partitions the dataset across workers so no two GPUs see the same samples. **Without this, all GPUs train on identical data.**

### Launching with `torchrun`

`torchrun` is the modern launcher (replaces the deprecated
`torch.distributed.launch`). It sets `LOCAL_RANK`, `RANK`, `WORLD_SIZE`, and
`MASTER_ADDR` automatically.

```bash
torchrun --nproc_per_node=$SLURM_GPUS_ON_NODE \
         --nnodes=$SLURM_NNODES \
         --node_rank=$SLURM_NODEID \
         --master_addr=$(scontrol show hostname $SLURM_NODELIST | head -n1) \
         --master_port=29500 \
         train.py
```

### Single-Node Multi-GPU Slurm Script

{{ sbatch_template(
    job_name="ddp_train",
    partition="gpu",
    time="04:00:00",
    nodes=1,
    ntasks_per_node=1,
    cpus=16,
    mem="64G",
    gpus=4,
    commands="torchrun --nproc_per_node=$SLURM_GPUS_ON_NODE train.py"
) }}

### Multi-Node Slurm Script

For multi-node jobs, request one task per node (the task is `torchrun`, which
then spawns one process per GPU on that node):

{{ sbatch_template(
    job_name="ddp_multinode",
    partition="gpu",
    time="08:00:00",
    nodes=2,
    ntasks_per_node=1,
    cpus=16,
    mem="64G",
    gpus=4,
    commands='torchrun \\\n  --nproc_per_node=$SLURM_GPUS_ON_NODE \\\n  --nnodes=$SLURM_NNODES \\\n  --node_rank=$SLURM_NODEID \\\n  --master_addr=$(scontrol show hostname $SLURM_NODELIST | head -n1) \\\n  --master_port=29500 \\\n  train.py'
) }}

!!! tip "Total world size"
    With `--nodes=2 --gres=gpu:4`, your world size is 8. Your effective batch
    size is `per_gpu_batch_size × 8`. Adjust your learning rate accordingly
    (linear scaling rule: `lr × world_size` is a reasonable starting point).

---

## HuggingFace Accelerate

[Accelerate](https://huggingface.co/docs/accelerate) is a thin abstraction
layer that handles DDP, FSDP, and DeepSpeed configuration automatically. It
requires only minimal changes to single-GPU training code and is the
**recommended approach for most users** who don't need low-level DDP control.

### Minimal Code Change

=== "Before (single GPU)"

    ```python
    model = model.to("cuda")
    optimizer = torch.optim.AdamW(model.parameters(), lr=1e-4)

    for batch in dataloader:
        inputs = {k: v.to("cuda") for k, v in batch.items()}
        outputs = model(**inputs)
        loss = outputs.loss
        loss.backward()
        optimizer.step()
        optimizer.zero_grad()
    ```

=== "After (Accelerate, any backend)"

    ```python
    from accelerate import Accelerator

    accelerator = Accelerator()
    model, optimizer, dataloader = accelerator.prepare(
        model, optimizer, dataloader
    )

    for batch in dataloader:
        outputs = model(**batch)  # batch already on the right device
        loss = outputs.loss
        accelerator.backward(loss)  # replaces loss.backward()
        optimizer.step()
        optimizer.zero_grad()
    ```

`accelerator.prepare()` handles device placement, `DistributedSampler` wrapping,
and gradient synchronization. You don't call `dist.init_process_group` or
`DDP()` manually.

### Slurm Script with `accelerate launch`

{{ sbatch_template(
    job_name="accelerate_train",
    partition="gpu",
    time="04:00:00",
    nodes=1,
    ntasks_per_node=1,
    cpus=16,
    mem="64G",
    gpus=4,
    commands="accelerate launch --num_processes $SLURM_GPUS_ON_NODE train.py"
) }}

For multi-node, add `--num_machines $SLURM_NNODES --machine_rank $SLURM_NODEID
--main_process_ip $(scontrol show hostname $SLURM_NODELIST | head -n1)` to the
`accelerate launch` command.

!!! tip "Config file alternative"
    You can also run `accelerate config` once to generate a YAML config, then
    just call `accelerate launch train.py` with no flags. This is cleaner for
    shared codebases where the script shouldn't hardcode the parallelism strategy.

---

## FSDP and DeepSpeed — When You Need Them

When your model is **too large to fit in a single GPU's VRAM** even during
training (weights + gradients + optimizer states can be 4–8× the weights-only
size), you need to shard across GPUs.

**FSDP (Fully Sharded Data Parallel)** — Built into PyTorch. Shards model
parameters, gradients, and optimizer states across all GPUs. Each GPU holds
only a fraction of the model at any time; parameters are gathered on-demand
for forward/backward passes.

**DeepSpeed ZeRO** — Microsoft's library with similar sharding (ZeRO-1/2/3)
plus additional optimizations like CPU offloading and mixed precision. ZeRO-3
approaches FSDP in capability; DeepSpeed also provides kernel fusions that
can improve throughput.

Both are supported as Accelerate backends — you configure them via an
`accelerate config` YAML rather than changing training code:

```yaml
# accelerate_config.yaml (DeepSpeed ZeRO-3 example)
compute_environment: LOCAL_MACHINE
distributed_type: DEEPSPEED
deepspeed_config:
  zero_stage: 3
  offload_optimizer_device: none
  offload_param_device: none
num_processes: 4
```

```bash
accelerate launch --config_file accelerate_config.yaml train.py
```

For a full walkthrough, see the
[Accelerate FSDP docs](https://huggingface.co/docs/accelerate/usage_guides/fsdp)
and [DeepSpeed integration docs](https://huggingface.co/docs/accelerate/usage_guides/deepspeed).

---

## Checking GPU Utilization Across Nodes

After submitting a job, verify that **all** GPUs are actually being used:

```bash
# From inside a running job (add to your script for logging)
srun --ntasks=$SLURM_NNODES --ntasks-per-node=1 nvidia-smi

# After the job completes
sacct -j <JOBID> --format=JobID,Elapsed,NCPUS,NNodes,MaxRSS
```

The most common silent failure in DDP is that **only GPU 0 is doing any
work** — `nvidia-smi` shows GPU 0 at ~100% utilization and all others at ~0%.
This means `dist.init_process_group()` was never called, or your model/data
aren't being moved to the correct `local_rank` device.

Enable NCCL debug output to diagnose communication issues:

```bash
export NCCL_DEBUG=INFO
torchrun ... train.py
```

---

## Common Pitfalls

!!! warning "Forgetting `DistributedSampler`"
    Without `DistributedSampler`, every GPU iterates over the **entire**
    dataset. Your model will still train (gradients are averaged after
    identical forward passes), but you get no data-parallel speedup and your
    effective batch size math will be wrong. Always wrap your `DataLoader`
    dataset with `DistributedSampler` when using DDP directly, or let
    Accelerate's `prepare()` do it for you.

!!! warning "Port conflicts on shared nodes"
    `--master_port=29500` is a fixed default that multiple jobs on the same
    node will fight over. If a job fails immediately with a binding error,
    try a random high port: `--master_port=$((29500 + RANDOM % 1000))`.

!!! warning "NCCL errors and timeouts"
    NCCL errors (`Unhandled system error`, `Connection timed out`) are usually
    network or firewall issues between nodes, not bugs in your code. Run with
    `NCCL_DEBUG=INFO` to see which collective is failing. On {{ cluster.name }},
    use the `gpu` partition for multi-node GPU jobs — nodes in this partition
    are on the high-speed interconnect. Contact
    [{{ institution.support_team }}](mailto:{{ institution.support_email }})
    if errors persist across multiple attempts.

!!! warning "More GPUs than your batch can use"
    If your global batch size divided by world size is less than 1, some
    workers get empty batches and crash. More subtly: if your per-GPU batch
    size drops to 1 or 2, batch normalization statistics become noisy and
    training may destabilize. A minimum of 8–16 samples per GPU is a
    reasonable floor. If you can't afford that batch size, you probably don't
    need that many GPUs.

---

## See Also

- [GPU Computing Fundamentals](../../fundamentals/gpu-computing.md) — GPU
  architecture, VRAM sizing, and choosing the right GPU partition
- [PyTorch Recipe](pytorch.md) — single-GPU setup and CUDA index selection
- [Transformers Recipe](transformers.md) — `device_map="auto"` for multi-GPU
  inference with HuggingFace models
- [Job Arrays](../slurm/job-arrays.md) — embarrassingly parallel hyperparameter
  sweeps without DDP complexity
