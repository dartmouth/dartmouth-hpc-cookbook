---
title: "Running MATLAB Batch Jobs"
description: "How to run MATLAB scripts as non-interactive batch jobs on {{ cluster.name }}"
tags:
  - matlab
  - slurm
  - intermediate
---

# Running MATLAB Batch Jobs

!!! abstract "What we're cooking"
    How to submit MATLAB scripts as batch jobs on {{ cluster.name }} — from a minimal
    single-core script to parallel and GPU-accelerated jobs.

!!! warning "License required"
    MATLAB is commercial software. {{ cluster.name }} provides a site license for
    {{ institution.name }} users, but license tokens are shared — during peak hours
    your job may wait to acquire one. See [Common Pitfalls](#common-pitfalls) below.

Running MATLAB interactively is fine for development, but production analyses should
run as **batch jobs**: unattended, on a compute node, with resources controlled by
Slurm. This recipe covers everything from the basics to parallel and GPU workflows.

## Loading MATLAB

MATLAB is available as an environment module. Check what versions are installed:

```bash
module avail matlab
```

Then load the default (or a specific version):

```bash
module load matlab
# or
module load matlab/R2024a
```

## Running a MATLAB Script in Batch

On a cluster there is no display server, so MATLAB must be told to run headlessly.
Two flags handle this:

| Flag | Effect |
|------|--------|
| `-nodisplay` | Suppress the Java desktop — required without a display |
| `-nosplash` | Skip the splash screen |
| `-nodesktop` | Disable the MATLAB desktop UI |

### Two equivalent invocation styles

**Classic (`-r`)** — works in all MATLAB versions:

```bash
matlab -nodisplay -nosplash -nodesktop -r "run('myscript.m'); exit"
```

**Modern (`-batch`)** — recommended, requires MATLAB R2019a or newer:

```bash
matlab -batch "run('myscript.m')"
```

Prefer `-batch`. It automatically calls `exit` when the script finishes and — critically
for job monitoring — exits with a **non-zero return code if MATLAB throws an error**.
With `-r`, a runtime error prints a message but MATLAB exits with code 0, so Slurm
reports the job as successful even when it failed. With `-batch`, Slurm marks the job
as failed and you can catch it with `--mail-type=FAIL` or `sacct`.

## A Minimal Batch Job

```bash
#!/bin/bash
#SBATCH --job-name=matlab-job
#SBATCH --ntasks=1
#SBATCH --cpus-per-task=1
#SBATCH --mem=8G
#SBATCH --time=02:00:00
#SBATCH --output=logs/matlab_%j.out
#SBATCH --error=logs/matlab_%j.err

module load matlab

matlab -batch "run('myscript.m')"
```

MATLAB writes all console output (`disp`, `fprintf`, warnings, errors) to stdout, which
Slurm captures in the `--output` file. Check that file first when debugging a failed job.

## Parallel Computing Toolbox

If your code can be parallelized, MATLAB's Parallel Computing Toolbox lets you use
multiple cores within a single node via `parpool` and `parfor`.

### Requesting cores in Slurm

```bash
#SBATCH --cpus-per-task=8
```

### Creating a `parpool` with the right worker count

!!! danger "Always specify worker count explicitly"
    Calling `parpool('local')` without a size argument makes MATLAB query the machine's
    total CPU count — which on a shared compute node may be 64 or more. You will consume
    resources you did not request, slow down other users' jobs, and may violate cluster
    policy. Always read `SLURM_CPUS_PER_TASK` and pass it explicitly.

```matlab
% Read the allocation from the environment
workers = str2num(getenv('SLURM_CPUS_PER_TASK'));
pool = parpool('local', workers);

% Now use parfor — iterations run in parallel across workers
results = zeros(1, 100);
parfor i = 1:100
    results(i) = heavy_computation(i);
end

delete(pool);
```

### Parallel job script

```bash
#!/bin/bash
#SBATCH --job-name=matlab-parallel
#SBATCH --ntasks=1
#SBATCH --cpus-per-task=8
#SBATCH --mem=32G
#SBATCH --time=04:00:00
#SBATCH --output=logs/matlab_par_%j.out
#SBATCH --error=logs/matlab_par_%j.err

module load matlab

matlab -batch "run('parallel_script.m')"
```

`parfor` scales well when loop iterations are independent and each takes more than a
few milliseconds. For very fast iterations the overhead of inter-process communication
dominates — prefer vectorized operations in that case.

## GPU Computing

MATLAB supports GPU acceleration through the Parallel Computing Toolbox. Request a
GPU partition in your job script, then use `gpuArray` to move data onto the device.

### GPU job script

```bash
#!/bin/bash
#SBATCH --job-name=matlab-gpu
#SBATCH --ntasks=1
#SBATCH --cpus-per-task=4
#SBATCH --mem=16G
#SBATCH --gres=gpu:1
#SBATCH --partition=gpu
#SBATCH --time=02:00:00
#SBATCH --output=logs/matlab_gpu_%j.out

module load matlab

matlab -batch "run('gpu_script.m')"
```

### GPU MATLAB code

```matlab
% Confirm a GPU is visible
info = gpuDevice();
fprintf('Using GPU: %s\n', info.Name);

% Move data to GPU
A = rand(4096, 4096);       % host array
A_gpu = gpuArray(A);        % copy to GPU memory

% Computations on gpuArray objects run on the GPU automatically
B_gpu = A_gpu * A_gpu';

% Bring results back to host
B = gather(B_gpu);
```

`gpuArray` works with most standard MATLAB operations (matrix math, FFT, element-wise
functions). Check `gpuArray` supported functions in the MATLAB documentation for a full
list. GPU support requires the Parallel Computing Toolbox.

## MATLAB Compiler: Running Without a License

If you need to run MATLAB code across a **large job array** — hundreds or thousands of
tasks — license contention becomes a real bottleneck. The MATLAB Compiler (`mcc`)
solves this by producing a **standalone executable** that runs against the free MATLAB
Runtime (MCR) instead of a full license:

```bash
# Compile on the login node (requires a Compiler license)
mcc -m myscript.m -o myscript_exe

# The resulting binary can run on any node without a MATLAB license
./myscript_exe
```

The MCR is available as a module (`module avail matlab-runtime`) and must match the
MATLAB version used to compile. This approach is ideal for embarrassingly parallel
workloads. See the
[MATLAB Compiler documentation](https://www.mathworks.com/help/compiler/) for details.

## Managing Output Files

### Console logging with `diary`

Capture all MATLAB console output to a text file in addition to Slurm's log:

```matlab
diary('matlab_run.log');
% ... your code ...
diary off;
```

### Saving large results to scratch

Do not save large matrices to your home directory — use scratch storage instead:

```matlab
scratch = getenv('SCRATCH');   % set this in your job script, or hardcode the path
outfile = fullfile(scratch, 'results.mat');
save(outfile, 'results', '-v7.3');   % -v7.3 supports files > 2 GB
```

`.mat` files (especially `-v7.3` / HDF5 format) are the right format for large
numerical arrays. CSV and text files are orders of magnitude slower to write and
read for matrix data.

### Setting the scratch path in your job script

```bash
export SCRATCH={{ storage.scratch_path }}/$USER
mkdir -p $SCRATCH
matlab -batch "run('myscript.m')"
```

## Common Pitfalls

!!! warning "License server contention"
    MATLAB license tokens are shared across all cluster users. During peak hours
    (weekday mornings and afternoons) jobs may queue waiting for a token, or fail
    with a license checkout error. Strategies: schedule jobs off-peak with
    `--begin=22:00`, retry failed jobs, or use compiled executables (see above).

!!! danger "Letting MATLAB autodetect worker count"
    Never call `parpool('local')` without specifying a size. MATLAB will detect all
    CPUs on the physical node — potentially 64+ — and spawn that many workers,
    consuming resources you didn't request and impacting other users. Always use
    `parpool('local', str2num(getenv('SLURM_CPUS_PER_TASK')))`.

!!! warning "Interactive GUI calls in batch scripts"
    Any MATLAB call that opens a window will **hang indefinitely** in a batch job:
    `figure`, `uigetfile`, `uiputfile`, `inputdlg`, `msgbox`, etc. Even `imshow`
    is a problem. Use `saveas` or `exportgraphics` to save figures to files instead
    of displaying them. The `-nodisplay` flag suppresses the desktop but does not
    prevent GUI function calls from blocking.

!!! tip "MATLAB temp files filling home directory"
    MATLAB writes preferences, crash dumps, and temporary files to `~/.matlab` and
    `$TMPDIR`. On a cluster, `$TMPDIR` may default to `/tmp` (local, fast) or to
    your home directory. Redirect these if you hit quota limits:

    ```bash
    export MATLAB_PREFDIR={{ storage.scratch_path }}/$USER/matlab-prefs
    export TMPDIR={{ storage.scratch_path }}/$USER/tmp
    mkdir -p $MATLAB_PREFDIR $TMPDIR
    ```
