def test_sentiment_analysis_api_without_bearer_token(client):
    response = client.post('/sentiment')
    assert response.status_code == 401
    assert response.json == {"message": "Access Denied"}
