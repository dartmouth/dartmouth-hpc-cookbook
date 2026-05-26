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
- **Scratch storage paths:** Unity organizes scratch as workspaces (e.g., `/scratch/workspace/<name>`), not as `/scratch/$USER/`. Do not use `{{ storage.scratch_path }}/$USER/` in recipe examples because it produces a path that does not exist on the cluster. Use generic placeholders like `/path/to/your/scratch/` instead. A dedicated recipe/article on scratch workspaces will cover the specifics.
- **Multi-GPU jobs require `--nodes`:** Unity's Slurm configuration requires `--nodes=1` (or `--constraint=mpi`) when requesting more than one GPU. Always include `nodes=1` in `sbatch_template()` calls that use `gres="gpu:2"` or higher.
- Build-time SSH macros (`remote_cmd`, `system_stats`, `cluster_stats`) use SSH key auth by default (controlled by `build.ssh_auth` in `site.yml`). Without access, they silently fall back to placeholder admonitions.
- Custom MkDocs Material color schemes are `dartmouth-light` and `dartmouth-dark` (not the standard `default`/`slate`).
- Headings use "Dartmouth Ruzicka" font; body uses "National 2" — both loaded from local files in `docs/stylesheets/fonts/`.
- The quiz widget (`docs/javascripts/quiz.js`) expects a specific `.slide-quiz > .quiz-slide` HTML structure with `data-answer` and `data-explain` attributes.
- No tests or linting exist in this project. No pyproject.toml or setup.cfg.
- **Common Pitfalls sections** use collapsible red admonitions: `??? failure "Title"`. Do not use `!!! warning`, `!!! danger`, definition lists, or other formats for pitfall items. The `??? failure` type renders as a red collapsible block, visually distinct from in-body admonitions and scannable when collapsed.
- **Glossary scan after writing content:** After creating or substantially editing a page, scan it for technical terms and jargon that a reader might not know. Check each term against `includes/glossary.yml`. If it's missing, add it. This keeps tooltips comprehensive and the glossary page useful as a standalone reference. Common candidates: acronyms, library names, HPC-specific concepts, and Python internals.
- **Always use `uv` for Python:** The cookbook recommends `uv` as the standard way to manage Python environments and run scripts. In recipe sbatch templates, use `modules=["uv/latest"]` and `uv run python myscript.py` (not `module load python` and bare `python`). In local/interactive examples, use `uv run python` rather than bare `python`. See the [uv recipe](docs/recipes/python/uv.md) for the full workflow.
- **Sbatch annotation format:** When adding code annotations to `#SBATCH` directive lines in `sbatch_template()` calls, use the format `"8 (1)"` (just the number in parens), not `"8  # (1)!"`. The `#SBATCH` lines are already shell comments, so adding `# (1)!` creates a double-comment that Slurm can't parse. The `_parse_annotated_int()` helper in `hooks/macros.py` strips the `(N)` marker for numeric logic while preserving it in the rendered output.

## Important distinction
- This cookbook is a learning resource, not a technical documentation. Introduced concepts should be explained. The *why* is just as important as the *how*. Total coverage of a topic is less important than good scaffolding. Be opinionated and selective in recommendations if it fosters understanding.
- **Tutorial-style examples:** Recipe code examples must be fully guided walkthroughs, not brief references. Always provide a complete, runnable script the reader can save and submit. Show the expected output or what to check for. Avoid placeholder function names like `heavy_computation(i)` — use a real (if simple) computation so the reader can run the example end-to-end and see it work. Think "smoke test they can copy-paste" rather than "API sketch they must fill in."
- Discoverability is very important. We have to assume that a user might land on any page as their starting page. We need to make sure that other related resources can be discovered from there, not just when traveling through the materials from the top down.
- **Index Pages:** The `index.md` files in each category (e.g., `recipes/index.md`, `articles/index.md`) act as directories and landing pages. When adding new recipes or articles, you *must* also update the corresponding `index.md` to link to the new content so it is discoverable.

