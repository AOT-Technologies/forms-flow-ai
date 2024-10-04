"""Test suite for application API public endpoint."""

from formsflow_api_utils.utils import CREATE_DESIGNS
from pytest import mark

from formsflow_api.constants import BusinessErrorCode
from tests.utilities.base_test import (
    get_application_create_payload,
    get_form_request_anonymous_payload,
    get_form_request_payload_private,
    get_form_request_payload_public_inactive,
    get_token,
)


@mark.describe("Initialize application public API")
class TestApplicationAnonymousResourcesByIds:
    """Test suite for anonymosu application endpoint."""

    def test_application_valid_post(self, app, client, session, jwt, mock_redis_client):
        """Assert that public API /application when passed with valid payload returns 201 status code."""
        token = get_token(jwt, role=CREATE_DESIGNS)
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
        """Assert that public API /application when passed with invalid payload returns 400 status code."""
        response = client.post(
            "/public/application/create",
            json=get_application_create_payload("asgdgasjg"),
        )
        assert response.status_code == 400
        assert response.json == {
            "message": BusinessErrorCode.FORM_ID_NOT_FOUND.message,
            "code": BusinessErrorCode.FORM_ID_NOT_FOUND.name,
            "details": [],
        }

    def test_application_unauthorized_post(self, app, client, session, jwt):
        """Assert that public API /application when passed with valid payload returns 403 status code when the form is not anonymos."""
        token = get_token(jwt, role=CREATE_DESIGNS)
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
        assert response.status_code == 403
        assert response.json == {
            "message": BusinessErrorCode.PERMISSION_DENIED.message,
            "code": BusinessErrorCode.PERMISSION_DENIED.code,
            "details": [],
        }

    def test_application_inactive_post(self, app, client, session, jwt):
        """Assert that public API /application when passed with valid payload returns 403 status code when the form is anonymous but Inactive."""
        token = get_token(jwt, role=CREATE_DESIGNS)
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
        assert response.status_code == 403
        assert response.json == {
            "message": BusinessErrorCode.PERMISSION_DENIED.message,
            "code": BusinessErrorCode.PERMISSION_DENIED.code,
            "details": [],
        }


class TestAnonymousFormById:
    """Class for unit test check form is Anonymous and published."""

    def test_anonymous_active_form_by_form_id(self, client, session, jwt):
        """Assert that public API when passed with valid payload returns 200 status code."""
        token = get_token(jwt, role=CREATE_DESIGNS)
        headers = {
            "Authorization": f"Bearer {token}",
            "content-type": "application/json",
        }
        response = client.post(
            "/form", headers=headers, json=get_form_request_anonymous_payload()
        )
        assert response.status_code == 201

        form_id = response.json.get("formId")

        response = client.get(f"/public/form/{form_id}")
        assert response.status_code == 200

    def test_invalid_form_id(self, app, client, session):
        """Assert that public API when passed with invalid payload returns 400 status code."""
        response = client.get("/public/form/2ddse3")
        assert response.status_code == 400
        assert response.json == {
            "message": BusinessErrorCode.FORM_ID_NOT_FOUND.message,
            "code": BusinessErrorCode.FORM_ID_NOT_FOUND.code,
            "details": [],
        }
