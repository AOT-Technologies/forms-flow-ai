"""Module for calculating overall sentiment analysis using hugging face transformers."""
import string
from typing import Dict

from flask import current_app


def preprocess_incoming(str_data) -> str:
    """Function to preprocess the incoming text for the inference."""
    try:
        return str_data.translate(str.maketrans("", "", string.punctuation)).lower()
    except Exception:  # pylint: disable=broad-except # noqa: B902
        return str_data


def overall_sentiment_transformers(string_data: str):
    """Function to get the inference and return the readable sentiment."""
    data = preprocess_incoming(string_data)
    prediction = current_app.classifier(data)

    # Create a mapping for different model output formats
    # This works with cardiffnlp/twitter-roberta-base-sentiment or similar models
    label_mapping = {
        "LABEL_0": "NEGATIVE",
        "LABEL_1": "NEUTRAL",
        "LABEL_2": "POSITIVE",
        # Add direct label mapping for models that use different label formats
        "NEGATIVE": "NEGATIVE",
        "NEUTRAL": "NEUTRAL",
        "POSITIVE": "POSITIVE"
    }

    # Get the predicted label from the model
    label = prediction[0]["label"]
    score = prediction[0]["score"]

    # Try to map the label using our mapping dictionary
    sentiment = label_mapping.get(label)

    # If label isn't in our mapping (unknown format)
    if sentiment is None:
        # For models that only predict positive/negative (like distilbert-sst2)
        # We can create a NEUTRAL class based on confidence threshold
        if score < 0.7:  # If model isn't very confident
            sentiment = "NEUTRAL"
        else:
            # Log the unknown label for debugging
            current_app.logger.warning(f"Unknown sentiment label: {label}")
            sentiment = "NEUTRAL"  # Default fallback

    # Log the sentiment analysis results
    current_app.logger.debug(f"Sentiment analysis: '{string_data}' → {sentiment} (score: {score:.2f})")

    return sentiment


def sentiment_analysis_pipeline_transformers(text: str) -> Dict:
    """
    A input pipeline which returns sentiment of input text.

    :params text: The input text blob being entered by user

    Usage:
        >> sentiment_analysis_pipeline_transformers(
            "awesome location and great staff. Staff provided excellent service."
            )
        returns {'overall_sentiment': 'POSITIVE'}
    """
    return {"overallSentiment": overall_sentiment_transformers(text)}
