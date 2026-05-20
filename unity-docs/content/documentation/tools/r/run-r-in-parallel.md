---
title: R Parallelization
---

# Run R in parallel

There are many different approaches to parallelization in R that suit different workflows, data structures, and packages. The CRAN [task view for High-Performance and Parallel Computing with R](https://cran.r-project.org/web/views/HighPerformanceComputing.html) provides a comprehensive overview of the different approaches to parallelization in R.

The following sections include examples of approaches to parallelization in R that Unity users might take.

## Check which packages are adapted to running in parallel

The packages you are using may already support running in parallel. To check if a package supports running in parallel, read the documentation for that specific package. You can also check the [applications section](https://cran.r-project.org/web/views/HighPerformanceComputing.html#parallel-computing-applications) of the HPC and Parallel Task view for a partial list of R packages that aren't focused on parallelization, but support running in parallel.

For example, the [caret](http://topepo.github.io/caret/index.html) package supports training a range of models with a common API while managing validation data (training holdouts or cross validation) and tuning hyperparameters. As a result, there are a lot of model runs that can run in parallel. The package includes useful documentation on [parallel processing with caret](https://topepo.github.io/caret/parallel-processing.html).

If the packages you are using do support running in parallel, you likely need to launch the job, run a single R script job on Slurm, and request more cores with the `-c`  argument. See [Introduction to R on Unity]({{< relref "r" >}}) for a step-by-step on how to do so. You may also need to load additional packages and set parameters to tell the package or function how many cores to use.

## Use independent tasks to run in parallel

Some projects can naturally be broken up into fairly large independent tasks. For example, you can fit a similar model repeatedly on many input data sets, or fit multiple models to the same data with different parameters.

Using independent tasks to run in parallel allows you to set up a bunch of independent tasks that are managed together. In the simplest case, each task uses just one core, but you can also configure the batch script to use multiple cores per task.

The following example shows how to create a single script that run on three different input files.

1. To make a new directory and create files, use the following shell commands:
    ```shell
    cd ~
    mkdir r_slurm_test
    cd r_slurm_test
    echo "first file" > file1.txt
    echo "second file" > file2.txt
    echo "third file" > file3.txt
    ```
    Replace the directory and file names with your own preferred names.

2. To create a batch script (*array.slurm*) to execute the Rscript three times, use the following code sample:

    ```shell
    #!/bin/bash
    #SBATCH -t 00:10:00  # Job time limit - too small for a real job!
    #SBATCH -o slurm-%j.out  # %j = job ID
    #SBATCH -c 1  # 1 cpu per task
    #SBATCH --mail-type=BEGIN
    #SBATCH --array=1-3  # Three tasks with values 1, 2, 3
    #SBATCH --mem 200    # memory limit in mb - too small for a real job!

    module load r-rocker-ml-verse/4.4.0+apptainer
    shopt -s expand_aliases

    Rscript --no-restore --quiet --no-save array.R $SLURM_ARRAY_TASK_ID

    ```
    Remember to replace the job specifications to your own preferred specifications.

    In this bash script:
    *  The `--array` argument specifies running 3 tasks numbered 1, 2, and 3. These don't have to be sequential.
    *  The `-c 1` indicates one core per task.
    * Slurm has defined the `$SLURM_ARRAY_TASK_ID` variable in the scope of the bash script and it resolves to the task ID (1, 2, or 3 in this case). By adding it to the end of the Rscript call, it is passed to the Rscript as an argument.

3. Create an Rscript to process each file. The following code sample shows how to create an Rscript to process each file by calculating each mdf5 checksum and writing it out to a similarly named `.txt` file. In a real use case, you may write a model object or summary stats to a series of `.Rds` files.

    *array.R*
    ```R
    # Recover first argument (Task ID), convert to numeric, and assign it to a variable:
    task_id <- commandArgs(trailingOnly=TRUE)[1] |> as.numeric()

    # Use it to define input and output files:
    input <- paste0("file", task_id, ".txt"
    output <- paste0("file_", task_id, "mdf.txt")

    # If this wasn't just an example, we'd do something useful but slow here. Instead, calculate the md5 hash for the file:
    md5 <- tools::md5sum(input)

    # Delay 15 seconds so that the parallel processing is observable; don't add this to your real script:
    Sys.sleep(15)

    # Finally, save the result as an an .rDa file (serialized R object):
    saveRDS(md5, output)
    ```

    {{< callout note >}}
**Use task ID to define a  suite of parameters:** You likely need to read or define a table of file names and/or parameters. To do so, use the `task_id` to specify the relevant row to run on.
    {{< /callout >}}

4. To launch from the shell, use the following command:
    ```shell
    sbatch array.slurm
    ```

5. To load the results into a list, launch R using the following command:
    ```shell
    module load r-rocker-ml-verse/4.4.0+apptainer
    R
    ```
    {{< callout note >}}
You could also use Open OnDemand RStudio for these steps.
    {{< /callout >}}

6. To view the results, run the following code sample in R:
    ```R
    files <- paste0("file_", 1:3, "mdf.Rds")
    result <- lapply(files, readRDS)
    names(result) <- files
    print(result)
    ```

## Use `foreach` to run in parallel

The following section guides you through how to divide an Rscript into pieces that may run in parallel, with the parallelization managed internally by R. There are multiple packages that support this type of [explicit parallelism](https://cran.r-project.org/web/views/HighPerformanceComputing.html#parallel-computing-explicit-parallelism).

The following guide uses [**foreach**](https://cran.r-project.org/web/packages/foreach/index.html), which provides an alternative to standard R loops that can run in parallel or serially. Most importantly, the code within the loop needs to be independent of prior iterations.

The following is [a minimal example of running `foreach` on Slurm](https://gist.github.com/brfitzpatrick/33fc2c815d66fedb88e90f1764cc0f96).

**The job script:**
```shell
#!/bin/bash
#SBATCH --job-name=rfee
#SBATCH --workdir=/home/user.name/rfee/
#SBATCH --output=r_foreach_example_console_output.txt
#SBATCH --mem-per-cpu=100 # specify RAM per CPU here in Mb
#SBATCH --time=0:02:00
#SBATCH --ntasks=1
#SBATCH --cpus-per-task=4 # specify number of CPUs to use here

module load r-rocker-ml-verse/4.4.0+apptainer
shopt -s expand_aliases

Rscript ./r_foreach_example.R
```

**The R script** (`r_foreach_example.R`):
```R
# Specify the path from which to load R packages:
.libPaths('/home/user.name/R')

# Load the packages:
library('doMC') # note: loading 'doMC' also loads 'foreach'

# Provide a simple function to execute first in serial, then again in parallel:
f1 <- function(x){
  Sys.sleep(2)
  return(x)
  }

# Import the number of available CPUs (this is the number we supplied at the line #SBATCH --cpus-per-task=4 in our .sh file):
n.cpus <- Sys.getenv("SLURM_CPUS_PER_TASK") |> as.numeric()

# Register a parallel backend specifying the number of CPUs as the number we imported using Sys.getenv():
registerDoMC(cores = n.cpus)

# Run a serial foreach loop:
system.time(
  s1 <- foreach(i = 1:4, .combine = c) %do%
    f1(i)
)

# Run a parallel foreach loop:
system.time(
  s2 <- foreach(i = 1:4, .combine = c) %dopar%
    f1(i)
)

# Print the results:
Print(s1)
Print(s2)

#Stop parallel in the backend:
stopImplicitCluster()
```

## Parallel processing with `future` and `batchtools` packages
The **future** package, in combination with **batchtools**, provides a powerful way to parallelize computations across a cluster using Slurm.

On Unity using the Slurm job scheduler, the following steps guide you through how to set up parallelization across compute nodes.

1.	To install and load the necessary packages, use the following commands:
    ```R
    install.packages("future.batchtools")
    install.packages("batchtools")

    library(future.batchtools)
    library(batchtools)
    ```

2.	To define the slurm template and store it as an R string, create a slurm template file (slurm.tmpl) that looks like the following:

    ```R
    slurm_template <- "#!/bin/bash
    #SBATCH --job-name=<%= job.name %>
    #SBATCH --output=<%= job.name %>-%j.out
    #SBATCH --error=<%= job.name %>-%j.err
    #SBATCH --time=<%= resources$walltime %>
    #SBATCH --mem=<%= resources$memory %>G
    #SBATCH --cpus-per-task=<%= resources$cpus %>
    #SBATCH --ntasks=1
    module load r-rocker-ml-verse/4.4.0+apptainer
    Rscript -e \"batchtools::doJobCollection('<%= uri %>')\"
    ```

3. Save the template as a `.tmpl` file that `batchtools` can read using the following command:
    ```R
    writeLines(slurm_template, con = "slurm.tmpl")
    ```

4. Create a `batchtools` registry where job results and logs are stored using the following command:
    ```R
    reg <- makeRegistry(file.dir = "my_registry", seed = 123)
    ```

5. Configure `future.batchtools` to use the slurm backend with your template using the following command:
    ```R
    plan(batchtools_slurm, template = "slurm.tmpl", resources = list(walltime = "01:00:00", memory = 2, cpus = 1))
    ```
    Be sure to customize the resources list to match your own job requirements.

6. Submit your jobs using the `future` command:
    ```R
    fut <- future({
    # Your R code here, for example:
    sum(runif(1e6))
    })

    # To retrieve the result:
    result <- value(fut)
    print(result)
    ```
    The job runs according to the configuration specified in the `slurm_template`.

    Note that this is a **blocking operation**. You can run this operation from the login node, but **the terminal must remain open** (possibly using `tmux`). Therefore, this operation may only be useful for a small number of very short jobs that are expected to complete quickly.

## Parallel processing with `furrr` package
The `furrr` package is a combination of the `purrr` package and the `future` package. It allows a drop-in replacement for `purrr`'s map functions such as `future_map`.

```R
# Load the furrr package
library (furrr)

# Set a plan for how the code should run.
# Use the future package's plan () function to set up a parallel backend.
# This will determine how the parallelization is handled.
# You can specify the number of workers (cores) to use.
future::plan (multiprocess, workers = no_cores)
```

## Other parallelization packages
* [Target package](https://books.ropensci.org/targets/hpc.html#future)

