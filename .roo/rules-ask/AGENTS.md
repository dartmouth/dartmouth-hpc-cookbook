# Ask Mode Rules (Non-Obvious Only)

- This is an MkDocs Material documentation site for Dartmouth's HPC cluster — not a Python application.
- The repo is designed to be forked by other HPC centers. `CUSTOMIZING.md` documents the fork workflow; `site.yml` + `includes/site/` are the only files a fork needs to change.
- `hooks/macros.py` is a 576-line file that defines build-time macros (glossary, SSH commands, Slurm queries, sbatch templates) — it is the core logic of the project.
- The `overrides/` directory exists but is empty — Material theme overrides are not currently in use.
- CI deploys on push to `main` AND on a daily cron schedule (for freshness of SSH-fetched data).
- No tests, linting, or type checking exist — validation is purely visual via `mkdocs serve`.
