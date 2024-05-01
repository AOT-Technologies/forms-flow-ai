"""Test suite for application API endpoint."""
import pytest  # noqa

from tests.utilities.base_test import get_token


class TestFormResourceRenderPdf:
    """Test suite for the render endpoint."""

    def test_render_template(self, app, client, jwt, mock_redis_client):
        """Assert that API /render when passed with token returns 200 status code."""
        with app.app_context():
            token = get_token(jwt)
            assert token is not None
            headers = {
                "Authorization": f"Bearer {token}",
                "content-type": "application/json",
            }
            response = client.get(
                "/form/624d71460d7e747ab1b85d73/submission/635f97be1b21a07fc44e05e2/render",
                headers=headers,
            )
            assert response.status_code == 200
            assert response.content_type == "text/html"

    def test_render_template_invalid_template(self, app, client, jwt):
        """Assert that API /render when passed with token and invalid template name returns 400 status code."""
        with app.app_context():
            token = get_token(jwt)
            assert token is not None
            headers = {
                "Authorization": f"Bearer {token}",
                "content-type": "application/json",
            }
            response = client.get(
                "/form/624d71460d7e747ab1b85d73/submission/635f97be1b21a07fc44e05e2/render?template_name=invalid.html",
                headers=headers,
            )
            assert response.status_code == 400
            assert response.json.get("message") == "Template not found!"

    def test_render_template_invalid_template_variable(self, app, client, jwt):
        """Assert that API /render when passed with token and invalid template variable name returns 400 status code."""
        with app.app_context():
            token = get_token(jwt)
            assert token is not None
            headers = {
                "Authorization": f"Bearer {token}",
                "content-type": "application/json",
            }
            response = client.get(
                "/form/624d71460d7e747ab1b85d73/submission/635f97be1b21a07fc44e05e2/render?template_variable=invalid.html",
                headers=headers,
            )
            assert response.status_code == 400
            assert response.json.get("message") == "Template variables not found!"

    def test_render_template_without_authentication(self, app, client):
        """Assert that API /render when passed without auth token should return error."""
        with app.app_context():
            response = client.get(
                "/form/624d71460d7e747ab1b85d73/submission/635f97be1b21a07fc44e05e2/render"
            )
            assert response.status_code == 401
