---
title: Troubleshooting
description: "Solutions to common problems on {{ cluster.name }}"
---

# Troubleshooting

Something went wrong. This page collects solutions to the most common problems
researchers run into on {{ cluster.name }}. Each entry explains *why* the problem
happens — not just how to fix it — so you can recognize similar issues in the future.

If your problem isn't listed here, see [Getting More Help](#getting-more-help) at the bottom of the page.

---

## Jobs

??? question "My job is stuck in PENDING — how do I find out why?"

    A pending job simply means {{ cluster.name }} hasn't been able to schedule it yet.
    The scheduler records a *reason code* for every waiting job. Retrieve it with:

    ```bash
    squeue --me --format="%.18i %.9P %.8j %.8u %.8T %.10M %.6D %R"
    ```

    Or just `squeue --me` for a quick look. Common reason codes and what they mean:

    | Reason | Meaning |
    |--------|---------|
    | `Resources` | Waiting for enough nodes/CPUs/memory to free up — normal queue wait. |
    | `Priority` | Other jobs have higher priority and are ahead of yours in the queue. |
    | `QOSMaxCpuPerUserLimit` | You've hit your per-user CPU quota. Wait for a running job to finish. |
    | `ReqNodeNotAvail` | You requested a node or feature the cluster can't satisfy (e.g., more memory per node than any node has, or a GPU count that doesn't exist). Double-check your `#SBATCH` resource requests. |
    | `Maintenance` | The cluster is in a scheduled maintenance window; jobs will start when it ends. |

    If the reason is `ReqNodeNotAvail` and you're sure the cluster isn't in maintenance,
    the most likely cause is an impossible resource combination — for example, requesting
    512 GB of memory on a node type that only offers 256 GB. Review the partition limits
    with `sinfo -o "%P %l %m %c"` and adjust your request accordingly.

??? question "My job was killed with state OUT_OF_MEMORY (OOM) — what do I do?"

    An OOM kill means your job used more memory than you asked for.
    {{ cluster.name }}'s scheduler strictly enforces memory limits: when a job exceeds its
    allocation, the kernel terminates it immediately, often without a helpful error message
    in your output.

    **Diagnose:** inspect the job's actual peak memory usage with `sacct`:

    ```bash
    sacct -j JOBID --format=JobID,MaxRSS,ReqMem,State
    ```

    `MaxRSS` is the peak resident memory your job used; `ReqMem` is what you requested.
    If `MaxRSS` is at or above `ReqMem`, that's your problem.

    **Fix:** increase your memory request in your job script:

    ```bash
    #SBATCH --mem=32G          # total memory for the job
    # or, if using multiple CPUs:
    #SBATCH --mem-per-cpu=8G   # memory per CPU core
    ```

    **Tip:** after a *successful* run, use `seff JOBID` to see efficiency statistics
    including actual memory usage. This helps you set a realistic (and not wasteful)
    memory request for future jobs:

    ```bash
    seff JOBID
    ```

??? question "My job finished instantly with a non-zero exit code and produced no output"

    A near-instant failure with no output almost always means the job script itself
    couldn't run to completion — the work never started. Check the `.err` file Slurm
    wrote (named `slurm-JOBID.err` by default, or whatever you set with `--error=`).
    Common culprits:

    1. **Missing `module load`** — if you tested a command interactively and it worked,
       your interactive shell may have had a module loaded that your batch script doesn't.
       Batch jobs start with a minimal environment. Always load every required module
       explicitly in your job script:

        ```bash
        module load python/3.11
        ```

        See [Software Modules](../fundamentals/modules.md) for details on using modules
        inside job scripts.

    2. **Wrong file paths** — relative paths are resolved from the working directory at
       job submission time, which may not be where you expect. Prefer absolute paths
       (e.g., `/dartfs-hpc/scratch/netid/myproject/input.csv`) or set your working
       directory explicitly with `#SBATCH --chdir=`.

    3. **Script syntax error** — a typo or missing quote in your Bash script causes an
       immediate exit. Run `bash -n myscript.sh` locally to check for syntax errors
       before submitting.

