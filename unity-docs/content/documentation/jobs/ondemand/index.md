---
title: Unity OnDemand
---
# Submit jobs with Unity OnDemand

[Unity OnDemand]({{< param ood-url >}}) gives you access to Slurm's functionality without any use of the command line, making this method especially convenient for users that have less experience with the command line.

There are three main features of Unity OnDemand job management:

* **The Job Composer**: to customize and schedule batch jobs
* **The Job Templater**: to make templates from jobs and jobs from templates
* **The Active Job Viewer**: to list jobs, kill jobs, and read output files

{{< callout caution >}}
OnDemand does not include a way to view previously submitted jobs. The Active Job Viewer is based off of `squeue`, and a job only stays behind in `squeue` for 5 minutes after it is completed. (as of Jan. 2023)
{{< /callout >}}

## How to access the Job Composer
The Job Composer allows you to customize and schedule batch jobs in Unity OnDemand.

To access the Job Composer, go to [Unity OnDemand's](https://ood.unity.rc.umass.edu/pun/sys/dashboard) top menu and click **Jobs > Job Composer**.

{{< figure src="job-composer-button.png" title="OOD Job Composer button" alt="OnDemand Job Composer button" width="700" >}}

The Job Composer opens. This page includes an interactive guide on how to create, edit, and submit a job using the Job Composer.

{{< figure src="ood-job-composer.png" title="OOD Job Composer" alt="OnDemand Job Composer" width="700" >}}

## How to access the Job Templater
The Job Templater allows you to make templates from jobs, or jobs from templates.

From the Job Composer's top menu, click **Jobs > Templates**.

{{< figure src="job-templates-button.png" title="OOD Job Templates button" alt="OnDemand Job Templates button" >}}

The Job Templater page opens. The Job Templater includes a list of job templates, a job editor, and details about the selected template.

{{< figure src="ood-job-templates.png" title="OOD Job Templates" alt="OnDemand Job Templates" width="700" >}}

{{< callout note >}}
You might notice that the job template descriptions are displayed "literally", with unwanted `<p>` and `<code>` tags. This is a bug in OpenOnDemand and should be patched soon.
{{< /callout >}}

We have a number of job templates at your disposal that you can copy to your home directory and edit as needed. The following sections will guide you through how to copy a job template, create a new job from a job template, and edit a job template that you've already copied.

### Copy a job template to your home directory
1. To copy a job template to your home directory, select the desired template.

2. Click **Copy Template**. A form appears that allows you to change the **Path**, **Name**, **Cluster**, and **Notes** for the job template. 
3. Click **Save**. A copy of the selected template appears in the list with a **Source** of **My Templates** instead of System Templates.

### Create a new job from a job template
1. To create a new job from a job template, select the desired job template.

2. In the form labeled **Create New "[Job template name]"**, edit the **Job Name**, **Cluster**, or **Script Name** as needed.
3. Click **Create New Job**.

### Edit a job template that you've already copied
1. To edit a job template that you've already copied to your home directory, select the copied job template.

2. Click **View Files**.
3. Edit your job as needed.
4. Click **Create New Job**.

## How to access the Active Job Viewer
The Active Jobs page allows you to view information on your jobs, view the output files from your jobs, and kill your jobs. 

To open the Active Job Viewer, click `Jobs > Active Jobs` from [Unity OnDemand's](https://ood.unity.rc.umass.edu/pun/sys/dashboard) top menu.

{{< figure src="ood-active-jobs-button.png" title="OOD Active Jobs button" alt="OnDemand Active Jobs button" width="700" >}}

The Active Jobs page opens.

{{< figure src="ood-active-jobs.png" title="OOD Active Jobs" alt="OnDemand Active Jobs list" width="700" >}}
