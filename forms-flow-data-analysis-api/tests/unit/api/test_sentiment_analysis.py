from tests.utilities.base_test import (
    factory_auth_header,
    get_sentiment_analysis_api_payload,
)


def test_sentiment_analysis_api_without_bearer_token(client):
    response = client.post("/sentiment")
    assert response.status_code == 401
    assert response.json == {"message": "Access Denied"}


def test_sentiment_analysis_api(app, session, client):
    token = factory_auth_header()
    headers = {
        "Authorization": f"Bearer {token}",
        "content-type": "application/json",
    }
    rv = client.post(
        "/sentiment", headers=headers, json=get_sentiment_analysis_api_payload()
    )
    assert rv.status_code == 201 or 200

    response = rv.json
    assert response["data"][0]["overall_sentiment"] is not None
