# Customizing This Cookbook for Your Institution

This cookbook is written for the **Unity HPC cluster**.  The core content
(HPC concepts, Linux fundamentals, recipes, tutorials) is shared across all
Unity member institutions.  Each institution forks this repo and customizes
a small set of files to add their own branding, account onboarding flow,
and local system details.

> [!NOTE] "Non-Unity clusters"
> The variable-driven architecture (`site.yml` + Jinja2 templates) could
> be adapted for a completely different cluster.  You would need to change
> the cluster variables, rewrite the `includes/site/` content blocks, and
> review recipes that reference Unity-specific features (scratch workspaces,
> Conda presets, etc.).  The rest of this guide assumes you are a Unity
> member institution.

## Quick start

1. **Fork** (or clone) this repository.
2. **Edit `site.yml`** — set your institution's name, support contacts,
   portal URL, and username format.  The cluster-level variables (Unity's
   login node, scheduler, storage paths) are already correct.
3. **Replace the files in `includes/site/`** that describe your
   institution's specific details (account flow, other local systems).
4. **Swap the branding** (logo, fonts, CSS) in `docs/stylesheets/` and
   `docs/assets/`.
5. Run `mkdocs serve` and verify everything looks right.

Each step is explained in detail below.

---

## 1. `site.yml` — institution variables

All institution-specific variables live in `site.yml` at the repository root.
They are loaded at build time by `hooks/macros.py` and made available in every
Markdown page via Jinja2 syntax (`{{ variable.name }}`).

### Institution variables

These are the fields you **must** change when forking for your institution:

| Variable | Example (Dartmouth) | Where it appears |
|----------|---------------------|------------------|
| `institution.name` | Dartmouth College | Footer, about pages |
| `institution.short_name` | Dartmouth | Headings, inline text, site title |
| `institution.support_team` | Research Computing and Data | Footer, troubleshooting |
| `institution.support_email` | research.computing@dartmouth.edu | Contact links, troubleshooting |
| `institution.support_url` | https://rc.dartmouth.edu | Footer link |
| `institution.github_url` | https://github.com/dartmouth | Social links |
| `institution.username_label` | NetID | Login instructions, prompts |
| `institution.sso_dropdown_label` | Dartmouth College | Label users pick in the Unity SSO dropdown |
| `institution.username_suffix` | `_dartmouth_edu` | Appended to the username when SSHing into Unity |

### Cluster variables

These describe the Unity cluster itself.  Most are **shared across all member
institutions** and typically don't need changing.  The ones marked ★ are
institution-specific:

| Variable | Example | Notes |
|----------|---------|-------|
| `cluster.name` | Unity | Shared — don't change |
| `cluster.scheduler` | Slurm | Shared |
| `cluster.module_system` | Lmod | Shared |
| `cluster.login_node` | login.unityhpc.org | Shared |
| `cluster.login_node_count` | 4 | Shared |
| `cluster.default_partition` | cpu | Shared |
| `cluster.ondemand_url` | https://ood.unity.rc.umass.edu/ | Shared |
| `cluster.docs_url` | https://unityhpc.org/documentation/ | Shared |
| `cluster.portal_url` | https://unity.dartmouth.edu/ | ★ Institution-specific portal URL |
| `cluster.catchall_pi_group` | pi_general_dartmouth_edu | ★ Institution-specific fallback PI group |
| `cluster.support_email` | hpc@umass.edu | Shared (Unity-wide support) |

### Storage variables

These describe Unity's storage tiers and are **shared across all members**:

| Variable | Example | Where it appears |
|----------|---------|------------------|
| `storage.home_path` | /home | Home directory references |
| `storage.home_quota` | 100 GB | Storage guidance |
| `storage.work_path` | /work | Primary job I/O references |
| `storage.work_quota` | 1 TB | Storage guidance |
| `storage.scratch_path` | /scratch | Scratch storage references |
| `storage.scratch_quota` | 15 TB | Storage guidance |
| `storage.project_path` | /project | Project storage references |
| `storage.datasets_path` | /datasets | Curated dataset references |

### Build variables

| Variable | Example | Where it appears |
|----------|---------|------------------|
| `build.ssh_auth` | key | SSH macro authentication (`key` or `gssapi`) |

### Example: forking for Smith College

