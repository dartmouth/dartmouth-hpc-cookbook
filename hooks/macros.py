"""
Custom macros for the HPC Cookbook.

These are available in any Markdown file via Jinja2 syntax:
  {{ institution.name }}      -> from site.yml
  {{ cluster.name }}          -> from site.yml
  {{ slurm_partitions() }}    -> build-time table of partitions
  {{ module_list("python") }} -> build-time list of matching modules
  {{ last_updated() }}        -> human-readable build timestamp
  {{ remote_cmd("login.example.edu", "free -h") }}
                              -> run a command on a remote host via SSH
  {{ system_stats(["server1.example.edu", "server2.example.edu"]) }}
                              -> system stats table from remote hosts

All institution-specific variables are defined in site.yml at the repo
root.  See CUSTOMIZING.md for details on adapting this cookbook to a
different HPC center.

For truly live data, use the JavaScript widget approach instead
(see docs/reference/status.md for an example).
"""

import subprocess
import json
import os
import re
from datetime import datetime, timezone
from pathlib import Path

import yaml


_ROOT = Path(__file__).resolve().parent.parent
_INCLUDES = _ROOT / "includes"
_SITE_YML = _ROOT / "site.yml"

_GLOSSARY_YML = _INCLUDES / "glossary.yml"
_GLOSSARY_MD = _INCLUDES / "glossary.md"


def _load_site_config() -> dict:
    """Load institution-specific variables from site.yml."""
    with open(_SITE_YML) as f:
        return yaml.safe_load(f)


def _load_glossary() -> list[dict]:
    """Load glossary entries from the YAML source of truth."""
    with open(_GLOSSARY_YML) as f:
        return yaml.safe_load(f)


def _build_tooltip(entry: dict) -> str:
    """Build tooltip text for a glossary entry.

    Abbreviations (entries with a ``full`` field) show "Full Name — definition".
    Plain terms show just the definition.
    """
    if entry.get("tooltip"):
        return entry["tooltip"]
    full = entry.get("full", "")
    definition = entry.get("definition", "")
    if full:
        return f"{full} — {definition}" if definition else full
    return definition


def _substitute_vars(text: str, site_config: dict) -> str:
    """Replace {{var.key}} placeholders in glossary text with site.yml values.

    Supports dotted paths like ``{{cluster.name}}`` or ``{{institution.short_name}}``.
    Unrecognised placeholders are left as-is.
    """
    def _replace(match: re.Match) -> str:
        path = match.group(1).strip()
        obj: object = site_config
        for part in path.split("."):
            if isinstance(obj, dict) and part in obj:
                obj = obj[part]
            else:
                return match.group(0)  # leave unresolved
        return str(obj)

    return re.sub(r"\{\{\s*([\w.]+)\s*\}\}", _replace, text)


def _generate_glossary_tooltips(site_config: dict):
    """Write includes/glossary.md (tooltip definitions) from glossary.yml.

    Called once at build time so pymdownx.snippets can auto-append the
    generated file to every page.  Substitutes ``{{ var }}`` placeholders
    with values from site.yml.
    """
    entries = _load_glossary()
    lines: list[str] = [
        "<!-- AUTO-GENERATED from includes/glossary.yml — do not edit by hand -->"
    ]

    for entry in entries:
        if entry.get("no_tooltip"):
            continue

        term = entry["term"]
        tooltip = _substitute_vars(_build_tooltip(entry), site_config)

        lines.append(f"*[{term}]: {tooltip}")

        for plural in entry.get("plurals", []):
            lines.append(f"*[{plural}]: {tooltip}")

    _GLOSSARY_MD.write_text("\n".join(lines) + "\n")


