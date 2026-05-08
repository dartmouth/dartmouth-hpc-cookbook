# Unity website and documentation

This is the proposed format for a new Unity website, which incorporates
technical documentation, tutorials, general user information, and a blog.

## Setting up your editor

This project uses an [EditorConfig](https://editorconfig.org/) file to enforce
consistent styles across editors and developers. Your text editor or IDE
may have [built-in support](https://editorconfig.org/#pre-installed)
for EditorConfig. If not, you can
[install a plugin](https://editorconfig.org/#download).

NOTE: This will strip trailing whitespace, so the technique of using two spaces
to line break in Markdown files will not work. Please use
[the `<br>` tag](https://www.markdownguide.org/basic-syntax/#line-break-best-practices) instead.

## Adding content

The Unity theme provides several archetypes for different content types. To
create a new file with the appropriate archetype, you can use
`hugo new <path/to/new/page.md>` or `./scripts/dev_helpers/linux/docker-hugo-new <path/to/new/page.md>`.
The path to the new page should assume `./content` as the root directory. For
example, to create a new news item, use the following command:

```bash
hugo new news/YYYY/MM/title.md
```

### Custom shortcodes

`{{< help-email >}}`: adds a `mailto` link for our help email.

## Building the development website

### Docker

All build dependencies are bundled in [georgiastuart/unity-website on DockerHub](https://hub.docker.com/r/georgiastuart/unity-website).
Using this container will ensure your development environment matches the production build environment!

#### Linux

1. [Install Docker](https://docs.docker.com/desktop/).
2. Clone the [Unity website repository](https://gitlab.rc.umass.edu/unity/education/documentation/unity-website).
3. Initialize the theme submodule with `git submodule init && git submodule update`
4. From within the root of the Unity website directory, run `./scripts/dev_helpers/linux/docker-install` to
   install the required npm modules for the theme and website in the cloned directory.
5. To launch the development server, run `./scripts/dev_helpers/linux/docker-dev`, then
   open `localhost:1313` in your browser. This development server will watch for
   file changes and rebuild.

#### Windows

1. [Install Docker](https://docs.docker.com/desktop/).
2. Clone the [Unity website repository](https://gitlab.rc.umass.edu/unity/education/documentation/unity-website).
3. Initialize the theme submodule with `git submodule init && git submodule update`
4. From within the root of the Unity website directory, run `powershell.exe -executionpolicy bypass -File .\scripts\dev_helpers\windows\docker-install.ps1` to
   install the required npm modules for the theme and website in the cloned directory.
5. To launch the development server, run `powershell.exe -executionpolicy bypass -File .\scripts\dev_helpers\windows\docker-dev.ps1`, then
   open `localhost:1313` in your browser. This development server will watch for
   file changes and rebuild.

### Manual

The framework for this site is [Hugo](https://gohugo.io/), a static site
generator written in Go. To get started,
[install Hugo](https://gohugo.io/installation/) (0.125.7 or newer) on your development machine.
To build the theme locally, you'll also need [NodeJS](https://nodejs.org/) (16 or newer).

Hugo sites have two components: the _site repository_ which
contains files to build a specific website, and the _theme repository_ which
contains most of the templates necessary to turn the site's markdown files
into HTML, along with styling files. This repository is the site repository
for the Unity website. The theme lives on the
[Unity GitLab](https://gitlab.rc.umass.edu/unity/education/documentation/unity-theme).
Note that both repositories are _public_. Don't include sensitive information
in these repositories. The theme repository is included in the site repository
as a submodule, so it does not need to be cloned separately.

Hugo comes with a development web server. To set up the
development environment:

1. Clone the [Unity website repository](https://gitlab.rc.umass.edu/unity/education/documentation/unity-website).
2. Initialize the theme submodule with `git submodule init && git submodule update`
3. Run `npm run node-install` in the website directory

### Running the development server

There are two options for running a development server: with the search index
and without. To run with the search index built, run

```bash
npm run pagedev
```

and navigate to `http://localhost:1313`. To run the dev server without the page
index, run

```bash
npm run dev
```

and navigate to `http://localhost:1313`. Both options should watch for changes
and rebuild automatically.

## Vale

The GitLab CI/CD for this project runs all changed files through the
[Vale Text Linter](https://vale.sh/). To check Vale adherence before pushing,
use Docker or Apptainer:

```bash
apptainer exec docker://jdkato/vale vale --config=".vale/vale.ini" <path/to/file.md>
```

or

```bash
npm run vale -- <path/to/file.md>
```

Vale rules for Unity live
[here](https://gitlab.rc.umass.edu/unity/education/documentation/unity-vale).