??? question "My job ran but the output file is empty"

    An empty output file means the script executed but nothing was written where you
    expected. A few things to check:

    - **Output directory doesn't exist.** Slurm will not create missing directories.
      If your script writes to `results/output.txt` but the `results/` directory
      doesn't exist on the compute node's filesystem, the write silently fails.
      Create the directory before submitting, or add `mkdir -p results` to your script.

    - **Program writes to stderr, not stdout.** Many tools print results to standard
      error by default. Slurm captures stdout and stderr separately. Redirect stderr
      into the same file to capture everything:

        ```bash
        python my_script.py > output.txt 2>&1
        ```

        Or combine Slurm's output and error streams with `#SBATCH --output` and
        `#SBATCH --error` pointing to the same file.

    - **Working directory mismatch.** The output path in your program may be relative
      to a directory that isn't the current directory when the job runs. Use absolute
      paths or verify the working directory with `echo $PWD` at the top of your script.

??? question "My job ran successfully but produced wrong or unexpected results"

    Unexpected results are almost always an **environment or path problem**, not a
    cluster problem — the scheduler ran your script exactly as written, but the
    script did something unintended. Start by adding these two lines near the top
    of your job script to capture diagnostic information in the output:

    ```bash
    echo "Working directory: $PWD"
    module list
    ```

    Common causes:

    - **Wrong input path.** Relative paths are resolved from the submission directory,
      which may differ from where you think. Use absolute paths for all input and
      output files (e.g., `{{ storage.scratch_path }}/netid/project/input.csv`).
    - **Wrong module version.** If you have multiple versions of a tool installed,
      the wrong one may be loaded. `module list` in your job output will tell you
      exactly what was active.
    - **Output written to the wrong location.** A common confusion is writing to
      `$HOME` when you intended scratch, or vice versa. Check both locations.
    - **Race condition in parallel code.** Multiple workers writing to the same file
      without locking will corrupt output. Use separate per-worker output files and
      merge afterward, or use a thread-safe output mechanism.

    !!! tip
        Add `set -euo pipefail` as the second line of every Bash job script (right
        after `#!/bin/bash`). This makes the script exit immediately on any unhandled
        error, undefined variable, or failed pipe — catching problems early instead
        of silently producing wrong results.

??? question "I submitted too many jobs — how do I cancel them all?"

    {{ cluster.scheduler }} gives you several `scancel` options depending on how
    many jobs you want to remove:

    ```bash
    # Cancel every one of your jobs (running and pending)
    scancel -u $USER

    # Cancel only your PENDING jobs (leave running jobs alone)
    scancel -u $USER --state=PENDING

    # Cancel a single specific job
    scancel JOBID

    # Cancel a range of consecutive job IDs (Bash brace expansion)
    scancel {10000..10099}
    ```

    For **job arrays**, you have finer control:

    ```bash
    # Cancel the entire array
    scancel ARRAYJOBID

    # Cancel a single task within the array
    scancel ARRAYJOBID_TASKID
    ```

    !!! warning
        `scancel -u $USER` is immediate and irreversible — there is no undo.
        If you want to pause jobs temporarily instead of deleting them, use
        `scontrol hold JOBID` / `scontrol release JOBID`.

    See the [job arrays recipe](../recipes/slurm/job-arrays.md) for more on
    managing large batches of work.

---

## Python

??? question "ModuleNotFoundError on the cluster, but the package is installed on my laptop"

    The package isn't missing from the cluster — it's just not in the Python environment
    your batch job uses. When you install packages interactively (e.g., `pip install
    numpy` in a terminal), they go into your active virtual environment. But a batch job
    starts a fresh shell with no virtual environment activated, so it falls back to the
    system Python, which doesn't have your packages.

    **Fix:** activate your virtual environment explicitly in your job script, *before*
    calling Python:

    ```bash
    #!/bin/bash
    #SBATCH --job-name=my-python-job
    #SBATCH --ntasks=1
    #SBATCH --mem=8G

    source /path/to/your/.venv/bin/activate
    python my_script.py
    ```

    If you use `uv` to manage environments (recommended), see the
    [uv recipe](../recipes/python/uv.md) for the correct activation pattern and how to
    structure your environment so it's always accessible from batch jobs.

