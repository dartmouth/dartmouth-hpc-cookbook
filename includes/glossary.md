<!-- AUTO-GENERATED from includes/glossary.yml — do not edit by hand -->
*[CI/CD]: Continuous Integration / Continuous Deployment — Automated build, test, and deployment pipelines.
*[compute node]: A node dedicated to running jobs — where your code actually executes.
*[compute nodes]: A node dedicated to running jobs — where your code actually executes.
*[core]: A general-purpose processor. A modern CPU contains many cores, each capable of running work independently. In HPC contexts (and throughout this cookbook), "CPU" and "core" are used interchangeably to mean one unit of processing power. When you request "4 CPUs" for a job, you're asking for 4 cores.
*[cores]: A general-purpose processor. A modern CPU contains many cores, each capable of running work independently. In HPC contexts (and throughout this cookbook), "CPU" and "core" are used interchangeably to mean one unit of processing power. When you request "4 CPUs" for a job, you're asking for 4 cores.
*[CPU]: Central Processing Unit — A general-purpose processor. A modern CPU contains many cores, each capable of running work independently. In HPC contexts (and throughout this cookbook), "CPU" and "core" are used interchangeably to mean one unit of processing power. When you request "4 CPUs" for a job, you're asking for 4 cores.
*[CPUs]: Central Processing Unit — A general-purpose processor. A modern CPU contains many cores, each capable of running work independently. In HPC contexts (and throughout this cookbook), "CPU" and "core" are used interchangeably to mean one unit of processing power. When you request "4 CPUs" for a job, you're asking for 4 cores.
*[CUDA]: Compute Unified Device Architecture — NVIDIA's GPU programming toolkit.
*[distributed memory]: An architecture where many nodes each have private memory, communicating over a high-speed network.
*[GPU]: Graphics Processing Unit — Used for parallel computation and AI/ML.
*[GPUs]: Graphics Processing Unit — Used for parallel computation and AI/ML.
*[HPC]: High-Performance Computing — The practice of aggregating computing power for large-scale workloads.
*[job]: A unit of work that a user submits to a scheduler. A job script specifies what to run and what resources are needed.
*[jobs]: A unit of work that a user submits to a scheduler. A job script specifies what to run and what resources are needed.
*[login node]: The node you connect to via SSH — used for preparing and submitting jobs, not running them.
*[memory]: The fast but volatile working memory (RAM) available to a node, used by running processes to hold data and code while a job executes. Memory is different from storage because it is cleared when power is removed, but is much faster to access for the CPU or GPU.
*[MPI]: Message Passing Interface — Standard for distributed computing across nodes.
*[node]: An individual machine within a cluster. Each node has its own CPUs, memory, and (sometimes) GPUs.
*[nodes]: An individual machine within a cluster. Each node has its own CPUs, memory, and (sometimes) GPUs.
*[OOD]: Open OnDemand — Web portal for cluster access.
*[OOM]: Out of Memory — When a job exceeds its allocated memory.
*[partition]: A logical grouping of nodes, often organized by hardware type or intended use (e.g., standard CPU nodes, GPU nodes).
*[partitions]: A logical grouping of nodes, often organized by hardware type or intended use (e.g., standard CPU nodes, GPU nodes).
*[PBS]: Portable Batch System — A legacy job scheduler (this site uses Slurm).
*[QOS]: Quality of Service — Slurm mechanism for priority and limits.
*[scheduler]: A program that receives job submissions from users, keeps track of the cluster's available resources, and decides when and where each job should run. This site's cluster uses Slurm.
*[shared memory]: An architecture where all processors share a single pool of RAM — like your laptop, but bigger.
*[SIF]: Singularity Image Format — Container image format used by Apptainer.
*[SLURM]: Simple Linux Utility for Resource Management — The job scheduler used on the Discovery cluster.
*[Slurm]: Simple Linux Utility for Resource Management — The job scheduler used on the Discovery cluster.
*[SSH]: Secure Shell — Encrypted protocol for remote access.
*[storage]: The persistent, non-volatile data repositories that jobs read from and write to. This includes parallel file systems (e.g., Lustre, GPFS) shared across many nodes, local scratch disks on individual nodes, and longer-term archives. Unlike memory, storage retains its contents after power is removed.
*[venv]: Python virtual environment — A bundle of Python packages of specific versions.
