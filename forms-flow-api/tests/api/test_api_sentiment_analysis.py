from http import HTTPStatus

def test_sentiment_analysis_api(client, session):
    response = client.get('/sentiment/api', content_type='application/json')
    assert response.status_code == HTTPStatus.OK

def test_sentiment_analysis_mongodb_insert(client, session):
    response = client.get('/sentiment/insert', content_type='application/json')
    assert response.status_code == HTTPStatus.OK