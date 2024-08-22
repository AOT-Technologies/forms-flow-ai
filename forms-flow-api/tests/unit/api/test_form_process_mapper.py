"""Test suite for FormProcessMapper API endpoint."""

import json
from unittest.mock import MagicMock
import pytest
from formsflow_api.models import FormProcessMapper
from formsflow_api_utils.utils import (
    ADMIN,
    CREATE_DESIGNS,
    CREATE_SUBMISSIONS,
    VIEW_DESIGNS,
    VIEW_SUBMISSIONS,
)

from tests.utilities.base_test import (
    get_application_create_payload,
    get_form_request_anonymous_payload,
    get_form_request_payload,
    get_formio_form_request_payload,
    get_token,
)


def test_form_process_mapper_list(app, client, session, jwt):
    """Testing form process mapper listing API."""
    token = get_token(jwt, role=CREATE_DESIGNS)
    headers = {"Authorization": f"Bearer {token}", "content-type": "application/json"}
    response = client.get("/form", headers=headers)
    assert response.status_code == 200
    assert response.json is not None


def test_form_process_mapper_creation(app, client, session, jwt):
    """Testing form process mapper create API."""
    token = get_token(jwt, role=CREATE_DESIGNS)
    headers = {"Authorization": f"Bearer {token}", "content-type": "application/json"}
    response = client.post("/form", headers=headers, json=get_form_request_payload())
    assert response.status_code == 201
    assert response.json.get("id") is not None


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
    app, client, session, jwt, pageNo, limit, filters
):
    """Testing form process mapper paginated filtered list."""
    token = get_token(jwt, role=CREATE_DESIGNS)
    headers = {"Authorization": f"Bearer {token}", "content-type": "application/json"}
    response = client.post("/form", headers=headers, json=get_form_request_payload())
    assert response.status_code == 201
    rv = client.get(f"/form?pageNo={pageNo}&limit={limit}&{filters}", headers=headers)
    assert rv.status_code == 200


def test_anonymous_form_process_mapper_creation(app, client, session, jwt):
    """Testing anonymous form process mapper creation."""
    token = get_token(jwt, role=CREATE_DESIGNS)
    headers = {"Authorization": f"Bearer {token}", "content-type": "application/json"}
    response = client.post(
        "/form", headers=headers, json=get_form_request_anonymous_payload()
    )
    assert response.status_code == 201
    assert response.json.get("id") is not None


def test_form_process_mapper_detail_view(app, client, session, jwt):
    """Testing form process mapper details endpoint."""
    token = get_token(jwt, role=CREATE_DESIGNS)
    headers = {"Authorization": f"Bearer {token}", "content-type": "application/json"}
    response = client.post(
        "/form",
        headers=headers,
        json=get_form_request_payload(),
    )
    assert response.status_code == 201
    mapper_id = response.json.get("id")
    rv = client.get(f"/form/{mapper_id}", headers=headers)
    assert rv.status_code == 200
    assert rv.json.get("id") == mapper_id


def test_form_process_mapper_by_formid(app, client, session, jwt):
    """Testing API/form/formid/<formid> with valid data."""
    token = get_token(jwt, role=CREATE_DESIGNS)
    headers = {"Authorization": f"Bearer {token}", "content-type": "application/json"}
    response = client.post(
        "/form",
        headers=headers,
        json=get_form_request_payload(),
    )
    assert response.status_code == 201
    form_id = response.json.get("formId")
    assert form_id is not None
    rv = client.get(f"/form/formid/{form_id}", headers=headers)
    assert rv.status_code == 200


def test_form_process_mapper_id_deletion(app, client, session, jwt):
    """Testing form process mapper delete endpoint."""
    token = get_token(jwt, role=CREATE_DESIGNS, roles=["/formsflow/formsflow-designer"])
    headers = {"Authorization": f"Bearer {token}", "content-type": "application/json"}
    response = client.post(
        "/form",
        headers=headers,
        json=get_form_request_payload(),
    )
    assert response.status_code == 201
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


def test_form_process_mapper_test_update(app, client, session, jwt):
    """Testing form process mapper update endpoint."""
    token = get_token(jwt, role=CREATE_DESIGNS, roles=["/formsflow/formsflow-designer"])
    headers = {"Authorization": f"Bearer {token}", "content-type": "application/json"}
    response = client.post(
        "/form",
        headers=headers,
        json=get_form_request_payload(),
    )
    assert response.status_code == 201

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
    form_id = response.json["forms"][0]["id"]
    token = get_token(jwt, role=CREATE_DESIGNS, roles=["/formsflow/formsflow-designer"])
    headers = {"Authorization": f"Bearer {token}", "content-type": "application/json"}
    rv = client.put(
        f"/form/{form_id}", headers=headers, json=get_form_request_payload()
    )
    assert rv.status_code == 200


def test_anonymous_form_process_mapper_test_update(app, client, session, jwt):
    """Testing anonymous form process mapper update endpoint."""
    token = get_token(jwt, role=CREATE_DESIGNS, roles=["/formsflow/formsflow-designer"])
    headers = {"Authorization": f"Bearer {token}", "content-type": "application/json"}
    response = client.post(
        "/form",
        headers=headers,
        json=get_form_request_payload(),
    )
    assert response.status_code == 201

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
        f"/form/{form_id}", headers=headers, json=get_form_request_anonymous_payload()
    )
    assert rv.status_code == 200


def test_get_application_count_based_on_form_process_mapper_id(
    app, client, session, jwt
):
    """Testing the count API for applications corresponding to mapper id."""
    token = get_token(jwt, role=CREATE_DESIGNS, roles=["/formsflow/formsflow-designer"])
    headers = {"Authorization": f"Bearer {token}", "content-type": "application/json"}
    response = client.post(
        "/form",
        headers=headers,
        json=get_form_request_payload(),
    )
    assert response.status_code == 201

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
    app, client, session, jwt
):
    """Testing the count api."""
    token = get_token(jwt, role=CREATE_DESIGNS)
    headers = {
        "Authorization": f"Bearer {token}",
        "content-type": "application/json",
    }
    rv = client.post("/form", headers=headers, json=get_form_request_payload())
    assert rv.status_code == 201

    form_id = rv.json.get("formId")
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


def test_get_task_variable_based_on_form_process_mapper_id(app, client, session, jwt):
    """Assert that API when passed with valid payload returns 200 status code."""
    token = get_token(jwt, role=CREATE_DESIGNS)
    headers = {
        "Authorization": f"Bearer {token}",
        "content-type": "application/json",
    }
    rv = client.post("/form", headers=headers, json=get_form_request_payload())
    assert rv.status_code == 201

    form_id = rv.json.get("formId")
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
