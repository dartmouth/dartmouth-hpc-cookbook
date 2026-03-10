# Debug Mode Rules (Non-Obvious Only)

- If `{{ variable }}` renders literally on a page, check that `site.yml` has the key — unresolved placeholders are left as-is silently by `_substitute_vars()` in `hooks/macros.py`.
- Frontmatter variables rendering as `{{ raw }}` is expected until `on_post_page_macros()` runs — this hook patches metadata after macro rendering, not before.
- SSH macros (`remote_cmd`, `system_stats`, `cluster_stats`) fail silently to placeholder admonitions without a Kerberos ticket — no error is raised.
- `module avail` outputs to stderr (not stdout) — the `module_list()` macro reads `result.stderr` intentionally.
- `git-revision-date-localized` plugin requires `fetch-depth: 0` in CI checkout — shallow clones break page dates.
- `mkdocs.yml` `site_name` value is a placeholder — it's overridden by `hooks/macros.py` at build time from `site.yml` `institution.short_name`.
