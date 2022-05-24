"""Utils for Test Suite"""
import ast
import os

import requests
import time
from dotenv import find_dotenv, load_dotenv
from flask import current_app

load_dotenv(find_dotenv())

token_header = {"alg": "RS256", "typ": "JWT", "kid": "forms-flow-web"}


def get_token(
    jwt,
    role: str = "formsflow-client",
    username: str = "client",
    roles: list = [],
    tenant_key: str = None,
):
    """Return token json representation."""
    return jwt.create_jwt(
        {
            "jti": "1d8c24bd-a1a7-4251-b769-b7bd6ecd51213215",
            "exp": round(time.time() * 1000),
            "nbf": 0,
            "iat": 1635399332,
            "iss": current_app.config["JWT_OIDC_TEST_ISSUER"],
            "aud": ["camunda-rest-api", "forms-flow-web"],
            "sub": "47b46f22-45ec-4cfb-825b-ed10ba8bed01",
            "typ": "Bearer",
            "azp": "forms-flow-web",
            "auth_time": 0,
            "session_state": "6f50e760-cd96-4934-86dc-e0e667f1a407",
            "acr": "1",
            "allowed-origins": ["*"],
            "realm_access": {"roles": ["offline_access", "uma_authorization"]},
            "resource_access": {
                "forms-flow-web": {"roles": [role, *roles]},
                "account": {
                    "roles": ["manage-account", "manage-account-links", "view-profile"]
                },
            },
            "scope": "camunda-rest-api email profile",
            "roles": [role, *roles],
            "name": "John Smith",
            "preferred_username": username,
            "given_name": "John",
            "family_name": "Smith",
            "email": "formsflow-reviewer@example.com",
            "tenantKey": tenant_key,
        },
        token_header,
    )


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