??? question "CUDA error: no kernel image is available for execution on the device"

    This error means PyTorch (or another CUDA library) was compiled for a different
    CUDA version than the one the GPU driver supports. A PyTorch build targeting
    CUDA 11.8, for example, will not run on a node whose driver only exposes CUDA 12.x
    kernels — or vice versa.

    **Diagnose:** check what CUDA version the GPU supports:

    ```bash
    srun --partition=gpu --gres=gpu:1 --pty nvidia-smi
    ```

    Look for the "CUDA Version" in the top-right corner of the output — this is the
    *maximum* CUDA version the driver supports.

    **Fix:** reinstall PyTorch with a CUDA index that matches. For example, if the
    driver reports CUDA 12.1:

    ```bash
    uv pip install torch --index-url https://download.pytorch.org/whl/cu121
    ```

    See the [PyTorch recipe](../recipes/python/pytorch.md) for the full setup walkthrough,
    including how to verify the installation before submitting a batch job.

??? question "CUDA out of memory — my training job crashes partway through"

    Your model, activations, or batch data exceed the GPU's available VRAM. Unlike
    system RAM, GPU memory is not virtual — there's no swap, so the process crashes
    immediately when it runs out.

    **Diagnose:** see how much VRAM your job is actually using:

    ```bash
    # interactively, on a GPU node:
    srun --partition=gpu --gres=gpu:1 --pty nvidia-smi
    ```

    Or add `nvidia-smi` as a command inside your job script to log usage at a point
    during the run.

    **Options to reduce memory usage:**

    - **Reduce batch size** — the most direct lever. Halving the batch size roughly
      halves the activation memory.
    - **Use mixed precision** — `torch.cuda.amp` runs forward passes in FP16/BF16,
      cutting memory roughly in half with minimal accuracy loss:
        ```python
        with torch.autocast(device_type="cuda"):
            output = model(input)
        ```
    - **Gradient checkpointing** — trades compute for memory by recomputing activations
      during the backward pass instead of storing them.
    - **Request a larger GPU** — if the cluster has nodes with higher-VRAM GPUs,
      specify the GPU model with `--gres=gpu:a100:1` (or the appropriate type). Check
      `sinfo -o "%P %G"` to see what GPU types are available.

??? question "My virtual environment works interactively but fails in a batch job"

    The most common reason is that your batch job script doesn't set up the same
    environment your interactive shell has. Batch jobs start with a **minimal
    environment** — no modules loaded, no virtual environments activated.

    Work through this checklist:

    1. **Load the right Python/uv module first.** Even before activating the
       environment, you need the same Python toolchain:
        ```bash
        module load python/3.11   # or whichever version you used to create the env
        source /path/to/.venv/bin/activate
        ```
       For `uv`-managed environments, use `uv run` directly instead:
        ```bash
        uv run python my_script.py
        ```
    2. **Use absolute paths.** Relative paths to the environment break when the
       working directory differs between submission and execution. Prefer
       `/dartfs-hpc/scratch/netid/project/.venv` over `.venv`.
    3. **Check home directory accessibility.** In rare cases, NFS issues can make
       home unavailable on a compute node. If your environment lives in `$HOME`,
       try `ls $HOME` inside the job script and check the output.
    4. **Use the correct activation method for your tool.**
       conda requires `source /path/to/conda.sh && conda activate myenv`;
       a plain `conda activate` without the shell initialization will silently fail.

    !!! tip
        Add `which python && python --version` near the top of your job script.
        The output in your `.out` file will confirm immediately whether the right
        interpreter is active.

    See the [uv recipe](../recipes/python/uv.md) and the
    [conda recipe](../recipes/python/conda.md) for canonical batch job templates.

