---
title: Module Hierarchy
weight: 20
draft: true
---

# Module Hierarchy #

Environment modules are tools that dynamically change what software is available to use by a given user at a given time. Before you read this, it's recommended that you first read the  [introduction]({{< relref "modules" >}}) and the [module usage guide]({{< relref "module-usage" >}}).

As a Unity user, you have access to many modules built with various software stacks. As Unity grows and more modules are installed with more stacks, it can become difficult to effectively manage them all. Our strategy is to create a **module hierarchy** to divide modules according to their stacks. Having **model hierarchy** makes it much more difficult to accidentally load modules that are incompatible with each other.

The `$MODULEPATH` environment variable is a list of directories in which Lmod searches for modules. With a module hierarchy, not all directories are added to the modulepath by default.

This means **not all modules can be found with `module avail` by default.**

<!-- ## Current hierarchy
<!--
Compilers are red, and providers are blue. -->

```
/modules/modulefiles/

/modules/spack_modulefiles/
├── linux-ubuntu24.04-x86_64
|   ├── Core
|   ├── intel
|   │   └── 2021.4.0
|   ├── atlas
|   │   └── 3.10.3-sfhhdph
|   │       └── Core
|   ├── intel-oneapi-mpi
|   │   └── 2021.6.0-h3cppyo
|   │       ├── Core
|   │       └── openblas
|   │           └── 0.3.18-6pbqv7b
|   │               └── Core
|   ├── openblas
|   │   └── 0.3.18-6pbqv7b
|   │       └── Core
|   └── openmpi
|       ├── 4.1.3-3rgk3nu
|       │   ├── Core
|       │   └── intel-mkl
|       │       └── 2020.4.304-gmusbfh
|       │           └── Core
|       └── 4.1.4-tauaqk4
|           ├── Core
|           └── intel-mkl
|               └── 2020.4.304-gmusbfh
|                   └── Core
├── linux-ubuntu24.04-aarch64
│   └── Core
└── linux-ubuntu24.04-ppc64le
    ├── Core
    ├── openblas
    │   └── 0.3.21-coxg6gz
    │       └── Core
    └── openmpi
        ├── 4.1.3-edoxxdf
        │   ├── Core
        │   └── xl
        │       └── 16.1
        └── 4.1.4-476r55m
            └── Core
``` -->

{{< callout note "Module naming" >}}
Random characters at the end of compiler/provider version numbers can usually be ignored.

`Core` refers to modules compiled with Ubuntu's default GNU compiler suite, and without any special providers. The majority of Unity's modules are found here.

`intel` refers to the classic intel compilers (`icc`, `ifort`, `icpc`, ...).

The `intel-oneapi-compilers-classic` module adds `intel` to modulepath.
{{< /callout >}}

## Hierarchy naming scheme ##
```
linux-ubuntu24.04-[architecture]/[compiler]/[name]/[version]
linux-ubuntu24.04-[architecture]/[provider]/[compiler]/[name]/[version]
linux-ubuntu24.04-[architecture]/[provider]/[another-provider]/[compiler]/[name]/[version]
```

{{< callout "note" >}}
In this naming scheme, `Core` counts as a compiler.
{{< /callout >}}

## How to use the hierarchy ##
To find modules anywhere in the hierarchy, use the `unity-module-find` command.

Based on the full path of your desired module, you should be able to tell which other modules need to be loaded first.

{{< callout note >}}
`Core` is always automatically added to `$MODULEPATH`!
{{< /callout >}}

#### For example: ####
```
user@login1:~$ module load fftw/3.3.10
Lmod has detected the following error:   These module(s) or extension(s) exist but cannot be loaded as requested: "fftw/3.3.10"
 Make sure that you specified a version number.
 Some modules can only be found after their parent modules have been loaded.
 To find version numbers and parent modules, you can use the command:
 $ module --show_hidden spider fftw/3.3.10
 or our web interface: https://ood.unity.rc.umass.edu/pun/sys/module-explorer
```

```
user@login1:~$ unity-module-find gromacs
Modules found:
linux-ubuntu24.04-x86_64/intel-oneapi-mpi/2021.6.0-h3cppyo/Core/gromacs/2021.3
linux-ubuntu24.04-x86_64/openmpi/4.1.3-3rgk3nu/intel-mkl/2020.4.304-gmusbfh/Core/gromacs/2021.3
```

The following example shows the desired module:
```
linux-ubuntu24.04-x86_64/openmpi/4.1.3-3rgk3nu/intel-mkl/2020.4.304-gmusbfh/Core/gromacs/2021.3
```

The module path shows which modules must loaded first. Based on that path, the following command is used to load the necessary modules:
```
module load openmpi/4.1.3 intel-mkl/2020.4.304 gromacs/2021.3
```

### Learn more ###

[https://lmod.readthedocs.io/en/latest/010_user.html#module-hierarchy](https://lmod.readthedocs.io/en/latest/010_user.html#module-hierarchy)

[https://lmod.readthedocs.io/en/latest/080_hierarchy.html](https://lmod.readthedocs.io/en/latest/080_hierarchy.html)
