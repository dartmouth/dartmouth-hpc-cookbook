---
title: Module Usage
---

# How to use environment modules

Environment modules are a convenient and efficient way to use non-standard and version-specific software in Unity. The following guide shows you how to enable and disable modules, view all currently active modules, search for modules, and unload all active modules.

{{< callout note >}}
While modules work on the login nodes, the login nodes have strict CPU and memory limits. Jobs that require more processing power should always be [scheduled through Slurm]({{< relref "jobs" >}}).
{{< /callout >}}

## List all available modules

To list all available modules, use any of the four commands listed below:

```bash
module available
module avail
module av
ml av
```

The `module available` command outputs a partial list of the modules available in Unity. However, this command does not show modules that require loading an intermediate module, such as those arranged in a module hierarchy. To see a full list of modules, use the `module spider` command described in the [next section](#search-for-modules).

```console
---- /modules/modulefiles/spack/latest/linux-ubuntu24.04-x86_64/Core ----
   bcftools/1.19                              nvhpc/24.9
   boost/1.85.0-cxx11                         openblas/0.3.26
   bowtie2/2.5.2                              openmpi/4.1.6-cuda12.6
   bwa/0.7.17                                 openmpi/4.1.6
   cuda/11.8                                  openmpi/5.0.3-cuda12.6
   cuda/12.1                                  openmpi/5.0.3
   cuda/12.6                                  parallel/20240822
   ...
```

{{< callout tip >}}
The module list is rapidly growing. To see the full list, use the `module spider` command in your terminal.
{{< /callout >}}

## Search for modules

To search for specific software, use the `module spider` command followed by the software you are searching for. In the following example, `module spider fftw` finds all versions of the `fftw` module:

```bash
module spider fftw
```

The output may list several versions. Run the command again with a specific version for more information.

```bash
module spider fftw/3.3.10
```

The output may tell you that you need to load another module first, due to the Module Hierarchy.

```
You will need to load all module(s) on any one of the lines below before the "fftw/3.3.10" module is available to load.

   mpich/4.2.1
   openmpi/4.1.6
   openmpi/5.0.3
```


In this case, you can load them together as in:

```bash
module load openmpi/4.1.6 fftw/3.3.10
```

## Load modules

To load a module, use the `module load` command followed by the module of choice. In the following example, `module load gcc/9.4.0` loads the module `gcc/9.4.0`:

```
module load gcc/9.4.0
```


## Unload modules

To unload modules, use the `module unload` command followed by the module(s) of choice. In the following example, `module unload gcc` unloads all `gcc` modules:

```bash
module unload gcc
```

This is only necessary in an interactive session if you are switching modules, or in a batch script between programs using incompatible modules, although even there `module purge` may be better.

## Unload all active modules

To unload *all* active modules, use the following command:

```bash
module purge
```

The `module purge` command quickly unloads all currently active modules. Purging modules is the best practice ahead of loading any modules in your batch scripts since it will ensure your job doesn't inherit any unexpected modules from your login session.

## List currently loaded modules

To list the modules that are currently loaded, use the following command:

```bash
module list
```

Note that the commands `module list` and `module avail` are distinct. While `module avail` lists available modules, including modules you haven't loaded, `module list` shows all modules that are currently loaded and affecting your compute session.
