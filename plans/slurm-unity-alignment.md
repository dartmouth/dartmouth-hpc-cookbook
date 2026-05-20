# Plan: Align SLURM Patterns with Unity

## Summary

The cookbook's SLURM recipes and fundamentals pages are written with generic Slurm patterns that don't reflect several Unity-specific behaviors. After auditing against the [Unity documentation](unity-docs/) (the official Hugo source), this plan addresses the gaps.

## Key Unity-Specific Facts (from Unity docs)

1. **General-access partitions**: `cpu`, `gpu`, `cpu-preempt`, `gpu-preempt` (48-hour max time each)
2. **Long jobs (>48h)**: Use `--qos=long` (`-q long`), NOT separate `cpu-long`/`gpu-long` partitions (those were removed in the Oct 2024 OS upgrade)
3. **Short QOS**: `--qos=short` gives a priority boost for jobs under 4 hours (one job at a time)
4. **Preempt partitions**: Run on other groups' idle hardware; jobs can be killed after 2 hours by priority users
5. **Multi-GPU requires `--nodes`**: Since March 2026, requesting >1 GPU requires either `--nodes=<n>` or `--constraint=mpi`, otherwise the job errors out
6. **`--constraint` flags**: Unity supports `sm_XX` (CUDA compute capability), `vramYY` (minimum VRAM), `ib` (InfiniBand), `mpi` (consistent CPU model), and GPU model names (`a100`, `l40s`, `h100`, `2080ti`, etc.)
7. **`--account=pi_...`**: Required when a user belongs to multiple PI groups; the default is the primary group
8. **`--gpus=` vs `--gres=gpu:`**: Unity docs use both interchangeably; `--gpus=` is slightly more common in their examples
9. **Resource limits**: 1000 simultaneous CPU cores or 64 simultaneous GPUs per research group on general partitions
10. **Default partition**: `cpu` with 1-hour default time

---

## Changes by File

### 1. `docs/recipes/slurm/interactive-jobs.md`

**A. GPU interactive section (around line 48-63)**: Add `--nodes=1` to the multi-GPU note. The current example requests `--gres=gpu:1` which is fine for a single GPU, but the info box should warn that requesting >1 GPU requires `--nodes=1`.

**B. Add preempt partition tip**: After the GPU section, add a tip about `gpu-preempt` being a good option for short interactive GPU sessions (under 2 hours) since it has more available hardware.

**C. Add `--qos=short` tip**: Mention that `--qos=short` can boost priority for interactive sessions under 4 hours.

**D. `salloc` section (around line 65-84)**: Unity docs recommend `salloc` for interactive work. Add a note that `salloc` is the more common pattern on Unity, and show the Unity-style syntax: `salloc --gpus=1 --partition=gpu-preempt -q short -t 4:00:00`.

**E. Add `--account` note**: Brief mention that multi-PI users should specify `--account=pi_...`.

### 2. `docs/recipes/slurm/intermediate-patterns.md`

**A. Time limits and partitions section (around line 27-42)**: Replace the generic partition discussion with Unity-specific guidance:
  - Table of general-access partitions (`cpu`, `gpu`, `cpu-preempt`, `gpu-preempt`) with their 48-hour max
  - Explain `-q long` for jobs >48 hours
  - Explain `-q short` for priority boost on jobs <4 hours
  - Explain preempt partitions: access to more hardware, but jobs can be killed after 2 hours

**B. Add new section: "Constraints and hardware targeting"**: Cover `--constraint` usage:
  - `sm_XX` for CUDA compute capability
  - `vramYY` for minimum VRAM per GPU
  - GPU model names (`a100`, `l40s`, `h100`)
  - `ib` for InfiniBand (tightly coupled MPI)
  - `mpi` for consistent CPU model
  - Combining constraints with `&` syntax

**C. Add `--account=pi_...` subsection**: Explain when and why to use it, with the `pi_<username>` naming convention.

**D. Environment section (around line 162-188)**: This is fine as-is; no Unity-specific changes needed.

### 3. `docs/recipes/slurm/job-arrays.md`

**A. GPU partition warning (line 171-172)**: Expand the warning to also mention:
  - Use `--constraint` to target specific GPU types
  - The preempt partition as an alternative for short array tasks

### 4. `docs/fundamentals/scheduling.md`

**A. Partitions section (around line 119-131)**: Add a concrete table of Unity's general-access partitions with time limits, instead of just saying "multiple partitions." Include QOS explanation (`short` and `long`).

**B. Pending reasons table (line 202-208)**: Add `AssocGrpCpuLimit` / `AssocGrpGRES` to explain the per-group resource caps (1000 CPUs / 64 GPUs).

### 5. `docs/fundamentals/gpu-computing.md`

**A. "Requesting GPUs in Slurm" section (around line 105-131)**:
  - Add `--nodes=1` to the multi-GPU example and explain the March 2026 enforcement
  - Show `--constraint` examples for targeting GPU types by name and by capability (`sm_75`, `vram40`)
  - Mention `--gpus=` as an alternative syntax to `--gres=gpu:`

**B. "Available GPUs" section (around line 92-100)**: Add concrete mention of known GPU types (A100, L40S, H100) and how to discover them via `sinfo` or `unity-slurm-list-constraints`.

---

## Scope Boundary

These changes are limited to aligning *existing content* with Unity's actual behavior. They do NOT include:
- Creating new recipe pages
- Modifying `hooks/macros.py` or `site.yml`
- Changing the `sbatch_template()` macro (it already handles `nodes`, `constraint`, etc.)
- Touching non-SLURM pages

## Implementation Notes

- All partition names, QOS names, and constraint syntax come directly from the Unity docs in `unity-docs/`
- The multi-GPU `--nodes` requirement was announced in the [March 2026 digest](unity-docs/content/news/2026/03/digest-3-11-26.md)
- The QOS changes (removing `cpu-long`/`gpu-long`, adding `-q long`) came from the [October 2024 OS upgrade announcement](unity-docs/content/news/2024/10/os-upgrade-24.04-done.md)
- The `--qos=short` feature is documented in the [July 2023 feature announcements](unity-docs/content/news/2023/07/feature-announcements.md)
