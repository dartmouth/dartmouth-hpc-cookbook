---
title: "Unity Digest 1/27/26"
published: "2026-01-27T14:15:00-04:00"
author: lauren
draft: false
---
Hi Unity Users! This week’s digest includes important information about running jobs on Unity and some exciting spring semester opportunities.
<!--more-->

## ⏱️ JupyterLab Sessions: Idle Job Timeout (after 1-2 hours)

To ensure efficient use of shared resources, we will be enabling automatic timeouts for **idle Jupyter Lab sessions**. Sessions that remain inactive for **1-2 hours** will be stopped.

## 🖥️ GPU Jobs: Idle Timeout

We will also begin ending GPU jobs that are not actively using allocated GPU resources for a sustained period of time. This policy applies to jobs using high-memory or high-end GPUs (40+ GB VRAM), including cases where:
- A job is not using any GPU resources
- Only one GPU is being used when multiple GPUs were requested
- A higher-end GPU is requested but not utilized

**Affected GPUs include**: a100, h100, l40s, rtx800, gh200, a4

**For smaller GPUs** where this policy won’t be enforced, we strongly recommend the following best practices to ensure efficient usage:
- For developing/debugging code with LLMs: use smaller models and/or models with low bit quantization, smaller batch sizes, and low numbers of epochs. Switch to better models and larger batch sizes only in batch jobs.
- Use GPU monitoring tools to observe VRAM usage patterns during interactive runs and use that to inform requirements for larger runs.
- Consider using multiple-GPUs per job instead of one larger GPU, or breaking the problem into smaller pieces, if possible.


## 📩 The University of Rhode Island's AI Lab's Spring 2026 Workshops Start This Week!

Starting this week, the University of Rhode Island’s [Artificial Intelligence (URI AI) Lab](https://events.uri.edu/group/ai) invites the Unity community to attend their Spring 2026 Workshops. The URI AI Lab is dedicated to interdisciplinary research and learning in the context of use-inspired AI. The Lab runs workshops on common AI tools and offers consultancy for research and educational projects. Visit our [News page]({{< relref "news/2026/01/uri-spring-26-workshops.md">}})
 to see the full schedule and click the Zoom links to register in advance.

## 🗓️ NEW Weekly Workshop on Quantum Algorithms

As part of the URI AI Lab’s [Spring 2026 Workshops]({{< param docs-url >}}/news/2026/01/uri-spring-26-workshops/), URI is hosting a new weekly workshop called [Quantum Algorithms for Engineers and Scientists](https://events.uri.edu/event/quantum-algorithms-for-engineers-and-scientist) that will introduce quantum computing and quantum algorithms for a general audience.

**Description**: This workshop series will introduce the basics of quantum computation with an information theoretic motivation. With a quick review of the basics of quantum mechanics, we will move to quantum circuits as the programming model for quantum computation. Over the course of the semester, we will cover multiple quantum algorithms beginning with foundational building blocks like phase estimation, QFT and amplitude amplification. Using these fundamental algorithms, we will study algorithms like Grover's search, Shor's algorithm, VQE and QAOA.

The workshop series will take place weekly on **Fridays, starting on January 30, from 12:30 - 2:00pm**. See details and register in advance on the [Event page](https://events.uri.edu/event/quantum-algorithms-for-engineers-and-scientist).

## 🧭 Reminder: Spring Unity Onboarding Session – Feb. 6 at 10:00AM
A reminder to join our facilitators on Friday, February 6, 2026, at 10:00 AM for an introductory session covering SSH access, Slurm job submission, and Unity OnDemand tools like JupyterLab and RStudio. You can see details about the workshop on our [Event page]({{< relref "events/2026/spring-onboarding-26.md">}}) and click the [Zoom link](https://umass-amherst.zoom.us/meeting/register/VNanyJtQRA-sWp-RHCu0fA) to register for the workshop in advance – all Unity users are welcome!
