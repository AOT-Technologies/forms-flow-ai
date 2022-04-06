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


def predict(string_data: str):
    """Function to get the inference and return the readable sentiment."""
    data = preprocess_incoming(string_data)
    prediction = current_app.classifier(data)
    if prediction[0]["label"] == "LABEL_1":
        return "NEUTRAL"
    if prediction[0]["label"] == "LABEL_0":
        return "NEGATIVE"
    if prediction[0]["label"] == "LABEL_2":
        return "POSITIVE"


def overall_sentiment_transformers(text: dict) -> Dict:
    """Function to return the sentiment of the input text blob."""
    return {"overall_sentiment": predict(text)}
