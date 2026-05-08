<!-- includes/site/systems-overview.md
     Institution-specific: any HPC systems your institution operates
     IN ADDITION to {{ cluster.name }}. Replace this file when forking.
     If your institution only uses {{ cluster.name }}, the file can be
     left empty (or reduced to a single sentence pointing at support).
-->

### Other {{ institution.short_name }} Systems

{{ institution.short_name }} also operates several other computing systems. These are **not covered** in this cookbook, but remain available to researchers:

**Discovery** — {{ institution.short_name }}'s on-campus HPC cluster with Slurm scheduling, suitable for batch computing and GPU workloads. Discovery predates {{ institution.short_name }}'s participation in {{ cluster.name }}.

**Andes & Polaris** — Large shared-memory systems available to all {{ institution.short_name }} researchers. These are single machines (not clusters) where you log in and run programs interactively. They are well suited for memory-intensive workloads that don't need a job scheduler.

**Babylon** — A set of shared-memory compute servers operated by Thayer School of Engineering and Computer Science, available only to Thayer and CS users.

!!! tip "Not sure which system to choose?"
    {{ institution.short_name }}'s recommended HPC system is **{{ cluster.name }}**. If you don't know which one would be best for you, start with {{ cluster.name }}.

For information about any of these systems, contact [{{ institution.support_team }}](mailto:{{ institution.support_email }}) or visit [{{ institution.support_url }}]({{ institution.support_url }}).
