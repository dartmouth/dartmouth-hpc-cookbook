---
title: Unity Open Access & Open Hardware Rates
unsearchable: true
---

{{< callout  caution "This page is institution-specific" >}}
The information below applies to UMass Amherst, UMass Boston, UMass Lowell, and
Mount Holyoke College. For inquiries regarding other institutions, including
UMass Dartmouth and the University of Rhode Island, contact
[your institution's representative]({{< relref "people#point-of-contact" >}}).
{{< /callout >}}

## Standard Unity access and resources

All research groups receive a standard storage allocation and compute access as part of their institution's Unity membership, at no cost to the researcher.

### Standard storage allocations

Each research group receives [access to storage]({{< relref storage >}}), including:
- A 50 GB home directory for each group member.
- 1 TB of high performance work storage, located at `/work/<group name>`.
- Up to 5 TB of project storage, located at `/project/<group name>`.
- Access to temporary, high performance [scratch space]({{< relref "hpc-workspace" >}}).

### Standard compute access

Research groups can use the [general access partitions]({{< relref partitions >}}),
including `cpu`, `cpu-preempt`, `gpu`, and `gpu-preempt`.
Each research group is restricted to using 1000
simultaneous CPU cores or 64 simultaneous GPUs. However, there is no total core-hour or gpu-hour usage cap. At this time, this restriction
does not apply to the preempt partitions. For information about submitting
workloads to compute nodes, see our
[Slurm job scheduler documentation]({{< relref "documentation/jobs" >}}).
Note that availability of resources is subject to cluster load and immediate
access is not guaranteed.

In addition, all Unity users can access the [Unity OnDemand portal]({{< relref "documentation/connecting/ondemand" >}}),
a web-based, graphical interface where users can access graphical applications; like JupyterLab, RStudio, and
Matlab; and a graphical XFCE desktop.

### Research group management

Upon [account creation]({{< relref "getting-access" >}}), we generate a unique
group for each eligible researcher, usually in the form
`pi_<lead researcher's Unity username>`. Group owners can manage access for
an unlimited number of group members, including students and research staff,
through the [Unity portal]({{< param account-base-url >}}).

## Purchasing additional resources

Research groups requiring resources beyond the institution-sponsored resources
can purchase additional compute or storage capacity. If you're unsure whether your project requires or would benefit from purchasing additional resources, please email {{< help-email >}}. For grant submissions,
please email {{< help-email >}} for a copy of our facilities boilerplate.

### Additional storage

Unity provides [two expandable storage platforms]({{< relref storage >}}):
[NESE-hosted `/project` directories]({{< param nese-url >}}) and VAST-based
`/work` directories.

| Platform   | Price per TB per month | Purchase Increment | Minimum Duration | Maximum Duration |
|------------|------------------------|--------------------|------------------|------------------|
| `/project` | $4.71                  | 5 TB               | 1 year           | 5 years          |
| `/work`    | $30.00                 | 1 TB               | 6 months         | 2 years          |

### Priority compute access

Unity provides three avenues for purchasing priority compute: priority compute
core or GPU hours, node leasing, and Unity Open Hardware node purchasing.

#### Priority compute hours

Purchasing priority compute access offers research groups either priority access to
resources or access beyond the group's resource cap.

{{< callout note >}}
Priority access is subject to cluster load and is not equivalent to immediate
or preemptable access.
{{< /callout >}}

| Resource type | Cost per core- or gpu-hour | Notes |
|---------------|----------------------------|-------|
| CPU           | $0.01412                   | 8GB RAM per CPU core |
| GPU           | $0.25 and up               | Cost depends on GPU type, email {{< help-email >}} with inquiries |

#### Node leasing

Research groups can lease nodes from six months to up to five years at a 50%
discount over purchasing priority compute hours. The cost assumes 100% utilization
over the duration of the lease. Research groups leasing nodes get priority
access to leased nodes, subject to a two-hour grace period for preemptable
jobs running on the node.

| Example node type       | Cost per core- or gpu-hour | Cost per year |
|-------------------------|----------------------------|---------------|
| CPU (128 core)          | $0.00706                   | $7,921.66     |
| GPU                     | $0.125 and up              | $1,095 and up |

### Unity Open Hardware purchasing

Research groups with substantial or specific computational needs can also
purchase hardware to add to Unity.
Unity Open Hardware owners get priority access to their hardware. However,
all purchased hardware is added to the `cpu-preempt` or `gpu-preempt` partitions
for use by all Unity users. Priority jobs supersede jobs in the preempt
partitions following a two-hour grace period.

All Open Hardware
purchases must be approved
by the Unity leadership team in advance and are subject to hardware type
restrictions. To discuss a hardware purchase for your research group, contact
{{< help-email >}}.
