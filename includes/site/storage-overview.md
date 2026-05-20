<!-- includes/site/storage-overview.md
     Institution-specific: describes the storage systems available at your site.
     Replace this file with your own storage details when forking the cookbook.
     You can use any Jinja2 variables from site.yml, e.g. {{ storage.home_path }}.
-->

## Storage on {{ cluster.name }}

{{ cluster.name }} provides a tiered storage system. Here's how each tier maps to the concepts described above:

| Storage | Path | Quota | Backed Up | Best For |
|:--------|:-----|:------|:----------|:---------|
| **Home** | `{{ storage.home_path }}` | {{ storage.home_quota }} | Yes | Init files, scripts, configuration |
| **Work** | `{{ storage.work_path }}/pi_<group>` | {{ storage.work_quota }} (shared per PI group) | Yes | Primary job I/O, research data, results |
| **Scratch** | `{{ storage.scratch_path }}` | {{ storage.scratch_quota }} soft cap | No | Fast temporary workspace for active jobs |
| **Project** | `{{ storage.project_path }}` | By allocation | Varies | Staged data, cross-group sharing |
| **Datasets** | `{{ storage.datasets_path }}` | Read-only | N/A | 120+ curated AI/ML and bioinformatics datasets |

### Work Storage (`{{ storage.work_path }}`)

Your PI group's **work directory** is the primary location for research data and job I/O. Each PI group gets {{ storage.work_quota }} of shared storage by default. This is where you should keep datasets you're actively using, job input files, and results.

### Scratch Storage (`{{ storage.scratch_path }}`)

Scratch provides high-speed temporary storage for running jobs. Files on scratch are **not backed up** and are subject to cleanup policies. Use scratch for intermediate results and temporary files during computation, then copy important results back to your work directory.

Scratch space is managed through the [HPC Workspace]({{ cluster.docs_url }}managing-files/hpc-workspace/) system. Here's the minimum you need to get started:

```bash
# Create a scratch workspace (max 30 days)
ws_allocate myproject 30
```

This prints the path to your new workspace, something like:

```
/scratch/workspace/yourname-myproject
```

Use that path anywhere a recipe says `/path/to/your/scratch`.

A few other commands you'll reach for:

```bash
# List your workspaces and their expiration dates
ws_list

# Extend a workspace before it expires
ws_extend myproject 30

# Release a workspace when you're done
ws_release myproject
```

!!! tip "Save the path in a variable"
    Many recipes need your scratch path repeatedly. A handy pattern:

    ```bash
    export SCRATCH=$(ws_list -s myproject)
    ```

    Then use `$SCRATCH` in your scripts. Add it to `~/.bashrc` if you use the same workspace across sessions.

!!! warning "Scratch is temporary"
    Workspaces expire and files are not backed up. Always copy important results back to your work directory (`{{ storage.work_path }}`) when a job finishes.

For the full set of options (shared workspaces, email reminders, etc.), see the [HPC Workspace documentation]({{ cluster.docs_url }}managing-files/hpc-workspace/).

### Curated Datasets (`{{ storage.datasets_path }}`)

{{ cluster.name }} provides 120+ pre-staged AI/ML models and bioinformatics databases at `{{ storage.datasets_path }}`. These include popular models (Llama, Whisper, DINO), databases (AlphaFold, BLAST, UniProt), and benchmark datasets (ImageNet, COCO). Using these saves you from downloading large files and counting them against your storage quota.

### Which Storage Should I Use?

| I need to... | Use |
|:-------------|:----|
| Store scripts and config files | **Home** (`{{ storage.home_path }}`) |
| Run jobs and store research data | **Work** (`{{ storage.work_path }}/pi_<group>`) |
| Fast temporary workspace for a running job | **Scratch** (`{{ storage.scratch_path }}`) |
| Share data across groups or stage large datasets | **Project** (`{{ storage.project_path }}`) — request allocation first |
| Use a pre-staged ML model or reference database | **Datasets** (`{{ storage.datasets_path }}`) |

!!! warning "Job I/O: use Work or Scratch"
    All job I/O should use `{{ storage.work_path }}` or `{{ storage.scratch_path }}`, which are high-performance parallel filesystems. Do **not** run jobs that read/write heavily from `{{ storage.project_path }}` or `{{ storage.home_path }}`.

For full storage documentation, see the [{{ cluster.name }} storage overview]({{ cluster.docs_url }}cluster_specs/storage/).
