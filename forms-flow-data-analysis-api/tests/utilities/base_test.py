"""Utils for Test Suite"""
import ast
import os

import requests

TEST_USER_PAYLOAD = {
    "client_id": "forms-flow-web",
    "grant_type": "password",
    "username": os.getenv("TEST_REVIEWER_USERID"),
    "password": os.getenv("TEST_REVIEWER_PASSWORD"),
}


def factory_auth_header():
    url = f"{os.getenv('KEYCLOAK_URL')}/auth/realms/{os.getenv('KEYCLOAK_URL_REALM')}/protocol/openid-connect/token"
    x = requests.post(url, TEST_USER_PAYLOAD, verify=True).content.decode("utf-8")
    return str(ast.literal_eval(x)["access_token"])


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
