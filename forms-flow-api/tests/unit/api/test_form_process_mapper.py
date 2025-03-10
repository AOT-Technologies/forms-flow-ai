"""Test suite for FormProcessMapper API endpoint."""

import json
from unittest.mock import MagicMock, patch

import pytest
from formsflow_api_utils.utils import (
    ADMIN,
    CREATE_DESIGNS,
    CREATE_SUBMISSIONS,
    VIEW_DESIGNS,
    VIEW_SUBMISSIONS,
    get_token,
)

from formsflow_api.models import FormProcessMapper
from formsflow_api.services import FormHistoryService
from tests.utilities.base_test import (
    get_application_create_payload,
    get_draft_create_payload,
    get_form_request_payload,
    get_formio_form_request_payload,
)


def test_form_process_mapper_list(app, client, session, jwt):
    """Testing form process mapper listing API."""
    token = get_token(jwt, role=CREATE_DESIGNS)
    headers = {"Authorization": f"Bearer {token}", "content-type": "application/json"}
    response = client.get("/form", headers=headers)
    assert response.status_code == 200
    assert response.json is not None


@pytest.mark.parametrize(("pageNo", "limit"), ((1, 5), (1, 10), (1, 20)))
def test_form_process_mapper_paginated_list(app, client, session, jwt, pageNo, limit):
    """Testing form process mapper paginated list."""
    token = get_token(jwt, role=CREATE_DESIGNS)
    headers = {"Authorization": f"Bearer {token}", "content-type": "application/json"}
    response = client.get(f"/form?pageNo={pageNo}&limit={limit}", headers=headers)
    assert response.status_code == 200


@pytest.mark.parametrize(
    ("pageNo", "limit", "sortBy", "sortOrder"),
    ((1, 5, "id", "asc"), (1, 10, "id", "desc"), (1, 20, "id", "desc")),
)
def test_form_process_mapper_paginated_sorted_list(
    app, client, session, jwt, pageNo, limit, sortBy, sortOrder
):
    """Testing form process mapper paginated sorted list."""
    token = get_token(jwt, role=VIEW_SUBMISSIONS)
    headers = {"Authorization": f"Bearer {token}", "content-type": "application/json"}
    response = client.get(
        f"/application?pageNo={pageNo}&limit={limit}&sortBy={sortBy}&sortOrder={sortOrder}",
        headers=headers,
    )
    assert response.status_code == 200


@pytest.mark.parametrize(
    ("pageNo", "limit", "filters"),
    (
        (1, 5, "search=free"),
        (1, 10, "search=Free"),
        (1, 20, "search=privacy"),
    ),
)
def test_form_process_mapper_paginated_filtered_list(
    app, client, session, jwt, pageNo, limit, filters, create_mapper
):
    """Testing form process mapper paginated filtered list."""
    token = get_token(jwt, role=CREATE_DESIGNS)
    headers = {"Authorization": f"Bearer {token}", "content-type": "application/json"}
    response = create_mapper  # noqa: F841
    rv = client.get(f"/form?pageNo={pageNo}&limit={limit}&{filters}", headers=headers)
    assert rv.status_code == 200


def test_form_process_mapper_detail_view(app, client, session, jwt, create_mapper):
    """Testing form process mapper details endpoint."""
    token = get_token(jwt, role=CREATE_DESIGNS)
    headers = {"Authorization": f"Bearer {token}", "content-type": "application/json"}

    mapper_id = create_mapper.get("id")
    rv = client.get(f"/form/{mapper_id}", headers=headers)
    assert rv.status_code == 200
    assert rv.json.get("id") == mapper_id


def test_form_process_mapper_by_formid(app, client, session, jwt, create_mapper):
    """Testing API/form/formid/<formid> with valid data."""
    token = get_token(jwt, role=CREATE_DESIGNS)
    headers = {"Authorization": f"Bearer {token}", "content-type": "application/json"}
    response = create_mapper
    form_id = response.get("formId")
    assert form_id is not None
    rv = client.get(f"/form/formid/{form_id}", headers=headers)
    assert rv.status_code == 200


