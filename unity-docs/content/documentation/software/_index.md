---
title: Software Management
menu:
  - docs
blurb: >
    How to use software installed on Unity.
icon: terminal
weight: 60
---

# Unity software overview

{{< callout tip "Request software" >}} If you would like software installed to Unity, you can request it by completing our Software Request Form. To do so, log into the [Unity portal]({{< param account-url >}}) and select "Software Install Request Form" from the side-menu.{{< /callout >}}

{{< callout tip "Building software from scratch" >}} If you are interested in building software, view our [Building software from scratch]({{< relref "documentation/software/softwarefromscratch" >}}) documentation on building and installing programs from scratch. {{< /callout >}}

## Ways to install packages

### `apt` package manager
The Ubuntu system package manager `apt` downloads its packages pre-compiled from the [Ubuntu repository](https://packages.ubuntu.com/). These are in standard locations like `/usr/bin` so that they are always found in your `$PATH`. This requires administrator access. To avoid conflicts, most software is only available in one version. As a rule, we only install basic support packages this way, not research software.

### Environment modules
There are a wide variety of modules available with the <red>`module`</red> command. Most software requests can be found this way. The admins usually compile and install software in `/modules/apps/` or in `/modules/spack/packages/`.

Relevant documentation:

* [Introduction to environment modules]({{< relref "modules" >}})
* [How to use environment modules]({{< relref "module-usage" >}})
<!-- * [Module hierarchy]({{< relref "#" >}}) Currently out of date -->

### Conda environments
The conda package manager allows users to compile software easily and without administrator privileges. Conda creates environments for a set of compatible software, and you can activate the environments as needed.

Relevant Documentation:

* [Conda environments]({{< relref "conda" >}})

### Virtual environments in Python
The [venv](https://docs.python.org/3/library/venv.html) module in Python creates a light virtual environment that allows users to isolate specific versions of the Python interpreter and software libraries for their projects. It comes with the standard library of Python and does not require a separate installation. Venv is ideal for project-based workflows.

Relevant documentation:
* [Virtual environments in python]({{< relref "venv" >}})

### R package management
Generally you can use `R`'s native `install.packages()` and it should work as intended. However, if you have external dependencies, using them with our standard modules `r-rocker-ml-verse/*-apptainer` may run into issues. You can build a container for it, using a recipe like this:

```ini
Bootstrap: docker
From: rocker/ml-verse:{{ R_VERSION }}

%arguments
    R_VERSION=4.4.0

%post
    apt-get -y update
    apt-get -y install jags

    # Install R packages
    Rscript -e 'install.packages("pak")'
    Rscript -e 'pak::pak(c("rjags", "jagsUI", "coda", "EnvStats", "sads"))'
```

And then build the container giving a destination image name (`.sif`) and the preceding definition file:

```bash
apptainer build --ignore-fakeroot-command my-r.sif my-r.def
```

Relevant Documentation:

* [R](R.md)

### Containers: Docker, Singularity, and  Apptainer
While Docker is not supported in an HPC environment, Apptainer provides nearly equivalent capability. It's possible to pull an existing Docker image into a local Apptainer image file like this:

```bash
apptainer pull docker://ollama/ollama
```

If you need to install your own set of software, you can create and build your own container as show preceding in [R Package Management]({{< relref "#r-package-management" >}})
