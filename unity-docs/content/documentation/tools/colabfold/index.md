---
title: ColabFold
---

[1]: https://doi.org/10.1038/s41592-022-01488-1
[2]: https://doi.org/10.1038/s41586-021-03819-2
[3]: https://github.com/sokrypton/ColabFold#running-locally

# Introduction to ColabFold on Unity

ColabFold ([1]) is a software developed to accelerate the prediction of 3D protein structures and protein complexes by integrating the fast search algorithm MMSeqs2 with AlphaFold2 ([2]) or RoseTTAFold.

ColabFold is available on Unity through a Jupyter notebook or a batch script. Both methods use a graphics processing unit (GPU) and the AlphaFold2 AI tool. The output includes the predicted protein structure as a PDB format text file and additional files to evaluate the results.
The Jupyter notebook method is designed to [predict one protein sequence at a time](#run-colabfold-on-single-protein-sequences), while the batch script method can [predict multiple protein sequences at once](#run-colabfold-in-batch-mode).
You can access a beta version of ColabFold on Unity.

The following guide will show you how to use a Jupyter notebook to access ColabFold and how to use a batch script to run ColabFold. If you have any questions, please send an email to [hpc@umass.edu](mailto:hpc@umass.edu).

## Run ColabFold on single protein sequences
ColabFold can be accessed on Unity through a JupyterLab notebook, which allows the prediction of one protein sequence at a time.

The following steps are divided into Part 1 and Part 2. Part 1 will show you how to access and set up JupyterLab in Unity, and Part 2 will show you how to run ColabFold using a Jupyter notebook.

### Part 1: Access and set up JupyterLab

The following steps will guide you through how to access and set up JupyterLab through Unity OnDemand. If you already know how to access and set up JupyterLab successfully, you can skip to [Part 2: Access and use ColabFold through JupyterLab](#part-2-access-and-use-colabfold-through-jupyterlab).

1. Go to [Unity OnDemand](https://ood.unity.rc.umass.edu/pun/sys/dashboard) and sign in.
2. From the top menu, click **Interactive Apps**.
3. In the dropdown menu that appears, click **JupyterLab**.
4. On the JupyterLab page, fill in the following fields:
   - **Partition**: the type of compute nodes you want to run your interactive session on. Select one of the gpu partitions to run ColabFold Jupyter notebook (gpu, uri-gpu or gpu-preempt). For more information on partitions, see [the partition list](/documentation/cluster_specs/partitions/).
   - **Maximum job duration**: how long the interactive session with JupyterLab runs for. This field can be left with the default value of one hour (1:00:00) for short protein sequences, but should be increased to make predictions on larger protein sequences.
   - **Memory (in GB)**: the amount of memory in gigabytes, allocated to your interactive session. For example, 8GB is enough for a protein of 59 amino acids, but 50 GB is required for a large protein of 2894 amino acids.
   - **GPU count**: the number of GPUs allocated to your interactive session. Set this value to 1 since ColabFold only runs on a single GPU.
   - **Modules**: which environment modules should be loaded before the job starts.
     -  To use a GPU, **add the two following modules exactly as written to this field:** `cudnn/cuda11-8.4.1.50 cuda/11.4.0`

   - The fields **CPU thread count** and **Extra arguments for Slurm** can be left blank.

### Part 2: Access and use ColabFold through JupyterLab

The following steps will guide you through how to access and use ColabFold through a Jupyter notebook. To learn how to access JupyterLab in Unity, see [Part 1: Access and set up JupyterLab](#part-1-access-and-set-up-jupyterlab).

1. From the top menu of Unity OnDemand, click **Files**.
2. In the dropdown menu that appears, click **datasets**.
3. From the list of directories, click **bio > colabfold**.
4. Select the checkbox next to **ColabFold.ipynb**.
5. From the taskbar, click **Copy/Move**.
6. In the new window that asks if you want to copy or move the file to your working directory, click **Copy**.
7. Open the **ColabFold.ipynb** notebook.
8. Choose **Python (colabfold)** for the kernel.
9. Insert your protein sequence next to **query_sequence**.
10. To execute the code in the cell, press **SHIFT+ENTER** or click the **Play** button in the taskbar above.
11. Run the code in the remaining cells to predict the protein structure with the default parameters (see Notes section below) and output plots and a visualization of the 3D structure.
    - The output directory containing the results is located in the folder where you put the **ColabFold.ipynb** notebook.

{{< callout note >}}
* ColabFold's notebook is setup to run with the following parameters that can be adjusted by the user:
    * No templates
    * Number of models: 5
    * Stop predictions at score 100
    * Msa mode: mmseqs2_uniref_env
    * Model type: alphafold2_ptm
* The Jupyter notebook made available here is a modified version of the AlphaFold2_mmseqs2 notebook [3].
{{< /callout >}}

## Run ColabFold in batch mode

If you are dealing with a large number of protein sequences, running ColabFold in batch mode is a more efficient method.





The script `colabfold_batch` **searches for homologous protein sequences** in the ColabFold MMseqs2 server and **predicts 3D protein structures** with AlphaFold2.

The code below provides an example on how to make predictions using `colabfold_batch` in a batch script:

  ```bash
  #!/bin/bash
  #SBATCH --partition=gpu
  #SBATCH --constraint=vram16
  #SBATCH --gpus-per-node=1
  #SBATCH --cpus-per-gpu=8
  #SBATCH --mem-per-gpu=40G
  #SBATCH --time=05:00:00
  #SBATCH --output=slurm-%j.out
  #SBATCH --error=slurm-%j.err

  module load cudnn/cuda11-8.4.1.50
  module load cuda/11.4.0
  module load conda/latest
  conda activate colabfold

  colabfold_batch <path to directory containing fasta file of protein sequences> <path to output directory> --
  stop-at-score 85 --msa-mode 'mmseqs2_uniref_env'
  ```

The parameter `--stop-at-score` is used to stop generating models until the predicted confidence metric (pLDDT or predicted local distance difference test) is reached.

The `colabfold_batch` command used in the example above creates the following files in the provided output directory for each input protein sequence:

* `{*}_PAE.png` → 2D plot of the Predicted Aligned Error (PAE) for each of the 5 trained models.
* `{*}_coverage.png` → plot of the coverage of protein sequences to the query protein.
* `{*}_plddt.png` → plot of the pLDDT (predicted local distance difference test) scores for each residue and the 5 trained models.
* `{*}_predicted_aligned_error_v1.json` → raw data with PAE for all residue pairs for each of the 5 trained models.

The following two files are generated for the five trained models:
* `{*}_unrelaxed_rank_1_model_1.pdb` → PDB format text file containing the predicted structure obtained from model 1.
* `{*}_unrelaxed_rank_1_model_1_scores.json` → raw data with the pLDDT scores for each residue of the protein structure obtained from model 1.

#### Other notes:
* If a multiple sequence alignment file in A3M format is provided as input, `colabfold_batch` will skip the protein sequence search and proceed with the prediction of 3D protein structures.
* `<path to output directory>` is the full path to an existing directory used to store the results.
* When dealing with a large number of sequences, we recommend sorting proteins into batches based on their size and submitting a job to a GPU node with smaller VRAM for batches with shorter proteins. The whole process can be expedited on a large set of input protein sequences by submitting the batch script  as an [array job]({{< slurmlink "job_array.html" >}}).
* Predictions on proteins longer than 2000bp should be run on a GPU node with at least 16GB VRAM.
* One of ColabFold default settings is to not overwrite existing results. The batch script above can be resubmitted in case a job ended before ColabFold finished to resume protein predictions.


To perform **protein sequence search** with MMseqs2 and the protein databases available on Unity, you can use `colabfold_search`.

The code below is an example of a batch script to run MMseqs2 with `colabfold_search`:


```bash
#!/bin/bash
#SBATCH --partition=cpu
#SBATCH --nodes=1
#SBATCH --cpus-per-task=32
#SBATCH --mem=200G
#SBATCH --time=05:00:00
#SBATCH --output=slurm-%j.out
#SBATCH --error=slurm-%j.err

module load uri/main
module load MMseqs2/14-7e284-gompi-2021b
module load conda/latest
conda activate colabfold

colabfold_search <path to fasta file> /datasets/bio/colabfold <path to output directory> --db1 uniref30_2202/uniref30_2202_db --db3 colabfold_envdb_202108/colabfold_envdb_202108_db --use-env 1 --use-templates 0 --threads $SLURM_CPUS_ON_NODE
```

In this case, protein sequences contained in a fasta file are aligned against the UniRef30 (`--db1 uniref30_2202/uniref30_2202_db`) and environmental (`--db3 colabfold_envdb_202108/colabfold_envdb_202108_db`) databases. `UniRef30` is the default database used to search proteins.

To use the **environmental database:**
- Set the parameter `--use-env` to `1`.

- Provide the path to the database: `--db3 colabfold_envdb_202108/colabfold_envdb_202108_db`.

To use the **PDB70 templates database:**
- Set the parameter `--use-templates` to `1`.

- Provide the path to the database: `--db2 pdb`.

The multiple sequence alignment (MSA) file obtained with `colabfold_search` can then be used with `colabfold_batch` to make 3D protein predictions:
```bash
colabfold_batch <path to directory containing MSA file> <path to output directory> --stop-at-score 85
```

#### Other notes:
* `<path to fasta file>` is the full path to a fasta file containing protein sequence(s) of interest.
* `<path to output directory>` is the full path to an existing directory used to store the multiple sequence alignments (MSAs).
* It is recommended to request at least 200G using `#SBATCH --mem=200G` in order to load the protein databases.
* The time requested using `#SBATCH --time=05:00:00` should be adjusted depending on the number of protein sequences in the input fasta file.

## Full list of parameters for colabfold_search and colabfold_batch

```
colabfold_search [-h] [-s S] [--db1 DB1] [--db2 DB2] [--db3 DB3]
                        [--use-env {0,1}] [--use-templates {0,1}]
                        [--filter {0,1}] [--mmseqs MMSEQS]
                        [--expand-eval EXPAND_EVAL] [--align-eval ALIGN_EVAL]
                        [--diff DIFF] [--qsc QSC] [--max-accept MAX_ACCEPT]
                        [--db-load-mode DB_LOAD_MODE] [--threads THREADS]
                        query dbbase base

  query                 fasta files with the queries.
  dbbase                The path to the database and indices you downloaded
                        and created with setup_databases.sh
  base                  Directory for the results (and intermediate files)
  -s S                  mmseqs sensitivity (1-8). Lowering this will result in a
                        much faster search but possibly sparser msas → default = 8
  --db1 DB1             path to a UniRef database on Unity
  --db2 DB2             path to the Templates database on Unity
  --db3 DB3             path to the Environmental database on Unity
  --use-env {0,1}
  --use-templates {0,1}
  --filter {0,1}
  --mmseqs MMSEQS       Location of the mmseqs binary
  --expand-eval EXPAND_EVAL
  --align-eval ALIGN_EVAL
  --diff DIFF
  --qsc QSC
  --max-accept MAX_ACCEPT
  --db-load-mode DB_LOAD_MODE → default = 0 (batch searches)
  --threads THREADS
```

```
colabfold_batch [-h]   [--stop-at-score STOP_AT_SCORE]
                       [--stop-at-score-below STOP_AT_SCORE_BELOW]
                       [--num-recycle NUM_RECYCLE]
                       [--num-ensemble NUM_ENSEMBLE]
                       [--random-seed RANDOM_SEED] [--num-models {1,2,3,4,5}]
                       [--recompile-padding RECOMPILE_PADDING]
                       [--model-order MODEL_ORDER] [--host-url HOST_URL]
                       [--data DATA]
                       [--msa-mode {'mmseqs2_uniref_env','mmseqs2_uniref','single_sequence'}]
                       [--model-type {auto,AlphaFold2-ptm,AlphaFold2-multimer-v1,AlphaFold2-multimer-v2}]
                       [--amber] [--templates]
                       [--custom-template-path CUSTOM_TEMPLATE_PATH] [--env]
                       [--cpu] [--rank {auto,plddt,ptmscore,multimer}]
                       [--pair-mode {unpaired,paired,unpaired+paired}]
                       [--recompile-all-models]
                       [--sort-queries-by {none,length,random}]
                       [--save-single-representations]
                       [--save-pair-representations] [--training]
                       [--max-msa           {512:5120,512:1024,256:512,128:256,64:128,32:64,16:32}]
                       [--zip] [--use-gpu-relax]
                       [--overwrite-existing-results]
                       input results

--stop-at-score STOP_AT_SCORE
                        Compute models until plddt (single chain) or ptmscore
                        (complex) > threshold is reached. This can make
                        colabfold much faster by only running the first model
                        for easy queries.
--stop-at-score-below STOP_AT_SCORE_BELOW → default = 0
                        Stop to compute structures if plddt (single chain) or
                        ptmscore (complex) < threshold. This can make
                        colabfold much faster by skipping sequences that do
                        not generate good scores.
--num-recycle NUM_RECYCLE <strong>→ default = 3</strong>
                        Number of prediction cycles.Increasing recycles can
                        improve the quality but slows down the prediction.
--num-ensemble NUM_ENSEMBLE <strong>→ default = 1</strong>
                        Number of ensembles.The trunk of the network is run
                        multiple times with different random choices for the
                        MSA cluster centers.
--random-seed RANDOM_SEED <strong>→ default = 0</strong>
                        Changing the seed for the random number generator can
                        result in different structure predictions.
--num-models {1,2,3,4,5} <strong>→ default = 5</strong>
--recompile-padding RECOMPILE_PADDING <strong>→ default = 1.1</strong>
                        Whenever the input length changes, the model needs to
                        be recompiled, which is slow. We pad sequences by this
                        factor, so we can e.g. compute sequence from length
                        100 to 110 without recompiling. The prediction will
                        become marginally slower for the longer input, but
                        overall performance increases due to not recompiling.
                        Set to 1 to disable.
--model-order MODEL_ORDER
--host-url HOST_URL <strong>→ default = https://api.colabfold.com</strong>
--data DATA
--msa-mode {MMseqs2 (UniRef+Environmental),MMseqs2 (UniRef only),single_sequence}
                        Using an a3m file as input overwrites this option
--model-type {auto,AlphaFold2-ptm,AlphaFold2-multimer-v1,AlphaFold2-multimer-v2}
                        predict structure/complex using the following
                        model.Auto will pick "AlphaFold2" (ptm) for structure
                        predictions and "AlphaFold2-multimer-v2" for
                        Complexes. <strong>→ default = AlphaFold2-ptm</strong>
--amber               Use amber for structure refinement
--templates           Use templates from pdb
--custom-template-path CUSTOM_TEMPLATE_PATH
                        Directory with pdb files to be used as input</code>
--env
--cpu                 Allow running on the cpu, which is very slow
--rank {auto,plddt,ptmscore,multimer} → default = plddt
                        rank models by auto, plddt or ptmscore
--pair-mode {unpaired,paired,unpaired+paired} → default =  unpaired+paired
                        rank models by auto, unpaired, paired, unpaired+paired
--recompile-all-models → default = false
                        recompile all models instead of just model 1 and 3
--sort-queries-by {none,length,random}
                        sort queries by: none, length, random
--save-single-representations
                        saves the single representation embeddings of all
                        models
--save-pair-representations
                        saves the pair representation embeddings of all models
--training            turn on training mode of the model to activate drop
                        Outs → default = false
--max-msa {512:5120,512:1024,256:512,128:256,64:128,32:64,16:32} → default = null
                        defines: `max_msa_clusters:max_extra_msa` number of
                        sequences to use
--zip                 zip all results into one <jobname>.result.zip and
                        delete the original files
--use-gpu-relax       run amber on GPU instead of CPU
--overwrite-existing-results → default = false
```

# References
1. Mirdita, M., Schütze, K., Moriwaki, Y. et al. ColabFold: making protein folding accessible to all. Nat Methods 19, 679–682 (2022). https://doi.org/10.1038/s41592-022-01488-1
2. Jumper, J., Evans, R., Pritzel, A. et al. Highly accurate protein structure prediction with AlphaFold. Nature 596, 583–589 (2021). https://doi.org/10.1038/s41586-021-03819-2
3. https://github.com/sokrypton/ColabFold#running-locally
