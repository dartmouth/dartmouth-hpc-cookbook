---
title: Getting Started with uv
description: "How to set up and manage Python environments with `uv` on {{ cluster.name }}"
tags:
  - python
  - beginner
---

# Getting Started with uv

!!! abstract "What we're cooking"
    How to use [uv](https://docs.astral.sh/uv/) to manage Python versions,
    virtual environments, and packages on {{ cluster.name }}, and why it
    makes your work more reproducible.

## Why Use `uv` on the Cluster?

The system Python on {{ cluster.name }} is shared and locked down — you can't
`pip install` into it. To install your own packages you need an **isolated
environment**: a private copy of Python plus any libraries your project
requires, walled off from the rest of the system.

You also need **reproducibility**. Research code that "works on my laptop"
but breaks on the cluster  (or breaks six months later when a dependency
updates) is research code you can't trust. A reproducible environment
rebuilds exactly the same way every time, on any machine.

`uv` handles both problems in a single tool. It manages Python versions,
creates virtual environments, resolves and installs packages, and locks
every version so the result is reproducible. No need to juggle separate
`module load python`, `python -m venv`, `pip install`, and `pip freeze`
commands.

!!! warning "Don't use `pip install --user`"
    While `--user` installs technically work, they dump packages into your
    home directory where they silently conflict across projects. Always use
    an isolated environment instead.

## How `uv` Manages Your Project

When you start a project with `uv`, it creates three things. Understanding
what each one does will save you confusion later:

| File | What it is | Analogy |
|---|---|---|
| `pyproject.toml` | What you *want*: your dependencies and Python version | A recipe |
| `uv.lock` | What you *got*: every resolved version, pinned exactly | A shopping receipt |
| `.venv/` | Where it *lives*: the actual installed packages | Your pantry |

**`pyproject.toml`** is the file you edit. It lists your dependencies (like
`numpy >= 1.24`) and the Python version your project needs. It's the single
source of truth for what your project requires.

**`uv.lock`** is generated automatically. It records the *exact* version of
every package that was resolved. That includes not just your direct dependencies, but
their dependencies too (so-called *transitive* dependencies), all the way down. This is what guarantees
reproducibility: Anyone who runs `uv sync` gets precisely the same
environment.

**`.venv/`** is the virtual environment directory containing the installed
packages. It's disposable. If it gets corrupted or you delete it, `uv sync`
rebuilds it from the lockfile. Don't check it into version control.

!!! tip "What to commit"
    Commit `pyproject.toml` and `uv.lock` to version control. Don't commit
    `.venv/`! It can get very large and can be recreated at any time with `uv sync`.

## Step by Step

### 1. Load uv

```bash
module load uv
```

This is required on both login nodes and in batch jobs.

### 2. Create a New Project

```bash
uv init myproject  # (1)!
cd myproject
```

1. This creates `pyproject.toml` and `.python-version`. `uv` automatically
   downloads and manages the Python version specified in `.python-version`.

### 3. Add Packages

```bash
uv add numpy pandas matplotlib  # (1)!
```

1. This resolves compatible versions, installs them into `.venv/`, and
   writes the lockfile `uv.lock` that makes your environment
   reproducible.

### 4. Run Your Code

The simplest way is `uv run`, which activates the project environment
automatically:

```bash
uv run python myscript.py
```

You don't need to remember to activate or deactivate anything. `uv run`
reads `pyproject.toml` and handles it for you.

If you prefer a traditional workflow (useful in interactive sessions or when
other tools expect a standard venv), you can still treat a `.venv` managed
by `uv` like any other virtual environment:

```bash
source .venv/bin/activate
python myscript.py
```

### 5. Use a Specific Python Version

```bash
uv python install 3.11  # (1)!
uv init --python 3.11 myproject
```

1. `uv` downloads and manages Python versions for you. You can have multiple
   versions installed side by side and each project uses whichever version
   its `.python-version` file specifies.

### 6. Use in a Batch Job

!!! warning "Remember to load `uv` in every batch job"
    Include `module load uv` in your sbatch script or via the `modules` argument of `sbatch_template`. This ensures the uv commands are available.


{{ sbatch_template(
    job_name="uv_python",
    partition="standard",
    time="01:00:00",
    cpus=1,
    mem="8G",
    modules=["uv"],
    commands="cd /path/to/myproject\nuv run python myscript.py"
) }}

`uv run` handles all environment setup. No `source .venv/bin/activate`
needed in the script.

## Working with an Existing `requirements.txt`

If you have a project that already uses a `requirements.txt` file, `uv` can
work with it directly. Create a virtual environment and install from the
file:

```bash
uv venv  # (1)!
source .venv/bin/activate
uv pip install -r requirements.txt
```

1. Without arguments, `uv venv` creates a `.venv/` in the current directory
   using the default Python version.

To keep the environment in sync as the file changes:

```bash
uv pip sync requirements.txt  # (1)!
```

1. `uv pip sync` ensures the environment matches the file exactly. It
   installs missing packages *and* removes packages that are no longer
   listed.

!!! tip "For new projects, prefer `uv init`"
    The `uv pip` workflow is useful for existing projects or when
    collaborating with others who use `requirements.txt`, but
    `pyproject.toml` with `uv.lock` gives you better reproducibility
    and dependency management.

## Shared Environments for Labs

If your lab has a shared project directory, you can create a `uv` project
there. Anyone with access to the directory can run `uv sync` to get an
identical environment:

```bash
cd /path/to/shared/labproject
uv sync  # (1)!
uv run python analysis.py
```

1. `uv sync` reads `pyproject.toml` and `uv.lock`, then creates or updates
   `.venv/` so everyone gets exactly the same package versions.

## Keeping Storage Tidy

`uv` caches downloaded packages and Python builds so that repeated installs
are fast. By default this cache lives in `~/.cache/uv` — inside your home
directory, which has a storage quota on {{ cluster.name }}.

The cache is purely a speed optimization. It's safe to delete at any time because
`uv` will simply re-download what it needs on the next install. That makes it
a good candidate for scratch storage, which is fast and has generous space
limits but is not permanent.

!!! tip "Move the `uv` cache to scratch"
    Add this line to your `~/.bashrc` so the cache goes to scratch
    automatically:
    ```bash
    export UV_CACHE_DIR={{ storage.scratch_path }}/$USER/.uv-cache
    ```
    Log out and back in (or run `source ~/.bashrc`) for it to take effect.

To reclaim space at any time, prune entries that are no longer needed by any
project:

```bash
uv cache prune
```

The `.venv/` directory also counts against quota if your project lives in
your home directory. For large environments (especially ML packages),
consider placing the project itself on scratch or shared storage. Just
remember that scratch is **not backed up**! Always keep `pyproject.toml`
and `uv.lock` in version control so you can recreate the environment
anywhere.

## Common Pitfalls

??? failure "ModuleNotFoundError in a batch job"
    You probably forgot `module load uv` in your sbatch script, or you're
    running `python myscript.py` instead of `uv run python myscript.py`.
    Without `uv run`, the job uses the system Python which doesn't know
    about your project's packages. Make sure `module load uv` appears in
    the script and use `uv run` to launch your code.

??? failure "Disk quota exceeded when installing packages"
    Your home directory has a quota. Two things eat into it: the `uv` cache
    (`~/.cache/uv`) and the `.venv/` directory itself. Move the cache to
    scratch with `UV_CACHE_DIR` (see [Keeping Storage Tidy](#keeping-storage-tidy)
    above) and consider placing large projects on
    `{{ storage.scratch_path }}` as well. Remember that scratch is **not
    backed up**! Keep `pyproject.toml` and `uv.lock` in version control.

??? failure "I edited `pyproject.toml` but my environment didn't change"
    When you use `uv add`, the environment updates automatically. But if
    you edit `pyproject.toml` by hand (e.g., to change a version
    constraint), you need to run `uv sync` explicitly to apply the changes.

??? failure "Wrong Python version in my project"
    `uv` uses the version specified in `.python-version`. If you need a
    different version, either edit that file or create a new project with
    `uv init --python 3.xx myproject`. The `.venv/` is tied to the Python
    version that created it — after changing versions, delete `.venv/` and
    run `uv sync` to rebuild.

## Quick Start

Here the essence of everything above, distilled into a copy-paste recipe for starting a new
project:

```bash
# Load uv
module load uv

# Move the cache off your home directory (only needed once — add to ~/.bashrc)
export UV_CACHE_DIR={{ storage.scratch_path }}/$USER/.uv-cache

# Create a project and add packages
uv init myproject
cd myproject
uv add numpy pandas matplotlib

# Verify it works
uv run python -c "import numpy; print(numpy.__version__)"
```
