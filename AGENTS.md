# AGENTS.md

This file provides guidance to agents when working with code in this repository.

## Commands
- **Serve locally:** `uv run mkdocs serve` (requires `uv venv && uv pip install -r requirements.txt` first)
- **Build:** `uv run mkdocs build`
- **Deploy:** `uv run mkdocs gh-deploy --force` (CI does this on push to `main`)

## Reference Material
- **`unity-docs/`** contains a local copy of the official Unity documentation (Hugo source from unityhpc.org). Consult it when writing or fact-checking Unity-specific content (commands, quotas, partitions, portal flows). It is not part of the MkDocs build.

## Critical Architecture
- **`site.yml`** is the single source of truth for all institution-specific variables (`{{ institution.name }}`, `{{ cluster.name }}`, etc.). Every Jinja2 `{{ }}` reference in Markdown pages resolves from this file via `hooks/macros.py`.
- **`hooks/macros.py`** overrides `site_name` at build time from `site.yml` — the value in `mkdocs.yml` is a placeholder that satisfies config validation.
- **`includes/glossary.md` is AUTO-GENERATED** from `includes/glossary.yml` at build time — never edit `glossary.md` by hand. Edit `glossary.yml` instead.
- **`includes/glossary.yml`** supports `{{ var }}` placeholders from `site.yml` inside definitions — they are resolved at build time.
- **`pymdownx.snippets`** auto-appends `includes/glossary.md` to every page, enabling `*[term]: tooltip` abbreviation tooltips site-wide.
- **`on_post_page_macros()`** in `hooks/macros.py` resolves `{{ }}` in YAML frontmatter (`title:`, `description:`) — MkDocs extracts frontmatter before macros run, so this hook patches it after.
- **`includes/site/`** contains institution-specific content blocks pulled in via `{% include "site/filename.md" %}` — replace these when forking.

## Non-Obvious Patterns
- Build-time SSH macros (`remote_cmd`, `system_stats`, `cluster_stats`) use SSH key auth by default (controlled by `build.ssh_auth` in `site.yml`). Without access, they silently fall back to placeholder admonitions.
- Custom MkDocs Material color schemes are `dartmouth-light` and `dartmouth-dark` (not the standard `default`/`slate`).
- Headings use "Dartmouth Ruzicka" font; body uses "National 2" — both loaded from local files in `docs/stylesheets/fonts/`.
- The quiz widget (`docs/javascripts/quiz.js`) expects a specific `.slide-quiz > .quiz-slide` HTML structure with `data-answer` and `data-explain` attributes.
- No tests or linting exist in this project. No pyproject.toml or setup.cfg.

## Important distinction
- This cookbook is a learning resource, not a technical documentation. Introduced concepts should be explained. The *why* is just as important as the *how*. Total coverage of a topic is less important than good scaffolding. Be opinionated and selective in recommendations if it fosters understanding.
- Discoverability is very important. We have to assume that a user might land on any page as their starting page. We need to make sure that other related resources can be discovered from there, not just when traveling through the materials from the top down.
- **Index Pages:** The `index.md` files in each category (e.g., `recipes/index.md`, `articles/index.md`) act as directories and landing pages. When adding new recipes or articles, you *must* also update the corresponding `index.md` to link to the new content so it is discoverable.

## Writing Style and Tone
- **Address the reader as "you"** in second person. Use "we" sparingly, only for shared reasoning ("we can still leverage shared memory..."). Avoid third-person passive ("the user should...").
- **Tone is friendly, direct, and lightly opinionated** — warm without being chatty, technical without being cold. Occasional personality words ("footgun", "sluggish", "disorienting") are welcome when they sharpen a point. Avoid corporate hedging.
- **Lead with the *why*, then the *how*.** State the motivation, constraint, or failure mode before the command or procedure. A reader who understands *why* a rule exists can generalize; one who only sees the *how* is stuck the moment the situation shifts.
- **Short sentences and short paragraphs.** One- or two-sentence paragraphs are normal. Break long explanations with headings, lists, tables, or admonitions rather than letting prose run.
- **Use analogies to bridge to familiar experience** when introducing a new abstraction (SSH as a phone call with caller ID, scratch as a workbench, etc.). Don't force them — only when they genuinely shorten the path to understanding.
- **Surround code with intent, not narration.** Frame what the reader is trying to do, show the command, then note what changed or what to watch for. Don't restate what the code visibly does.
- **Use admonitions deliberately:**
    - `!!! tip` — actionable advice that improves outcomes
    - `!!! note` — clarifying side detail
    - `!!! warning` — likely to cause problems if ignored
    - `!!! danger` — irreversible or destructive (e.g., scratch deletion)
    - `!!! info` / `!!! abstract` — neutral context, recipe summaries

    Don't stack admonitions or use them for ordinary prose.
- **Headings use sentence case.** Question-style headings ("Why this matters on HPC", "Where am I? — `pwd`") are encouraged where they match the reader's likely mental question.
- **Explain jargon inline on first use**, then rely on the glossary (`includes/glossary.yml`) for tooltip reinforcement. Don't assume HPC vocabulary; don't over-explain it twice.
- **Acknowledge friction honestly.** If a workflow is awkward, slow, or has a sharp edge, say so and explain the tradeoff rather than papering over it.
- **Be opinionated and selective.** Recommend a path. Mention alternatives only when the reader genuinely needs to choose between them.
- **Do not use em-dashes (—) in your responses.** Instead, restructure sentences using commas, parentheses, colons, semicolons, or periods. If you find yourself reaching for an em-dash to insert an aside, set it off with commas or parentheses; if you're using one to introduce a conclusion or elaboration, use a colon or start a new sentence. This applies to all output, including code comments, headings, and quoted material you paraphrase.