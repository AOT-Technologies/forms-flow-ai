from api.models.sentiment_results import SentimentResults


def test_sentimentresult_model_createtable():
    sentiment_table = SentimentResults(
        id=1,
        input_text="Staff is awesome.",
        overall_sentiment="POSITIVE",
        output_response={
            "sentiment": {"staff": "POSITIVE", "facility": "POSITIVE"},
            "overall_sentiment": "POSITIVE",
            "elementId": "reviewfoi",
            "applicationId": 31,
            "formUrl": "http://app2.aot-technologies.com/form/123123",
        },
    )

    assert sentiment_table.id == 1
    assert sentiment_table.overall_sentiment == "POSITIVE"