def test_form_process_mapper_id_deletion(app, client, session, jwt, create_mapper):
    """Testing form process mapper delete endpoint."""
    token = get_token(jwt, role=CREATE_DESIGNS, roles=["/formsflow/formsflow-designer"])
    headers = {"Authorization": f"Bearer {token}", "content-type": "application/json"}
    response = create_mapper
    auth_payload = {
        "resourceId": "1234",
        "resourceDetails": {},
        "roles": ["/formsflow/formsflow-designer"],
    }
    token = get_token(jwt, role=CREATE_DESIGNS)
    headers = {"Authorization": f"Bearer {token}", "content-type": "application/json"}
    response = client.post(
        "/authorizations/form", headers=headers, data=json.dumps(auth_payload)
    )
    response = client.post(
        "/authorizations/designer", headers=headers, data=json.dumps(auth_payload)
    )
    assert response.status_code == 200
    token = get_token(jwt, role=VIEW_DESIGNS, roles=["/formsflow/formsflow-designer"])
    headers = {"Authorization": f"Bearer {token}", "content-type": "application/json"}
    response = client.get("/form", headers=headers)
    assert response.status_code == 200

    data = response.json
    form_id = data["forms"][0]["id"]
    token = get_token(jwt, role=CREATE_DESIGNS, roles=["/formsflow/formsflow-designer"])
    headers = {"Authorization": f"Bearer {token}", "content-type": "application/json"}
    r = client.delete(f"/form/{form_id}", headers=headers)
    assert r.json == "Deleted"
    assert r.status_code == 200


def test_form_process_mapper_test_update(app, client, session, jwt, create_mapper):
    """Testing form process mapper update endpoint."""
    token = get_token(jwt, role=CREATE_DESIGNS, roles=["/formsflow/formsflow-designer"])
    headers = {"Authorization": f"Bearer {token}", "content-type": "application/json"}
    response = create_mapper

    auth_payload = {
        "resourceId": "1234",
        "resourceDetails": {},
        "roles": ["/formsflow/formsflow-designer"],
    }
    token = get_token(jwt, role=ADMIN)
    headers = {"Authorization": f"Bearer {token}", "content-type": "application/json"}
    response = client.post(
        "/authorizations/form", headers=headers, data=json.dumps(auth_payload)
    )
    response = client.post(
        "/authorizations/designer", headers=headers, data=json.dumps(auth_payload)
    )
    assert response.status_code == 200
    token = get_token(jwt, role=VIEW_DESIGNS, roles=["/formsflow/formsflow-designer"])
    headers = {"Authorization": f"Bearer {token}", "content-type": "application/json"}
    response = client.get("/form", headers=headers)
    assert response.status_code == 200
    form_id = response.json.get("forms")[0].get("id")
    token = get_token(jwt, role=CREATE_DESIGNS, roles=["/formsflow/formsflow-designer"])
    headers = {"Authorization": f"Bearer {token}", "content-type": "application/json"}
    data = {
        "mapper": {
            **get_form_request_payload(),
            "formName": "Test Form",
            "taskVariables": [],
        }
    }
    rv = client.put(f"/form/{form_id}", headers=headers, json=data)
    assert rv.json.get("mapper")["formName"] == "Test Form"
    assert rv.status_code == 200


def test_anonymous_form_process_mapper_test_update(
    app, client, session, jwt, create_mapper
):
    """Testing anonymous form process mapper update endpoint."""
    token = get_token(jwt, role=CREATE_DESIGNS, roles=["/formsflow/formsflow-designer"])
    headers = {"Authorization": f"Bearer {token}", "content-type": "application/json"}
    response = create_mapper

    auth_payload = {
        "resourceId": "1234",
        "resourceDetails": {},
        "roles": ["/formsflow/formsflow-designer"],
    }
    token = get_token(jwt, role=ADMIN)
    headers = {"Authorization": f"Bearer {token}", "content-type": "application/json"}
    response = client.post(
        "/authorizations/form", headers=headers, data=json.dumps(auth_payload)
    )
    response = client.post(
        "/authorizations/designer", headers=headers, data=json.dumps(auth_payload)
    )
    assert response.status_code == 200
    token = get_token(jwt, role=VIEW_DESIGNS, roles=["/formsflow/formsflow-designer"])
    headers = {"Authorization": f"Bearer {token}", "content-type": "application/json"}
    response = client.get("/form", headers=headers)
    assert response.status_code == 200
    data = response.json
    form_id = data["forms"][0]["id"]
    token = get_token(jwt, role=CREATE_DESIGNS, roles=["/formsflow/formsflow-designer"])
    headers = {"Authorization": f"Bearer {token}", "content-type": "application/json"}
    rv = client.put(
        f"/form/{form_id}",
        headers=headers,
        json={
            "mapper": {
                "formId": "1234",
                "formName": "Sample form",
                "anonymous": True,
                "status": "active",
                "formType": "form",
                "parentFormId": "1234",
            }
        },
    )
    assert rv.status_code == 200


