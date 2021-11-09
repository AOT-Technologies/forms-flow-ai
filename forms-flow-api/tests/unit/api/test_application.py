"""Test suite for application API endpoint"""
from pytest import mark
from tests.utilities.base_test import get_token_header, get_token_body


@mark.describe("Initialize application API")
class TestApplicationResource:
    def test_application_no_auth_api(self, client):
        """Assert that API /application when passed with no token returns 401 status code"""
        response = client.get("/application")
        assert response.status_code == 401
        assert response.json == {
            "type": "Invalid Token Error",
            "message": "Access to formsflow.ai API Denied. Check if the bearer token is passed for Authorization or has expired.",
        }

    def test_application_list(self, session, client, jwt):
        token = jwt.create_jwt(get_token_body(), get_token_header())
        headers = {
            "Authorization": f"Bearer {token}",
            "content-type": "application/json",
        }

        response = client.get("/application", headers=headers)
        assert response.status_code == 200


class TestApplicationDetailView:
    def test_application_no_auth_api(self, session, client, jwt):
        response = client.get("/application/1")
        assert response.status_code == 401
        assert response.json == {
            "type": "Invalid Token Error",
            "message": "Access to formsflow.ai API Denied. Check if the bearer token is passed for Authorization or has expired.",
        }

    def test_application_detailed_view(self, session, client, jwt):
        token = jwt.create_jwt(get_token_body(), get_token_header())
        headers = {
            "Authorization": f"Bearer {token}",
            "content-type": "application/json",
        }
        response = client.get("/application/1", headers=headers)
        assert response.status_code == 403
