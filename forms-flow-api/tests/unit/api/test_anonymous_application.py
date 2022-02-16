"""Test suite for application API public endpoint"""
from pytest import mark

from tests.utilities.base_test import (
    get_application_create_payload,
    get_form_request_anonymous_payload,
    factory_auth_header,
    get_form_request_payload_private,
    get_form_request_payload_public_inactive,
)


@mark.describe("Initialize application public API")
class TestApplicationAnonymousResourcesByIds:

    def test_application_valid_post(self, app, client, session):
        """Assert that public API /application when passed with valid payload returns 201 status code"""
        token = factory_auth_header()
        headers = {
            "Authorization": f"Bearer {token}",
            "content-type": "application/json",
        }
        rv = client.post(
            "/form", headers=headers, json=get_form_request_anonymous_payload()
        )
        assert rv.status_code == 201
        form_id = rv.json.get("formId")
        response = client.post(
            "/public/application/create", json=get_application_create_payload(form_id)
        )

        assert response.status_code == 201

    def test_application_invalid_post(self, app, client, session):
        """Assert that public API /application when passed with invalid payload returns 400 status code"""

        response = client.post(
            "/public/application/create",
            json=get_application_create_payload("asgdgasjg"),
        )
        assert response.status_code == 400
        assert response.json == {
            "type": "Bad request error",
            "message": "Invalid application request passed",
        }

    def test_application_unauthorized_post(self, app, client, session):
        """Assert that public API /application when passed with valid payload returns 401 status code when the form is not anonymos"""
        token = factory_auth_header()
        headers = {
            "Authorization": f"Bearer {token}",
            "content-type": "application/json",
        }
        rv = client.post(
            "/form", headers=headers, json=get_form_request_payload_private()
        )
        assert rv.status_code == 201
        form_id = rv.json.get("formId")
        response = client.post(
            "/public/application/create", json=get_application_create_payload(form_id)
        )
        assert response.status_code == 401
        assert response.json == {
            "type": "Authorization error",
            "message": "Permission denied",
        }

    def test_application_inactive_post(self, app, client, session):
        """Assert that public API /application when passed with valid payload returns 401 status code when the form is anonymous but Inactive"""
        token = factory_auth_header()
        headers = {
            "Authorization": f"Bearer {token}",
            "content-type": "application/json",
        }
        rv = client.post(
            "/form", headers=headers, json=get_form_request_payload_public_inactive()
        )
        assert rv.status_code == 201
        form_id = rv.json.get("formId")
        response = client.post(
            "/public/application/create", json=get_application_create_payload(form_id)
        )
        assert response.status_code == 401
        assert response.json == {
            "type": "Authorization error",
            "message": "Permission denied",
        }
