# Code Mode Rules (Non-Obvious Only)

- Edit `includes/glossary.yml` for glossary changes — `includes/glossary.md` is auto-generated at build time and must never be hand-edited.
- Markdown pages use Jinja2 `{{ variable }}` syntax resolved from `site.yml` — not hardcoded institution/cluster names.
- YAML frontmatter `title:` and `description:` can contain `{{ }}` placeholders; they are resolved by `on_post_page_macros()` in `hooks/macros.py`.
- Institution-specific content goes in `includes/site/*.md` files, pulled in via `{% include "site/filename.md" %}`.
- The `macros` plugin `include_dir` is set to `includes/` — all `{% include %}` paths are relative to that directory.
- Custom color schemes are `dartmouth-light` / `dartmouth-dark` in `docs/stylesheets/dartmouth.css` — do not use Material's `default`/`slate`.
- Quiz HTML must follow `.slide-quiz > .quiz-slide` structure with `data-answer` and `data-explain` attributes on `.quiz-slide` elements.
- The `sbatch_template()` macro in `hooks/macros.py` generates Slurm job scripts — use it in recipe pages instead of writing raw sbatch blocks.
