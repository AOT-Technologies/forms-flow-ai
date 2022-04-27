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
    sentiment = None
    if prediction[0]["label"] == "LABEL_1":
        sentiment = "NEUTRAL"
    if prediction[0]["label"] == "LABEL_0":
        sentiment = "NEGATIVE"
    if prediction[0]["label"] == "LABEL_2":
        sentiment = "POSITIVE"
    if sentiment is None:
        raise Exception("Failed to identify the sentiment.")
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
