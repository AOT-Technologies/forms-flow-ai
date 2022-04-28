""" Test to assure code Sentiment Analysis Service.

Test-suite
"""
from api.services.transformers import (
    sentiment_analysis_pipeline_transformers
    
)


def sentiment_analysis_pipeline_transformers():
    response = sentiment_analysis_pipeline_transformers(
        "Staff was very helpful."
    )
    assert response is not None
    assert response["overallSentiment"] == "POSITIVE"
    assert isinstance(response["overallSentiment"], str)
