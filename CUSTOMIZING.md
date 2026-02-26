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

| Variable | Example | Where it appears |
|----------|---------|------------------|
| `institution.name` | Dartmouth College | Footer, about pages |
| `institution.short_name` | Dartmouth | Headings, inline text, site title |
| `institution.support_team` | Research Computing | Footer |
| `institution.support_url` | https://rc.dartmouth.edu | Footer link |
| `institution.github_url` | https://github.com/dartmouth | Social links |
| `cluster.name` | Discovery | Throughout all articles |
| `cluster.scheduler` | Slurm | Job submission guides |
| `cluster.login_node` | discovery.dartmouth.edu | SSH connection guides |
| `cluster.default_partition` | standard | Example job scripts |
| `build.kerberos_realm` | KIEWIT.DARTMOUTH.EDU | Build-time SSH auth |

To customize, open `site.yml` and replace the values.  For example, to
adapt the cookbook for a fictional "Atlas" cluster at MIT:

```yaml
institution:
  name: Massachusetts Institute of Technology
  short_name: MIT
  support_team: Research Computing Services
  support_url: https://rc.mit.edu
  github_url: https://github.com/mit

cluster:
  name: Atlas
  scheduler: Slurm
  login_node: atlas.mit.edu
  default_partition: general

build:
  kerberos_realm: ATHENA.MIT.EDU
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
| `includes/site/systems-overview.md` | Describes all HPC systems at your site (shared-memory machines, the main cluster, comparison table, "which system should I use" guidance) | `docs/getting-started/what-is-hpc.md` |
| `includes/site/footer.md` | "Maintained by …" footer line | `docs/index.md` |

When forking, replace these files with your own content.  You can use any
Jinja2 variables from `site.yml` inside them, plus the macros defined in
`hooks/macros.py` (like `{{ system_stats([...]) }}` or
`{{ cluster_stats("host", label="Name") }}`).

If your institution has only one cluster and no shared-memory servers, your
`systems-overview.md` can be much simpler — just describe your cluster and
delete the comparison table.

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
2. GSSAPI (Kerberos) authentication — obtain a ticket before building:
   ```
   kinit youruser@YOUR.REALM
   ```
3. Hostnames defined in your `includes/site/systems-overview.md` (or
   wherever you call the macros).

If your build environment can't reach the cluster (e.g., CI/CD), the macros
fall back gracefully to an info admonition saying the data is unavailable.

If you don't use Kerberos, you can modify `_ssh_cmd()` in `hooks/macros.py`
to use key-based SSH or remove the GSSAPI options.

---

## 6. `mkdocs.yml` — build configuration

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
| Optional | `includes/glossary.yml` | Add/remove terms for your site |
| Optional | `hooks/macros.py` | Adjust SSH auth method if not using Kerberos |
