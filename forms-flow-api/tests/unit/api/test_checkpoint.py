"""Test suite for Checkpoint API endpoint."""
from pytest import mark

from formsflow_api import create_app


@mark.describe("Initialize Checkpoint API")
def test_checkpoint_api():
    """Assert that checkpoint API resonse."""
    flask_app = create_app(run_mode="testing")

    with flask_app.test_client() as client:
        response = client.get("/checkpoint")
        assert response.status_code == 200
        assert response.json == {"message": "Welcome to formsflow.ai API"}


def test_checkpoint_test_api(app, client, session):
    """Assert that checkpoint API status code."""
    response = client.get("/checkpoint")
    assert response.status_code == 200
