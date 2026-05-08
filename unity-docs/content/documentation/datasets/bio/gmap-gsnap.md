---
blurb: "The programs GMAP (Genomic Mapping and Aligment Program) and GSNAP (Genomic Short-read Nucleotide Alignment Program) align RNA and DNA sequences from next-generation sequencing data to a genome reference sequence. The GMAP-GSNAP human genomic database available on Unity was built using the human genome assembly GRCh38.p14 (NCBI RefSeq assembly GCF_000001405.40)"
cite: >
    Wu TD, Reeder J, Lawrence M, Becker G, Brauer MJ. GMAP and GSNAP for Genomic Sequence Alignment: Enhancements to Speed, Accuracy, and Functionality. Methods Mol Biol. 2016;1418:283-334. doi:10.1007/978-1-4939-3578-9_15
bibtex: >
    @inbook{Wu2016,title = {GMAP and GSNAP for Genomic Sequence Alignment: Enhancements to Speed,  Accuracy,  and Functionality},ISBN = {9781493935789},ISSN = {1940-6029},url = {http://dx.doi.org/10.1007/978-1-4939-3578-9_15},DOI = {10.1007/978-1-4939-3578-9_15},booktitle = {Statistical Genomics},publisher = {Springer New York},author = {Wu,  Thomas D. and Reeder,  Jens and Lawrence,  Michael and Becker,  Gabe and Brauer,  Matthew J.},year = {2016},pages = {283–334}}
datapath: /datasets/bio/gmap-gsnap
dataurl: https://github.com/juliangehring/GMAP-GSNAP
downloaded: 2025-01-02
science: bio
title: GMAP-GSNAP database (human genome)
---

Use the following example to map one or more cDNAs sequences in a FASTA file to the human genome assembly GRCh38.p14:

```shell
gmap -D /datasets/bio/gmap-gsnap/2025-01-02/db -d GCF_000001405.40_GRCh38.p14 <cdna_file>
```
