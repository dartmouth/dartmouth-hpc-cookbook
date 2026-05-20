---
title: "{{ institution.short_name }} HPC Cookbook"
description: "Practical recipes for High-Performance Computing at {{ institution.short_name }}"
---

# {{ institution.short_name }} HPC Cookbook

Welcome to the **{{ institution.short_name }} HPC Cookbook** — a practical guide to using {{ institution.short_name }}'s High-Performance Computing resources. Whether you're submitting your first batch job or scaling a deep learning pipeline across multiple GPUs, you'll find what you need here.

!!! warning "What is this?"
     This "cookbook" is first and foremost a learning resource, not the official documentation for {{ institution.name }}'s HPC systems. While there is significant overlap, this cookbook is opinionated and selective in how it presents information and the available options and concepts. The goal is to offer you an engaging and scaffolded learning path, not full coverage of everything {{ institution.name }} has to offer. For the official documentation, please visit [{{ institution.support_url }}]({{ institution.support_url }}).


---

<div class="grid cards" markdown>


-   :material-rocket-launch:{ .lg .middle } **Getting Started**

    ---

    New to HPC? Start here. Get an account, connect to the cluster, and submit your first job in under 30 minutes.

    [:octicons-arrow-right-24: Get started](../getting-started/what-is-hpc.md)

-   :material-book-open-variant:{ .lg .middle } **Fundamentals**

    ---

    Build a solid foundation with Linux basics, Slurm concepts, environment modules, and storage management.

    [:octicons-arrow-right-24: Learn the basics](../fundamentals/index.md)

-   :material-chef-hat:{ .lg .middle } **Recipes**

    ---

    Task-oriented guides for Python, R, containers, GPU workloads, and common job patterns.

    [:octicons-arrow-right-24: Browse recipes](../recipes/index.md)

-   :material-server:{ .lg .middle } **Cluster Reference**

    ---

    Hardware specs, partition details, software modules, and the Slurm cheat sheet.

    [:octicons-arrow-right-24: Reference](../reference/index.md)

</div>

---

## How to Use This Cookbook

This site is organized into two main tracks:

**If you're new to HPC**, start with [Getting Started](../getting-started/index.md) and work through the [Fundamentals](../fundamentals/index.md) section in order. These will give you the basic knowledge you need.

**If you know the basics and need to get something done**, jump straight to [Recipes](../recipes/index.md). Each recipe is self-contained with copy-pasteable scripts and explanations.

!!! tip "Look for the copy button"
    Every code block on this site has a :material-content-copy: button in the top-right corner. Use it to copy commands and scripts directly into your terminal.

---


*Last built: {{ last_updated() }}*

{% include "site/footer.md" %}