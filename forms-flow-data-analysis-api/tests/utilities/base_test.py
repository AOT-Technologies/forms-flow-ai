"""Utils for Test Suite"""

def get_sentiment_analysis_api_payload():
    """Get sentiment analysis Schema"""
    return {
        "applicationId": 111,
        "formUrl": "https://app2.aot-technologies.com/form/5f6b04ffbdb05c09bb3b3489/submission/5f72da6f09b07b3493604252",
        "data": [
            {
                "elementId": "provideYourFeedbackOverTheResponseToFoi",
                "topics": ["Facility", "Person", "Service"],
                "text": "Facility is good.Service is bad",
            },
            {
                "elementId": "reviewfoi",
                "topics": ["Facility", "Person", "Service"],
                "text": "Bad",
            },
        ],
    }
