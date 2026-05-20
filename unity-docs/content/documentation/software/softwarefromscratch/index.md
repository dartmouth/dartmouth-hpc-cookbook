---
title:  Building Software from Scratch
blurb: >
   An overview of building software from scratch, covering the process of obtaining and building code and software installation.
---

## Building software from scratch

Building software from scratch is the most flexible method, but also the most involved. In some cases, it requires deep knowledge of the software in question, including its dependencies and other requirements.

{{< callout caution >}}
Download code only from trusted sources. Especially with open source software there can be multiple versions (sometimes called "forks") maintained by different people, so it's important to find the correct version and check that it hasn't been maliciously altered.
{{< /callout >}}

While any well maintained software should provide some installation instructions, usually in a README or INSTALL file, there are many that assume the user has some knowledge of common build systems. This is particularly true for code that is mostly in C/C++ or Fortran.

The following content is a general guide. Please read it completely before starting, but be aware that a single guide can not capture all of the potential complexity.

### Part 1: Obtaining the code
When fetching the code, we recommend using **compressed release bundles** instead of doing a `git clone`. Compressed release bundles are:
* Usually single files with an extension of `.tar.gz`, `.tar.bz2`, `.tar.xz`, or `.zip`.
* Often contain a "build ready" set of files with more content than is in the repository itself.

#### If a Release file is available:
1. Download it with a command such as `wget https://...`. This command saves it with the same filename as the end of the URL.
    * In some cases this might be just `v4.1.1.tar.gz`, which is not descriptive. You may provide a name with `wget -O somepackage-v4.1.1.tar.gz https://...`.
2. Extract files with `.tar.*`, `.tbz2` or similar with `tar xf filename.tar.gz`.
    * We recommend checking the contents with `tar tf filename.tar.gz` to see if it's going to extract everything to a new subdirectory, or put files in the current directory as well.
    * For `.zip` files, use `unzip -l filename.zip` to check the directory structure first.

#### If a Git project doesn't have a Release file:
1. Check to see if it has "tagged" version available.
2. Download the `.zip` of the "tagged" version or checkout that version with a command such as: `git clone https://..../project ; cd project ; git checkout v4.1.1`.
    * If there are no tags at all, then this is probably very untested software and you should scrutinize it carefully before proceeding.

### Part 2: Building the code
Once you have the code, the next step is to identify the build system. Look at the files at the top level of the code. Different programming languages use different tools. The following are the basic commands, though most of them require extra arguments.

| Language | File               | Build Command                          |
| -------- | ------------------ | -------------------------------------- |
| Java     | `pom.xml`          | `mvn`                                  |
|          | `build.xml`        | `ant`                                  |
| Python   | `environment.yml`  | `conda`                                |
|          | `requirements.txt` | `pip`                                  |
|          | `pyproject.toml`   | `poetry`                               |
|          | `setup.py`         | `python setup.py`                      |
| C/C++    | `CMakeLists.txt`   | `cmake -Bbuild && cmake --build build` |
|          | `Makefile`         | `make`                                 |
|          | `configure`        | `./configure && make`                  |
|          | `autogen.sh`       | `./autogen.sh && ./configure && make`  |

### Part 3: Installing the program

Before building, you should decide where you want the software to end up after installing. By default, many packages may try to install to a location your user account can't write to.

**We recommend placing the software under the PI `/work` folder so that you can share the software with other members of your group.** Installing in `/home` is possible, but has a much smaller quota. Building in `/project` will be much slower, and running from there may also have run-time performance impacts. Since `/scratch` is temporary, software installed there will be lost.

Each build system has its own way of specifying the location.
* For Java, you may need to edit the `.xml` file or at least examine it to determine how to override its default.
* For Python, use either [Conda]({{< relref "conda" >}}) or [venv]({{< relref "venv" >}}).
* For C/C++ and Fortran projects, consult the following table to specify a destination directory:

| Build file       | Command                                          |
| ---------------- | ------------------------------------------------ |
| `CMakeLists.txt` | `cmake -Bbuild -DCMAKE_INSTALL_PREFIX=/work/...` |
| `configure`      | `./configure --prefix=/work/...`                 |
| `Makefile`       | Edit the Makefile                                |

After building, run the install command:

| Build file              | Command                                          |
| ----------------------- | ------------------------------------------------ |
| `CMakeLists.txt`        | `cmake --install build`                          |
| `configure`/`Makefile`  | `make install`                                   |

Not all Makefile based projects provide an `install` target, so you may just end up with a binary somewhere under the project directory, maybe at the top level, maybe not.

### Notes on certain build systems
* With `cmake`, you can use `ccmake` for an interactively view of all of the possible parameters.
    * This is sometimes necessary to turn on or off certain features, or to specify dependency location information.
* For "autobuild" style packages, there is a cascade of commands to run.
    * If there is an `./autogen.sh` file, it can create a `./configure` file from a `./configure.in` file. However, only do this if `./configure` doesn't already exist.
    * If there is a `./configure.am` but no `./autogen.sh`, you can try `aclocal && autoconf && automake && libtoolize --force`.
* For software that just uses raw Makefile, if they don't provide a way to specify include and library paths for specific dependencies, sometimes modifying the Makefile directly is necessary.
    *  A complete description of Makefile syntax is beyond the scope of this document, but here's an example of what inserting this command existing variables might look like, for packages that support `pkg-config`, like `ompi` (OpenMPI, use `impi` for `intel-oneapi-mpi`) and `netcdf-fortran`:
```Makefile
CFLAGS=$(shell pkg-config ompi netcdf-fortran --cflags) -I.
CXXFLAGS=$(shell pkg-config ompi netcdf-fortran --cflags) -I.
LDFLAGS=$(shell pkg-config ompi netcdf-fortran --libs) -lz
```
