# AGENTS.md

This file provides guidance to agents when working with code in this repository.

## Commands
- **Serve locally:** `uv run mkdocs serve` (requires `uv venv && uv pip install -r requirements.txt` first)
- **Build:** `uv run mkdocs build`
- **Deploy:** `uv run mkdocs gh-deploy --force` (CI does this on push to `main`)

## Critical Architecture
- **`site.yml`** is the single source of truth for all institution-specific variables (`{{ institution.name }}`, `{{ cluster.name }}`, etc.). Every Jinja2 `{{ }}` reference in Markdown pages resolves from this file via `hooks/macros.py`.
- **`hooks/macros.py`** overrides `site_name` at build time from `site.yml` — the value in `mkdocs.yml` is a placeholder that satisfies config validation.
- **`includes/glossary.md` is AUTO-GENERATED** from `includes/glossary.yml` at build time — never edit `glossary.md` by hand. Edit `glossary.yml` instead.
- **`includes/glossary.yml`** supports `{{ var }}` placeholders from `site.yml` inside definitions — they are resolved at build time.
- **`pymdownx.snippets`** auto-appends `includes/glossary.md` to every page, enabling `*[term]: tooltip` abbreviation tooltips site-wide.
- **`on_post_page_macros()`** in `hooks/macros.py` resolves `{{ }}` in YAML frontmatter (`title:`, `description:`) — MkDocs extracts frontmatter before macros run, so this hook patches it after.
- **`includes/site/`** contains institution-specific content blocks pulled in via `{% include "site/filename.md" %}` — replace these when forking.

## Non-Obvious Patterns
- Build-time SSH macros (`remote_cmd`, `system_stats`, `cluster_stats`) require a valid **Kerberos ticket** for GSSAPI auth. Without it, they silently fall back to placeholder admonitions.
- Custom MkDocs Material color schemes are `dartmouth-light` and `dartmouth-dark` (not the standard `default`/`slate`).
- Headings use "Dartmouth Ruzicka" font; body uses "National 2" — both loaded from local files in `docs/stylesheets/fonts/`.
- The quiz widget (`docs/javascripts/quiz.js`) expects a specific `.slide-quiz > .quiz-slide` HTML structure with `data-answer` and `data-explain` attributes.
- No tests or linting exist in this project. No pyproject.toml or setup.cfg.

## Important distinction
- This cookbook is a learning resource, not a technical documentation. Introduced concepts should be explained. The *why* is just as important as the *how*. Total coverage of a topic is less important than good scaffolding. Be opinionated and selective in recommendations if it fosters understanding.
- Discoverability is very important. We have to assume that a user might land on any page as their starting page. We need to make sure that other related resources can be discovered from there, not just when traveling through the materials from the top down.