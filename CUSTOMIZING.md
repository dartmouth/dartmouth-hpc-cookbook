# Customizing This Cookbook for Your Institution

This HPC Cookbook is designed to be forked and adapted by any HPC center.
The generic content (HPC concepts, Linux fundamentals, Python recipes, etc.)
lives in `docs/` and works out of the box.  Institution-specific details are
isolated in a small number of files so you can swap them out without touching
the core articles.

## Quick start

1. **Fork** (or clone) this repository.
2. **Edit `site.yml`** — this is the single most important file.  It defines
   your institution name, cluster name, scheduler, and other variables that
   appear throughout the site.
3. **Replace the files in `includes/site/`** with content describing *your*
   systems.
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

| Variable | Example | Where it appears |
|----------|---------|------------------|
| `institution.name` | Dartmouth College | Footer, about pages |
| `institution.short_name` | Dartmouth | Headings, inline text, site title |
| `institution.support_team` | Research Computing | Footer, troubleshooting |
| `institution.support_email` | research.computing@dartmouth.edu | Contact links, troubleshooting |
| `institution.support_url` | https://rc.dartmouth.edu | Footer link |
| `institution.github_url` | https://github.com/dartmouth | Social links |
| `institution.username_label` | NetID | Login instructions, prompts |
| `institution.sso_dropdown_label` | Dartmouth College | Label users pick in the {{ cluster.name }} SSO dropdown |
| `institution.username_suffix` | `_dartmouth_edu` | Appended to the username when SSHing into {{ cluster.name }} |

### Cluster variables

| Variable | Example | Where it appears |
|----------|---------|------------------|
| `cluster.name` | Unity | Throughout all articles |
| `cluster.scheduler` | Slurm | Job submission guides |
| `cluster.module_system` | Lmod | Module system references |
| `cluster.login_node` | login.unityhpc.org | SSH connection guides |
| `cluster.login_node_count` | 4 | Number of named login nodes (login1..loginN) |
| `cluster.default_partition` | cpu | Example job scripts |
| `cluster.ondemand_url` | https://ood.unity.rc.umass.edu/ | Open OnDemand references |
| `cluster.docs_url` | https://unityhpc.org/documentation/ | Links to official docs |
| `cluster.portal_url` | https://unity.dartmouth.edu/ | Account registration |
| `cluster.catchall_pi_group` | pi_general_dartmouth_edu | Optional general PI group for users without a specific lab |
| `cluster.support_email` | hpc@umass.edu | Cluster-level support |

### Storage variables

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

To customize, open `site.yml` and replace the values.  For example, to
adapt the cookbook for a fictional "Atlas" cluster at MIT:

```yaml
institution:
  name: Massachusetts Institute of Technology
  short_name: MIT
  support_team: Research Computing Services
  support_email: rcs@mit.edu
  support_url: https://rc.mit.edu
  github_url: https://github.com/mit
  username_label: Kerberos ID
  sso_dropdown_label: MIT
  username_suffix: _mit_edu

cluster:
  name: Atlas
  scheduler: Slurm
  module_system: Lmod
  login_node: atlas.mit.edu
  login_node_count: 2
  default_partition: general
  ondemand_url: https://ood.atlas.mit.edu/
  docs_url: https://atlas.mit.edu/docs/
  portal_url: https://atlas.mit.edu/portal/
  catchall_pi_group: pi_general_mit_edu
  support_email: hpc@mit.edu

storage:
  home_path: /home
  home_quota: 50 GB
  work_path: /work
  work_quota: 2 TB
  scratch_path: /scratch
  scratch_quota: 10 TB
  project_path: /project
  datasets_path: /datasets

build:
  ssh_auth: gssapi
```

After this change, every page that references `{{ institution.short_name }}`
will render "MIT", and `{{ cluster.name }}` will render "Atlas".

---

## 2. `includes/site/` — institution-specific content blocks

Some content is too large or too institution-specific to express as a simple
variable.  These blocks live as Markdown files in `includes/site/` and are
pulled into generic pages with `{% include "site/filename.md" %}`.

| File | Purpose | Included by |
|------|---------|-------------|
| `systems-overview.md` | Lists any institution-specific HPC systems available IN ADDITION to {{ cluster.name }} | `docs/getting-started/what-is-hpc.md` |
| `account-details.md` | Account creation process, what users get (home dir, storage) | `docs/getting-started/account.md` |
| `connecting-details.md` | How to connect (SSH hostname, OnDemand URL) | `docs/getting-started/connecting.md` |
| `storage-overview.md` | Maps the cluster's storage tiers to the generic concepts | `docs/fundamentals/storage.md` |
| `footer.md` | "Maintained by …" footer line | `docs/index.md` |

When forking, replace these files with your own content.  You can use any
Jinja2 variables from `site.yml` inside them, plus the macros defined in
`hooks/macros.py` (like `{{ system_stats([...]) }}` or
`{{ cluster_stats("host", label="Name") }}`).

### Forkability notes for Unity institutions

If your institution is part of the Unity consortium, most of these files are
largely reusable as-is — they describe Unity's shared infrastructure:

- **`connecting-details.md`** — Unity-generic (same login node and OnDemand URL)
- **`storage-overview.md`** — Unity-generic (same storage tiers)

The files you'll need to fully rewrite for your institution:

- **`systems-overview.md`** — Replace the Dartmouth-specific systems (Discovery, Andes, etc.) with your institution's landscape, or empty the file if {{ cluster.name }} is the only system to mention
- **`account-details.md`** — Replace the Dartmouth SSO portal URL and onboarding steps with your institution's process

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
change `cluster.name` in `site.yml`, the glossary updates automatically.

Review the glossary after forking to ensure the definitions make sense for
your site.  You may want to add terms specific to your infrastructure or
remove ones that don't apply.

---

## 5. Build-time live data (optional)

The cookbook includes macros that SSH into cluster nodes at build time to
fetch live statistics (`system_stats`, `cluster_stats`, `remote_cmd`).
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
- **Quiz System** (`docs/javascripts/quiz.js`) — Multi-slide quizzes. The HTML structure is in the Markdown files.

---

## 7. `mkdocs.yml` — build configuration

Most of `mkdocs.yml` is generic (theme features, markdown extensions,
plugins) and shouldn't need changes.  The institution-specific parts to
review are:

- `extra_css` — path to your CSS file
- `extra.social` — GitHub/social links
- `theme.logo` / `theme.favicon` — paths to your logo
- `theme.palette` — color scheme names (must match your CSS)

The `site_name` is set automatically from `site.yml` by the macros hook.
If you want to override it, uncomment the `site_name` line in `mkdocs.yml`.

---

## Summary of files to change

| Priority | File(s) | What to do |
|:--------:|---------|------------|
| **Must** | `site.yml` | Set your institution and cluster variables |
| **Must** | `includes/site/*.md` | Write content describing your systems |
| Should | `docs/assets/` | Replace logo images |
| Should | `docs/stylesheets/dartmouth.css` | Adjust colors and fonts |
| Should | `docs/stylesheets/fonts/` | Replace custom fonts |
| Should | `mkdocs.yml` | Update logo paths, CSS path, social links |
| Should | `docs/javascripts/*.js` | Update CONFIG blocks in terminal tour and SSH simulator |
| Optional | `includes/glossary.yml` | Add/remove terms for your site |
| Optional | `hooks/macros.py` | Adjust SSH auth method if needed |
