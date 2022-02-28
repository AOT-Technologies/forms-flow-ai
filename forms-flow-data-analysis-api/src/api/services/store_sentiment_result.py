"""Service for storing sentiment_analysis result."""
from typing import Any

from ..models.sentiment_results import SentimentResults


def save_sentiment_result(
    input_text: str, overall_sentiment: str, output_response: Any
):
    """Function to save the sentiment analysis result to the database."""
    SentimentResults(
        input_text=input_text,
        overall_sentiment=overall_sentiment,
        output_response=output_response,
    ).save()
