---
title: "Unity Digest 1/10/25"
published: "2025-01-10T11:00:00-04:00"
author: lauren
draft: false
---
Hi Unity Users! We hope you had a wonderful holiday and a happy new year! The Unity Digest is back with some updated documentation and key announcements.

## UPDATED DOCS ✏️
- Updated our documentation on [conda environments]({{< relref "documentation/software/conda">}}) to reflect the change in module name

## ANNOUNCEMENTS 📢

### 💡 Unity profile is now available for Nextflow nf-core pipelines
An institutional Unity profile is now available for Nextflow nf-core pipelines ([docs](https://github.com/nf-core/configs/blob/master/docs/unity.md), [config](https://github.com/nf-core/configs/blob/master/conf/unity.config))!

To use it, add the `-profile unity` option to any nf-core pipeline. This allows for each process to be submitted as a slurm job and use `apptainer` for dependency management.

### ⚙️ New GPU and CPU additions
We’ve made some exciting updates to accommodate new CPU and GPU additions as part of the URI expansion:
- **NVIDIA H100**
    - One node with 4x Nvidia H100 (80GB VRAM each) with 1TB of CPU RAM is now in the general `gpu` queue
    - An additional H100 node is available in the `gpu-preempt` queue
    - To access these, use `h100` with `--gpus` or `--constraint`
- **NVIDIA L40s**
    - Eight additional L40s have been added in `gpu-preempt` (note: these are 32-cores)
- **CPUs**
    - Four 64-core, 250GB CPU nodes were added to `cpu`
    - Twelve such nodes added to `cpu-preempt`

### 🏆 Get involved with Harmony!
You might remember that before the holidays, the Unity team received an [NSF grant](https://www.nsf.gov/awardsearch/showAward?AWD_ID=2430001) to add Harmony to the Unity Research Compiting Platform. You can now [read the full article on the Harmony award here](https://www.umass.edu/news/article/research-computing-data-team-umass-amherst-awarded-11-million-design-new-energy).

If you're interested in getting involved — as a student worker, beta tester, or simply to receive updates when deployment is complete — please fill out this form: https://forms.office.com/r/phehJTxHww.

### ❄️ We hope everyone had a wonderful holiday!
The Unity Team has returned to regular help hours.




