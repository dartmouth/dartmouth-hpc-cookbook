---
title: "Unity Community Newsletter: Fall 2023"
published: "2023-10-18T11:23:07-05:00"
author: georgia
draft: false
---

{{< iconcard "mail" "Dear Unity Community" >}}
Welcome to the inaugural issue of the Unity User Community newsletter! In these correspondences, we hope to inform the community about Unity updates and changes, advertise workshops and educational events, and highlight the phenomenal research that relies on Unity for computing resources. 

As we move into the final quarter of 2023, we’re reflecting on where Unity has been and where we hope to go in the future. In the past year, the [Unity team]({{< relref people >}}) has expanded to include five systems administrators and five research computing facilitators from UMass Amherst, University of Rhode Island, and UMass Dartmouth. We’ve welcomed users from UMass Lowell and UMass Boston, along with smaller institutions in our area, onto the system. We now support over 2000 users across 450 research groups. 

Unity itself has grown as quickly as its community. Since November 2022, we’ve added over 15,000 CPUs, 1200 GPUs, and ~100TB of RAM. Unity users have completed jobs totaling over 10,000 years of CPU time. 

Unity’s growth is shaped by the needs and experiences of our users, including you! Your feedback on your Unity experience is invaluable and appreciated. To connect with the Unity team, please consider joining our [Unity Community Slack]({{< relref community >}}) or emailing us at {{< help-email >}}. 

Sincerely,<br>
[Tom Bernardin]({{< relref tom >}})<br>
Director, UMass Amherst Research Computing and Data
{{< /iconcard >}}

## Unity Operating Updates

### Monthly Service Node Maintenance
Beginning November 7, 2023, we are implementing a monthly maintenance window for the Unity service nodes (including login nodes, the portal, and the Open OnDemand server). On the first Tuesday of every month, from 6 am to 7 am Eastern, the Unity login nodes, Open OnDemand server, and web portal may be temporarily inaccessible. This will not affect running batch jobs, but interactive jobs may be interrupted.

### Unity Hardware Upgrades
Exciting changes are in store for Unity! We recently completed a core switch upgrade which significantly expands the Unity network capacity. Over the summer, we upgraded the high-performance VAST storage, which forms the basis for `/work` and `/home` directories, and deployed a [scratch space system]({{< relref "hpc-workspace" >}}). We also recently added twenty CPU nodes (2560 cores), three A40 nodes (4 GPUs each), and two A100 nodes (8 GPUs each) to Unity.

### Upcoming Change: GPU Enforcement and Interactive Job Time Limits
In order to enforce optimal and appropriate use of Unity resources, after **November 7, 2023** jobs submitted to the GPU partitions (`gpu`, `gpu-long`, `gpu-preempt` ) must request at least one GPU. This will help us ensure that GPU partitions are used only for jobs that require GPUs. In addition, we are trialing limiting interactive job sessions to 8 hours. If you are used to long-running interactive sessions and would like help converting your workflow to batch (non-interactive) jobs, please email our facilitation team at {{< help-email >}}.

### Documentation Changes
Unity documentation is getting a refresh! In the next few weeks, the documentation website will be swapped for the new website. In addition to technical documentation, the new website will host news items, events, and tutorials. While the main page link, [{{< param docs-url >}}]({{< relref "/" >}}), will remain operational, any links you've saved to specific pages in the documentation may break due to the change in organizational structure.

## Upcoming Events

### Introduction to Git

Git, a version control software, lets you retain a record of changes throughout the history of your software. Version control is essential for reproducible, traceable science and is useful for any field with a computational component. This workshop will introduce you to the fundamentals of version control with git and how to incorporate version control into your Unity workflow.

**When:** Monday, November 6, 2023 at 2 pm Eastern<br>
**Where:** [Get Zoom details here]({{< relref "events/2023/git-basics" >}}).

### Introduction to Snakemake

Snakemake is a workflow engine for piping data through analysis pipelines. While particularly popular in the bioinformatics community, Snakemake is useful across any field that involves pipelines of data processing and analysis. This workshop will introduce using Snakemake on Unity and demonstrate a workflow on metagenomics data.

**When:** Friday, December 15, 2023 at 1 pm Eastern<br>
**Where:** [Get Zoom details here]({{< relref "events/2023/snakemake" >}}).

### HPC Day at UMass Dartmouth

UMass Dartmouth will be hosting HPC Day 2023 on November 3, 2023. This one-day annual conference brings together researchers in academia and industry to showcase state-of-the-art research involving high performance computing. Talks will feature keynote speakers David Furrer (Pratt & Whitney), George Karniadakis (Brown University), and Carole-Jean Wu (Meta AI / FAIR), in addition to presentations from researchers across a wide range of disciplines. Attendees are invited to bring posters highlighting their own research involving high performance computing. The event is sponsored in part by AMD, Cambridge Computer, Dell, Microway, and Nvidia. For more information and to register, see [the UMass Dartmouth HPC Day website](https://www.cscdr.umassd.edu/externalEvents/HPCDay2023/index.html). Registration is FREE, but due by October 26th. We hope to see you there!

**When:** Friday, November 3, 2023<br>
**Where:** [UMass Dartmouth](https://www.cscdr.umassd.edu/externalEvents/HPCDay2023/index.html).

## Bioinformatics Corner

With the setup of [ColabFold]({{< relref "documentation/tools/colabfold" >}}) over the Summer, Unity now provides a state-of-the-art approach to predict 3D protein structures from amino acid sequences. ColabFold can be launched from a Jupyter notebook via the Open OnDemand interface or with an sbatch script. The Jupyter notebook has been recently updated to include template mode. You can now supply custom templates in CIF format to facilitate prediction of protein structures. [More information about ColabFold on Unity can be found here]({{< relref "documentation/tools/colabfold" >}}).

For biologists working with third-generation sequencing data, you will be happy to know that the basecaller Guppy produced by Oxford Nanopore technologies has been recently installed in addition with Minimap2, a fast sequence aligner for long reads. Guppy and Minimap2 are two programs commonly used in workflows for long-read analysis.

Finally, if your project involves transcriptomics, rnaQUAST, used for assessment of de novo transcriptome assemblies, is now available on Unity.

## Unity in the News

### RI-CHAMP: Revolutionizing Storm Preparedness

The University of Rhode Island based project [RI-CHAMP was recently featured in the MGHPCC news](https://www.mghpcc.org/ri-champ-revolutionizing-storm-preparedness/). The Rhode Island Coastal Hazards, Analysis, Modeling, and Prediction (RI-CHAMP) system uses Unity for real-time hazard and impact predictions for storms that impact the coastal Northeastern United States.
