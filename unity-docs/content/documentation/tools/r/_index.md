---
title: R
---

# Introduction to R on Unity

[R](https://www.r-project.org/about.html) is a language and environment for statistical computing and graphics. It provides a wide variety of statistical and graphical techniques, and is highly extensible.

[Unity OnDemand](https://ood.unity.rc.umass.edu/pun/sys/dashboard) includes RStudio, which is an Integrated Development Environment (IDE) that allows you to use R. You can also access R through the Command Line Interface (CLI). This guide includes instructions for both methods.

This guide will also show you how to install R packages, which are add-on modules for R. Additionally, this guide includes instructions on how to execute an R script as a job on [slurm]({{< relref "sbatch" >}})  that will be independent of the node and session you've logged on with.

## Access RStudio on Unity OnDemand

RStudio is an IDE (Integrated Development Environment) that allows you to use R. It combines a source code editor, a debugger, and build automation tools. Unity OnDemand provides RStudio as one of its interactive apps. Connect to RStudio through Unity OnDemand using the following steps: 
1. Go to [Unity OnDemand](https://ood.unity.rc.umass.edu/pun/sys/dashboard).

2. From the top menu, click **Interactive Apps**. A dropdown menu appears.
3. Click **RStudio**. In the RStudio page that appears, you are asked to allocate resources for your RStudio session. 
4. Change the options as needed. To use the default settings, leave all the fields blank.

5. To launch the RStudio app, click **Launch**.

    {{< figure src="rstudio-launch-button.png" title="RStudio Launch Button" alt="RStudio Launch Button" >}}

    The server begins to launch, which may take a few moments.Once the session is successfully created, the **My Interactive Sessions** page opens and displays information about the **"Queued"** RStudio session, including the time created, the time requested, and the session ID. There is also an option to **Cancel** the session if necessary.

    {{< figure src="rstudio-queued.png" title="RStudio Queued Session" alt="RStudio Queued Session" >}}

    Once the session moves to **"Starting"**, the informational box displays the time remaining and the number of nodes and cores.

    {{< figure src="rstudio-starting.png" title="RStudio Starting Session" alt="RStudio Starting Session" >}}

    Once the session begins **"Running"**, the top of the informational box turns green and the host name is displayed below it. The **Connect to RStudio Server** button also becomes available.

    {{< figure src="rstudio-running.png" title="RStudio Running Session" alt="RStudio Running Session" >}}

6. To connect to RStudio once your session is running, click **Connect to Rstudio Server**. The RStudio app opens.

    {{< figure src="rstudio-app.png" title="RStudio App" alt="RStudio App" >}}


## Access R through the Command Line Interface (CLI)

When using the command line through either [the Unity OnDemand web-based shell](https://ood.unity.rc.umass.edu/pun/sys/shell/ssh/login-node-round-robin.unity.rc.umass.edu) or SSH, you need to load R before using it.  We recommend using the same container that is used by RStudio. To learn how to submit an R script as a batch job using `sbatch`, see [Submit an R script as a batch job](#submit-an-r-script-as-a-batch-job).

The following instructions outline how to load and call R, how to exit out of R once you are done, and how to view other versions of the R module.

1. In your preferred shell, use the following code sample to load the container and call R, resulting in an interactive R prompt:

    ```
    module load r-rocker-ml-verse/4.4.0+apptainer
    R
    ```

2. To exit out of R and return to the command line, use `q()`.
    ``` 
    q()
    ```
3. To view other (possibly newer) versions of the above module that might be available on Unity, use the following command:
    ```
    module avail r-rocker
    ```
## Install CRAN and Bioconductor packages 

The [Comprehensive R Archive Network (CRAN)](https://cran.r-project.org/) and [Bioconductor](https://www.bioconductor.org/) are two repositories that include R packages, which are add-on modules that extend the functionality of R. 

When you install a CRAN or Bioconductor package, the package files will be added to the library associated with your user account. In most cases, using the default library location works well.

{{< callout caution >}}
You should **not** install packages in scripts run by slurm (`sbatch`).
{{< /callout >}}

The following instructions will show you how to install packages using one of the following methods: 

* Install using the RStudio package installer.

* After loading the R container, install packages using R in the command line.

For both methods, be sure to install the packages in a fresh R session, prior to any `library()` calls.

### Install packages using the RStudio package installer

RStudio includes the option to install additional R packages within your RStudio session window. The following instructions assume that you have an RStudio session running already, but if you don't and would like to start one, see [Access RStudio on Unity OnDemand](#access-rstudio-on-unity-ondemand) for detailed step-by-step instructions.

The following steps will guide you through how to install additional R packages in your RStudio OnDemand session:

1. Open your RStudio session in Unity OnDemand. For a detailed walkthrough on how to access and start an RStudio session, see [Access RStudio on Unity OnDemand](#access-rstudio-on-unity-ondemand).

    {{< figure src="rstudio-app.png" title="RStudio App" alt="RStudio App" >}}

2. In the bottom right pane of the RStudio app, click **Packages**. The **Package Manager** opens, showing a list of the currently installed packages. The checked boxes in the first column indicate that the packages are currently loaded in memory with a `library()` call.

    {{< figure src="rstudio-package-manager.png" title="RStudio Package Manager" alt="RStudio Package Manager" >}}

3. To install **additional** packages, click **Install**. Alternatively, from the main taskbar at the top of the RStudio window, click **Tools > Install Packages**.

    {{< figure src="rstudio-tools-tab.png" title="RStudio Tools Tab" alt="RStudio Tools Tab" >}}

4. In the **Install Packages** window that appears, fill in the necessary information about the package(s) you want to install, including:

    - **Install from**: Select where you are installing the package(s) from, such as Repository (CRAN).

    - **Packages**: Type the name(s) of the package(s) you want to install. If you are installing multiple packages, make sure to separate the package names with a space or comma.

    - **Install to Library**: Select which library you want to install the package(s) to.

    - **Install dependencies**: Click the checkbox if you want to install dependencies for the package(s).

  
    {{< figure src="rstudio-install-packages-window.png" title="RStudio Install Packages Window" alt="RStudio Install Packages Window" >}}

### Install packages using R (via shell or RStudio)

Users that are comfortable using the Command Line Interface (CLI) can alternatively install packages using R, whether it be through SSH in your terminal, [the Unity OnDemand web-based shell](https://ood.unity.rc.umass.edu/pun/sys/shell/ssh/login-node-round-robin.unity.rc.umass.edu), or the **Console** in RStudio. 

To install R packages, use the following command:

```
# To install the foreach package
install.packages("foreach")
```
Replace `"foreach"` with the name of whichever package you want to install.

## Install binary packages

The following instructions are for users that are **_not_** installing packages through the [RStudio package installer](#install-packages-using-the-rstudio-package-installer) previously discussed in this guide. The R container used by RStudio OnDemand is configured to install binary packages, so if you are installing packages through RStudio, you do not need to manually install binary packages and **can skip this section**.

In Linux systems, R by default will download source packages and then build them locally into binary packages before installing them.  Depending on the package, this process can be slow and complex.  [Posit](https://packagemanager.posit.co/client/#/repos/2/overview/), the company behind RStudio, hosts a package repository that contains binary packages built for various Linux distributions.  These binary packages are generally easier and faster to install than the source packages.   

To install binary packages from the [Posit repository](https://packagemanager.posit.co/client/#/repos/2/overview/), specify the repository within an R session for a particular call to `install.packages()`, as shown in the following code sample:
```
# Install binary CRAN packages from POSIT

# Determine the correct repository for linux as installed
repos <-  c(CRAN = paste0('https://packagemanager.posit.co/cran/__linux__/',
			system2('lsb_release', c('-c', '-s'), stdout = TRUE), '/latest'))

# change "dplyr" to your package
install.packages(“dplyr", repos=repos, dependencies=TRUE) 

```

Alternatively, to ensure that binary packages are always preferentially installed, add the following information to `.Rprofile` in your home directory:
```
options(repos = c(CRAN = paste0('https://packagemanager.posit.co/cran/__linux__/', system2('lsb_release', c('-c', '-s'), stdout = TRUE), '/latest')))
options(HTTPUserAgent = sprintf("R/%s R (%s)", getRversion(), paste(getRversion(), R.version["platform"], R.version["arch"], R.version["os"])))

```

## Troubleshooting package installation
The following sections will guide you through common package installation issues.

### Check installation location

If your package installation is failing, it could be because R is installing packages in a location that you do not have write access to. The following steps will show you how to check where your R packages are being installed and how to change that location.

1. To see where R packages are being loaded, run the following command:
    ```
    .libPaths()
    ```
    `.libPaths()` shows where R packages are loaded. If packages are installed in more than one location, the list begins with libraries listed first in the paths.

    The first library in the list is the location where R attempts to install packages by default; **if this location is a directory that you do not have write access to, the installation will fail.**  

2. To change the path for the current R session, run the following command:
    ```
    .libPaths(new = c("NEW_PATH", .libPaths()))
    ``` 
    Be sure to replace `"NEW_PATH"` with the path you would like the packages to be installed at (in quotation marks). This path becomes the first library in the list when you run `.libPaths()`.

3. To make the path change permanent, add the `.libPaths(new = c("NEW_PATH", .libPaths()))` command from the previous step to the `~/.Renviron` file in your home directory. If the `~/.Renviron` file doesn't exist, you need to create it first.

### Bioconductor package installation
There are a few problems that you might run into with [Bioconductor package installation](https://cran.r-project.org/web/packages/BiocManager/vignettes/BiocManager.html). The steps outlined below will guide you through any problems that might come up during the installation process.

1. To install Bioconductor packages, use base R `install.packages()`.
2. Bioconductor tends to have package updates more than CRAN. If you need to update multiple Bioconductor packages, and base R's `install.packages()` isn't working, use `BiocManager::install()`.  

    By default, it will attempt to update all the installed Bioconductor packages with `update = TRUE`.
    This default setting presents two problems: (1) there are a lot of Bioconductor packages installed in the container, so you will need to install and update a lot of packages, and (2) it will attempt to update the packages in the library they are installed in, including libraries that users don't have permission to edit. 

   - If you **don't** need to update every Bioconductor package, you can use `update = FALSE` to save time. Otherwise, you'll end up with a lot of extra packages that you don't necessarily need. 

   - If you **do** need to update Bioconductor packages, use:
      ```
      BiocManager::install("package_name", lib = .libPaths()[1])
      ```
      This command forces the installation into the library in your home directory, taking up a lot of space in that location.

## Submit an R script as a batch job

[slurm](slurm/index.html) is the Unity job scheduler and should be used for running any large or parallel work on Unity. The following instructions will show you how to run a single R script job on slurm and check the job progress. 

{{< callout caution >}}
Please install any required R packages (see [Install CRAN and Bioconductor Packages](#install-cran-and-bioconductor-packages) and [Install binary packages](#install-binary-packages)) *before* launching jobs on slurm. Do not use `install.packages()` or similar functions within a script running on slurm.
{{< /callout >}}

### Run a single R script job on slurm

If you have an R script that takes a long time to run, you can use `sbatch` to execute the R script as a job on slurm that will be independent of the node and session you've logged on with. These instructions will guide you through creating two bash script files to launch the job, and an R file to do the work.  

The following code samples use `sbatch` to execute the R script as a job on slurm, independently from the node session you've logged on with. 

1. Use the following code sample to create a *single.script*, which is the **bash script** that helps launch the job.  

    ```
    #!/bin/bash
    #SBATCH -t 00:10:00  # Job time limit
    #SBATCH -o slurm-%j.out  # %j = job ID
    #SBATCH -N 1
    #SBATCH -n 1
    #SBATCH --mail-type=BEGIN

    module load r-rocker-ml-verse/4.4.0+apptainer
    shopt -s expand_aliases

    Rscript --no-restore --quiet --no-save single.R
    ```

    Replace the following information in the `#SBATCH` lines with information that is specific to your job:

    - `-t 00:10:00` is the job time limit. The format is `days-hours:minutes:seconds`. In the code sample, the job time limit is 10 minutes. You should request a little more time than your job will need, because if your job doesn't complete before the limit, the output will be lost. If you omit this flag, the default is `infinite`, which is safe but not efficient for the scheduler.

    - `-o` specifies the output file and incorporates the job ID.
    - `-N` specifies the number of nodes (computers) to run on.
    - `-n` specifies how many cores you want to use. 
    - `--mail-type=BEGIN` indicates that you would like to receive an email when the job begins.
    The last line executes the `test.R` script with R, without restoring a saved R workspace and without saving the workspace on completion.

2. Use the following code sample to create a *single\.R*, which is the **R script** that helps launch the job.
    ```
    # This is the R script to do your work. 

    # We are just going to print some of the environmental variables set by slurm
    # to standard output.
    cat("Job id:", Sys.getenv("SLURM_JOB_ID"), "\n")
    cat("Submit dir:", Sys.getenv("SLURM_SUBMIT_DIR"), "\n")
    Sys.sleep(30)  # Delay as if you were doing some work 
    ```

3. Start the job from the Unity shell using the following code sample:
    ```
    sbatch single.script
    ```
    Once the job is submitted successfully, `Submitted batch job 10121952` appears in the output.

### Check R script job progress
There are a few ways to check on the progress of an R script job run on slurm, including:

- `squeue --me`, which shows all of your currently queued jobs.

- `seff 10121952`, which lists the job efficiency after it has completed. ***Be sure to update the `10121952` number to your job ID.***

To learn more about checking the progress of your jobs, see our [Introduction to batch jobs]({{< relref "sbatch" >}}) documentation.















