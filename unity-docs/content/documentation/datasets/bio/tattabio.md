---
blurb: 'LLM that was trained genomic sequences with the goal of creating embeddings for protein sequences'
cite: "Cornman, A., West-Roberts, J., Pedro Camargo, A., Roux, S., Beracochea, M., Miridita, M., Ovechnikov, S., & Wang, Y. (2024, October 1). The OMG Dataset: An Open MetaGenomic Corpus for Mixed-modality Genomic Language Modeling. BioRxiv"
datapath: /datasets/bio/tattabio
dataurl: https://huggingface.co/tattabio
downloaded: '2025-11-10'
science: bio
title: Tattabio
bibtex: '@article {Cornman2024.08.14.607850,
    author = {Cornman, Andre and West-Roberts, Jacob and Camargo, Antonio Pedro and Roux, Simon and Beracochea, Martin and Mirdita, Milot and Ovchinnikov, Sergey and Hwang, Yunha},
    title = {The OMG dataset: An Open MetaGenomic corpus for mixed-modality genomic language modeling},
    elocation-id = {2024.08.14.607850},
    year = {2024},
    doi = {10.1101/2024.08.14.607850},
    publisher = {Cold Spring Harbor Laboratory},
    abstract = {Biological language model performance depends heavily on pretraining data quality, diversity, and size. While metagenomic datasets feature enormous biological diversity, their utilization as pretraining data has been limited due to challenges in data accessibility, quality filtering and deduplication. Here, we present the Open MetaGenomic (OMG) corpus, a genomic pretraining dataset totalling 3.1T base pairs and 3.3B protein coding sequences, obtained by combining two largest metagenomic dataset repositories (JGI{\textquoteright}s IMG and EMBL{\textquoteright}s MGnify). We first document the composition of the dataset and describe the quality filtering steps taken to remove poor quality data. We make the OMG corpus available as a mixed-modality genomic sequence dataset that represents multi-gene encoding genomic sequences with translated amino acids for protein coding sequences, and nucleic acids for intergenic sequences. We train the first mixed-modality genomic language model (gLM2) that leverages genomic context information to learn robust functional representations and coevolutionary signals in protein-protein interfaces. Furthermore, we show that deduplication in embedding space can be used to balance the corpus, demonstrating improved performance on downstream tasks. The OMG dataset is publicly hosted on the Hugging Face Hub at https://huggingface.co/datasets/tattabio/OMG and gLM2 is available at https://huggingface.co/tattabio/gLM2_650M.Competing Interest StatementThe authors have declared no competing interest.},
    URL = {https://www.biorxiv.org/content/early/2024/08/17/2024.08.14.607850},
    eprint = {https://www.biorxiv.org/content/early/2024/08/17/2024.08.14.607850.full.pdf},
    journal = {bioRxiv}
}
'
---
