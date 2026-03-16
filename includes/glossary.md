<!-- AUTO-GENERATED from includes/glossary.yml — do not edit by hand -->
*[CI/CD]: Continuous Integration / Continuous Deployment — Automated build, test, and deployment pipelines.
*[compute node]: A node dedicated to running jobs — where your code actually executes.
*[compute nodes]: A node dedicated to running jobs — where your code actually executes.
*[core]: A general-purpose processor. A modern CPU contains many cores, each capable of running work independently. In HPC contexts (and throughout this cookbook), "CPU" and "core" are used interchangeably to mean one unit of processing power. When you request "4 CPUs" for a job, you're asking for 4 cores.
*[cores]: A general-purpose processor. A modern CPU contains many cores, each capable of running work independently. In HPC contexts (and throughout this cookbook), "CPU" and "core" are used interchangeably to mean one unit of processing power. When you request "4 CPUs" for a job, you're asking for 4 cores.
*[CPU]: Central Processing Unit — A general-purpose processor. A modern CPU contains many cores, each capable of running work independently. In HPC contexts (and throughout this cookbook), "CPU" and "core" are used interchangeably to mean one unit of processing power. When you request "4 CPUs" for a job, you're asking for 4 cores.
*[CPUs]: Central Processing Unit — A general-purpose processor. A modern CPU contains many cores, each capable of running work independently. In HPC contexts (and throughout this cookbook), "CPU" and "core" are used interchangeably to mean one unit of processing power. When you request "4 CPUs" for a job, you're asking for 4 cores.
*[CUDA]: Compute Unified Device Architecture — NVIDIA's GPU programming toolkit.
*[dependency]: Something your program depends on. This could be a Python package (like numpy), a shared library (like GDAL), or anything else that exists outside your own source code. If something works on your computer, but not on a different computer (like an HPC system), it's most likely because of a missing or mismatched dependency.
*[dependencies]: Something your program depends on. This could be a Python package (like numpy), a shared library (like GDAL), or anything else that exists outside your own source code. If something works on your computer, but not on a different computer (like an HPC system), it's most likely because of a missing or mismatched dependency.
*[distributed memory]: An architecture where many nodes each have private memory, communicating over a high-speed network.
*[embarrassingly parallel]: A type of problem where the work can be divided into completely independent tasks that require no communication or coordination between them. Processing 1,000 images with the same filter is a classic example: each image can be handled separately without any information from the others.
*[GSSAPI]: Generic Security Services Application Program Interface — An authentication mechanism that works with campus credentials (like Kerberos) to enable passwordless logins to HPC systems.
*[GPU]: Graphics Processing Unit — Used for parallel computation and AI/ML.
*[GPUs]: Graphics Processing Unit — Used for parallel computation and AI/ML.
*[headless]: A system with no physical display attached. Cluster nodes are headless, which is why running graphical applications requires X11 forwarding or a similar tool to send the visual output back to your local screen.
*[host]: A computer on a network, identified by its hostname. When you're logged into an HPC cluster, the hostname in your shell prompt (e.g., discovery) tells you which host you're on.
*[HPC]: High-Performance Computing — The practice of aggregating computing power for large-scale workloads.
*[I/O]: Input/Output — Abbreviation for data input and output processes, like reading/writing to a file or database.
*[job]: A unit of work that a user submits to a scheduler. A job script specifies what to run and what resources are needed.
*[jobs]: A unit of work that a user submits to a scheduler. A job script specifies what to run and what resources are needed.
*[login node]: The node you connect to via SSH — used for preparing and submitting jobs, not running them.
*[memory]: The fast but volatile working memory (RAM) available to a node, used by running processes to hold data and code while a job executes. Memory is different from storage because it is cleared when power is removed, but is much faster to access for the CPU or GPU.
*[MPI]: Message Passing Interface — A standard for writing programs that run as many simultaneous processes spread across multiple nodes, communicating by sending messages over the network. Each process has its own private memory and a unique integer ID called a rank. Open MPI is the most common implementation on HPC clusters.
*[Open MPI]: A widely used open-source implementation of the MPI standard, available on Discovery. Provides the mpicc compiler wrapper (which links the MPI libraries into your program) and the mpirun launcher (which starts your processes across allocated nodes).
*[rank]: A unique integer ID assigned to each process in an MPI job, starting at 0. If you launch 8 MPI processes, they are numbered rank 0 through 7. Rank 0 is conventionally used as the "root" for coordination tasks like gathering results from all other ranks.
*[ranks]: A unique integer ID assigned to each process in an MPI job, starting at 0. If you launch 8 MPI processes, they are numbered rank 0 through 7. Rank 0 is conventionally used as the "root" for coordination tasks like gathering results from all other ranks.
*[node]: An individual machine within a cluster. Each node has its own CPUs, memory, and (sometimes) GPUs.
*[nodes]: An individual machine within a cluster. Each node has its own CPUs, memory, and (sometimes) GPUs.
*[OOD]: Open OnDemand — Web portal for cluster access.
*[OOM]: Out of Memory — When a job exceeds its allocated memory.
*[partition]: A logical grouping of nodes, often organized by hardware type or intended use (e.g., standard CPU nodes, GPU nodes).
*[partitions]: A logical grouping of nodes, often organized by hardware type or intended use (e.g., standard CPU nodes, GPU nodes).
*[PBS]: Portable Batch System — A legacy job scheduler (this site uses Slurm).
*[process]: A running instance of a program, with its own process ID (PID) and memory. A single program can spawn multiple processes — for example, an MPI job launches one process per rank.
*[processes]: A running instance of a program, with its own process ID (PID) and memory. A single program can spawn multiple processes — for example, an MPI job launches one process per rank.
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
*[HuggingFace Hub]: The online model registry at huggingface.co where researchers publish pre-trained model weights, tokenizers, and datasets. The ``transformers`` library downloads from the Hub on first use and caches the files locally under ``$HF_HOME``.
*[device_map]: An ``accelerate`` feature that automatically partitions a model's layers across all available GPUs (and CPU/disk if needed) so that large models exceeding a single GPU's memory can still run. Enabled by passing ``device_map="auto"`` to ``AutoModel.from_pretrained()``.
*[accelerate]: A HuggingFace library that abstracts multi-GPU and mixed-precision training and inference. Required for ``device_map="auto"`` in ``transformers``.
*[Amdahl's Law]: A formula predicting the maximum speedup from parallelizing a program: S = 1 / (1 − P + P/n), where P is the fraction that can be parallelized and n is the number of processors. The serial portion of your code sets a hard ceiling on how much faster you can go, no matter how many processors you add.
*[concurrency]: Executing multiple tasks in overlapping time periods, potentially on a single processor. Tasks make progress by interleaving — not necessarily by running simultaneously. Useful for I/O-bound workloads where tasks spend time waiting for external resources.
*[coroutine]: A function that can pause its execution (yield control) and resume later. Used in async/concurrent programming to allow cooperative multitasking within a single thread.
*[coroutines]: A function that can pause its execution (yield control) and resume later. Used in async/concurrent programming to allow cooperative multitasking within a single thread.
*[CPU-bound]: A workload whose execution time is dominated by computation rather than waiting for I/O. CPU-bound tasks benefit from parallel execution on multiple cores.
*[event loop]: A programming construct that waits for tasks to become ready and dispatches them for execution. The core mechanism behind concurrent/async programming — it switches between tasks when one begins waiting for I/O, keeping the processor busy.
*[GIL]: Global Interpreter Lock — A mutex in CPython that allows only one thread to execute Python bytecode at a time. This limits the effectiveness of thread-based parallelism for CPU-bound Python code; use multiple processes instead.
*[I/O-bound]: A workload whose execution time is dominated by waiting for input/output operations (network requests, disk reads, database queries) rather than computation. I/O-bound tasks benefit from concurrent execution.
*[message passing]: A communication model where processes exchange data by explicitly sending and receiving messages rather than sharing memory. MPI is the dominant standard for message passing in HPC.
*[oversubscription]: Running more processes or threads than available physical CPU cores, forcing the operating system to time-share them. Can degrade performance due to context-switching overhead.
*[parallelism]: Executing multiple tasks at the exact same time on separate physical processors. Unlike concurrency (which interleaves tasks on one core), parallelism requires multi-core or multi-node hardware.
*[race condition]: A bug that occurs when multiple threads or processes access shared data simultaneously and the outcome depends on the unpredictable timing of their execution. Avoiding race conditions is a central challenge in shared-memory parallel programming.
*[race conditions]: A bug that occurs when multiple threads or processes access shared data simultaneously and the outcome depends on the unpredictable timing of their execution. Avoiding race conditions is a central challenge in shared-memory parallel programming.
*[speedup]: The ratio of sequential execution time to parallel execution time. A speedup of 4× means the parallel version runs four times faster than the sequential one.
*[thread]: An execution flow within a process that shares the parent process's memory space. Threads are lightweight to create and destroy, but concurrent access to shared memory introduces the risk of race conditions.
*[threads]: An execution flow within a process that shares the parent process's memory space. Threads are lightweight to create and destroy, but concurrent access to shared memory introduces the risk of race conditions.