def test_get_application_count_based_on_form_process_mapper_id(
    app, client, session, jwt, create_mapper
):
    """Testing the count API for applications corresponding to mapper id."""
    token = get_token(jwt, role=CREATE_DESIGNS, roles=["/formsflow/formsflow-designer"])
    headers = {"Authorization": f"Bearer {token}", "content-type": "application/json"}
    response = create_mapper
    auth_payload = {
        "resourceId": "1234",
        "resourceDetails": {},
        "roles": ["/formsflow/formsflow-designer"],
    }
    token = get_token(jwt, role=ADMIN)
    headers = {"Authorization": f"Bearer {token}", "content-type": "application/json"}
    response = client.post(
        "/authorizations/form", headers=headers, data=json.dumps(auth_payload)
    )
    response = client.post(
        "/authorizations/designer", headers=headers, data=json.dumps(auth_payload)
    )
    assert response.status_code == 200
    token = get_token(jwt, role=VIEW_DESIGNS, roles=["/formsflow/formsflow-designer"])
    headers = {"Authorization": f"Bearer {token}", "content-type": "application/json"}
    response = client.get("/form", headers=headers)
    assert response.status_code == 200
    data = response.json
    form_id = data["forms"][0]["id"]

    rv = client.get(f"/form/{form_id}/application/count", headers=headers)
    assert rv.status_code == 200
    assert rv.json == {"message": "No Applications found", "value": 0}


def test_get_application_count_based_on_form_process_mapper_id1(
    app, client, session, jwt, create_mapper
):
    """Testing the count api."""
    token = get_token(jwt, role=CREATE_DESIGNS)
    headers = {
        "Authorization": f"Bearer {token}",
        "content-type": "application/json",
    }
    rv = create_mapper
    form_id = rv["formId"]
    token = get_token(jwt, role=CREATE_SUBMISSIONS)
    headers = {"Authorization": f"Bearer {token}", "content-type": "application/json"}
    rv = client.post(
        "/application/create",
        headers=headers,
        json=get_application_create_payload(form_id),
    )
    assert rv.status_code == 201

    rv = client.get(f"/form/{form_id}/application/count", headers=headers)
    assert rv.status_code == 200


def test_get_task_variable_based_on_form_process_mapper_id(
    app, client, session, jwt, create_mapper
):
    """Assert that API when passed with valid payload returns 200 status code."""
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

    rv = client.get(f"/form/applicationid/{application_id}", headers=headers)
    assert rv.status_code == 200


def test_formio_form_creation(app, client, session, jwt, mock_redis_client):
    """Testing formio form create API."""
    token = get_token(jwt, role=CREATE_DESIGNS, username="designer")
    headers = {"Authorization": f"Bearer {token}", "content-type": "application/json"}
    response = client.post(
        "/form/form-design", headers=headers, json=get_formio_form_request_payload()
    )
    assert response.status_code == 201


def get_export(client, headers, mapper_id):
    """Get export."""
    return client.get(f"/form/{mapper_id}/export", headers=headers)


def get_authorizations(form_id):
    """Get authorizations."""
    return {
        "APPLICATION": {
            "resourceId": form_id,
            "resourceDetails": {},
            "roles": [],
            "userName": None,
        },
        "DESIGNER": {
            "resourceId": form_id,
            "resourceDetails": {},
            "roles": [],
            "userName": None,
        },
        "FORM": {
            "resourceId": form_id,
            "resourceDetails": {},
            "roles": [],
            "userName": None,
        },
    }


def get_forms(form_name, scope_type):
    """Get forms."""
    return {"formTitle": form_name, "type": scope_type, "content": "json form content"}


def get_workflows(process_key, process_name, scope_type, xml):
    """Get workflows."""
    return {
        "processKey": process_key,
        "processName": process_name,
        "type": scope_type,
        "content": xml,
    }


def get_dmns(dmn_key, scope_type, xml):
    """Get DMN."""
    return {"key": dmn_key, "type": scope_type, "content": xml}


def mapper_payload(form_name, process_key, process_name):
    """Mapper payload."""
    return {
        "form_id": "1234",
        "form_name": form_name,
        "process_key": process_key,
        "process_name": process_name,
        "status": "active",
        "tenant": None,
        "form_type": "form",
        "parent_form_id": "1234",
        "created_by": "test",
    }