??? question "My code works on one GPU but crashes when I use multiple GPUs"

    Single-GPU code doesn't automatically scale. Multi-GPU training requires
    explicit distributed training setup — if you just request multiple GPUs
    without initializing a process group, only the first GPU will be used (or
    the job will crash with a confusing error).

    **The most common fix:** follow the
    [multi-GPU recipe](../recipes/python/multi-gpu.md) to initialize PyTorch
    Distributed Data Parallel (DDP) or use HuggingFace Accelerate, which handles
    the boilerplate for you.

    Other things to check:

    - **NCCL errors** (e.g., `NCCL WARN` or `Timeout`) usually indicate a network
      or configuration issue between GPUs or nodes. Set `NCCL_DEBUG=INFO` to get
      verbose output that points to the root cause:
        ```bash
        export NCCL_DEBUG=INFO
        ```
    - **Process group not destroyed.** Add `dist.destroy_process_group()` at the
      end of your training script to cleanly shut down distributed workers.
    - **Batch size too small.** With data-parallel training, the total batch is
      split across GPUs — each GPU must receive at least one sample. If
      `batch_size < num_gpus`, you'll get a zero-length tensor error.

---

## Connectivity

??? question "ssh: connect to host ... Connection refused (or timeout)"

    A "connection refused" or timeout when SSH-ing to {{ cluster.name }} almost always
    means your machine isn't on the Dartmouth network. {{ cluster.name }}'s login nodes
    are not reachable from the public internet without a VPN.

    **Fix:**

    1. Connect to the Dartmouth VPN first.
    2. Then SSH to `{{ cluster.login_node }}`.

    If you're already on campus or VPN and still see this error, double-check the
    hostname — a typo is a common cause. The correct login node is:

    ```
    {{ cluster.login_node }}
    ```

    If the hostname is correct and VPN is active, the cluster may be in maintenance.
    Check the [{{ institution.short_name }} Research Computing status page]({{ institution.support_url }})
    for announcements.

??? question "Permission denied (publickey,gssapi-keyex,gssapi-with-mic)"

    This error means SSH authentication failed entirely — the server rejected every
    method it tried. The most common cause is an **expired Kerberos ticket**. {{ cluster.name }}
    uses Kerberos (GSSAPI) as its primary authentication mechanism; when your ticket
    expires (typically after 24 hours), SSH can't authenticate and falls through to
    public-key auth, which may also not be configured.

    **Fix:** renew your Kerberos ticket:

    ```bash
    kinit your_netid@KIEWIT.DARTMOUTH.EDU
    ```

    Then retry SSH. If that doesn't resolve it, verify your SSH config is set up
    correctly by following the [Connecting to {{ cluster.name }}](../getting-started/connecting.md)
    guide — in particular, the `GSSAPIAuthentication yes` and `GSSAPIDelegateCredentials yes`
    settings in `~/.ssh/config`.

---

## Storage & Quota

??? question "I'm getting \"No space left on device\" or \"Disk quota exceeded\""

    Both errors mean you've run out of storage in a particular filesystem — either
    the total space is full, or your personal quota has been reached. They are
    treated differently, so diagnose first:

    ```bash
    df -h $HOME          # how much of your home quota is used
    df -h {{ storage.scratch_path }}/$USER   # scratch usage (if applicable)
    ```

    **Common culprits hiding in home:**

    | Location | What fills it |
    |----------|--------------|
    | `~/.cache/pip` | pip download and wheel cache |
    | `~/.cache/uv` | uv package cache |
    | `~/.local/lib/python*/` | pip user-install packages |
    | `~/miniconda3/` or `~/anaconda3/` | Conda environments and packages |
    | `~/.matlab/` | MATLAB temp files and toolbox caches |

    **Solutions:**

    - **Move caches to scratch.** Set environment variables before installing:
        ```bash
        export PIP_CACHE_DIR={{ storage.scratch_path }}/$USER/.cache/pip
        export UV_CACHE_DIR={{ storage.scratch_path }}/$USER/.cache/uv
        ```
    - **Create conda environments on scratch** using `--prefix`:
        ```bash
        conda create --prefix {{ storage.scratch_path }}/$USER/envs/myenv python=3.11
        ```
    - **Purge old virtual environments** you no longer use (`rm -rf` the `.venv`
      directory).

    !!! tip
        Visit the [{{ institution.short_name }} Research Computing storage docs]({{ institution.support_url }})
        for the official quota check command and instructions for requesting a quota increase.

