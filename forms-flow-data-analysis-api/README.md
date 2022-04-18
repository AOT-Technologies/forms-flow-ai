## formsflow.ai Sentiment Analysis Component

![Python](https://img.shields.io/badge/python-3.8-blue) ![Flask](https://img.shields.io/badge/Flask-1.1.4-blue) ![postgres](https://img.shields.io/badge/postgres-11.0-blue)

### About Sentiment Analysis model


1. Our dynamic ontology aware topics modelling and sentiment analysis module required data for analysis. 
So we have collected the initial data from a generic dataset in Kaggle. Dataset is a combined Mobile reviews, Twitter sentiment, Yelp review, Toxic reviews and few more to cover multiple domain of sentiment analysis.

2. Bidirectional Encoder Representations from Transformers(BERT) is a transformer-based machine learning technique for natural language processing pre-training developed by Google. We can fine-tune these BERT models on a specific task, like sentiment analysis and question answering, with our own data.

2. We will load the datasets using pandas and split into train and test sets. The input dataset was cleaned using various preprocessing techniques.
 
3. Once the data was prepared, a variety of techniques for identifying topics and sentiment analysis was tried. Using [Hugging Face Transformers library](https://huggingface.co/docs/transformers/index) by walking you through how to fine-tune model for sequence classification tasks on your own unique datasets. We are using Hugging Face API to select a more powerful model such as BERT, RoBERTa, ELECTRA, MPNET, or ALBERT.
4. Finally, we choose DistilBERT for sentiment analysis. Compared to all other models DistilBERT is faster, smaller, lighter and gives better accuracy.

4. Model we will use is from the Transformer library, we need to install it using python package manager(pip). Now we need to apply Auto tokenizer to use pre-trained tokenizers. For more details refer [HuggingFace Tokenizers](https://huggingface.co/docs/transformers/main_classes/tokenizer).
Next  prepare the data according to the format needed for the BERT model:
* Input IDs – The input ids are often the only required parameters to be passed to the model as input. 
* Attention mask – Attention Mask is used to avoid performing attention on padding token indices. Mask value can be either 0 or 1, 1 for tokens that are NOT MASKED, 0 for MASKED tokens.

5. Transformers provides a Trainer class optimized for training. Transformers models, making it easier to start training without manually writing code. Start by loading your model and specify the number of expected labels.

6. Next, create a Training Arguments class which contains all the hyperparameters you can tune as well as flags for activating different training options. You can start with the default training hyperparameters. Here we use:
* learning_rate=5.691013656357132e-06,
* num_train_epochs=5,
* per_device_train_batch_size=8,
* seed=36,
* optim="adamw_torch"

7. Trainer does not automatically evaluate model performance during training. You will need to pass Trainer a function to compute and report metrics. The Datasets library provides a simple accuracy function you can load with the load_metric function.

8. Create a Trainer object with your model, training arguments, training and test datasets, and evaluation function. Then fine-tune your model by calling train(). This model reaches an accuracy of 86.

## Steps for enabling Sentiment Analysis component

One of the unique features of the formsflow.ai framework is Sentiment Analysis. It can
analyze the sentiment from forms based on specific topics mentioned by the designer
during form creation.

- A form designer can drag and drop **Text Area with Analytics component** and in section
**Data** add key topics for Sentiment Analysis like facility, service, etc. This activates
sentiment analysis component.
- Based on the input responses of the user formsflow.ai process sentiment associated
 with each user's responses and stores it MongoDB database using **Python API**.
- You can take data stored in mongodb and create **meaningful visualization** based on the 
output of sentiment API in Redash dashboards. This information can be found in the **Insights section**
for staff user formsflow.ai.

A potential architectural conflict, which can happen is the choosing of
postgres database and mongodb database. What database should we use, for
which arhchitecure. 