def test_export(app, client, session, jwt, mock_redis_client):
    """Testing export by mapper id."""
    token = get_token(jwt, role=CREATE_DESIGNS, username="designer")
    headers = {"Authorization": f"Bearer {token}", "content-type": "application/json"}

    # Test export - no DMN - no subprocess -no task based forms(form connector)
    form = FormProcessMapper(
        **mapper_payload("sample form2", "onestepapproval", "One Step Approval")
    )
    form.save()
    mapper_id = form.id
    form_id = form.form_id

    # Mock response
    client = MagicMock()
    mock_response = MagicMock()
    mock_response.status_code = 200
    mock_response.json = {
        "forms": [get_forms("sample form1", "main")],
        "workflows": [
            get_workflows("onestepapproval", "One Step Approval", "main", "xml")
        ],
        "rules": [],
        "authorizations": [get_authorizations(form_id)],
    }
    client.get.return_value = mock_response
    response = get_export(client, headers, mapper_id)
    assert response.status_code == 200
    assert response.json is not None
    assert len(response.json["forms"]) == 1
    assert len(response.json["workflows"]) == 1
    assert len(response.json["rules"]) == 0
    assert len(response.json["authorizations"]) == 1

    # Test export - with task based forms - no DMN - no subprocess
    # form = FormProcessMapper(
    #     **mapper_payload("sample form2", "formconectflow", "FormConnectFlow")
    # )
    # form.save()
    # mapper_id = form.id
    # form_id = form.form_id

    # # Mock response
    # mock_response = MagicMock()
    # mock_response.status_code = 200
    # mock_response.json = {
    #     "forms": [get_forms("sample form2", "main"), get_forms("sample form3", "sub")],
    #     "workflows": [
    #         get_workflows("formconectflow", "FormConnectFlow", "main", "xml")
    #     ],
    #     "rules": [],
    #     "authorizations": [get_authorizations(form_id)],
    # }
    # client.get.return_value = mock_response
    # response = get_export(client, headers, mapper_id)
    # assert response.status_code == 200
    # assert response.json is not None
    # assert len(response.json["forms"]) == 2
    # assert len(response.json["workflows"]) == 1
    # assert len(response.json["rules"]) == 0
    # assert len(response.json["authorizations"]) == 1

    # Test export - with DMN- no task based forms  - no subprocess
    # form = FormProcessMapper(
    #     **mapper_payload("sample form2", "rulebasedflow", "RuleBasedFlow")
    # )
    # form.save()
    # mapper_id = form.id
    # form_id = form.form_id

    # # Mock response
    # mock_response = MagicMock()
    # mock_response.status_code = 200
    # mock_response.json = {
    #     "forms": [get_forms("sample form2", "main")],
    #     "workflows": [get_workflows("rulebasedflow", "RuleBasedFlow", "main", "xml")],
    #     "rules": [get_dmns("dmn1", "main", "dmn xml")],
    #     "authorizations": [get_authorizations(form_id)],
    # }
    # client.get.return_value = mock_response
    # response = get_export(client, headers, mapper_id)
    # assert response.status_code == 200
    # assert response.json is not None
    # assert len(response.json["forms"]) == 1
    # assert len(response.json["workflows"]) == 1
    # assert len(response.json["rules"]) == 1
    # assert len(response.json["authorizations"]) == 1

    # Test export - with subprocess - no DMN- no task based forms
    # form = FormProcessMapper(
    #     **mapper_payload("sample form2", "subprocessflow", "SubprocessFlow")
    # )
    # form.save()
    # mapper_id = form.id
    # form_id = form.form_id

    # # Mock response
    # mock_response = MagicMock()
    # mock_response.status_code = 200
    # mock_response.json = {
    #     "forms": [get_forms("sample form2", "main")],
    #     "workflows": [
    #         get_workflows("subprocessflow", "SubprocessFlow", "main", "xml"),
    #         get_workflows("subflow1", "subflow1", "sub", "xml"),
    #         get_workflows("subflow2", "subflow2", "sub", "xml"),
    #     ],
    #     "rules": [],
    #     "authorizations": [get_authorizations(form_id)],
    # }
    # client.get.return_value = mock_response
    # response = get_export(client, headers, mapper_id)
    # assert response.status_code == 200
    # assert response.json is not None
    # assert len(response.json["forms"]) == 1
    # assert len(response.json["workflows"]) == 3
    # assert len(response.json["rules"]) == 0
    # assert len(response.json["authorizations"]) == 1


