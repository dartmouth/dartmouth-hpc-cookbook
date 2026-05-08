---
title: Using HuggingFace Datasets
blurb: >
  How to use a HuggingFace dataset in Unity.
---
# Using HuggingFace Datasets
To use a HuggingFace dataset in Unity, you need to configure the HuggingFace environment variable. If you need a HuggingFace model, check its availability at [Unity AI Datasets]({{< relref "documentation/datasets/ai" >}}). If the model is unavailable, please [contact the Unity team]({{< relref "contact" >}}).

## Example
To load the `Llama-3.2-3B` model, which is stored at `/datasets/ai/llama3`, set the HuggingFace environment variable accordingly  
There are 3 supported options for huggingface library to recognize the model

**Option 1**: Set environment variable directly on your terminal before running the script  
Note that notebook cell doesn't support **Option 1**. Try this on your terminal

`export HF_HOME=/datasets/ai/llama3`


```python
# export HF_HOME=/datasets/ai/llama3 # <- Set environment path in the terminal
from transformers import AutoTokenizer, AutoModelForCausalLM

tokenizer = AutoTokenizer.from_pretrained("meta-llama/Llama-3.2-3B")
model = AutoModelForCausalLM.from_pretrained("meta-llama/Llama-3.2-3B")
```

**Option 2**: Use Absolute Model Path directly  
Huggingface stores model parameters/tokenizer/config files in a specific directory structure as follows


```python 
from transformers import AutoTokenizer, AutoModelForCausalLM

model_path = '/datasets/ai/llama3/hub/models--meta-llama--Llama-3.2-3B/snapshots/13afe5124825b4f3751f836b40dafda64c1ed062'
tokenizer = AutoTokenizer.from_pretrained(model_path)
model = AutoModelForCausalLM.from_pretrained(model_path)
```
**Option 3**: Set HF_HOME in the script  
`os.environ["HF_HOME"] = "/datasets/ai/llama3"` must be placed above importing transformer library   
Note that notebook cell doesn't support **Option 3**. Try this on your terminal


```python
import os

os.environ["HF_HOME"] = "/datasets/ai/llama3" # <- This line is placed above "from transformers.."
from transformers import AutoTokenizer, AutoModelForCausalLM

tokenizer = AutoTokenizer.from_pretrained("meta-llama/Llama-3.2-3B")
model = AutoModelForCausalLM.from_pretrained("meta-llama/Llama-3.2-3B")
```


See [HuggingFace's cache management documentation](https://huggingface.co/docs/datasets/en/cache) for more information.

For usage details, click the **"Use this model"** button on the HuggingFace model page.

{{< figure src="huggingface-model-page.png" title="HuggingFace Model Page" alt="HuggingFace Model Page" >}}
