"""" Test to assurce code Sentiment Analysis Service.

Test-suite
"""

from api.services.sentiment_analysis import sentiment_analysis_pipeline

def test_overall_sentiment():
    response = sentiment_analysis_pipeline(text="Staff is good", entity_sentiment=False)
    assert response is not None
    assert response["overall_sentiment"]

def test_entity_sentiment():
    response = sentiment_analysis_pipeline(text="Staff is great", topics=["staff"]  , entity_sentiment=True)
    assert response is not None
    assert len(response["sentiment"]) > 0
