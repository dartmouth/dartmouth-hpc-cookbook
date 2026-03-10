# Architect Mode Rules (Non-Obvious Only)

- All institution-specific data flows through `site.yml` → `hooks/macros.py` → Jinja2 in Markdown. Adding a new variable means: add to `site.yml`, then reference as `{{ section.key }}` in any `.md` file.
- `hooks/macros.py` uses the `mkdocs-macros-plugin` hooks `define_env()` and `on_post_page_macros()` — all macros are registered inside `define_env()` as nested functions.
- SSH-based macros (`remote_cmd`, `system_stats`, `cluster_stats`) use GSSAPI/Kerberos auth with `BatchMode=yes` and 5s/15s timeouts — they are designed to degrade gracefully.
- The glossary pipeline: `glossary.yml` → `_generate_glossary_tooltips()` → `glossary.md` (auto-generated) → auto-appended to every page via `pymdownx.snippets`. A separate `glossary()` macro renders the full glossary page as a definition list.
- `nav` in `mkdocs.yml` has several sections commented out (Recipes, Reference, Troubleshooting) — these are planned but not yet active.
- The `redirects` plugin maps `index.md` → `home/index.md` so the root URL works with the nested `Home` nav section.
