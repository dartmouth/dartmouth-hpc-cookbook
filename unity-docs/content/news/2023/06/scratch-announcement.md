---
title: Unity Portal / Login Maintenance 6/30 & Scratch and NCBI Announcements
published: 2023-06-23T12:15:07-0400
author: georgia
---

Happy Friday! We have three announcements today:


## Login Node and OOD Portal Maintenance 


On Friday, June 30, 2023, from 7 am to 9 am EDT, the Unity login nodes, Unity portal, and Open OnDemand portal will be inaccessible for maintenance. No running batch jobs will be affected, but interactive jobs may be disconnected. Open OnDemand jobs are considered “batch” jobs and will be able to be resumed after maintenance, but you will experience some interruption. 


## HPC-Workspace


We’re pleased to announce our new ~400TB scratch system on Unity! Scratch is on storage suitable for job IO and is managed by software called HPC Workspace. With HPC Workspace, you will be able to “check out” a scratch directory and share it with anyone on Unity. Directories can be requested for up to 30 days and can be extended up to 3 times. For more information, see our documentation. Please note that the scratch space is a shared resource. Be mindful of your scratch usage and release directories when you no longer need them. 


## NCBI Datasets


For users that who have been using `/datasets/bio/ncbi-nr` or `/datasets/bio/ncbi-nt`, a new version of these databases will be provided under `/datasets/bio/ncbi-db`, and `$BLASTDB` will point to this directory by the blast-plus module (or you can set it yourself if using your own copy). Please change your scripts to use `-db nr` or `-db nt` as appropriate, instead of specifying the entire path. The old directories will disappear on August 1st.