To adapt the cookbook for Smith College (a Unity member), you would change
only the institution-specific fields and the two starred cluster fields:

```yaml
institution:
  name: Smith College
  short_name: Smith
  support_team: Scientific Computing
  support_email: scicomp@smith.edu
  support_url: https://www.smith.edu/its/scicomp
  github_url: https://github.com/smith-college
  username_label: Smith Username
  sso_dropdown_label: Smith College
  username_suffix: _smith_edu

cluster:
  name: Unity                          # keep as-is
  scheduler: Slurm                     # keep as-is
  module_system: Lmod                  # keep as-is
  login_node: login.unityhpc.org       # keep as-is
  login_node_count: 4                  # keep as-is
  default_partition: cpu               # keep as-is
  ondemand_url: https://ood.unity.rc.umass.edu/  # keep as-is
  docs_url: https://unityhpc.org/documentation/  # keep as-is
  portal_url: https://unity.smith.edu/           # ★ your portal
  catchall_pi_group: pi_general_smith_edu        # ★ your PI group
  support_email: hpc@umass.edu         # keep as-is (Unity-wide)

# storage and build sections stay the same
```

After this change, every page that references `{{ institution.short_name }}`
will render "Smith", while `{{ cluster.name }}` still renders "Unity".

---

## 2. `includes/site/` — institution-specific content blocks

Some content is too large or too institution-specific to express as a simple
variable.  These blocks live as Markdown files in `includes/site/` and are
pulled into pages with `{% include "site/filename.md" %}`.

Most of these files describe Unity's shared infrastructure and **work as-is**
for any member institution.  The ones you need to rewrite are marked below.

| File | Purpose | Included by | Rewrite needed? |
|------|---------|-------------|:---------------:|
| `systems-overview.md` | Lists HPC systems your institution runs IN ADDITION to Unity | `docs/getting-started/what-is-hpc.md` | **Yes** — replace Dartmouth systems (Discovery, Andes, etc.) with yours, or empty the file if Unity is your only system |
| `account-details.md` | Institution-specific account creation details (SSO portal URL, onboarding steps) | `docs/getting-started/account.md` | **Yes** — replace Dartmouth portal URL and onboarding steps |
| `connecting-details.md` | How to connect (SSH hostname, OnDemand URL) | `docs/getting-started/connecting.md` | No — Unity-generic |
| `storage-overview.md` | Maps Unity's storage tiers to the generic concepts | `docs/fundamentals/storage.md` | No — Unity-generic |
| `conda-presets.md` | Conda environment presets and helper scripts | `docs/recipes/python/conda.md` | No — Unity-generic |
| `footer.md` | "Maintained by …" footer line | `docs/home/index.md` | No — uses `site.yml` variables, adapts automatically |

There is also a shared include that lives one level up:

| File | Purpose | Included by |
|------|---------|-------------|
| `includes/username-input.md` | "Personalize this page" input widget that fills the reader's username into code blocks | Any page that uses copy-pasteable SSH or Slurm commands |

The `username-input.md` widget uses `institution.username_label` from
`site.yml`, so it adapts automatically when you change that variable.

---

## 3. Branding — logos, fonts, and colors

The visual theme is defined in a few places:

- **`docs/assets/`** — logo images (`d-pine.png`, `d-pine_rev.png`).
  Replace with your own logo files and update the paths in `mkdocs.yml`
  under `theme.logo` and `theme.favicon`.

- **`docs/stylesheets/dartmouth.css`** — color schemes and font-face
  declarations.  The CSS defines two schemes (`dartmouth-light` and
  `dartmouth-dark`).  You can either:
    - Rename the schemes and update the references in `mkdocs.yml`, or
    - Simply edit the CSS variables in place to match your brand colors.

- **`docs/stylesheets/fonts/`** — custom font files.  Replace or remove
  these and update the `@font-face` rules in the CSS.

- **`mkdocs.yml`** — references the CSS file under `extra_css` and the
  color scheme names under `theme.palette`.

---

## 4. Glossary

The glossary (`includes/glossary.yml`) uses `{{ variable }}` placeholders
where definitions reference institution-specific details.  For example:

```yaml
- term: Slurm
  full: Simple Linux Utility for Resource Management
  definition: The job scheduler used on the {{ cluster.name }} cluster.
```