def test_form_name_validate_invalid(app, client, session, jwt, mock_redis_client):
    """Testing form name validation with valid parameters."""
    token = get_token(jwt, role=CREATE_DESIGNS)
    headers = {"Authorization": f"Bearer {token}", "content-type": "application/json"}

    # Mock the requests.get method
    with patch("requests.get") as mock_get:
        # Create a mock response object
        mock_response = MagicMock()
        mock_response.status_code = 400
        mock_response.text = '{"message": "Form name, path, or title is invalid."}'
        # Assign the mock response to the mocked get method
        mock_get.return_value = mock_response

        # Test with valid parameters
        response = client.get(
            "/form/validate?title=TestForm&name=TestForm&path=TestForm", headers=headers
        )

        assert response.status_code == 400
        assert response.json is not None
        assert (
            response.json["message"]
            == "Form validation failed: The Name or Path already exists. They must be unique."
        )


def test_form_name_validate_missing_params(
    app, client, session, jwt, mock_redis_client
):
    """Testing form name validation with missing parameters."""
    token = get_token(jwt, role=CREATE_DESIGNS)
    headers = {"Authorization": f"Bearer {token}", "content-type": "application/json"}

    # Mock the requests.get method
    with patch("requests.get") as mock_get:
        # Create a mock response object
        mock_response = MagicMock()
        mock_response.status_code = 400
        mock_response.text = '{"message": "At least one query parameter (title, name, path) must be provided."}'
        # Assign the mock response to the mocked get method
        mock_get.return_value = mock_response

        # Test with missing query parameters
        response = client.get("/form/validate", headers=headers)

        assert response.status_code == 400
        assert response.json is not None
        assert (
            response.json["message"]
            == "At least one query parameter (title, name, path) must be provided."
        )


def test_form_name_validate_unauthorized(app, client):
    """Testing form name validation without proper authorization."""
    # Mock the requests.get method
    with patch("requests.get") as mock_get:
        # Create a mock response object
        mock_response = MagicMock()
        mock_response.status_code = 401
        mock_response.text = '{"message": "Unauthorized"}'
        # Assign the mock response to the mocked get method
        mock_get.return_value = mock_response

        # Test without proper authorization
        response = client.get("/form/validate?title=TestForm")

        assert response.status_code == 401


def test_form_name_invalid_form_title(app, client, session, jwt, mock_redis_client):
    """Testing invalid form title."""
    token = get_token(jwt, role=CREATE_DESIGNS)
    headers = {"Authorization": f"Bearer {token}", "content-type": "application/json"}
    # With only numbers
    response = client.get("/form/validate?title=1234", headers=headers)
    assert response.status_code == 400
    assert response.json is not None
    assert (
        response.json["message"]
        == "Title: Only contain alphanumeric characters, hyphens(not at the start or end), spaces,and must include at least one letter."
    )
    # With special characters
    response = client.get("/form/validate?title=$$", headers=headers)
    assert response.status_code == 400
    assert response.json is not None
    assert (
        response.json["message"]
        == "Title: Only contain alphanumeric characters, hyphens(not at the start or end), spaces,and must include at least one letter."
    )
    response = client.get("/form/validate?title=1234$@@#test", headers=headers)
    assert response.status_code == 400
    assert response.json is not None
    assert (
        response.json["message"]
        == "Title: Only contain alphanumeric characters, hyphens(not at the start or end), spaces,and must include at least one letter."
    )
    # Validate for formio reserved keyword on path while new form creation
    response = client.get("/form/validate?title=import", headers=headers)
    assert response.status_code == 400
    assert response.json is not None
    assert (
        response.json["message"]
        == "The path must not contain: exists, export, role, current, logout, import, form, access, token, recaptcha or end with submission/action."
    )


def test_form_name_invalid_form_name(app, client, session, jwt, mock_redis_client):
    """Testing with invalid form name."""
    token = get_token(jwt, role=CREATE_DESIGNS)
    headers = {"Authorization": f"Bearer {token}", "content-type": "application/json"}
    # With only numbers
    response = client.get("/form/validate?name=1234", headers=headers)
    assert response.status_code == 400
    assert response.json is not None
    assert (
        response.json["message"]
        == "Name: Only contain alphanumeric characters, hyphens(not at the start or end), no spaces,and must include at least one letter."
    )
    # With special characters
    response = client.get("/form/validate?name=1234", headers=headers)
    assert response.status_code == 400
    assert response.json is not None
    assert (
        response.json["message"]
        == "Name: Only contain alphanumeric characters, hyphens(not at the start or end), no spaces,and must include at least one letter."
    )
    # With spaces
    response = client.get("/form/validate?name=test form", headers=headers)
    assert response.status_code == 400
    assert response.json is not None
    assert (
        response.json["message"]
        == "Name: Only contain alphanumeric characters, hyphens(not at the start or end), no spaces,and must include at least one letter."
    )