??? question "My scratch files disappeared"

    Scratch storage (`{{ storage.scratch_path }}`) is **not backed up** and is subject
    to automatic purge policies: files that haven't been accessed in a set number
    of days are deleted without warning to reclaim space for all users.

    !!! danger
        If files on scratch are gone, they are **not recoverable**. There is no
        recycle bin or backup for scratch.

    Scratch is designed for *active, intermediate working data* — input files
    staged for a running job, temporary outputs being processed. It is not
    intended for long-term storage.

    **Best practice workflow:**

    1. Copy inputs to scratch before the job starts.
    2. Run the job, writing outputs to scratch.
    3. Copy important results back to `$HOME` or
       [{{ storage.shared_name }}]({{ institution.support_url }}) at the end of the job script:
        ```bash
        cp -r {{ storage.scratch_path }}/$USER/results $HOME/results
        ```

    If you need long-term storage for large datasets, contact
    {{ institution.support_team }} about {{ storage.shared_name }} allocations.

??? question "I can't write to my home directory from a compute node"

    Home directories are NFS-mounted on all compute nodes and should always be
    accessible. If writes are failing, work through the likely causes in order:

    1. **Quota exceeded.** Run `df -h $HOME`. If you're at 100 %, writes will fail
       even if the NFS mount is healthy. Free up space or contact
       {{ institution.support_team }} to request an increase.

    2. **NFS timeout (transient).** High load can cause brief NFS hangs. If the
       problem appeared suddenly and your quota is fine, wait a few minutes and try
       again. Resubmitting the job usually resolves it.

    3. **Permission issue.** Verify that the directory you're writing to is owned
       by you and has write permission:
        ```bash
        ls -ld $HOME
        ```

    !!! warning
        If the problem is persistent across multiple jobs and your quota is fine,
        contact {{ institution.support_team }} at
        [{{ institution.support_email }}](mailto:{{ institution.support_email }})
        — a stuck NFS mount requires admin intervention.

---

## R

??? question "R package installation fails with compilation errors"

    Many R packages include C, C++, or Fortran code that must be compiled during
    installation. Errors like `unable to find -lgdal`, `zlib.h: No such file or
    directory`, or `cannot find -lproj` mean a required **system library** is
    missing from the build environment — the R package itself is fine.

    **Fix:** load the relevant module *before* starting R or running `install.packages()`:

    ```bash
    module load gcc         # most packages need a modern compiler
    module load gdal        # for sf, rgdal, terra and other spatial packages
    module load hdf5        # for rhdf5, ncdf4
    module load netcdf      # for ncdf4, RNetCDF
    ```

    Then install the package from within R normally. The loaded modules make the
    system headers and libraries visible to the compiler.

    !!! tip
        The [R on the Cluster](../recipes/r/getting-started.md) page has a table of
        common packages and the modules they require. Check there first before
        searching for the missing library manually.

    If you can't identify the required module, paste the full compilation error
    into a message to {{ institution.support_team }} — the library name is usually
    visible in the last few lines.

