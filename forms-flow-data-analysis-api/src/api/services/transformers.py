"""Module for calculating overall sentiment analysis using hugging face transformers."""
from transformers import pipeline  # pylint-disable=E0401


def overall_sentiment_transformers(text: str):
    """Function to return the sentiment analysis of the input text blob."""
    classifier = pipeline("sentiment-analysis")

    result = classifier(text)
    return result[0]["label"]