def test_form_name_invalid_form_path(app, client, session, jwt, mock_redis_client):
    """Testing with invalid form path."""
    token = get_token(jwt, role=CREATE_DESIGNS)
    headers = {"Authorization": f"Bearer {token}", "content-type": "application/json"}
    # With only numbers
    response = client.get("/form/validate?path=1234", headers=headers)
    assert response.status_code == 400
    assert response.json is not None
    assert (
        response.json["message"]
        == "Path: Only contain alphanumeric characters, hyphens(not at the start or end), no spaces,and must include at least one letter."
    )
    # With special characters
    response = client.get("/form/validate?path=1234", headers=headers)
    assert response.status_code == 400
    assert response.json is not None
    assert (
        response.json["message"]
        == "Path: Only contain alphanumeric characters, hyphens(not at the start or end), no spaces,and must include at least one letter."
    )
    # With spaces
    response = client.get("/form/validate?path=test form", headers=headers)
    assert response.status_code == 400
    assert response.json is not None
    assert (
        response.json["message"]
        == "Path: Only contain alphanumeric characters, hyphens(not at the start or end), no spaces,and must include at least one letter."
    )
    # Validate for formio reserved keyword on path
    response = client.get("/form/validate?path=import", headers=headers)
    assert response.status_code == 400
    assert response.json is not None
    assert (
        response.json["message"]
        == "The path must not contain: exists, export, role, current, logout, import, form, access, token, recaptcha or end with submission/action."
    )


def test_form_name_invalid_form_name_title_path(
    app, client, session, jwt, mock_redis_client
):
    """Testing with invalid form name, title & path."""
    token = get_token(jwt, role=CREATE_DESIGNS)
    headers = {"Authorization": f"Bearer {token}", "content-type": "application/json"}

    # Invalid path, title
    response = client.get(
        "/form/validate?name=testform&title=1234&path=$$$", headers=headers
    )
    assert response.status_code == 400
    assert response.json is not None
    assert (
        response.json["message"]
        == """Title: Only contain alphanumeric characters, hyphens(not at the start or end), spaces,and must include at least one letter.,\n Path: Only contain alphanumeric characters, hyphens(not at the start or end), no spaces,and must include at least one letter."""
    )
    # Invalid name, title
    response = client.get(
        "/form/validate?name=test form&title=1234&path=testform123", headers=headers
    )
    assert response.status_code == 400
    assert response.json is not None
    assert (
        response.json["message"]
        == """Title: Only contain alphanumeric characters, hyphens(not at the start or end), spaces,and must include at least one letter.,\n Name: Only contain alphanumeric characters, hyphens(not at the start or end), no spaces,and must include at least one letter."""
    )
    # Invalid path, name
    response = client.get(
        "/form/validate?name=test form&title=test form&path=$$$", headers=headers
    )
    assert response.status_code == 400
    assert response.json is not None
    assert (
        response.json["message"]
        == """Path: Only contain alphanumeric characters, hyphens(not at the start or end), no spaces,and must include at least one letter.,\n Name: Only contain alphanumeric characters, hyphens(not at the start or end), no spaces,and must include at least one letter."""
    )


