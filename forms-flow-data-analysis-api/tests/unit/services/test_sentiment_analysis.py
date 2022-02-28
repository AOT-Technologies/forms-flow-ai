""" Test to assure code Sentiment Analysis Service.

Test-suite
"""
from api.services.sentiment_analysis import (
    get_entities_mapper,
    get_sentiment_mapper,
    sentiment_analysis_pipeline,
    sentiment_entity_analysis,
)


def test_overall_sentiment():
    response = sentiment_analysis_pipeline(
        text="Staff was very helpful.", entity_sentiment=False
    )
    assert response is not None
    assert response["overall_sentiment"] == "POSITIVE"
    print(response["overall_sentiment"])
    assert isinstance(response["overall_sentiment"], str)


def test_entity_sentiment():
    response = sentiment_analysis_pipeline(
        text="Staff is great", topics=["staff"], entity_sentiment=True
    )
    assert response is not None
    assert len(response["sentiment"]) > 0


def test_entity_sentiment_phase1():
    response = get_entities_mapper(
        labels=["STAFF", "STAFF"], sentences=["receptionist", "Clerk"]
    )
    assert response is not None
    assert isinstance(response, dict)


def test_entity_sentiment_phase2():
    phase1 = get_entities_mapper(
        labels=["STAFF", "STAFF"], sentences=["receptionist", "Clerk"]
    )
    assert phase1 is not None
    sample_text = "Staff is awesome. But clerk was a bit rude"
    response = get_sentiment_mapper(entity_text_mapper=phase1, text_input=sample_text)
    assert response is not None
    assert isinstance(response, dict)


def test_entity_sentiment_model():
    response = sentiment_entity_analysis(text="Staff is great", topics=["staff"])
    assert response is not None
    print(response)
    assert isinstance(response, dict)
    assert response == {"staff": "POSITIVE"}


def test_failing_entity_sentiment_model():
    response = sentiment_entity_analysis(text="bad", topics=["staff"])
    assert response is not None
    assert isinstance(response, dict)
    assert response == {}