def define_env(env):
    """Hook called by mkdocs-macros-plugin to register macros."""

    # ----------------------------------------------------------------
    # Load site.yml and merge institution-specific variables so they
    # are available in every page as {{ institution.name }}, etc.
    # ----------------------------------------------------------------
    site_config = _load_site_config()
    for key, value in site_config.items():
        env.variables[key] = value

    # Set site_name from site.yml (overrides the placeholder in mkdocs.yml)
    inst = site_config.get("institution", {})
    short = inst.get("short_name", "")
    if short:
        env.conf["site_name"] = f"{short} HPC Cookbook"

    # Generate tooltip file from the single glossary YAML, substituting
    # institution-specific variables into glossary text.
    _generate_glossary_tooltips(site_config)

    @env.macro
    def glossary():
        """Render the glossary as a Markdown definition list.

        Abbreviations show their full form before the definition.
        ``{{ var }}`` placeholders in glossary.yml are replaced with
        values from site.yml.

        Usage in Markdown:
            {{ glossary() }}
        """
        entries = _load_glossary()
        parts: list[str] = []
        for entry in entries:
            term = entry["term"]
            full = entry.get("full", "")
            definition = _substitute_vars(
                entry.get("definition", ""), site_config
            )

            if full:
                heading = f"**{term}** — {full}"
            else:
                heading = f"**{term.title()}**"

            parts.append(f"{heading}\n:   {definition}")
        return "\n\n".join(parts)

    @env.macro
    def last_updated():
        """Return a human-readable build timestamp."""
        now = datetime.now(timezone.utc)
        return now.strftime("%B %d, %Y at %H:%M UTC")

    @env.macro
    def slurm_partitions():
        """
        Query Slurm for partition info at build time and return a Markdown table.

        Falls back to a placeholder if sinfo is not available (e.g., in CI).
        """
        try:
            result = subprocess.run(
                [
                    "sinfo",
                    "--noheader",
                    "--format=%P|%l|%D|%c|%m|%G",
                ],
                capture_output=True,
                text=True,
                timeout=10,
            )
            if result.returncode != 0:
                raise RuntimeError("sinfo returned non-zero")

            lines = result.stdout.strip().split("\n")
            table = (
                "| Partition | Time Limit | Nodes | CPUs/Node | Memory (MB) | GPUs |\n"
            )
            table += (
                "|-----------|-----------|-------|-----------|-------------|------|\n"
            )

            for line in lines:
                parts = line.strip().split("|")
                if len(parts) == 6:
                    table += f"| {' | '.join(p.strip() for p in parts)} |\n"

            return table

        except (FileNotFoundError, RuntimeError, subprocess.TimeoutExpired):
            return (
                '!!! info "Partition data unavailable"\n'
                "    Partition information is generated at build time from the cluster.\n"
                "    This build was not run on a cluster node.\n"
                "    See [Partition Details](../reference/partitions.md) for static info.\n"
            )

    @env.macro
    def module_list(query: str = ""):
        """
        List available environment modules matching a query at build time.

        Falls back gracefully when not on a cluster node.
        """
        try:
            result = subprocess.run(
                ["module", "-t", "avail", query],
                capture_output=True,
                text=True,
                timeout=10,
                shell=False,
            )
            # module avail outputs to stderr (yes, really)
            output = result.stderr.strip() or result.stdout.strip()
            modules = [m for m in output.split("\n") if m and not m.startswith("/")]

            if not modules:
                return f"No modules found matching `{query}`."

            items = "\n".join(f"- `{m}`" for m in sorted(modules))
            return items

        except (FileNotFoundError, subprocess.TimeoutExpired):
            return (
                f'!!! info "Module data unavailable"\n'
                f"    Module listing for `{query}` is generated at build time.\n"
                f"    This build was not run on a cluster node.\n"
            )

    @env.macro
    def remote_cmd(host: str, command: str, label: str = ""):
        """
        Run a command on a remote host via SSH at build time.

        Returns the output wrapped in a fenced code block. Falls back to
        an info admonition when SSH is unavailable (e.g., in CI or off-VPN).

        Uses GSSAPI (Kerberos) for authentication. Before building, obtain
        a Kerberos ticket for your realm (see ``build.kerberos_realm`` in
        site.yml).  Then run ``mkdocs build`` or ``mkdocs serve`` as usual.

        Usage in Markdown:
            {{ remote_cmd("login.example.edu", "free -h") }}
            {{ remote_cmd("login.example.edu", "free -h", label="MyCluster") }}
        """
        display_label = label or host.split(".")[0].capitalize()
        output = _ssh_cmd(host, command)

        if output is not None:
            details = (
                '??? example "Show me the commands"\n'
                f"    The output above was fetched when this cookbook was last published by running\n"
                f"    the following command on **{display_label}** (`{host}`) via SSH:\n\n"
                f"    ```bash\n    {command}\n    ```\n"
            )
            return (
                f"**{display_label}** — `{command}`:\n\n"
                f"```\n{output}\n```\n\n" + details
            )
        else:
            return (
                f'!!! info "Live data from {display_label} unavailable"\n'
                f"    Output of `{command}` on {display_label} is fetched via SSH at build time.\n"
                f"    This build could not reach {host}.\n"
            )

    def _ssh_cmd(host: str, command: str) -> str | None:
        """Run a command on a remote host via SSH. Returns stdout or None.

        Uses GSSAPI (Kerberos) for passwordless authentication. Requires
        a valid Kerberos ticket (see ``build.kerberos_realm`` in site.yml).
        """
        try:
            result = subprocess.run(
                [
                    "ssh",
                    "-o", "BatchMode=yes",
                    "-o", "ConnectTimeout=5",
                    "-o", "StrictHostKeyChecking=accept-new",
                    "-o", "GSSAPIAuthentication=yes",
                    "-o", "GSSAPIDelegateCredentials=yes",
                    host,
                    command,
                ],
                capture_output=True,
                text=True,
                timeout=15,
            )
            if result.returncode != 0:
                return None
            return result.stdout.strip()
        except (FileNotFoundError, RuntimeError, subprocess.TimeoutExpired):
            return None

    def _parse_free(output: str) -> tuple[str, str]:
        """Extract total and available memory from ``free -h`` output."""
        for line in output.split("\n"):
            if line.startswith("Mem:"):
                fields = line.split()
                total = fields[1] if len(fields) > 1 else "—"
                available = fields[6] if len(fields) >= 7 else "—"
                return total, available
        return "—", "—"

    def _parse_cpu_util(output: str) -> str:
        """Extract CPU utilization from ``top -bn1`` output.

        Looks for the ``%Cpu(s):`` line and computes utilization as
        ``100 - idle``.
        """
        for line in output.split("\n"):
            if "%Cpu" in line or "Cpu(s)" in line:
                # Match the idle value, e.g. "95.3 id" or "95.3%id"
                match = re.search(r"([\d.]+)\s*%?\s*id", line)
                if match:
                    idle = float(match.group(1))
                    return f"{100 - idle:.1f}%"
        return "—"

    @env.macro
    def system_stats(hosts: list[str]):
        """
        SSH into one or more hosts and return a Markdown table with
        CPU count, CPU utilization, total memory, and available memory,
        plus a collapsible section showing the commands used.

        Usage in Markdown:
            {{ system_stats(["server1.example.edu", "server2.example.edu"]) }}
        """
        timestamp = datetime.now(timezone.utc).strftime("%B %d, %Y at %H:%M UTC")
        rows: list[str] = []
        commands_used: list[dict] = []
        dash_row = "| {label} | — | — | — | — |"

        stat_commands = ["nproc", "free -h", "top -bn1 | head -5"]

        for host in hosts:
            label = host.split(".")[0].capitalize()
            commands_used.append({"host": host, "label": label})

            # Gather all stats in a single SSH call
            combined = _ssh_cmd(
                host,
                " && ".join(stat_commands),
            )
            if combined is None:
                rows.append(dash_row.format(label=label))
                continue

            lines = combined.split("\n")

            # First line is nproc output
            cpus = lines[0].strip() if lines else "—"

            # Rest contains free -h and top output
            remaining = "\n".join(lines[1:])
            mem_total, mem_avail = _parse_free(remaining)
            cpu_util = _parse_cpu_util(remaining)

            rows.append(
                f"| {label} | {cpus} | {cpu_util} | {mem_total} | {mem_avail} |"
            )

        table = (
            "| System | CPUs | CPU Utilization | Total Memory | Available Memory |\n"
            "|:------:|:----:|:--------------:|:-----------:|:----------------:|\n"
        )
        table += "\n".join(rows)

        # Build collapsible commands section
        host_list = ", ".join(
            f"`{e['host']}`" for e in commands_used
        )
        cmd_block = "\n".join(
            f"    ```bash\n    {cmd}\n    ```\n" for cmd in stat_commands
        )

        details = (
            '??? example "Show me the commands"\n'
            "    The following commands were run on each system\n"
            f"    ({host_list}) via SSH:\n\n"
            + cmd_block
        )

        return (
            '<figure class="system-stats" markdown>\n\n'
            + table
            + "\n\n"
            + f"<figcaption>Last updated — {timestamp}</figcaption>\n"
            + "</figure>\n\n"
            + details
        )

    def _humanize_mem(mb: int) -> str:
        """Convert megabytes to a human-readable string (GB or TB)."""
        if mb >= 1_000_000:
            return f"{mb / 1_048_576:.1f} TB"
        return f"{mb / 1024:.0f} GB"

    @env.macro
    def cluster_stats(host: str, label: str = ""):
        """
        SSH into a cluster head node and use sinfo to aggregate total
        nodes, CPUs, memory, and GPUs across the cluster. Returns a
        centered Markdown table with a collapsible commands section.

        Usage in Markdown:
            {{ cluster_stats("login.example.edu", label="MyCluster") }}
        """
        display_label = label or host.split(".")[0].capitalize()
        timestamp = datetime.now(timezone.utc).strftime("%B %d, %Y at %H:%M UTC")

        # sinfo with parseable output: nodes, cpus, memory (MB), gres
        sinfo_cmd = (
            "sinfo --noheader --responding -N "
            '--format="%N|%c|%m|%G"'
            " | sort -u -t'|' -k1,1"
        )
        output = _ssh_cmd(host, sinfo_cmd)

        if output is None:
            return (
                f'!!! info "Live data from {display_label} unavailable"\n'
                f"    Cluster stats are fetched via SSH at build time.\n"
                f"    This build could not reach {host}.\n"
            )

        total_nodes = 0
        total_cpus = 0
        total_mem_mb = 0
        total_gpus = 0

        for line in output.split("\n"):
            line = line.strip().strip('"')
            if not line:
                continue
            parts = line.split("|")
            if len(parts) < 4:
                continue

            total_nodes += 1

            try:
                total_cpus += int(parts[1].strip())
            except ValueError:
                pass

            try:
                total_mem_mb += int(parts[2].strip())
            except ValueError:
                pass

            # Parse GRES field for GPUs
            # Formats: "gpu:a100:2(S:0-1)", "gpu:nvidia_a100_80gb_pcie_3g.40gb:4(S:0-1)"
            # The count is always the last number before an optional "(S:...)" suffix
            gres = parts[3].strip()
            if "gpu" in gres:
                for entry in gres.split(","):
                    if "gpu" in entry:
                        match = re.search(r":(\d+)(?:\(|$)", entry)
                        if match:
                            total_gpus += int(match.group(1))

        table = (
            "| Metric | Total |\n"
            "|:------:|:-----:|\n"
            f"| Nodes | {total_nodes:,} |\n"
            f"| CPU cores | {total_cpus:,} |\n"
            f"| Memory | {_humanize_mem(total_mem_mb)} |\n"
            f"| GPUs | {total_gpus:,} |\n"
        )

        details = (
            '??? example "Show me the commands"\n'
            f"    The data above was when this cookbook was last published by running\n"
            f"    the following command on **{display_label}** (`{host}`) via SSH:\n\n"
            f"    ```bash\n    {sinfo_cmd}\n    ```\n"
        )

        return (
            '<figure class="system-stats" markdown>\n\n'
            + table
            + "\n\n"
            + f"<figcaption>Last updated — {timestamp}</figcaption>\n"
            + "</figure>\n\n"
            + details
        )

    @env.macro
    def sbatch_template(
        job_name: str = "my_job",
        partition: str = "standard",
        time: str = "01:00:00",
        cpus: int = 1,
        mem: str = "4G",
        gpus: int = 0,
        modules: list[str] | None = None,
        commands: str = "echo 'Hello from the cluster!'",
    ):
        """
        Generate a templated sbatch script. Useful for recipe pages.

        Usage in Markdown:
            {{ sbatch_template(
                job_name="pytorch_train",
                partition="gpu",
                gpus=1,
                mem="32G",
                modules=["python/3.11", "cuda/12.2"],
                commands="python train.py --epochs 50"
            ) }}
        """
        script = f"""```bash
#!/bin/bash
#SBATCH --job-name={job_name}
#SBATCH --partition={partition}
#SBATCH --time={time}
#SBATCH --cpus-per-task={cpus}
#SBATCH --mem={mem}
#SBATCH --output=%x_%j.out
#SBATCH --error=%x_%j.err"""

        if gpus > 0:
            script += f"\n#SBATCH --gres=gpu:{gpus}"

        script += "\n"

        if modules:
            script += "\n# Load required modules\n"
            for mod in modules:
                script += f"module load {mod}\n"

        script += f"\n# Run your work\n{commands}\n```"

        return script


def on_post_page_macros(env):
    """Resolve Jinja2-style placeholders in page metadata (title, description).

    MkDocs extracts YAML frontmatter *before* the macros plugin renders the
    page body, so ``{{ institution.short_name }}`` in a ``title:`` field is
    never processed by Jinja2.  This hook runs after macro rendering and
    patches ``page.meta`` so the browser tab title and Material's on-scroll
    header display the resolved values instead of raw ``{{ … }}`` tokens.
    """
    page = env.page
    if page is None:
        return

    site_config = env.variables  # already populated by define_env()

    for key in ("title", "description"):
        raw = page.meta.get(key)
        if raw and "{{" in str(raw):
            page.meta[key] = _substitute_vars(str(raw), site_config)

    # Material theme also caches the title on the Page object itself.
    if page.title and "{{" in page.title:
        page.title = _substitute_vars(page.title, site_config)
