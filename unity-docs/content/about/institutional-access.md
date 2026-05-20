---
title: Open Access for Academic Institutions
unsearchable: true
---

The Unity HPC and AI Platform is available to academic institutions through our
Unity Open Access program. Academic institutions lease CPU, GPU, and storage
resources on an annual basis and make those available to their users.

## Rates

The table below reflects standard annual Unity node configurations and rates.
Specialized hardware (for example, high memory nodes, non-x86_64 architectures,
or particular GPUs) is available. Please inquire for more information at
{{< help-email >}}.

| **Resource**                               | **Annual Rate** |
| ------------------------------------------ | --------------: |
| 128 Core Compute Node (1T RAM, InfiniBand) |      $11,848.83 |
| GPUs (A40)\*                               |       $3,951.70 |
| `/work` storage per TB                     |         $345.42 |
| `/project` storage per TB                  |          $56.55 |

\* Other GPU pricing available upon request, email {{< help-email >}} for
information.
{.italic .text-sm}

Unity provides [two expandable storage platforms]({{< relref storage >}}):
`/project` directories (intended for storage and not to be used for running
jobs) and VAST-based `/work` directories (intended for active data).

## Access

Our systems administrators work with institutions to determine appropriate
access policies for their affiliated researchers.

## Support

Rates include Tier 1 and Tier 2 support. Tier 1 support includes access to
email-based ticketing and [the Unity User Community
Slack]({{< relref community>}}) support. Tier 2 support includes modest
individualized consultations with researchers as needed. Tier 3 support is
available on an hourly basis for research groups needing in-depth consultation
and development services.

## Standard resource allocations

Research groups at partner institutions receive a standard storage allocation
and compute access, as part of their institution's Unity membership.

### Standard storage allocations

Each research group receives [access to storage]({{< relref storage >}}),
including:

- A 50 GB home directory for each group member.
- 1 TB of high performance work storage, located at `/work/<group name>`.
- Up to 5 TB of project storage, located at `/project/<group name>`.
- Access to temporary, high performance [scratch
  space]({{< relref "hpc-workspace" >}}).

### Standard compute access

Research groups can use the [general access partitions]({{< relref partitions>}}),
including `cpu`, `cpu-preempt`, `gpu`, and `gpu-preempt`. Each research
group is restricted to using 1000 simultaneous CPU cores or 64 simultaneous
GPUs.  However, there is no total core-hour or gpu-hour usage cap. At this time,
this restriction does not apply to the preempt partitions. For information about
submitting workloads to compute nodes, see our [Slurm job scheduler
documentation]({{< relref "documentation/jobs" >}}). Note that availability of
resources is subject to cluster load and immediate access is not guaranteed.

In addition, all Unity users can access the [Unity OnDemand
portal]({{< relref "documentation/connecting/ondemand" >}}), a web-based,
graphical interface where users can access graphical applications; like
JupyterLab, RStudio, and Matlab; and a graphical XFCE desktop.

### Research group management

Upon [account creation]({{< relref "getting-access" >}}), we generate a unique
group for each eligible researcher, usually in the form
`pi_<lead researcher's Unity username>`. Group owners can manage access for an
unlimited number of group members, including students and research staff,
through the [Unity portal]({{< param account-base-url >}}).

### Grant and startup funded hardware

Individual research groups can add grant- and startup-funded hardware to Unity
at cost, with no additional maintenance fees. The total amount of such hardware
at a partnering institution is limited to 25% of the fully funded institutional
commitment.

Hardware owners get priority access to their hardware. However, all purchased
hardware is added to the `cpu-preempt` or `gpu-preempt` partitions for use by
all Unity users. Priority jobs supersede jobs in the preempt partitions
following a two-hour grace period.

Hardware additions must be approved by the Unity leadership team in advance and
are subject to hardware type restrictions. To discuss a hardware purchase for
your research group, contact {{< help-email >}}.