def test_form_history(
    app,
    client,
    session,
    jwt,
    mock_redis_client,
):
    """Testing form history."""
    token = get_token(jwt, role=CREATE_DESIGNS, username="designer")
    headers = {"Authorization": f"Bearer {token}", "content-type": "application/json"}
    payload = get_formio_form_request_payload()
    payload["componentChanged"] = True
    payload["newVersion"] = True
    response = client.post("/form/form-design", headers=headers, json=payload)
    assert response.status_code == 201
    form_id = response.json["_id"]
    # Assert form history with major version
    response = client.get(f"/form/form-history/{form_id}", headers=headers)
    assert response.status_code == 200
    assert response.json is not None
    form_history = response.json["formHistory"]
    assert len(form_history) == 1
    assert form_history[0]["majorVersion"] == 1
    assert form_history[0]["minorVersion"] == 0
    assert form_history[0]["formId"] == form_id
    assert form_history[0]["version"] == "1.0"
    assert form_history[0]["isMajor"] is True
    assert response.json["totalCount"] == 1

    # Assert form history with minor version
    update_payload = get_formio_form_request_payload()
    update_payload["componentChanged"] = True
    update_payload["parentFormId"] = form_id
    update_payload["_id"] = form_id
    FormHistoryService.create_form_log_with_clone(data=update_payload)
    response = client.get(f"/form/form-history/{form_id}", headers=headers)
    assert response.status_code == 200
    assert response.json is not None
    form_history = response.json["formHistory"]
    assert len(form_history) == 2
    assert form_history[0]["majorVersion"] == 1
    assert form_history[0]["minorVersion"] == 1
    assert form_history[0]["formId"] == form_id
    assert form_history[0]["version"] == "1.1"
    assert form_history[0]["isMajor"] is False
    assert form_history[1]["majorVersion"] == 1
    assert form_history[1]["minorVersion"] == 0
    assert form_history[1]["formId"] == form_id
    assert form_history[1]["version"] == "1.0"
    assert form_history[1]["isMajor"] is True
    assert response.json["totalCount"] == 2


def test_publish(app, client, session, jwt, mock_redis_client, create_mapper):
    """Testing publish endpoint."""
    token = get_token(jwt, role=CREATE_DESIGNS, username="designer")
    headers = {"Authorization": f"Bearer {token}", "content-type": "application/json"}
    mapper_id = create_mapper["id"]
    rv = client.get(f"/form/{mapper_id}", headers=headers)
    assert rv.status_code == 200
    assert rv.json.get("id") == mapper_id
    # Test publish endpoint with valid response.
    with patch("requests.post") as mock_post:
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.text = "{}"
        mock_post.return_value = mock_response
        response = client.post(f"/form/{mapper_id}/publish", headers=headers)
        assert response.status_code == 200


def test_unpublish(app, client, session, jwt, mock_redis_client, create_mapper):
    """Testing unpublish endpoint."""
    token = get_token(jwt, role=CREATE_DESIGNS, username="designer")
    headers = {"Authorization": f"Bearer {token}", "content-type": "application/json"}
    mapper_id = create_mapper["id"]
    rv = client.get(f"/form/{mapper_id}", headers=headers)
    assert rv.status_code == 200
    assert rv.json.get("id") == mapper_id
    # Test unpublish endpoint with valid response.
    with patch("requests.post") as mock_post:
        mock_response = MagicMock()
        mock_response.text = "{}"
        mock_response.status_code = 200
        mock_post.return_value = mock_response
        response = client.post(f"/form/{mapper_id}/unpublish", headers=headers)
        assert response.status_code == 200


def test_form_list_submission_count(app, client, session, jwt, create_mapper):
    """Tests the form list endpoint with includeSubmissionsCount query param."""
    token = get_token(jwt, role=CREATE_DESIGNS)
    headers = {
        "Authorization": f"Bearer {token}",
        "content-type": "application/json",
    }

    form_id = create_mapper["formId"]
    auth_payload = {
        "resourceId": "1234",
        "resourceDetails": {},
        "roles": [],
    }
    # create authorization for the form.
    client.post("/authorizations/form", headers=headers, data=json.dumps(auth_payload))
    client.post(
        "/authorizations/designer", headers=headers, data=json.dumps(auth_payload)
    )
    client.post(
        "/authorizations/application", headers=headers, data=json.dumps(auth_payload)
    )
    token = get_token(jwt, role=CREATE_SUBMISSIONS)
    headers = {
        "Authorization": f"Bearer {token}",
        "content-type": "application/json",
    }
    # create application.
    rv = client.post(
        "/application/create",
        headers=headers,
        json=get_application_create_payload(form_id),
    )
    assert rv.status_code == 201

    # create draft
    client.post("/draft", headers=headers, json=get_draft_create_payload(form_id))

    token = get_token(jwt, role=CREATE_SUBMISSIONS)
    headers = {"Authorization": f"Bearer {token}", "content-type": "application/json"}
    # submissionsCount exclude draft and return submission count
    response = client.get(
        "/form?includeSubmissionsCount=true&showForOnlyCreateSubmissionUsers=true",
        headers=headers,
    )
    assert response.status_code == 200
    forms = response.json["forms"]
    assert len(forms) == 1
    assert forms[0]["submissionsCount"] == 1

    # Assert form list api with no create_submissions permission.
    token = get_token(jwt, role=CREATE_DESIGNS)
    headers = {"Authorization": f"Bearer {token}", "content-type": "application/json"}
    response = client.get("/form?includeSubmissionsCount=true", headers=headers)
    assert response.status_code == 200
    forms = response.json["forms"]
    assert len(forms) == 1
    assert "submissionsCount" not in forms[0]


