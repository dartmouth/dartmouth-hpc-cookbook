---
title: NVLink and NVSwitch
blurb: >
    Explains NVLink and NVSwitch
icon: work
weight: 40
---

# NVLink and NVSwitch
NVIDIA GPUs can be linked together in either pairs with NVLink, or larger groups using an NVSwitch configuration. This allows the data between the GPUs to be copied between the devices quicker than the system bus. Note that code must be written to specifically make use of this connection and that there is no simple way to make the two cards act as a single card.

# Use NVLink with PyTorch
PyTorch has built-in support for using NVlink if you tell it to use the `nccl` for the `torch.distributed` backend. You must use the `nccl` backend if you're targeting the "superpod" nodes with this feature in order to make use of the fast interconnect between the nodes.

# Request nodes
In Unity, only the nodes with the following types of GPUs have NVLink or NVSwitch available:
- v100
- a40
- a100
- h100

Not all of the `v100` nodes have NVLink, and those that do are inconsistent in their layout.  The scheduler does not provide a way to request GPUs linked wih NVLink, so you need to use `--exclusive` to get an entire node, and then use the topology if it's found.

The `a40` nodes have GPUs linked in pairs. Since there is no way to ensure a pair, the best option is to use `--exclusive` and use the topology as discovered.

The `a100` nodes, with the exception of the `ece-gpu` nodes and `uri-gpu[015-017]`, have NVSwitch, so all the GPUs are linked to each other at the same speed (NV4 for 4x nodes, and NV12 for 8x nodes). Additionally `gpu[013-024]` are connected with Infiniband (low-latency networking) so that cards across multiple nodes can talk with minimal latency.
