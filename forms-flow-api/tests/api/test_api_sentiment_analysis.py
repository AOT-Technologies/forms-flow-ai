import pytest

from http import HTTPStatus
from ...src.api.services.sentiment_analysis import sentiment_pipeline

def test_sentiment_analysis_api(client, session):
    response = client.get('/sentiment/api', content_type='application/json')
    assert response.status_code == HTTPStatus.OK

def test_sentiment_analysis_mongodb_insert(client, session):
    response = client.get('/sentiment/insert', content_type='application/json')
    assert response.status_code == HTTPStatus.OK

def test_query():
    qres = {
        "awesome staff and tea was epic. The breakfast was not good.": {'overall_sentiment': 'positive', 'sentiment': {'breakfast': 'negative', 'staff': 'positive', 'tea': 'positive'}},
        "The staff were so helpful.": {'overall_sentiment': 'positive', 'sentiment': {'staff': 'positive'}},
    }

    for q, response in qres.items():
        pipeline_response = sentiment_pipeline(q)
        assert pipeline_response == response

if __name__ == '__main__':
    pytest.main([__file__])