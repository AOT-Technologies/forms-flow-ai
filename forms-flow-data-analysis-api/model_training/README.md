## How to train on your own dataset

![Python](https://img.shields.io/badge/python-3.9-blue) ![Transformers](https://img.shields.io/badge/Transformers-4.18.0-blue) ![Torch](https://img.shields.io/badge/torch-1.10.0+cu111-blue)

Transformers provides APIs to easily download and train state-of-the-art pretrained models. Using pretrained models can reduce your compute costs, carbon footprint, and save you time from training a model from scratch. The models can be used across different modalities.
It is built using Python :snake: .

## Table of Content

1. [Solution Setup](#solution-setup)
   * [Step 1 : Installation](#installation)

## Solution Setup

### Installation

You can install packages using pip as follows:

Activate your virtualenv
run : ```python3 -m pip install -r requirements.txt```

Then run : ```training.py```  

## Steps for training

1. load your dataset 
2. create an Auto tokenizer
3. Tokenize the raw dataset
4. convert text to PyTorch Datasets
5. load pretrained DistilBERT model
6. train / fine-tune model using data
7. save fine-tuned model

