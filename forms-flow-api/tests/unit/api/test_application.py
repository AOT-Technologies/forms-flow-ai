"""Test suite for application API endpoint."""

import os

import pytest
import requests
from formsflow_api_utils.utils import (
    CREATE_DESIGNS,
    CREATE_SUBMISSIONS,
    VIEW_SUBMISSIONS,
)

from tests.utilities.base_test import (
    get_application_create_payload,
    get_draft_create_payload,
    get_formio_form_request_payload,
    get_token,
)


class TestApplicationResource:
    """Test suite for the application endpoint."""

    def test_application_no_auth_api(self, app, client, session):
        """Assert that API /application when passed with no token returns 401 status code."""
        response = client.get("/application")
        assert response.status_code == 401
        assert response.json == {
            "message": "Invalid Token Error",
            "code": "INVALID_AUTH_TOKEN",
            "details": [],
        }

    def test_application_list(self, app, client, session, jwt):
        """Assert that API/application when passed with valid token returns 200 status code."""
        token = get_token(jwt, role=VIEW_SUBMISSIONS)
        headers = {
            "Authorization": f"Bearer {token}",
            "content-type": "application/json",
        }

        response = client.get("/application", headers=headers)
        assert response.status_code == 200

    @pytest.mark.parametrize(("pageNo", "limit"), ((1, 5), (1, 10), (1, 20)))
    def test_application_paginated_list(self, app, client, session, jwt, pageNo, limit):
        """Tests the API/application endpoint with pageNo and limit query params."""
        token = get_token(jwt, role=VIEW_SUBMISSIONS)
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
        token = get_token(jwt, role=VIEW_SUBMISSIONS)
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
        self, app, client, session, jwt, pageNo, limit, filters, create_mapper
    ):
        """Tests the API/application endpoint with filter params."""
        token = get_token(jwt, role=CREATE_DESIGNS)
        headers = {
            "Authorization": f"Bearer {token}",
            "content-type": "application/json",
        }

        token = get_token(jwt, role=CREATE_SUBMISSIONS)
        headers = {
            "Authorization": f"Bearer {token}",
            "content-type": "application/json",
        }
        form_id = create_mapper["formId"]
        rv = client.post(
            "/application/create",
            headers=headers,
            json=get_application_create_payload(form_id),
        )

        assert rv.status_code == 201

        token = get_token(jwt, role=VIEW_SUBMISSIONS)
        headers = {
            "Authorization": f"Bearer {token}",
            "content-type": "application/json",
        }
        response = client.get(
            f"/application?pageNo={pageNo}&limit={limit}&{filters}",
            headers=headers,
        )
        assert response.status_code == 200

    def test_application_list_with_no_draft(
        self, app, client, session, jwt, create_mapper
    ):
        """Application list should not contain draft applications."""
        token = get_token(jwt, role=CREATE_DESIGNS)
        headers = {
            "Authorization": f"Bearer {token}",
            "content-type": "application/json",
        }
        form_id = create_mapper["formId"]
        # creating a draft will create a draft application
        token = get_token(jwt, role=CREATE_SUBMISSIONS)
        headers = {
            "Authorization": f"Bearer {token}",
            "content-type": "application/json",
        }
        client.post("/draft", headers=headers, json=get_draft_create_payload(form_id))
        token = get_token(jwt, role=VIEW_SUBMISSIONS)
        headers = {
            "Authorization": f"Bearer {token}",
            "content-type": "application/json",
        }
        response = client.get("/application", headers=headers)
        assert response.status_code == 200
        assert len(response.json["applications"]) == 0


class TestApplicationDetailView:
    """Test suite for the API/application/<id> endpoint."""

    def test_application_no_auth_api(self, app, client, session):
        """Tests the endpoint with no token."""
        response = client.get("/application/1")
        assert response.status_code == 401
        assert response.json == {
            "message": "Invalid Token Error",
            "code": "INVALID_AUTH_TOKEN",
            "details": [],
        }

    def test_application_detailed_view(self, app, client, session, jwt, create_mapper):
        """Tests the endpoint with valid token."""
        token = get_token(jwt, role=CREATE_DESIGNS)
        headers = {
            "Authorization": f"Bearer {token}",
            "content-type": "application/json",
        }

        form_id = create_mapper["formId"]
        token = get_token(jwt, role=CREATE_SUBMISSIONS)
        headers = {
            "Authorization": f"Bearer {token}",
            "content-type": "application/json",
        }
        rv = client.post(
            "/application/create",
            headers=headers,
            json=get_application_create_payload(form_id),
        )
        assert rv.status_code == 201
        application_id = rv.json.get("id")
        token = get_token(jwt, role=VIEW_SUBMISSIONS)
        headers = {
            "Authorization": f"Bearer {token}",
            "content-type": "application/json",
        }
        response = client.get(f"/application/{application_id}", headers=headers)
        assert response.status_code == 200
        assert response.json["applicationName"] == "Sample form"
        assert response.json["processKey"] == "onestepapproval"


