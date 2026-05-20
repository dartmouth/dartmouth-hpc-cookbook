---
title: "Unity Ubuntu 24.04 Update on 10/22/24"
published: "2024-09-05T12:00:00-04:00"
author: lauren
draft: false
---
**On October 22, 2024, we will be upgrading all Unity servers from the current operating system (OS), Ubuntu 20.04, to the new LTS (long term support) version, 24.04.** This is a critical update to the cluster to ensure continued security and stability. However, an OS update is a significant undertaking and there will be several changes that you should be aware of as a Unity user.

We will be updating this list on this page, so please bookmark for your reference during the update.

## Unity offline time
Unity will be offline for at least 24 hours starting at 6 am Eastern time on October 22, 2024. As with our annual maintenance shutdown, we have placed a cluster-wide reservation to prevent jobs from running into that window. As we approach the 22nd, your jobs may not start if the time limit overlaps with the start of the upgrade.

We encourage users to plan accordingly. Keep in mind that your job will not start if the time limit overlaps the start of maintenance. You can use the `-t` flag with Slurm to set a time limit that shortens your job to fit into the acceptable window. For example, to restrict your job to 2 days and 12 hours, you can add `-t 2-12:00:00`. In addition, you can add `--deadline=2024-10-22` to your job so it will remove itself from the queue if it won’t run in time for the maintenance. We will be purging the queues during maintenance, so anything queued will not run after the reservation is lifted. You will receive a follow up email once Unity is back online and ready for use again.


## Module stack updates
Many Unity modules rely on system software, so we need to rebuild every package in our module stack. However, this presents a significant opportunity for the Unity team to streamline and improve the available Unity modules. Over the next two months, we will be examining the current module layout, measuring module usage, and designing the new stack. **While we aim to make the transition as seamless as possible, it is very likely that your module load commands will need to be updated following the update.** In the coming weeks, we will provide information and test tools on how to update your module loads so that you can get back to your work as quickly as possible following the update.

## Python updates
Ubuntu 24.04 uses Python 3.12.3 by default, while we currently have Python 3.8 as default on Ubuntu 20.04. This update will affect user-installed python packages and venvs that use the default python.

### Backing up environment configurations
This update has the potential to mess up both venvs and conda envs. We strongly recommend saving the configurations of important environments prior to the OS update. You can export environment specifications in this manner:

For [conda environments](https://conda.io/projects/conda/en/latest/user-guide/tasks/manage-environments.html#exporting-an-environment-file-across-platforms):
```
conda env export --from-history > environment.yml
```
For venvs:
```
pip freeze > requirements.txt
```

We will provide guidance on updating environments in the coming weeks.
