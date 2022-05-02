"""Test suite for application API endpoint."""
import pytest

from tests.utilities.base_test import (
    get_application_create_payload,
    get_form_request_payload,
    get_token
)


class TestApplicationResource:
    """Test suite for the application endpoint."""

    def test_application_no_auth_api(self, app, client, session):
        """Assert that API /application when passed with no token returns 401 status code."""
        response = client.get("/application")
        assert response.status_code == 401
        assert response.json == {
            "type": "Invalid Token Error",
            "message": "Access to formsflow.ai API Denied. Check if the bearer token is passed for "
            "Authorization or has expired.",
        }

    def test_application_list(self, app, client, session, jwt):
        """Assert that API/application when passed with valid token returns 200 status code."""
        token = get_token(jwt)
        headers = {
            "Authorization": f"Bearer {token}",
            "content-type": "application/json",
        }

        response = client.get("/application", headers=headers)
        assert response.status_code == 200

    @pytest.mark.parametrize(("pageNo", "limit"), ((1, 5), (1, 10), (1, 20)))
    def test_application_paginated_list(self, app, client, session, jwt, pageNo, limit):
        """Tests the API/application endpoint with pageNo and limit query params."""
        token = get_token(jwt)
        headers = {
            "Authorization": f"Bearer {token}",
            "content-type": "application/json",
        }
        response = client.get(
            f"/application?pageNo={pageNo}&limit={limit}", headers=headers
        )
        assert response.status_code == 200

    @pytest.mark.parametrize(
        ("pageNo", "limit", "sortBy", "sortOrder"),
        ((1, 5, "id", "asc"), (1, 10, "id", "desc"), (1, 20, "id", "desc")),
    )
    def test_application_paginated_sorted_list(
        self, app, client, session, jwt, pageNo, limit, sortBy, sortOrder
    ):
        """Tests the API/application endpoint with pageNo, limit, sortBy and SortOrder params."""
        token = get_token(jwt)
        headers = {
            "Authorization": f"Bearer {token}",
            "content-type": "application/json",
        }
        response = client.get(
            f"/application?pageNo={pageNo}&limit={limit}&sortBy={sortBy}&sortOrder={sortOrder}",
            headers=headers,
        )
        assert response.status_code == 200

    @pytest.mark.parametrize(
        ("pageNo", "limit", "filters"),
        (
            (1, 5, "Id=1"),
            (1, 10, "applicationName=Free"),
            (1, 20, "applicationStatus=New"),
        ),
    )
    def test_application_paginated_filtered_list(
        self,
        app,
        client,
        session,
        jwt,
        pageNo,
        limit,
        filters,
    ):
        """Tests the API/application endpoint with filter params."""
        token = get_token(jwt)
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
            f"/application?pageNo={pageNo}&limit={limit}&{filters}",
            headers=headers,
        )
        assert response.status_code == 200


class TestApplicationDetailView:
    """Test suite for the API/application/<id> endpoint."""

    def test_application_no_auth_api(self, app, client, session):
        """Tests the endpoint with no token."""
        response = client.get("/application/1")
        assert response.status_code == 401
        assert response.json == {
            "type": "Invalid Token Error",
            "message": "Access to formsflow.ai API Denied. Check if the "
            "bearer token is passed for Authorization or has expired.",
        }

    def test_application_detailed_view(self, app, client, session, jwt):
        """Tests the endpoint with valid token."""
        token = get_token(jwt)
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

        response = client.get(f"/application/{application_id}", headers=headers)
        assert response.status_code == 200
        assert response.json['applicationName'] == 'Sample form'
        assert response.json['processKey'] == 'oneStepApproval'


def test_application_resource_by_form_id(app, client, session, jwt):
    """Tests the application by formid endpoint with valid token."""
    token = get_token(jwt)
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

    response = client.get(f"/application/formid/{form_id}", headers=headers)
    assert response.status_code == 200


def test_application_status_list(app, client, session, jwt):
    """Tests the application status list endpoint with valid payload."""
    token = get_token(jwt)
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


def test_application_create_method(app, client, session, jwt):
    """Tests the application create method with valid payload."""
    token = get_token(jwt)
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


def test_application_payload(app, client, session, jwt):
    """Tests the application create endpoint with valid payload."""
    token = get_token(jwt)
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
    application_response = rv.json
    assert application_response["applicationStatus"] == "New"
    assert application_response["formUrl"] == f"http://sample.com/form/{form_id}/submission/1233432"


def test_application_update_details_api(app, client, session, jwt):
    """Tests the application update endpoint with valid payload."""
    token = get_token(jwt)
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
    assert rv != {}

    rv = client.get(f"/application/{application_id}", headers=headers)
    payload = rv.json
    payload["applicationStatus"] = "New"

    rv = client.put(f"/application/{application_id}", headers=headers, json=payload)
    assert rv.status_code == 200
    assert rv.json == "Updated successfully"
