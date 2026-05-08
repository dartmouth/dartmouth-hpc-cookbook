---
title: Unity OnDemand
---
# Manage software in Unity OnDemand
**Unity OnDemand** provides **Batch Connect** as a way to run graphical applications. Batch Connect starts your software as a batch job, then connects you to your software through a VNC server. Anything that you could have run with X11 forwarding can now be run much faster and more easily through Batch Connect.

As of May. 2025, Unity OnDemand provides **VSCode, JupyterLab, Matlab, RStudio, Mathematica, and a Virtual Desktop environment,** a general-purpose interactive desktop environment.

## Run software with Batch Connect
The following steps will guide you through how to run software with Batch Connect. 

1. In [Unity OnDemand]({{< param ood-url >}}), click the [My Interactive Sessions]({{< param ood-url >}}pun/sys/dashboard/batch_connect/sessions) icon from the top menu.

    {{< figure src="ood-interactive-sessions-button.png" title="OOD Interactive Sessions button" alt="OOD Interactive Sessions button" >}}

    The **Interactive Sessions** page opens, showing a menu of Interactive Apps and any active sessions that you have.

    {{< figure src="ood-interactive-sessions.png" title="OOD Interactive Sessions" alt="OOD Interactive Sessions" >}}

2. Select an Interactive App from the side menu. A form opens for the app you selected. 
3. Select the resources you would like to schedule (CPU threads, time, GPU's) and leave blank any fields that may be irrelevant to your job.
4. Once you are done filling in the fields, click **Launch**. The **Interactive Sessions** page opens and the job you started is waiting in the queue.

    {{< figure src="ood-session-created.png" title="OOD Batch Connect Job in Queue" alt="OOD Batch Connect Job in Queue" >}}

    Once the job has left the queue, it turns from **Queued** to **Starting** to **Running**, and the **Connect to Jupyter** button appears at the bottom of the job card.

5. Click **Connect to Jupyter** to connect to your job.

    {{< figure src="ood-session-running.png" title="OOD Batch Connect Job Running in Queue" alt="OOD Batch Connect Job Running in Queue" >}}