These placeholders are resolved at build time by `hooks/macros.py`.  If you
change variables in `site.yml`, the glossary updates automatically.

Review the glossary after forking to ensure the definitions make sense for
your site.  You may want to add terms specific to your infrastructure or
remove ones that don't apply.

---

## 5. Build-time macros

### `sbatch_template()` — job script generator

The `sbatch_template()` macro in `hooks/macros.py` generates complete Slurm
job scripts.  Recipe pages call it instead of writing raw sbatch blocks, so
every generated script picks up the correct default partition from
`cluster.default_partition` in `site.yml`.

The macro accepts parameters for partition, time, CPUs, memory, GPUs, MPI
settings, module loads, and the commands to run.  Since all Unity members
share the same Slurm configuration, you typically don't need to change
anything here.

### SSH-based live data (optional)

The cookbook also includes macros that SSH into cluster nodes at build time
to fetch live statistics (`system_stats`, `cluster_stats`, `remote_cmd`).
These require:

1. SSH access from the build machine to the cluster nodes.
2. Authentication configured via `build.ssh_auth` in `site.yml`:
   - `key` (default): Uses standard SSH key authentication.
   - `gssapi`: Uses Kerberos/GSSAPI — obtain a ticket before building:
     ```
     kinit youruser@YOUR.REALM
     ```
3. Hostnames defined in your `includes/site/systems-overview.md` (or
   wherever you call the macros).

If your build environment can't reach the cluster (e.g., CI/CD), the macros
fall back gracefully to an info admonition saying the data is unavailable.

---

## 6. Interactive widgets

The cookbook includes JavaScript-powered interactive widgets:

- **Terminal Tour** (`docs/javascripts/linux-terminal-tour.js`) — A guided CLI simulation. The `CONFIG` block at the top defines the cluster name, home path function, and default username. Update these for your environment.
- **SSH Simulator** (`docs/javascripts/ssh-simulator.js`) — An SSH connection practice tool. The `CONFIG` block defines the cluster hostname and default username.
- **Username Personalize** (`docs/javascripts/username-personalize.js`) — Lets readers enter their username once and have it substituted into every `<code>` block on the page. The placeholder token is derived from `institution.username_label` in `site.yml` (via `includes/username-input.md`), so it adapts automatically.
- **Quiz System** (`docs/javascripts/quiz.js`) — Multi-slide quizzes. The HTML structure is in the Markdown files. No institution-specific configuration needed.

---

## 7. `mkdocs.yml` — build configuration

Most of `mkdocs.yml` is generic (theme features, markdown extensions,
plugins) and shouldn't need changes.  The institution-specific parts to
review are:

- `extra_css` — path to your CSS file
- `extra_javascript` — includes the interactive widgets and MathJax CDN
- `extra.social` — GitHub/social links
- `theme.logo` / `theme.favicon` — paths to your logo
- `theme.palette` — color scheme names (must match your CSS)
- `nav` — the navigation tree; add or remove sections to match the content you keep

The `site_name` is set automatically from `site.yml` by the macros hook.
If you want to override it, uncomment the `site_name` line in `mkdocs.yml`.

---

## Summary of files to change

| Priority | File(s) | What to do |
|:--------:|---------|------------|
| **Must** | `site.yml` | Set your institution variables and the two ★ cluster fields |
| **Must** | `includes/site/systems-overview.md` | Replace Dartmouth-specific systems with yours (or empty the file) |
| **Must** | `includes/site/account-details.md` | Rewrite with your institution's account flow |
| Should | `docs/assets/` | Replace logo images |
| Should | `docs/stylesheets/dartmouth.css` | Adjust colors and fonts |
| Should | `docs/stylesheets/fonts/` | Replace custom fonts |
| Should | `mkdocs.yml` | Update logo paths, CSS path, social links |
| Should | `docs/javascripts/*.js` | Update CONFIG blocks in terminal tour, SSH simulator, and username personalize widget |
| Optional | `includes/glossary.yml` | Add/remove terms for your site |
| Optional | `includes/username-input.md` | Adapts automatically via `site.yml`; customize the widget HTML if needed |
| Optional | `hooks/macros.py` | Adjust SSH auth method or `sbatch_template` defaults if needed |
