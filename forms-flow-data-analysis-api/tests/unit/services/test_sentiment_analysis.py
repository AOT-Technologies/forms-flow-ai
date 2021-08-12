"""" Test to assurce code Sentiment Analysis Service.

Test-suite
"""

from flask.wrappers import Response
from api.services.sentiment_analysis import sentiment_analysis_pipeline, get_entities_mapper, get_sentiment_mapper, sentiment_entity_analysis_v2

def test_overall_sentiment():
    response = sentiment_analysis_pipeline(text="Staff is good", entity_sentiment=False)
    assert response is not None
    assert response["overall_sentiment"]
    print(response["overall_sentiment"])
    assert isinstance(response["overall_sentiment"], str)

def test_entity_sentiment():
    response = sentiment_analysis_pipeline(text="Staff is great", topics=["staff"]  , entity_sentiment=True)
    assert response is not None
    assert len(response["sentiment"]) > 0

def test_entity_sentiment_phase1():
    response = get_entities_mapper(labels=["STAFF", "STAFF"], sentences=["receptionist", "Clerk"])
    assert response is not None
    assert isinstance(response, dict)

def test_entity_sentiment_phase2():
    phase1 = get_entities_mapper(labels=["STAFF", "STAFF"], sentences=["receptionist", "Clerk"])
    assert phase1 is not None
    sample_text = "Staff is awesome. But clerk was a bit rude"
    response = get_sentiment_mapper(entity_text_mapper=phase1, text_input=sample_text)
    assert response is not None
    assert isinstance(response, dict)
