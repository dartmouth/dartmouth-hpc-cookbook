---
title: NCBI BLAST databases
blurb: >
  National Center for Biotechnology Information (NCBI) database presented in the format required for running Basic Local Alignment Search Tool (BLAST) as well as the sequence aligner DIAMOND. It contains the nucleotide database, the non-redundant Reference Sequence protein database for archaeal and bacterial genomes, the Reference Sequence Prokaryotic Representative Genome Database and the Reference Sequence Eukaryotic Representative Genome Database. NCBI's BLAST databases are downloaded weekly. See the full details for more information.
datapath: /datasets/bio/ncbi-db/
dataurl: https://ftp.ncbi.nlm.nih.gov/blast/db/
downloaded: weekly
cite: https://support.nlm.nih.gov/knowledgebase/article/KA-03391/en-us
science: bio
---

The NCBI databases are downloaded every Sunday to a directory with that date. The file `/datasets/bio/ncbi-db/.ncbirc` is then updated to point to the new copy once the download has been verified. This allows running jobs to have a consistent database throughout the run.

Note that other tools that can use the NCBI database but do not read this configuration file can use the output of `blastdb_path` to find the current copy, as shown in the following example:

```shell
module load blast-plus/2.14.1 diamond/2.1.10
NR=$(blastdb_path -db nr -dbtype prot)
diamond blastp --db "$NR" -q query.fasta -o matches.tsv
```
