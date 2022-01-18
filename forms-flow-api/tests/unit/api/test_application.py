"""Test suite for application API endpoint"""
from pytest import mark
from tests.utilities.base_test import (
    get_token_header,
    get_token_body,
    get_application_create_payload,
    get_form_request_payload,
    factory_auth_header,
)


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
        token = factory_auth_header()
        headers = {
            "Authorization": f"Bearer {token}",
            "content-type": "application/json",
        }

        response = client.get("/application", headers=headers)
        assert response.status_code == 200

    def test_application_paginated_list(self, session, client, jwt, pageNo, limit):
        token = factory_auth_header()
        headers = {
            "Authorization": f"Bearer {token}",
            "content-type": "application/json",
        }
        response = client.get(
            f"/application?pageNo={pageNo}&limit={limit}", headers=headers
        )
        assert response.status_code == 200

    def test_application_paginated_sorted_list(
        self, session, client, jwt, pageNo, limit, sortBy, sortOrder
    ):
        token = jwt.create_jwt(get_token_body(), get_token_header())
        headers = {
            "Authorization": f"Bearer {token}",
            "content-type": "application/json",
        }
        response = client.get(
            f"/application?pageNo={pageNo}&limit={limit}&sortBy={sortBy}&sortOrder={sortOrder}",
            headers=headers,
        )
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
        token = factory_auth_header()
        headers = {
            "Authorization": f"Bearer {token}",
            "content-type": "application/json",
        }
        response = client.get("/application/1", headers=headers)
        assert response.status_code == 403


class TestApplicationResourceByFormId:
    def test_application_submission(self, session, client, jwt):
        token = factory_auth_header()
        headers = {
            "Authorization": f"Bearer {token}",
            "content-type": "application/json",
        }
        rv = client.post("/form", headers=headers, json=get_form_request_payload())
        assert rv.status_code == 201

        form_id = rv.json.get("formId")

        rv = client.post(
            "/application/create",
            headers=headers,
            json=get_application_create_payload(form_id),
        )
        assert rv.status_code == 201
        response = client.get(
            "/application/formid/61b81b6f85589c44f62865c7", headers=headers
        )
        assert response.status_code == 200


class TestProcessMapperResourceByApplicationId:
    def test_application_process_details(session, client, jwt):
        token = factory_auth_header()
        headers = {
            "Authorization": f"Bearer {token}",
            "content-type": "application/json",
        }
        rv = client.post("/form", headers=headers, json=get_form_request_payload())
        assert rv.status_code == 201

        form_id = rv.json.get("formId")

        rv = client.post(
            "/application/create",
            headers=headers,
            json=get_application_create_payload(form_id),
        )
        assert rv.status_code == 201
        response = client.get("/application/1/process", headers=headers)
        assert response.status_code == 200


class TestApplicationResourceByApplicationStatus:
    def test_application_status_list(session, client, jwt):
        token = factory_auth_header()
        headers = {
            "Authorization": f"Bearer {token}",
            "content-type": "application/json",
        }
        rv = client.post("/form", headers=headers, json=get_form_request_payload())
        assert rv.status_code == 201

        form_id = rv.json.get("formId")

        rv = client.post(
            "/application/create",
            headers=headers,
            json=get_application_create_payload(form_id),
        )
        assert rv.status_code == 201
        response = client.get("/application/status/list", headers=headers)
        assert response.status_code == 200
        assert response.json["applicationStatus"]


def test_application_status_list(session, client, jwt):
    token = factory_auth_header()
    headers = {
        "Authorization": f"Bearer {token}",
        "content-type": "application/json",
    }
    rv = client.post("/form", headers=headers, json=get_form_request_payload())
    assert rv.status_code == 201

    form_id = rv.json.get("formId")

    rv = client.post(
        "/application/create",
        headers=headers,
        json=get_application_create_payload(form_id),
    )
    assert rv.status_code == 201
    response = client.get("/application/status/list", headers=headers)
    assert response.status_code == 200
    assert response.json["applicationStatus"]


def test_application_create_method(session, client, jwt):
    token = factory_auth_header()
    headers = {
        "Authorization": f"Bearer {token}",
        "content-type": "application/json",
    }
    rv = client.post("/form", headers=headers, json=get_form_request_payload())
    assert rv.status_code == 201

    form_id = rv.json.get("formId")

    rv = client.post(
        "/application/create",
        headers=headers,
        json=get_application_create_payload(form_id),
    )
    assert rv.status_code == 201


def test_application_update_details_api(session, client, jwt):
    token = factory_auth_header()
    headers = {
        "Authorization": f"Bearer {token}",
        "content-type": "application/json",
    }
    rv = client.post("/form", headers=headers, json=get_form_request_payload())
    assert rv.status_code == 201

    form_id = rv.json.get("formId")

    rv = client.post(
        "/application/create",
        headers=headers,
        json=get_application_create_payload(form_id),
    )
    assert rv.status_code == 201
    application_id = rv.json.get("id")
    rv = client.get(f"/application/{application_id}", headers=headers)
    payload = rv.json()
    payload["applicationStatus"] = "New"
    rv = client.put(f"/application/{application_id}", headers=headers, json=payload)
    assert rv.status_code == 200
    assert rv.json() == "Updated successfully"
