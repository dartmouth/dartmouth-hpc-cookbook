---
title: Array Batch Jobs
---

# Array batch jobs #

Before reading this page, we recommend that you read our [Introduction to batch jobs](/documentation/jobs/sbatch/) first.

When submitting a batch job, you often need to execute the same set of commands with different sets of data or parameters. An **array job** refers to a sequence of individual jobs that are submitted together as a single job. You can use array jobs to submit several jobs or tasks at once with a single batch script. You can also use a **relative index** (via environment variable `$SLURM_ARRAY_TASK_ID`) to select jobs within the batch script.

The following sections will guide you through how to set parameters for an array batch job, set up email notifications for updates on your job, cancel an array job, and set up job dependencies.

## Set parameters for an array batch job

To submit an array job you have to use the `--array=<indexes>` parameter to specify the job(s) you want to submit.

The `<indexes>` can be any combination of ranges or lists. For example, `1-100,200` would submit 101 jobs (jobs 1-100 and 200). Ranges can include skip counting using a colon. For example, the expression `0-15:4`, is the same as the sequence `0, 4, 8, 12`. The number after the colon specifies the interval or skip size between consecutive numbers in the sequence.

When submitting a large array, it may be useful to limit the number of jobs running at one time. See the [partition list]({{< relref "partitions" >}}) for per-user and per-account limits.

To limit the number of jobs running at one time, you can use the `--array=<indexes>%<max concurrent jobs>` parameter. The `<indexes>` represent the range of jobs you want to run, and the `<max concurrent jobs>` is an integer that represents the maximum amount of jobs that can run at the same time.

For example, the following parameter limits the array job to 10 concurrent jobs:

```shell
--array=1-100%10
```

After starting the job, you can use `scontrol` to change the maximum amount of concurrent jobs:

```shell
scontrol update jobid=<your job id> arraytaskthrottle=<new max concurrent jobs>
```
{{< callout note >}}
Decreasing the number of concurrent jobs will not kill a job. Instead, a new job will not start until the running tasks dips below the new threshold.
{{< /callout >}}

When viewing the job queue (`squeue`) or querying job accounting information (`sacct`), each task within an array job is listed using the `<jobid>_<arrayid>` syntax as a **unique identifier**.

The unique identifier combines the `<jobid>` (the ID assigned to the entire array job) and the `<arrayid>` (the specific index or task number within the array). For example, if the job ID is 123456 and the array consists of tasks numbered from 1 to 100, individual tasks are listed as 123456_1, 123456_2, ..., 123456_100. These unique identifiers allow users and administrators to track and monitor the status and details of individual tasks within the array job.

 Slurm generates **output files for array jobs** based on a default naming convention to match this identification scheme. The default output file name format is `slurm-%A_%a.out`, where:

 * `%A` is a placeholder for the `<jobid>`.

 * `%a` is a placeholder for the `<arrayid>`.

 For example, if an array job with the ID `123456` consists of tasks numbered from 1 to 100, the output file names for individual tasks would follow the pattern `slurm-123456_1.out`, `slurm-123456_2.out`, ..., `slurm-123456_100.out`.

## Select data or parameters with `SLURM_ARRAY_TASK_ID`
Each task within a Slurm job array will have a `$SLURM_ARRAY_TASK_ID`, which represents the specific index of the task within the array. The following sections will explain how to use the `$SLURM_ARRAY_TASK_ID` index values to select data or parameters for an array batch job.

### Select a dataset
Depending on how your data is organized, you can select which dataset to work with by choosing a specific directory or folder for processing. The recommended method is to generate a list ahead of time, and then select files from that list. The following steps will guide you through how to generate a list and how to select a dataset from that list.

1. To change the directory of your dataset in the shell, use the command `cd PATH_TO_DIRECTORY_OF_DATASET`.

2. To create a list, use the following command:

    ```BashSession
    ls -1 *.FILE_TYPE > input.txt
    ```
    The `ls -1` command lists the contents of your directory in a single-column format. The `*.FILE_TYPE` specifies the type of data you want to list within the directory. `> input.txt` redirects the output of the `ls` command into a file named "input.txt". For example, the command `ls -1 *.fasta > input.txt` would search the directory for all ".fasta" files and writes each file name into a new text file "input.txt".

