---
blurb: "LLM Compiler: Foundation Language Models for Compiler Optimization"
cite: "Chris Cummins, Volker Seeker, Dejan Grubisic, Baptiste Roziere, Jonas Gehring, Gabriel Synnaeve, and Hugh Leather. 2025. LLM Compiler: Foundation Language Models for Compiler Optimization. In Proceedings of the 34th ACM SIGPLAN International Conference on Compiler Construction (CC'25). Association for Computing Machinery, New York, NY, USA, 141–153.https://doi.org/10.1145/3708493.3712691"
datapath: "/datasets/ai/llm-compiler"
dataurl: "https://huggingface.co/collections/facebook/llm-compiler-667c5b05557fe99a9edd25cb"
downloaded: "2025-07-07"
science: ai
title: LLM-compiler
bibtex: >
    @inproceedings{10.1145/3708493.3712691,
    author = {Cummins, Chris and Seeker, Volker and Grubisic, Dejan and
    Roziere, Baptiste and Gehring, Jonas and Synnaeve, Gabriel and Leather,
    Hugh},
    title = {LLM Compiler: Foundation Language Models for Compiler
    Optimization},
    year = {2025},
    isbn = {9798400714078},
    publisher = {Association for Computing Machinery},
    address = {New York, NY, USA},
    url = {https://doi.org/10.1145/3708493.3712691},
    doi = {10.1145/3708493.3712691},
    abstract = {Large Language Models (LLMs) have demonstrated remarkable
    capabilities across a variety of software engineering and coding tasks.
    However, their application in the domain of code and compiler optimization
    remains underexplored. Training LLMs is resource-intensive, requiring
    substantial GPU hours and extensive data collection, which can be
    prohibitive. To address this gap, we introduce LLMCompiler, a suite of
    robust, openly available, pre-trained models specifically designed for
    compiler tasks. Built on the foundation of CodeLlama, LLM&nbsp;Compiler
    enhances the understanding of compiler intermediate representations (IRs),
    assembly language, and optimization techniques. The models have been
    trained on a vast corpus of 546 billion tokens of LLVM-IR and assembly code
    and have undergone instruction fine-tuning to interpret compiler behavior.
    To demonstrate the utility of these research tools, we also present
    fine-tuned versions of the models with enhanced capabilities in optimizing
    code size and disassembling from x86_64 and ARM assembly back into LLVM-IR.
    These achieve 77\% of the optimising potential of an autotuning search, and
    45\% disassembly round trip (14\% exact match). LLMCompiler is released
    under a bespoke commercial license to allow wide reuse and is available in
    two sizes: 7 billion and 13 billion parameters. Our aim is to provide
    scalable, cost-effective foundational models for further research and
    development in compiler optimization by both academic researchers and
    industry practitioners. Since we released LLMCompiler the community has
    quantized, repackaged, and downloaded the models over 250k times.},
    booktitle = {Proceedings of the 34th ACM SIGPLAN International Conference
    on Compiler Construction},
    pages = {141–153},
    numpages = {13},
    keywords = {Code Optimization, Compiler Optimization, LLVM-IR, Large
    Language Models, Pre-trained Models},
    location = {Las Vegas, NV, USA},
    series = {CC '25}
    }
---
