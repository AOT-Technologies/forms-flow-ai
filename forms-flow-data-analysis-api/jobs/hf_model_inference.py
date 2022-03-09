"""Inference pipeline for the HF model.

The model was trained with a fine-tuned version of DistilBERT model.
Model: kurianbenoy/distilbert-base-uncased-finetuned-sst-2-english-finetuned-imdb
"""
from transformers import pipeline

model_id = "kurianbenoy/distilbert-base-uncased-finetuned-sst-2-english-finetuned-imdb"
classifier = pipeline("text-classification", model=model_id)

custom_tweet = (
    "Awesome movies. I really liked the historical context and lattetan's laughter"
)
preds = classifier(custom_tweet, return_all_scores=True)
print(preds)
