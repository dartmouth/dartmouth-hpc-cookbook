<!-- includes/site/storage-overview.md
     Institution-specific: describes the storage systems available at your site.
     Replace this file with your own storage details when forking the cookbook.
     You can use any Jinja2 variables from site.yml, e.g. {{ storage.shared_name }}.
-->

## Storage at {{ institution.short_name }}

{{ institution.short_name }} provides several storage options for researchers. Here's how they map to the tiers described above:

### {{ storage.shared_name }} (Long-Term Shared Storage)

**{{ storage.shared_name }}** is {{ institution.short_name }}'s shared network storage, available from all campus HPC systems as well as your desktop. It's designed for storing research data, datasets, and results that need to persist long-term. {{ storage.shared_name }} is backed up and accessible from {{ cluster.name }}, Andes, Polaris, and other campus systems.

This is where you should keep your important research data — the datasets you'll reuse, the results you want to preserve, and anything you'd need to recover if something went wrong.

For details on requesting a {{ storage.shared_name }} allocation and getting started, see the [{{ institution.support_team }} {{ storage.shared_name }} documentation]({{ storage.shared_url }}).

### Scratch on {{ cluster.name }}

{{ cluster.name }} provides high-speed scratch storage at `{{ storage.scratch_path }}`. When you have an account on {{ cluster.name }}, you'll have a personal scratch directory where your jobs can read and write data quickly. Files on scratch are **not backed up** and are subject to a purge policy — don't rely on scratch for long-term storage.

### Your Home Directory

Your home directory on {{ cluster.name }} (`~`) is persistent and backed up, but has a limited quota. Use it for scripts, configuration files, and small personal files. Avoid running jobs or storing large datasets here.

### Which Storage Should I Use?

| Storage | Speed | Capacity | Persistence | Best for |
|:--------|:------|:---------|:------------|:---------|
| **{{ storage.shared_name }}** | Moderate | Large (by allocation) | Backed up | Research data, datasets, long-term results |
| **Scratch** (`{{ storage.scratch_path }}`) | Fast | Large | Purged periodically | Job I/O, temporary files, intermediate results |
| **Home** (`~`) | Moderate | Small (quota) | Backed up | Scripts, config files, small personal files |