## Writing Style and Tone
- **Address the reader as "you"** in second person. Use "we" sparingly, only for shared reasoning ("we can still use shared memory..."). Avoid third-person passive ("the user should...").
- **Tone is friendly, direct, and lightly opinionated.** Warm without being chatty, technical without being cold. Occasional personality words ("footgun", "sluggish", "disorienting") are welcome when they sharpen a point. Avoid corporate hedging.
- **Lead with the *why*, then the *how*.** State the motivation, constraint, or failure mode before the command or procedure. A reader who understands *why* a rule exists can generalize; one who only sees the *how* is stuck the moment the situation shifts.
- **Short sentences and short paragraphs.** One- or two-sentence paragraphs are normal. Break long explanations with headings, lists, tables, or admonitions rather than letting prose run.
- **Use analogies to bridge to familiar experience** when introducing a new abstraction (SSH as a phone call with caller ID, scratch as a workbench, etc.). Don't force them; only use them when they genuinely shorten the path to understanding.
- **Surround code with intent, not narration.** Frame what the reader is trying to do, show the command, then note what changed or what to watch for. Don't restate what the code visibly does.
- **Use admonitions deliberately:**
    - `!!! tip` — actionable advice that improves outcomes
    - `!!! note` — clarifying side detail
    - `!!! warning` — likely to cause problems if ignored
    - `!!! danger` — irreversible or destructive (e.g., scratch deletion)
    - `!!! info` / `!!! abstract` — neutral context, recipe summaries

    Don't stack admonitions or use them for ordinary prose.
- **Headings use sentence case.** Question-style headings ("Where am I?", "What's here?") are encouraged where they match the reader's likely mental question. Avoid "Why X matters" as a heading pattern (see AI-isms list below).
- **Explain jargon inline on first use**, then rely on the glossary (`includes/glossary.yml`) for tooltip reinforcement. Don't assume HPC vocabulary; don't over-explain it twice.
- **Acknowledge friction honestly.** If a workflow is awkward, slow, or has a sharp edge, say so and explain the tradeoff rather than papering over it.
- **Be opinionated and selective.** Recommend a path. Mention alternatives only when the reader genuinely needs to choose between them.
- **Do not use em-dashes (—) in running prose.** Instead, restructure sentences using commas, parentheses, colons, semicolons, or periods. If you find yourself reaching for an em-dash to insert an aside, set it off with commas or parentheses; if you're using one to introduce a conclusion or elaboration, use a colon or start a new sentence.
    - **Allowed:** Em-dashes as separators in **heading subtitles** (`### Where am I? — \`pwd\``), **bulleted definition items** (`- **\`-a\`** — Archive mode`), and **glossary tooltip text** (where brevity is critical). In these structural roles, the em-dash functions as a lightweight colon and is visually clearer than alternatives.
    - **Not allowed:** Em-dashes in body paragraphs, admonitions, or any running sentence.
- **Avoid common AI-generated writing patterns.** These phrases are telltale signs of LLM output and erode the cookbook's voice. Do not use:
    - **"Why X matters"** as a heading or phrase. Rephrase to describe what something does or when to use it (e.g., "What storage tiers are for", "How this applies on HPC").
    - **"It's not X, it's Y"** as a rhetorical pivot. Just state what something is.
    - **Triplet lists for emphasis** ("No typing. No errors. No mistakes." or "Simple. Fast. Reliable."). Use a normal sentence instead.
    - **"Let's [verb]"** to introduce a section ("Let's dive in", "Let's break that down", "Let's explore"). Just start the section.
    - **"leverage"** when you mean "use".
    - **"ensure"** when you mean "make sure" or "check that" (technical uses like "ensure the lock is held" are fine).
    - **"seamless"**, **"robust"**, **"powerful"** as filler adjectives. Be specific about what makes something good, or drop the adjective.
    - **"unlock"**, **"game-changer"**, **"journey"** in any context.
    - **"key takeaway"**, **"in summary"**, **"to summarize"**, **"in conclusion"** to wrap up a section. The section's content should speak for itself; if you need a summary, use an admonition.
    - **"It's worth noting"**, **"It's important to note/understand"**. Just state the thing.

    When in doubt, read the sentence aloud. If it sounds like a LinkedIn post or a ChatGPT response, rewrite it.