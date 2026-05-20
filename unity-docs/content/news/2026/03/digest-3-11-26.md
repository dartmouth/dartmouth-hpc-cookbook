---
title: "Unity Digest 3/11/26"
published: "2026-03-11T10:30:00-04:00"
author: lauren
draft: false
---
Hi Unity Users! This week’s digest includes new documentation, important information about job submissions, and a reminder about upcoming events.
<!--more-->

## 🚨 Important: Specify number of nodes or add MPI constraint when requesting more than one GPU

Starting this week, you will need to explicitly **specify the number of nodes or add the MPI constraint** when requesting more than one GPU in your job submission. To do this, either specify `--nodes=<number>` or `--constraint=mpi` when submitting your job. If you don’t include one of these options, your job will return an error message.

## 💡New documentation on installing PyTorch

We’ve added a new guide on [how to install PyTorch on Unity]({{< relref "documentation/tools/pytorch/index.md">}}), under the [Tools & Software]({{< relref "documentation/tools/index.md">}}) section of our documentation.

## 📩 Reminders About Upcoming Events
* **University of Rhode Island’s [Artificial Intelligence (URI AI) Lab](https://events.uri.edu/group/ai) Spring 2026 Workshops**: Visit our [News page]({{< relref "news/2026/01/uri-spring-26-workshops.md">}}) to see the full schedule and click the Zoom links to register in advance.
* [Quantum Algorithms for Engineers and Scientists](https://events.uri.edu/event/quantum-algorithms-for-engineers-and-scientist): New URI-hosted workshop that will introduce quantum computing and quantum algorithms for a general audience. Weekly on **Fridays, starting on January 30, from 12:30 - 2:00pm**. See details and register in advance on the [Event page](https://events.uri.edu/event/quantum-algorithms-for-engineers-and-scientist).