{{< callout caution >}}
Do not use the `ls` command directly in the batch script. Changes to the contents of the directory during the run may affect the order of the output, which leads to missed or double-processed files.
{{< /callout >}}

3. To find out how many files within your directory matched the file type you specified in the previous step use the following command:

    ```BashSession
    wc -l your_input_file.txt
    ```

    The shell returns a number which represents how many lines there are in "input.txt". Since the `ls -1` command writes each file on separate lines, this number also represents how many files within your directory match the file type you specified in the previous step.

4. Open your batch script. If you haven't already created a batch script for your job, see [Introduction to batch jobs](/documentation/jobs/sbatch/).

5. In your batch script, write the following line:

    ```bash
    INPUT_FILE=$(sed -n "${SLURM_ARRAY_TASK_ID}p" input.txt)
    ```

    This line sets the `INPUT_FILE` variable to the files found within "input.txt". It is important that you write this line before any command that uses multiple inputs.

6. Wherever applicable, use `"${INPUT_FILE}"` as the input for commands within your batch script. The following is an example array batch script:

    ```bash
    #!/bin/bash
    #SBATCH -N 1 -c 12
    INPUT_FILE=$(sed -n "${SLURM_ARRAY_TASK_ID}p" input.txt)
    module load blast-plus/2.12.0
    blastx -query "${INPUT_FILE}" -db nr -num_threads "${SLURM_CPUS_ON_NODE}"
    ```

    In this example, the last line executes the `blastx` command using `"${INPUT_FILE}"` as the input.

7. To start your array batch job, go back to the shell and use the `sbatch --array=<indexes>` command.

    Within your new "input.txt" file, each file is listed on its own line. The line number associated with each file corresponds to the index number of that file. For example, if "example.fasta" is listed in line 7 of your "input.txt", the index of "example.fasta" is 7, as shown in the following example:

    ```BashSession
    login$ ls -1 *.fasta > input.txt
    login$ wc -l input.txt
    23
    login$ sbatch --array=1-23 search.sh
    ```

### Select a parameter set
The environment variable can also be used directly in your code, for example:
```python
import os
# Define the set of parameters
parameters = [
    {'x': 1, 'y': 1},
    {'x': 2, 'y': 1},
]
def model(x, y):
    pass
if __name__ == "__main__":
    # Note: use zero-based indexing on submit: --array=0-1
    DATA_SET = int(os.getenv("SLURM_ARRAY_TASK_ID"))
    model(**parameters[DATA_SET])
```

### Use a random number generator seed
For some applications, the only change in the code might be a seed for a random number generator, as shown in the following example:

```python
import os
import random
SEED = int(os.getenv("SLURM_ARRAY_TASK_ID"))
random.seed(SEED)
# Make note of the value somewhere so you can reproduce
print(f"Using RNG Seed: {SEED}")
```

## Receive emails about job arrays
By default, `BEGIN/END/FAIL` email updates about jobs apply to the array as a whole. For small arrays, you might consider using `--mail-type=ARRAY_TASKS,FAIL` to be notified of any task failure.

## Cancel an array job
You can cancel either a specific array index, or an entire array (running and pending), depending on how you specify the job ID.

To cancel a specific instance, use the following command:
```shell
scancel jobid_arrayid  # cancel a specific instance
```

To cancel any running or pending items in the array, use the following command:
```shell
scancel jobid  # cancel any running or pending items in the array
```


## Job dependencies
If your array jobs also have multiple steps with different resource requirements, you can submit multiple job arrays where the next step depends only on the corresponding ID of the last array. To do this, you need to submit each job sequentially, and use `--dependency=aftercorr:` to specify it on the next job.

For example, if you have a job that requires a lot of resources to compute, but only a single core to post-process, you can use the following commands (either on the command line or in another bash script):
```shell
mainjob=$(sbatch -P --array=0-12%6 -G 1 -p gpu main_job.sh)
sbatch --array=0-12%6 --dependency=aftercorr:$mainjob post_process.sh
```
