---
title: ColabFold and `srun`
published: 2023-06-12T14:22:55-0400
author: georgia
---

We have two announcements today: a clarification on a Slurm change to the srun feature and the details of a workshop about ColabFold on Unity.


## srun inside srun


Our Slurm update changed the behavior of the srun command when used inside an interactive srun session. If you want to use srun to launch tasks in an interactive srun session, launch the “outer” srun with the “--overlap” flag and it should have the same behavior as before.


## Predict protein structures on Unity with Colabfold


Unity facilitator Cecile Cres of the University of Rhode Island will present a workshop on ColabFold. During this workshop, participants will gain experience with protein structure prediction using Colabfold. Talking points will include prediction of single and complex structures, how to request computer resources efficiently and how to interpret the predicted protein models. This workshop will provide direct practical experience by using a Jupyter notebook on the Unity OnDemand interface. This workshop will be held remotely via Zoom. Please register for a Unity account prior to the workshop if you do not already have one at {{< param account-base-url >}}


Date and Time: Friday, June 30, 2023 at 2 pm EDT
Zoom Link: https://umass-amherst.zoom.us/j/94737984998


## Unity User Community

If you haven’t already done so, we encourage you to join our Unity User Community Slack! To join the Unity Slack community, please sign up with your school email here. If you’re unable to register with your school email, please contact hpc@umass.edu with your preferred email address and we’ll send you a direct invite.
