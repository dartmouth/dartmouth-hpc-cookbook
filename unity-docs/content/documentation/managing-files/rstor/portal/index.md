---
title: The Allocation Portal
---
# The Allocation Portal

Visit the Allocation Portal at [{{< param allocation-url >}}]({{< param allocation-url >}}).

This document provides an overview of the Allocation Portal, including its primary features, common use cases, and key concepts such as **resources**, **projects**, and **allocations**. It also explains how the **Allocation Portal** relates to the Unity HPC **Account Portal**.

The **Allocation Portal** is powered by an open-source product called [Coldfront](https://coldfront.dev).
For more detailed technical information, refer to the [Coldfront documentation](https://docs.coldfront.dev).

## Features and Use Cases
The Allocation Portal is a **resource allocation management system**.
At Unity HPC, we use it to keep track of agreements such as:
* "We rent 100TB of fast storage to Alice"
* "We rent 200TB of slow storage to Bob"
* "One of our compute nodes was purchased by Charlie, so he gets priority access to it"

A resource allocation management system stores this information in a database and provides tools to manage it efficiently.

Instead of contacting Unity staff via Slack or email when you need a new allocation, you can submit a request directly through the Allocation Portal.
Once approved and the allocation is active, you can manage that allocation yourself at any time.
You can take actions such as:
* Add or remove users
* Promote another user to *manager* so they can make changes on your behalf

These actions do not require Unity staff intervention.

## Projects, Resources, and Allocations
To understand how projects, resources, and allocations fit together, consider this example:

*You are a professor in the UMass Amherst College of Information and Computer Sciences researching novel machine learning models.
You'd like to take advantage of large datasets available online, but your personal computer doesn't have enough storage.
You contact the Unity HPC staff and request space on the [RStor Research Storage System]({{< relref "documentation/managing-files/rstor" >}}).
Unity staff approve 100 terabytes of storage for some price per year.*

In this scenario:
* **Project**: Your machine learning research
* **Resource**: RStor
* **Allocation**: 100 TB of RStor assigned to your project

### Projects
A **project** is owned by exactly one PI, but one PI can have multiple projects.

For most users, we recommend just having one project for all of your research activities.
However, there are some cases where it might make sense to create multiple projects, such as:
* Providing access to students in a course you are teaching
* Collaborating with PIs from other institutions
* Compartmentalizing between different funding sources, so you don't accidentally spend money from grant A when doing work for grant B

### Resources
As of the Allocation Portal's initial launch, the only available resource is the [RStor Research Storage System]({{< relref "documentation/managing-files/rstor" >}}).
We plan to include other resources in the future, such as:
* VAST and NESE storage systems
* Compute clusters like Unity and Harmony
* Priority access to specific nodes within those compute clusters

### Allocations
An **allocation** is a specific quantity of a resource (storage, compute access, etc.) assigned to a project, with a defined expiration date.
Each allocation belongs to exactly one project, though one project can have multiple allocations.

## Relationship to the Account Portal
The [Unity HPC Platform Account Portal]({{< param account-url >}}) (formerly the "Unity web portal") currently has some overlapping functionality with the Allocation Portal, which may cause some confusion.
Both portals allow a PI to manage a list of associated users who have access to some Unity HPC Platform service.
* In the **Account Portal**, this access applies specifically to the **Unity batch cluster**.
* In the **Allocation Portal**, this access applies to some **resource**, which could be storage systems, compute systems, and more.

Over time, access to the Unity batch cluster will be managed as a resource within the Allocation Portal just like RStor, and the user-group management will be removed from the Account Portal.
