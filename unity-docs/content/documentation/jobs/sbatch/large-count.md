---
title: Large Job Counts
---

# Large job counts #

There are many situations where it is necessary to submit a large number of jobs. These jobs are usually not dependent on one another, but may run more efficiently if they are submitted all at once.

Some situations that may require you to modify the submission style for a larger job count include:

- Repeated runs of the same model
- A similar simulation being run with a series of different initial values
- Simulations being run with a series of different input files
- A series of simulations to be run on the same set of data

Currently, the **maximum number of jobs you can submit at one time is 2000 per user**. The **maximum number of jobs that can be running at one time is 1000 per user**. 

If your simulations can be completed in **2000 or fewer jobs**, it is possible to let standard job scripts handle submission. However, we recommended to use **array jobs** instead. The main benefit of array jobs is that each job is recorded as only one job in slurm, and each array job allows for up to 1900 jobs to be created.

For tips on using arrays to maximize efficiency, see the [array job]({{< relref "arrays">}}) documentation page.