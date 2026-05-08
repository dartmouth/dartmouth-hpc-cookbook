---
title: About
menu: main
weight: 5
blurb: >
    Learn about the Unity platform and meet the executive, administrative,
    and facilitation teams
icon: groups
draft: false
---

Unity is a collaborative research computing platform with a variety of member
institutions. If you have questions about Unity services and your specific
institution, please see our [point of contact list]({{< relref "people#point-of-contact" >}}).

{{< iconcard "groups" "People" >}}
Unity is supported by an
[interdisciplinary and multi-institutional team]({{< relref "people" >}})
of systems administrators, research computing facilitators, and institutional
representatives.

[The systems administration team]({{< relref "people#sysadmin" >}}) manages the hardware, networking, software,
and services that form Unity. Our sysadmins are responsible for
hundreds of [compute nodes]({{< relref "nodes" >}}), petabytes of
[storage]({{< relref "storage" >}}), services like our
[Open OnDemand deployment]({{< relref "documentation/connecting/ondemand" >}}) and
[Unity portal]({{< param account-base-url >}}), and making it all work seamlessly
together for a great user experience.

[The facilitation team]({{< relref "people#facilitation" >}}) assists Unity users with deploying their workloads onto Unity and advising on workflow optimization, software tuning, and technical issues. In addition, the facilitation team provides [HPC workshops]({{< relref "events" >}}) and manages an [active Slack for the Unity Community]({{< relref "community" >}}). For groups needing mid to long term project support, facilitator time is available on an hourly basis. For help, [contact us]({{< relref "contact" >}}).
{{< /iconcard >}}

{{< iconcard "dns" "Compute resources" >}}
As of late 2024, Unity is an over 25,000 core cluster based on Ubuntu 24.04 LTS and Slurm with a heterogeneous network containing ethernet and IB linked compute nodes. Unity hosts a variety of compute node architectures. The majority of compute nodes are Intel or AMD x86-64 nodes, with a small number of ARM and Power9 nodes to supplement. Additionally, Unity contains ~1300 Nvidia GPUs, including over 100 A100, L40S, and V100 GPUs. Visit the [node list]({{< relref "nodes" >}}) for a complete description of Unity's compute nodes.
{{< /iconcard >}}

{{< iconcard "save" "Storage resources" >}}
Unity contains 1.5 PB high performance VAST, for home, work, and scratch directories, and 2 PB storage from the [New England Storage Exchange (NESE)](https://nese.mghpcc.org/), a regionally managed Ceph cluster located at the same data center as Unity, the[ Massachusetts Green High Performance Computing Center (MGHPCC)](https://www.mghpcc.org/).
We have a variety of [storage options]({{< relref "storage" >}}) that suit different
performance and size needs.
{{< /iconcard >}}

{{< iconcard "sell" "Purchasing" >}}
Research groups with compute or storage needs beyond the basic Unity access
provided by their institution can contact their
[institution's point of contact]({{< relref "people#point-of-contact" >}}),
our help desk at [{{< param help-email >}}](mailto:{{< param help-email >}}),
or, for institution-level inquiries, [Tom Bernardin](mailto:tbernard@umass.edu).
Hardware purchases must be approved by the Unity team prior to purchase.
{{< /iconcard >}}

{{< iconcard "news" "Grant information" >}}
Unity resources and purchases can be written into grants. We provide a [Unity NSF boilerplate document]({{< relref "boilerplate" >}}) to simplify the grant writing process. Contact
[{{< param help-email >}}](mailto:{{< param help-email >}}) to discuss your
grant requirements.
{{< /iconcard >}}

{{< iconcard "gavel" "Acceptable Use Policy" >}}
Unity's [Acceptable Use Policy]({{< relref "terms-of-service.md" >}}) provide the terms under which Unity may be accessed and used. All use of Unity must adhere to these guidelines to help ensure fair and equitable access. If you have any questions, reach out to {{< help-email >}}.
{{< /iconcard >}}

{{< iconcard "security" "Security statement" >}}
Unity's [Security Statement]({{< relref "security.md" >}}) provides information on the security of the Unity platform. For any further questions or concerns, reach out to {{< help-email >}}.
{{< /iconcard >}}