def test_application_resource_by_form_id(app, client, session, jwt, create_mapper):
    """Tests the application by formid endpoint with valid token."""
    token = get_token(jwt, CREATE_DESIGNS)
    headers = {
        "Authorization": f"Bearer {token}",
        "content-type": "application/json",
    }

    form_id = create_mapper["formId"]
    token = get_token(jwt, role=CREATE_SUBMISSIONS)
    headers = {"Authorization": f"Bearer {token}", "content-type": "application/json"}
    rv = client.post(
        "/application/create",
        headers=headers,
        json=get_application_create_payload(form_id),
    )
    assert rv.status_code == 201
    token = get_token(jwt, role=VIEW_SUBMISSIONS)
    headers = {"Authorization": f"Bearer {token}", "content-type": "application/json"}
    response = client.get(f"/application/formid/{form_id}", headers=headers)
    assert response.status_code == 200


def test_application_status_list(app, client, session, jwt, create_mapper):
    """Tests the application status list endpoint with valid payload."""
    token = get_token(jwt, role=CREATE_DESIGNS)
    headers = {
        "Authorization": f"Bearer {token}",
        "content-type": "application/json",
    }

    form_id = create_mapper["formId"]
    token = get_token(jwt, role=CREATE_SUBMISSIONS)
    headers = {"Authorization": f"Bearer {token}", "content-type": "application/json"}
    rv = client.post(
        "/application/create",
        headers=headers,
        json=get_application_create_payload(form_id),
    )
    assert rv.status_code == 201
    token = get_token(jwt, role=VIEW_SUBMISSIONS)
    headers = {"Authorization": f"Bearer {token}", "content-type": "application/json"}
    response = client.get("/application/status/list", headers=headers)
    assert response.status_code == 200
    assert response.json["applicationStatus"]


def test_application_create_method(app, client, session, jwt, create_mapper):
    """Tests the application create method with valid payload."""
    token = get_token(jwt, role=CREATE_DESIGNS)
    headers = {
        "Authorization": f"Bearer {token}",
        "content-type": "application/json",
    }

    form_id = create_mapper["formId"]
    token = get_token(jwt, role=CREATE_SUBMISSIONS)
    headers = {"Authorization": f"Bearer {token}", "content-type": "application/json"}
    rv = client.post(
        "/application/create",
        headers=headers,
        json=get_application_create_payload(form_id),
    )
    assert rv.status_code == 201


def test_application_create_method_tenant_based(
    app, client, session, jwt, create_mapper_custom
):
    """Tests the tenant based application create method with valid payload."""
    token = get_token(jwt, tenant_key="test-tenant", role=CREATE_DESIGNS)
    headers = {
        "Authorization": f"Bearer {token}",
        "content-type": "application/json",
    }

    payload = {
        "formId": "1234",
        "formName": "Sample form",
        "processKey": "two-step-approval",
        "processName": "Two Step Approval",
        "status": "active",
        "formType": "form",
        "parentFormId": "1234",
    }
    rv = create_mapper_custom(payload, tenant="test-tenant")
    form_id = rv["formId"]
    token = get_token(jwt, tenant_key="test-tenant", role=CREATE_SUBMISSIONS)
    headers = {"Authorization": f"Bearer {token}", "content-type": "application/json"}
    rv = client.post(
        "/application/create",
        headers=headers,
        json=get_application_create_payload(form_id),
    )
    assert rv.status_code == 201


def test_application_payload(app, client, session, jwt, create_mapper):
    """Tests the application create endpoint with valid payload."""
    token = get_token(jwt, role=CREATE_DESIGNS)
    headers = {
        "Authorization": f"Bearer {token}",
        "content-type": "application/json",
    }

    form_id = create_mapper["formId"]
    token = get_token(jwt, role=CREATE_SUBMISSIONS)
    headers = {"Authorization": f"Bearer {token}", "content-type": "application/json"}
    rv = client.post(
        "/application/create",
        headers=headers,
        json=get_application_create_payload(form_id),
    )
    assert rv.status_code == 201
    application_response = rv.json
    assert application_response["applicationStatus"] == "New"
    assert application_response["submissionId"] == "1233432"