??? question "My R job uses only 1 core even though I requested multiple CPUs"

    Requesting `--cpus-per-task=8` in your job script tells {{ cluster.scheduler }}
    to *reserve* 8 cores, but R is **single-threaded by default** — it will not
    automatically use those cores. You must write parallel code explicitly.

    Common options:

    | Approach | When to use |
    |----------|-------------|
    | `parallel::mclapply()` | Simple fork-based parallelism on a single node |
    | `foreach` + `doParallel` | Loop-style parallelism with a parallel backend |
    | `future` + `furrr` | Tidyverse-friendly, works across nodes too |

    A minimal example with `parallel::mclapply`:

    ```r
    library(parallel)
    ncores <- as.integer(Sys.getenv("SLURM_CPUS_PER_TASK"))
    results <- mclapply(my_list, my_function, mc.cores = ncores)
    ```

    !!! warning
        **Never use `detectCores()` without a limit.** On a compute node,
        `detectCores()` returns the total number of physical cores on the machine —
        far more than your allocation. Use
        `as.integer(Sys.getenv("SLURM_CPUS_PER_TASK"))` instead so your code
        respects the resources you actually requested.

    See the [R batch job recipe](../recipes/r/batch-job.md) for complete parallel
    job script templates.

---

## MATLAB

??? question "MATLAB exits immediately with error code 1 (license error)"

    An immediate exit with error code 1 almost always means MATLAB cannot acquire
    a license token — either the license server is unreachable, or all tokens for
    your license type are currently checked out.

    **Diagnose:** run a minimal MATLAB command interactively on a compute node:

    ```bash
    module load matlab
    matlab -nodisplay -batch "ver"
    ```

    If this produces a license error rather than the toolbox list, it is a license
    issue, not a code issue.

    **What to do:**

    - **Try again later.** License tokens are shared across all {{ institution.short_name }}
      users. During peak hours (weekday mornings and afternoons) tokens may all be
      in use. Off-peak hours are usually much better.
    - **Check which toolboxes you actually need.** Each licensed toolbox checks out
      a separate token. If your code calls functions from toolboxes you don't need,
      remove those calls to reduce license pressure.
    - **Contact support if persistent.** If you consistently can't get a license at
      any hour, contact {{ institution.support_team }} at
      [{{ institution.support_email }}](mailto:{{ institution.support_email }})
      with the exact license error message from the MATLAB output.

    See the [MATLAB batch job recipe](../recipes/matlab/batch-job.md) for license-aware
    job script patterns.

??? question "My MATLAB parpool job is slower than single-threaded"

    Parallel overhead is real: launching workers, serializing data, and
    coordinating results all take time. If each parallel task runs in milliseconds,
    the overhead dominates and parallelism *hurts* performance.

    **Rule of thumb:** each `parfor` iteration (or parallel task) should take at
    least a few seconds of computation to make parallelism worthwhile. If your
    iterations are very fast, restructure so each worker handles a *batch* of
    iterations rather than a single one:

    ```matlab
    % Instead of parfor over 10,000 tiny tasks:
    parfor i = 1:10000
        result(i) = tiny_function(i);   % too fast — overhead dominates
    end

    % Batch into chunks:
    chunk_size = ceil(10000 / pool.NumWorkers);
    parfor w = 1:pool.NumWorkers
        idx = (w-1)*chunk_size+1 : min(w*chunk_size, 10000);
        result(idx) = arrayfun(@tiny_function, idx);  % each worker does real work
    end
    ```

    Also verify that workers are actually being created. Add an assertion after
    `parpool`:

    ```matlab
    pool = parpool(str2num(getenv('SLURM_CPUS_PER_TASK')));
    assert(pool.NumWorkers > 1, 'Expected multiple workers but got %d', pool.NumWorkers);
    ```

    !!! tip
        Use `tic` / `toc` around both a serial and parallel version on a small
        input to measure the actual speedup before committing to a full parallel
        job. Many workloads are faster in serial than with a `parpool` of 4–8 workers.

---

## Getting More Help

If your problem isn't listed here, contact {{ institution.support_team }} at
[{{ institution.support_email }}](mailto:{{ institution.support_email }}) or visit
[{{ institution.support_url }}]({{ institution.support_url }}).

When reaching out, include:

- The job ID (`squeue --me` or `sacct` output)
- The error message (paste from your `.err` file)
- The relevant portion of your job script
- What you've already tried

This helps the support team diagnose your issue without needing to ask follow-up questions.