def test_get_form_data_for_designer(
    app, client, session, jwt, mock_redis_client, create_mapper
):
    """Testing get form data endpoint."""
    token = get_token(jwt, role=CREATE_DESIGNS, username="designer")
    headers = {"Authorization": f"Bearer {token}", "content-type": "application/json"}
    payload = get_formio_form_request_payload()
    payload["componentChanged"] = True
    payload["newVersion"] = True
    response = client.post("/form/form-design", headers=headers, json=payload)
    assert response.status_code == 201
    form_id = response.json["_id"]
    response = client.get(
        f"/form/form-data/{form_id}?authType=designer", headers=headers
    )
    assert response.status_code == 200
    assert response.json is not None
    unauthorized_token = get_token(jwt, role=CREATE_DESIGNS, username="designer2")
    headers = {
        "Authorization": f"Bearer {unauthorized_token}",
        "content-type": "application/json",
    }
    response = client.get(
        f"/form/form-data/{form_id}?authType=designer", headers=headers
    )
    assert response.status_code == 403


def test_get_form_data_for_client(
    app, client, session, jwt, mock_redis_client, create_mapper
):
    """Testing get form data endpoint."""
    token = get_token(jwt, role=CREATE_DESIGNS, username="designer")
    headers = {"Authorization": f"Bearer {token}", "content-type": "application/json"}
    payload = get_formio_form_request_payload()
    payload["componentChanged"] = True
    payload["newVersion"] = True
    response = client.post("/form/form-design", headers=headers, json=payload)
    assert response.status_code == 201
    form_id = response.json["_id"]
    form_name = response.json["name"]
    mapper_data = FormProcessMapper.find_form_by_form_id(form_id)

    payload = {
        "mapper": {
            "formId": form_id,
            "parentFormId": form_id,
            "status": "active",
            "id": str(mapper_data.id),
            "formName": form_name,
            "formType": "form",
            "anonymous": False,
        },
        "authorizations": {
            "form": {
                "resourceId": form_id,
                "resourceDetails": {},
                "roles": ["/formsflow/sample"],
            },
        },
    }
    response = client.put(f"/form/{mapper_data.id}", headers=headers, json=payload)
    assert response.status_code == 200
    # test authorized user
    client_token = get_token(jwt, role=CREATE_SUBMISSIONS, roles=["/formsflow/sample"])
    headers = {
        "Authorization": f"Bearer {client_token}",
        "content-type": "application/json",
    }
    response = client.get(f"/form/form-data/{form_id}", headers=headers)
    assert response.status_code == 200
    assert response.json is not None
    # test unauthorized user
    unauthorized_token = get_token(
        jwt, role=CREATE_SUBMISSIONS, roles=["/formsflow/unauthorized"]
    )
    headers = {
        "Authorization": f"Bearer {unauthorized_token}",
        "content-type": "application/json",
    }
    response = client.get(f"/form/form-data/{form_id}", headers=headers)
    assert response.status_code == 403


def test_get_form_data_for_application(
    app, client, session, jwt, mock_redis_client, create_mapper
):
    """Testing get form data endpoint."""
    token = get_token(jwt, role=CREATE_DESIGNS, username="designer")
    headers = {"Authorization": f"Bearer {token}", "content-type": "application/json"}
    payload = get_formio_form_request_payload()
    payload["componentChanged"] = True
    payload["newVersion"] = True
    response = client.post("/form/form-design", headers=headers, json=payload)
    assert response.status_code == 201
    auth_payload = {
        "resourceId": "1234",
        "resourceDetails": {"submitter": True},
        "roles": [],
    }
    client.post(
        "/authorizations/application", headers=headers, data=json.dumps(auth_payload)
    )
    token = get_token(jwt, role=CREATE_SUBMISSIONS, username="submitter")
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
    token = get_token(jwt, role=VIEW_SUBMISSIONS, username="submitter")
    headers = {
        "Authorization": f"Bearer {token}",
        "content-type": "application/json",
    }
    response = client.get(
        f"/form/form-data/{form_id}?authType=application", headers=headers
    )
    assert response.status_code == 200
    assert response.json is not None