def test_application_update_details_api(app, client, session, jwt, create_mapper):
    """Tests the application update endpoint with valid payload."""
    token = get_token(jwt, role=CREATE_DESIGNS)
    headers = {
        "Authorization": f"Bearer {token}",
        "content-type": "application/json",
    }

    form_id = create_mapper["formId"]
    token = get_token(jwt, role=CREATE_SUBMISSIONS)
    headers = {"Authorization": f"Bearer {token}", "content-type": "application/json"}
    rv = client.post(
        "/application/create",
        headers=headers,
        json=get_application_create_payload(form_id),
    )
    assert rv.status_code == 201
    application_id = rv.json.get("id")
    assert rv != {}
    token = get_token(jwt, role=VIEW_SUBMISSIONS)
    headers = {"Authorization": f"Bearer {token}", "content-type": "application/json"}
    rv = client.get(f"/application/{application_id}", headers=headers)
    payload = rv.json
    payload["applicationStatus"] = "New"
    payload["formUrl"] = "https://sample.com/form/980/submission/1234"

    rv = client.put(f"/application/{application_id}", headers=headers, json=payload)
    assert rv.status_code == 200
    assert rv.json == "Updated successfully"
    application = client.get(f"/application/{application_id}", headers=headers)
    assert application.status_code == 200
    assert application.json.get("formId") == "980"
    assert application.json.get("submissionId") == "1234"


def test_application_resubmit(app, client, session, jwt, create_mapper_custom):
    """Tests the application resubmit endpoint."""
    token = get_token(jwt, role=CREATE_DESIGNS)
    headers = {
        "Authorization": f"Bearer {token}",
        "content-type": "application/json",
    }
    payload = {
        "formId": "1234",
        "formName": "Sample form",
        "processKey": "two-step-approval",
        "processName": "Two Step Approval",
        "status": "active",
        "formType": "form",
        "parentFormId": "1234",
        "taskVariables": '[{"key":"abcd","label":"BusinessName"}]',
    }
    rv = create_mapper_custom(payload)

    form_id = rv.get("formId")

    token = get_token(jwt, role=CREATE_SUBMISSIONS)
    headers = {"Authorization": f"Bearer {token}", "content-type": "application/json"}
    rv = client.post(
        "/application/create",
        headers=headers,
        json=get_application_create_payload(form_id),
    )
    assert rv.status_code == 201
    application_id = rv.json.get("id")
    processInstanceId = rv.json.get("processInstanceId")
    payload = {
        "data": {"field1": "value1"},
        "processInstanceId": processInstanceId,
        "messageName": "application_resubmitted",
    }
    rv = client.post(
        f"/application/{application_id}/resubmit", headers=headers, json=payload
    )
    assert rv.status_code == 200


def test_capture_process_variables_application_create(
    app, client, session, jwt, mock_redis_client
):
    """Tests the capturing of process variables in the application creation method."""
    token = get_token(jwt, role=CREATE_DESIGNS, username="designer")
    headers = {
        "Authorization": f"Bearer {token}",
        "content-type": "application/json",
    }
    # Design form
    response = client.post(
        "/form/form-design", headers=headers, json=get_formio_form_request_payload()
    )
    assert response.status_code == 201
    form_id = response.json.get("_id")

    # fetch mapper data
    rv = client.get(f"/form/formid/{form_id}", headers=headers)
    assert rv.status_code == 200
    mapper_id = rv.json.get("id")

    # Added task variable to the form
    payload = {
        "mapper": {
            "id": mapper_id,
            "formId": form_id,
            "formName": "Sample form",
            "processKey": "two-step-approval",
            "processName": "Two Step Approval",
            "status": "active",
            "formType": "form",
            "parentFormId": "1234",
            "taskVariable": [
                {
                    "key": "textField",
                    "defaultLabel": "Text Field",
                    "label": "Text Field",
                }
            ],
        }
    }
    rv = client.put(f"/form/{mapper_id}", headers=headers, json=payload)
    assert rv.status_code == 200
    form_id = rv.json.get("mapper").get("formId")

    # Submit new application as client
    payload = get_application_create_payload(form_id)
    payload["data"] = {
        "textField": "Test",
        "applicationId": "",
        "applicationStatus": "",
    }
    token = get_token(jwt, role=CREATE_SUBMISSIONS)
    headers = {
        "Authorization": f"Bearer {token}",
        "content-type": "application/json",
    }
    rv = client.post(
        "/application/create",
        headers=headers,
        json=payload,
    )

    assert rv.status_code == 201
    processInstanceId = rv.json.get("processInstanceId")
    assert processInstanceId is not None
    # Check variable added to process
    bpm_api_base = os.getenv("BPM_API_URL")
    url = f"{bpm_api_base}/engine-rest-ext/v1/process-instance/{processInstanceId}/variables"
    response = requests.get(url, headers=headers)
    assert response.status_code == 200
    assert response.json().get("textField") == {"type": "String", "value": "Test"}
