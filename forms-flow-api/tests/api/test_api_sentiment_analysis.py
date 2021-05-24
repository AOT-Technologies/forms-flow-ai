from http import HTTPStatus

import pytest

from api.services import SentimentAnalyserService


def test_sentiment_analysis_api(client, session):
    response = client.get('/sentiment', content_type='application/json')
    assert response.status_code == HTTPStatus.OK

def test_sentiment_exception(client, session):
    response = client.get('/sentiment/insert', content_type='application/json')
    assert response.status_code == HTTPStatus.BAD_REQUEST

def test_query():
    qres = {
        "The staff were so helpful.": {'overall_sentiment': 'positive', 'sentiment': {'staff': 'positive'}},
    }

    for q, response in qres.items():
        pipeline_response = SentimentAnalyserService(q)
        assert pipeline_response == response

if __name__ == '__main__':
    pytest.main([__file__])