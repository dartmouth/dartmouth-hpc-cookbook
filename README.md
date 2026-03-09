# Dartmouth HPC Cookbook

A forkable, institution-customizable documentation site for HPC centers, built with [MkDocs Material](https://squidfunk.github.io/mkdocs-material/).

The generic content — HPC concepts, Linux fundamentals, job scheduling, Python recipes, and more — works out of the box. Institution-specific details (cluster names, login nodes, branding, systems overviews) are isolated so any HPC center can adapt the cookbook without touching the core articles.

## Getting Started

### Prerequisites

- Python 3.10+
- [uv](https://docs.astral.sh/uv/) (recommended) or pip

### Install dependencies

```bash
uv pip install -r requirements.txt
```

### Serve locally

```bash
mkdocs serve
```

Then open [http://127.0.0.1:8000](http://127.0.0.1:8000) in your browser.

### Build static site

```bash
mkdocs build
```

The output is written to the `site/` directory.

## Customizing for Your Institution

See [`CUSTOMIZING.md`](CUSTOMIZING.md) for a full guide. The short version:

1. **Fork** this repository.
2. **Edit [`site.yml`](site.yml)** — set your institution name, cluster name, login node, scheduler, and other site-wide variables.
3. **Replace `includes/site/`** with content describing your systems.
4. **Swap branding** — update logos in `docs/assets/` and colors in `docs/stylesheets/`.
5. Run `mkdocs serve` to preview.

## Project Structure

```
.
├── docs/               # Markdown source pages
├── hooks/              # MkDocs plugin hooks (macros, etc.)
├── includes/
│   ├── glossary.yml    # Shared abbreviation/glossary definitions
│   └── site/           # Institution-specific content blocks
├── mkdocs.yml          # MkDocs configuration
├── requirements.txt    # Python dependencies
└── site.yml            # Institution & cluster variables
```

## License

See [`LICENSE`](LICENSE) for details.
