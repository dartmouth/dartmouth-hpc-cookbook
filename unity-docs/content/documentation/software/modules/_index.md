---
title: Modules
---

# Introduction to environment modules #

Unity offers a wide variety of software tools that are available for you to use. Although you have access to all the software available on Unity, conflicts may occur if you enable all of the software simultaneously. Instead, you should use **environment modules** to enable only the software that you need.

In shell programming, an **environment** is a set of shell variables and their corresponding values. These variables are stored and managed by the shell and can be accessed or modified by the user. The shell variables are of the form `KEY="VALUE"` which is also known as key-value pairs. The `KEY` acts as a label or a name for the specific information stored inside. The `"VALUE"` is the actual data associated with the key. You can think of the key as a short keyword for the information you want to find or use.

{{< callout tip >}}
To see your current environment, use the `env` command.
{{< /callout >}}

### The `PATH` environment variable ###
 Most of the commands you use in the shell are actually executable files somewhere in the filesystem. When you want to run an executable you have multiple options. One way is to enter the full path to the executable. While this method works, it can be tedious to memorize and type in the path of each executable you want to run. Alternatively, you can use `$PATH`, which is an environment variable that contains a list of directories (folders) separated by colons. To view the directories in your `$PATH`, use the command `echo $PATH`.

 ```
$ echo $PATH
/usr/local/bin:/usr/bin:/bin
``` 

In this example there are three directories, `/usr/local/bin`, `/usr/bin`, and `/bin`. 

If you want to run an executable file directly from the command line, without specifying its full path or location, you have to use executables within the `$PATH` directories. When you enter just the name of the executable into the command line, the shell searches the directories in `$PATH` (from left to right) for an executable by that name. If there are multiple executables of the same name, whichever executable is found earlier in the `$PATH` (further to the left) will be executed.

**Using environment modules, you can modify your environment variables and change which commands are available in your shell. By changing the files within `$PATH`, you can change which programs you can run.**

### Environment modules ###
Environment modules are scripts that modify your environment. These modules can be used to add new directories to your `$PATH`, which makes the executables within the module available for use. Loading a module will add a directory to the beginning of the `$PATH`, or furthest to the left, ensuring that the executables within the module are chosen first by the shell when you call their name.

The `which` command can be used to identify what directory the following executable will run from, as shown in the following code sample:

```
$ which python3
/usr/bin/python3
$ module load python/3.11.7
$ which python3
/modules/spack/packages/linux-ubuntu24.04-x86_64_v3/gcc-13.2.0/python-3.11.7-fykk2xdfj47lpvrqnin4azhka2pvxc2o/bin/python3
```

In the example above, the executable `python3` would run from the directory `/usr/bin/python3`. After loading the module `python/3.11.7`, it would run from `/modules/spack/packages/linux-ubuntu24.04-x86_64_v3/gcc-13.2.0/python-3.11.7-fykk2xdfj47lpvrqnin4azhka2pvxc2o/bin/python` instead. 

Another way to see how `$PATH` changes is to use `echo $PATH`, as shown in the following code sample:

```
$ echo $PATH
/usr/local/bin:/usr/bin:/bin
$ module load python/3.11.7
$ echo $PATH
/modules/spack/packages/linux-ubuntu24.04-x86_64_v3/gcc-13.2.0/python-3.11.7-fykk2xdfj47lpvrqnin4azhka2pvxc2o/bin:/usr/local/bin:/usr/bin:/bin
```

In the example above, the command `module load python/3.11.7` prepends the `$PATH`. To learn more about how to use environment modules, go to Unity's [Module Usage](https://docs.unity.uri.edu/documentation/software/modules/module-usage/) page.

{{< callout note "What's what in modules?" >}}
The scripts that modify your environment are called "modules", "modulefiles", or "environment modules".
Our module system as a whole is called "Lmod".
There is another module system out there called "Tmod" or "Environment Modules", which Lmod is based off of.
These names can be confusing.
{{< /callout >}}

### Learn more
[The `PATH` Environment Variable](https://superuser.com/questions/284342/what-are-path-and-other-environment-variables-and-how-can-i-set-or-use-them)

[Lmod documentation](https://lmod.readthedocs.io/en/latest/010_user.html)
