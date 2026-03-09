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
*[GSSAPI]: Generic Security Services Application Program Interface — An authentication mechanism that works with campus credentials (like Kerberos) to enable passwordless logins to HPC systems.
*[GPU]: Graphics Processing Unit — Used for parallel computation and AI/ML.
*[GPUs]: Graphics Processing Unit — Used for parallel computation and AI/ML.
*[HPC]: High-Performance Computing — The practice of aggregating computing power for large-scale workloads.
*[I/O]: Input/Output — Abbreviation for data input and output processes, like reading/writing to a file or database.
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
*[NetID]: A unique campus username assigned to each member of the Dartmouth community, used for authentication across university systems including HPC.
*[QOS]: Quality of Service — Slurm mechanism for priority and limits.
*[quota]: A limit on how much storage space a user or directory can consume. Quotas prevent any one user or program from using more than their fair share of shared storage resources.
*[scheduler]: A program that receives job submissions from users, keeps track of the cluster's available resources, and decides when and where each job should run. This site's cluster uses Slurm.
*[shared memory]: An architecture where all processors share a single pool of RAM, like in a regular laptop computer.
*[SIF]: Singularity Image Format — Container image format used by Apptainer.
*[SLURM]: Simple Linux Utility for Resource Management — The job scheduler used on the Discovery cluster.
*[Slurm]: Simple Linux Utility for Resource Management — The job scheduler used on the Discovery cluster.
*[SSH]: Secure Shell — Encrypted protocol for remote access.
*[scratch]: High-speed temporary storage on the cluster, optimized for the heavy read/write patterns of running jobs. Files on scratch are not backed up and may be purged automatically after a period of inactivity.
*[scratch storage]: High-speed temporary storage on the cluster, optimized for the heavy read/write patterns of running jobs. Files on scratch are not backed up and may be purged automatically after a period of inactivity.
*[storage]: The persistent, non-volatile data repositories that jobs read from and write to. This includes parallel file systems (e.g., Lustre, GPFS) shared across many nodes, local scratch disks on individual nodes, and longer-term archives. Unlike memory, storage retains its contents after power is removed.
*[home directory]: A small, persistent, backed-up personal directory on the cluster (typically accessed as ~). Intended for scripts, configuration files, and small personal files — not for large datasets or heavy job I/O.
*[VPN]: Virtual Private Network — Software that creates a secure, encrypted connection to a campus network from an off-campus location, enabling access to resources that are restricted to on-campus use.
*[venv]: Python virtual environment — A bundle of Python packages of specific versions.
