---
title: "Running MATLAB batch jobs"
description: "How to run MATLAB scripts as non-interactive batch jobs on {{ cluster.name }}"
tags:
  - matlab
  - slurm
  - intermediate
---

# Running MATLAB batch jobs

!!! abstract "What we're cooking"
    How to submit MATLAB scripts as batch jobs on {{ cluster.name }}, from a minimal
    single-core script to parallel and GPU-accelerated jobs.

!!! warning "License required"
    MATLAB is commercial software. License tokens are shared and limited, so
    during peak hours your job may wait to acquire one or fail with a license
    checkout error. See [Common pitfalls](#common-pitfalls) below for strategies.

!!! tip "Prefer interactive work? Use Open OnDemand"
    MATLAB is available as a graphical Batch Connect app on
    [Open OnDemand]({{ cluster.ondemand_url }}). This is the easiest way to use
    MATLAB interactively on {{ cluster.name }}. See the
    [Open OnDemand recipes](../open-ondemand/getting-started.md) for details.

Running MATLAB interactively is fine for development, but production analyses should
run as **batch jobs**: unattended, on a compute node, with resources controlled by
Slurm. This recipe covers everything from the basics to parallel and GPU workflows.

## Loading MATLAB

MATLAB is available as an environment module. Search for available versions with
`module spider`, which searches the full module hierarchy (including modules hidden
behind intermediate dependencies):

```bash
module spider matlab
```

Then load the version you need. On {{ cluster.name }}, you **must** include the version
number; `module load matlab` without a version will not work:

```bash
module load matlab/r2026a
```

## Running a MATLAB script in batch

On a cluster there is no display server, so MATLAB must be told to run headlessly.
Two flags handle this:

| Flag | Effect |
|------|--------|
| `-nodisplay` | Suppress the Java desktop (required without a display) |
| `-nosplash` | Skip the splash screen |
| `-nodesktop` | Disable the MATLAB desktop UI |

### Two equivalent invocation styles

**Classic (`-r`)**, works in all MATLAB versions:

```bash
matlab -nodisplay -nosplash -nodesktop -r "run('myscript.m'); exit"
```

**Modern (`-batch`)**, recommended, requires MATLAB R2019a or newer:

```bash
matlab -batch "run('myscript.m')"
```

Prefer `-batch`. It automatically calls `exit` when the script finishes and, critically
for job monitoring, exits with a **non-zero return code if MATLAB throws an error**.
With `-r`, a runtime error prints a message but MATLAB exits with code 0, so Slurm
reports the job as successful even when it failed. With `-batch`, Slurm marks the job
as failed and you can catch it with `--mail-type=FAIL` or `sacct`.

## A minimal batch job

Start with a simple MATLAB script to confirm everything works. Save this as
`smoke_test.m`:

```matlab
fprintf('MATLAB %s on %s\n', version, computer);
A = rand(500);
B = A * A';
fprintf('Multiplied a 500x500 matrix. trace(B) = %.4f\n', trace(B));
fprintf('Done.\n');
```

Then submit it with a job script:

{{ sbatch_template(
    job_name="matlab-smoke",
    time="00:10:00",
    cpus=1,
    mem="4G",
    modules=["matlab/r2026a"],
    commands="matlab -batch \"run('smoke_test.m')\""
) }}

Check the output file after the job finishes. You should see the MATLAB version,
the matrix trace result, and "Done." MATLAB writes all console output (`disp`,
`fprintf`, warnings, errors) to stdout, which Slurm captures in the output file.
Check that file first when debugging a failed job.

## Parallel Computing Toolbox

If your code has loops where each iteration is independent, MATLAB's Parallel
Computing Toolbox lets you spread them across multiple CPU cores on a single node.
The key tools are `parpool` (create a pool of workers) and `parfor` (run loop
iterations in parallel across that pool).

### A complete parallel example

Save this as `parallel_monte_carlo.m`. It estimates π using a Monte Carlo method,
splitting the work across all available workers:

```matlab
% parallel_monte_carlo.m — Estimate pi with parfor
% Throws random darts at a unit square and counts how many land inside
% the inscribed quarter-circle. The total sample count is fixed, so
% adding more workers divides the same work into smaller chunks.

total_samples = 8e7;   % 80 million total (fixed regardless of worker count)
num_chunks = 80;        % split into this many independent chunks

num_workers = str2num(getenv('SLURM_CPUS_PER_TASK'));
pool = parpool('local', num_workers);
fprintf('Started pool with %d workers\n', pool.NumWorkers);

samples_per_chunk = total_samples / num_chunks;
hits = zeros(1, num_chunks);

tic;
parfor i = 1:num_chunks
    x = rand(samples_per_chunk, 1);
    y = rand(samples_per_chunk, 1);
    hits(i) = sum(x.^2 + y.^2 <= 1);
end
elapsed = toc;

pi_estimate = 4 * sum(hits) / total_samples;

fprintf('Workers:    %d\n', num_workers);
fprintf('Samples:    %.0e\n', total_samples);
fprintf('Pi approx:  %.8f\n', pi_estimate);
fprintf('Error:      %.2e\n', abs(pi - pi_estimate));
fprintf('Wall time:  %.2f seconds\n', elapsed);

delete(pool);
```

!!! danger "Always specify worker count explicitly"
    Calling `parpool('local')` without a size argument makes MATLAB query the
    machine's total CPU count, which on a shared compute node may be 64 or more.
    You will consume resources you did not request, slow down other users' jobs,
    and may violate cluster policy. Always read `SLURM_CPUS_PER_TASK` and pass it
    to `parpool`.

### Submit the parallel job

{{ sbatch_template(
    job_name="matlab-parallel",
    time="00:15:00",
    cpus=8,
    mem="16G",
    modules=["matlab/r2026a"],
    commands="matlab -batch \"run('parallel_monte_carlo.m')\""
) }}

After the job completes, check the output file. You should see something like:

```
Started pool with 8 workers
Workers:    8
Samples:    8e+07
Pi approx:  3.14162340
Error:      3.07e-05
Wall time:  2.41 seconds
```

The total work (80 million samples) is the same regardless of worker count, so you
can change `--cpus-per-task` to 1, 2, 4, and 8 to see how wall time scales. With
1 worker you should see roughly 8× the wall time compared to 8 workers. The speedup
won't be perfectly linear because `parpool` has startup overhead, but the trend
should be clear.

`parfor` scales well when loop iterations are independent and each takes more than a
few milliseconds. For very fast iterations the overhead of inter-process communication
dominates; prefer vectorized operations in that case.

## GPU computing

MATLAB can offload matrix operations to a GPU through the Parallel Computing Toolbox.
The workflow: move data to the GPU with `gpuArray`, run computations (which execute on
the GPU automatically), then pull results back with `gather`.

!!! info "GPU partitions on {{ cluster.name }}"
    {{ cluster.name }} has several GPU partitions with different time limits:

    - **`gpu-preempt`**: jobs up to 2 hours (may be preempted by priority jobs)
    - **`gpu`**: jobs up to 48 hours (not preempted)
    - For jobs longer than 48 hours, add `--qos=long`

    Use `--constraint` to request a specific GPU type (e.g., `--constraint=a100`)
    or a minimum VRAM level (e.g., `--constraint=vram40`). See
    [GPU Computing](../../fundamentals/gpu-computing.md) for available GPU types.

### A complete GPU example

Save this as `gpu_matmul.m`. It compares the time for a large matrix multiplication
on the CPU versus the GPU:

```matlab
% gpu_matmul.m — Compare CPU vs GPU matrix multiplication speed

N = 4096;
fprintf('Matrix size: %d x %d\n', N, N);

% --- CPU version ---
A_cpu = rand(N);
tic;
B_cpu = A_cpu * A_cpu';
cpu_time = toc;
fprintf('CPU time:  %.3f seconds\n', cpu_time);

% --- GPU version ---
info = gpuDevice();
fprintf('GPU:       %s (%d MB VRAM)\n', info.Name, info.TotalMemory / 1e6);

A_gpu = gpuArray(rand(N));    % create random matrix directly on GPU
tic;
B_gpu = A_gpu * A_gpu';
wait(info);                   % ensure GPU computation finishes before timing
gpu_time = toc;
fprintf('GPU time:  %.3f seconds\n', gpu_time);

% Pull result back to CPU memory
B = gather(B_gpu);
fprintf('Speedup:   %.1fx\n', cpu_time / gpu_time);
fprintf('trace(B):  %.4f\n', trace(B));
```

### Submit the GPU job

{{ sbatch_template(
    job_name="matlab-gpu",
    partition="gpu",
    time="00:10:00",
    cpus=4,
    mem="16G",
    gpus=1,
    modules=["matlab/r2026a"],
    commands="matlab -batch \"run('gpu_matmul.m')\""
) }}

After the job completes, the output file should look something like:

```
Matrix size: 4096 x 4096
CPU time:  3.412 seconds
GPU:       NVIDIA A100-SXM4-80GB (85899 MB VRAM)
GPU time:  0.089 seconds
Speedup:   38.3x
trace(B):  4198043.7621
```

The exact numbers depend on which GPU you get. `gpuArray` works with most standard
MATLAB operations (matrix math, FFT, element-wise functions). Check the
[gpuArray supported functions](https://www.mathworks.com/help/parallel-computing/run-matlab-functions-on-a-gpu.html)
in the MATLAB documentation for a full list.


## Common pitfalls

??? failure "Letting MATLAB autodetect worker count"
    Never call `parpool('local')` without specifying a size. MATLAB will detect all
    CPUs on the physical node (potentially 64+) and spawn that many workers,
    consuming resources you didn't request and impacting other users. Always use
    `parpool('local', str2num(getenv('SLURM_CPUS_PER_TASK')))`.

??? failure "Interactive GUI calls in batch scripts"
    Any MATLAB call that opens a window will **hang indefinitely** in a batch job:
    `figure`, `uigetfile`, `uiputfile`, `inputdlg`, `msgbox`, etc. Even `imshow`
    is a problem. Use `saveas` or `exportgraphics` to save figures to files instead
    of displaying them. The `-nodisplay` flag suppresses the desktop but does not
    prevent GUI function calls from blocking.

??? failure "MATLAB startup is slow on cluster nodes"
    MATLAB takes 2-5 minutes to start on a compute node. It needs to initialize
    the JVM and check out a license token. This is normal. Don't assume your job
    is hanging just because the output file is empty for the first few minutes.

??? failure "Harmless warning about `$documents/MATLAB`"
    You may see `Unable to locate a personal folder for $documents/MATLAB` in
    your output file. This is a cosmetic warning about the default MATLAB userpath.
    You can silence it by running `mkdir -p $HOME/Documents/MATLAB` once on a
    login node (or in your job script). It does not affect computation.
