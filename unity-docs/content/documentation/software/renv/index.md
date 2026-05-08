---
title: Renv
blurb: >
    An overview of virtual environments in R, including how to create and activate an environment, install and update packages, save and move an environment, check the status, clean your library, and use Python with renv.
---

# Virtual environments in R

Virtual environments allow users to separate and isolate their project-specific dependencies. The [renv](https://rstudio.github.io/renv/articles/renv.html#caveats) package in R allows for project and package-level dependency isolation, reproducibility, and portability.

Normally in R, `install.packages("pkgname")` installs the package and its dependencies in a central package library. However, when a user upgrades or downloads a package, these dependencies can be modified and potentially break the code in different projects. **Renv** creates a project-level package library and isolates the package dependencies. For portability, renv creates a `renv.lock` file that can be shared to recreate the environment at a different location.

{{< callout note >}}
Renv records the R version in the active environment. However, it does not link the R executable for that version. If you need a specific R version for your environment, you should first activate it with `module load r-rocker-ml-verse/<R_VERSION>+apptainer` or if you are using Rstudio on Open OnDemand, launch the Rstudio session with the R version of your choosing. After loading the R with the version of your choosing, you can create the renv environment which will record the R version in the active environment.

If you try to load the renv environment with a different R version, you will receive a warning and an option to record the new active R version in the `renv.lock` file.
{{< /callout >}}

{{< callout note >}}
Install functions in R and renv cannot download system dependencies. For this reason, it is recommended to use the `r-rocker-ml-verse/<R_VERSION>+apptainer` module on Unity for interacting with R from the terminal. To check other available R versions use `module spider r-rocker-ml-verse`. These modules are based on the [rocker/ml-verse](https://rocker-project.org/images/versioned/cuda.html) docker container and contain various system dependencies that might be needed by R packages.

Rstudio on Open OnDemand runs using `r-rocker-ml-verse/<R_VERSION>+apptainer` modules. This is why you will have access to the same environment both in Rstudio or from the terminal if you use these modules.
{{< /callout >}}

{{< callout warning >}}
Renv should be used on a per project basis. Create and activate a separate renv environment for each project.
{{< /callout >}}

## Create a virtual environment with renv

The overall workflow with renv is to activate the environment, install/update packages, and "snapshot" (save) the environment to a `renv.lock` file.

### Activate the environment

To activate a virtual environment with renv, use the following instructions:
1. Navigate to the project folder.
2. Load the desired R version.
3. To open an R session, run `R` in the terminal or in Rstudio, VS Code, or JupyterLab applications on [Open OnDemand](https://ood.unity.rc.umass.edu/shibboleth-ds/?entityID=https%3A%2F%2Funity.rc.umass.edu%2Fshibboleth&return=https%3A%2F%2Food.unity.rc.umass.edu%2FShibboleth.sso%2FLogin%3FSAMLDS%3D1%26target%3Dss%253Amem%253Aea7f311fb64cb1a2d51d3dd63eeec976073db728da593f0ddac9c6b2255eaeab). For more help with R, see our [R documentation]({{< relref "R" >}}).

4. To create the environment, run the following command in your R console:
    ```R
    renv::init()
    ```

    The `init()` function creates a `renv/` directory and an `.Rprofile` file. It also looks through your project, identifies libraries, and automatically downloads these packages. **If you want to prevent renv from automatically downloading packages**, run `renv::init(bare = TRUE)`.

    The created `.Rprofile` file contains the code `source("renv/activate.R")` which activates the `renv` environment. When the R session is launched, the `.Rprofile` file in the current directory is automatically sourced, which activates the environment. For more information, see [R Startup](https://rstats.wtf/r-startup.html).

    However, **if you are running R from a different directory, or using the `--vanilla` or `-no-init-file` options** in `Rscript` calls, you need to source the correct `activate.R` file in your script with `source("/PATH/TO/renv/activate.R")` or `renv::load("/PATH/TO/PROJECT")`.

{{< callout warning >}}
Files and directories created by renv should never be manually modified.
{{< /callout >}}

### Install packages

To download packages, use `install.packages()`, `remotes::install_github()`, or `BiocManager::install()` methods. You can also use the convenience function `renv::install()`.

For example, `renv::install()` installs packages from a variety of popular sources:
```R
# From CRAN latest version
renv::install("digest")
# Old version from archives
renv::install("digest@0.6.18")
# From Bioconductor
renv::install("bioc::edgeR")
# From Github
renv::install("tidyverse/dplyr")
```

### Save the environment to file

After package installation is complete, the environment can be **"snapshotted"**, or saved. Snapshotting will create a `renv.lock` file that logs all the packages, dependencies, and versions. We recommend that you snapshot an environment **every time you download or upgrade packages** in order to save the current environment.

To snapshot an environment, use the following function:
```R
renv::snapshot()
```

{{< callout note >}}
If there is a discrepancy between the package library and `renv.lock` file, the `renv::snapshot()` function gives a detailed description of the problem and what steps to take to fix it.
{{< /callout >}}

### Check the status of the environment

To check the status of the environment, use the `status()` function:

```R
renv::status()
```

If your `renv.lock` file and your project is in a consistent state, you will see an output like `No issues found -- the project is in a consistent state.`.

However, if there is discrepancy, you might see an example output like the following:
```md
The following package(s) are in an inconsistent state:

 package    installed recorded used
 data.table y         n        y

See ?renv::status() for advice on resolving these issues.
```
In this example, renv warns us that the `data.table` package is installed and used in the project, but is not recorded in the `renv.lock` file. We can solve this problem by running `renv::snapshot()` to record `data.table` in the `renv.lock` file.

### Move your renv virtual environment

To recreate the environment in a different location, or to revert your environment back to the last version of the `renv.lock` file, use the `renv::restore()` function:

```R
renv::restore()
```

{{< callout tip >}}
By default, `restore()` function automatically detects the `renv.lock` file in the current directory. However, you can also explicitly give the path to the `renv.lock` file with `renv::restore(lockfile = /PATH/TO/renv.lock)`.
{{< /callout >}}

{{< callout tip >}}
**Renv** does not keep track of the old versions of the `renv.lock` file. However, this is a perfect place for doing version control with `git`, so if needed, you can revert back to an old version of `renv.lock` using `renv::restore()`.
{{< /callout >}}

### Update packages

To update all packages in the environment, use the following command:
```R
renv::update()
```

To update a single package in the environment, use the following command:
```R
renv::update("dplyr")
```
Replace `"dplyr"` with the package that you want to update.

### Clean your renv library

If there are any downloaded packages that you are not using in your project anymore, you can clean them out using the `clean()` function:

```R
renv::clean()
```

### Use Python with renv

If your R projects also depend on some Python packages, you can use `renv` to track versions of Python packages.

The following instructions will show you how to create a python virtual environment and download R and Python `tensorflow` packages with the help of `renv` and [reticulate](https://rstudio.github.io/reticulate/).

1. Navigate to your project directory and activate a **renv** environment (if you have not already) using the following command:
    ```R
    renv::init()
    ```
2. To download the `tensorflow` R package, use the following command:
    ```R
    renv::install("tensorflow")
    ```
3. To activate Python in the renv environment and create a Python virtual environment for Python packages, use the following command:
    ```R
    renv::use_python(
    python = "/opt/venv/bin/python3",
    name = "name_of_virtualenv",
    type = "virtualenv"
    )
    ```

    * The `python` variable is the path to the Python executable. If you are using Rstudio on Open OnDemand or the `r-rocker-ml-verse` modules on Unity, you can leave it the same as shown in the example.

    * The `name` variable should be either the path or name of the Python virtual environment that is being created. It can also be an existing virtual environment.

    * The `type` variable sets the type of virtual environment to create. It can also be set to `conda`.

4. To download Python `tensorflow` library, use the following command:
    ```R
    reticulate::py_install("tensorflow")
    ```

    Under the hood, reticulate will run `pip install tensorflow`.

5. To save both R and Python environments to `renv.lock` and `requirements.txt` files, use the following command:
    ```R
    renv::snapshot()
    ```

6. To test if the installation worked, use the following example script:
    ```R
    library(tensorflow)
    tf$constant("Hello TensorFlow!")
    ```

## Submit a Slurm job with renv

To submit a `sbatch` job using renv, R will automatically detect the `.Rprofile` file in the root of the project directory and attach the renv environment.

The following example assumes we have a `test.R` script in the `/PATH/TO/PROJECT` directory with an initialized renv environment. The `test.R` script prints the package versions of the `dplyr`, `data.table`, and `ggplot2` packages that are in our renv environment.

**test.R**
```R
library(dplyr)
library(data.table)
library(ggplot2)

packageVersion("dplyr")
packageVersion("data.table")
packageVersion("ggplot2")
```

To submit this script using a `renv` environment, use a script similar to the following example `main.sh`.

**main.sh**
```bash
#!/usr/bin/bash
#SBATCH --partition=cpu-preempt      # Partition (queue) name
#SBATCH --ntasks=1                   # Number of CPU cores
#SBATCH --nodes=1                    # Number of nodes
#SBATCH --mem=1gb                    # Job memory request
#SBATCH --time=00:01:00              # Time limit hrs:min:sec
#SBATCH --output=renv_test_%j.log    # Standard output and error log

module load r-rocker-ml-verse/4.4.0+apptainer

cd /PATH/TO/PROJECT
Rscript test.R
```

{{< callout note >}}
The working directory can also be set with `#SBATCH --chdir=/PATH/TO/PROJECT`.
{{< /callout >}}

## Other package installation softwares

The following are some additional software options for managing packages.

1. [Pak](https://pak.r-lib.org/) is a great general-purpose package installation R package. This package can be used to download packages normally or in `renv` environments. The biggest advantage over using `install.package()` function is that it warns you if you are missing any system dependencies. It is also parallelized and extremely fast.
2. [Pacman](https://github.com/trinker/pacman?tab=readme-ov-file) will not create virtual environments, but provides convenience functions like `p_load`, which is equivalent to `library` function but will additionally install the package if it does not exist.

