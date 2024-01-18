"""Test suite for 'draft' namespace API endpoints."""
import os

import requests
from formsflow_api_utils.utils import (
    ANONYMOUS_USER,
    DRAFT_APPLICATION_STATUS,
    NEW_APPLICATION_STATUS,
)

from formsflow_api.constants import BusinessErrorCode
from formsflow_api.models import Application, Draft, FormProcessMapper
from tests.utilities.base_test import (
    get_anonymous_form_model_object,
    get_application_create_payload,
    get_draft_create_payload,
    get_form_model_object,
    get_form_request_payload,
    get_formio_form_request_payload,
    get_token,
)


def test_draft_create_method(app, client, session, jwt):
    """Tests the draft create method with valid payload."""
    token = get_token(jwt)
    headers = {"Authorization": f"Bearer {token}", "content-type": "application/json"}
    rv = client.post("/form", headers=headers, json=get_form_request_payload())
    form_id = rv.json.get("formId")
    response = client.post(
        "/draft", headers=headers, json=get_draft_create_payload(form_id)
    )
    assert response.status_code == 201
    assert response.json.get("id") is not None
    assert response.json.get("applicationId") is not None
    assert response.json.get("data") == get_draft_create_payload(form_id)["data"]

    application_table = Application()
    draft_application = application_table.find_by_id(response.json.get("applicationId"))
    assert draft_application.application_status == DRAFT_APPLICATION_STATUS


def test_draft_list(app, client, session, jwt):
    """Testing draft listing API."""
    token = get_token(jwt)
    headers = {"Authorization": f"Bearer {token}", "content-type": "application/json"}
    rv = client.post("/form", headers=headers, json=get_form_request_payload())
    form_id = rv.json.get("formId")
    for _ in range(2):
        client.post("/draft", headers=headers, json=get_draft_create_payload(form_id))

    response = client.get("/draft", headers=headers)
    assert response.status_code == 200
    assert response.json is not None
    assert len(response.json["drafts"]) == 2

    # tests if the draft listing is user specific
    token = get_token(jwt, username="different_user")
    headers = {"Authorization": f"Bearer {token}", "content-type": "application/json"}
    response = client.get("/draft", headers=headers)
    assert response.status_code == 200
    assert response.json is not None
    assert len(response.json["drafts"]) == 0


def test_draft_detail_view(app, client, session, jwt):
    """Testing draft details endpoint."""
    token = get_token(jwt)
    headers = {"Authorization": f"Bearer {token}", "content-type": "application/json"}
    rv = client.post("/form", headers=headers, json=get_form_request_payload())
    assert rv.status_code == 201

    form_id = rv.json.get("formId")
    response = client.post(
        "/draft", headers=headers, json=get_draft_create_payload(form_id)
    )
    assert response.status_code == 201
    draft_id = response.json.get("id")
    rv = client.get(f"/draft/{draft_id}", headers=headers)
    assert rv.status_code == 200
    assert rv.json.get("id") == draft_id

    # tests if the draft detail is user specific
    token = get_token(jwt, username="different_user")
    headers = {"Authorization": f"Bearer {token}", "content-type": "application/json"}
    rv = client.get(f"/draft/{draft_id}", headers=headers)
    assert rv.status_code == 400
    assert (
        rv.json.get("message") == BusinessErrorCode.DRAFT_APPLICATION_NOT_FOUND.message
    )


def test_draft_update_details_api(app, client, session, jwt):
    """Tests the draft update endpoint with valid payload."""
    token = get_token(jwt)
    headers = {
        "Authorization": f"Bearer {token}",
        "content-type": "application/json",
    }
    rv = client.post("/form", headers=headers, json=get_form_request_payload())
    assert rv.status_code == 201

    form_id = rv.json.get("formId")
    response = client.post(
        "/draft", headers=headers, json=get_draft_create_payload(form_id)
    )
    assert response.status_code == 201
    draft_id = response.json.get("id")
    rv = client.get(f"/draft/{draft_id}", headers=headers)
    payload = rv.json
    payload["data"] = {"name": "sample"}
    rv = client.put(f"/draft/{draft_id}", headers=headers, json=payload)
    assert rv.status_code == 200


def test_draft_submission_resource(app, client, session, jwt):
    """Tests the '/<int: draft_id>/submit' endpoint."""
    token = get_token(jwt)
    headers = {
        "Authorization": f"Bearer {token}",
        "content-type": "application/json",
    }
    rv = client.post("/form", headers=headers, json=get_form_request_payload())
    form_id = rv.json.get("formId")
    draft = client.post(
        "/draft", headers=headers, json=get_draft_create_payload(form_id)
    )
    assert draft.status_code == 201
    draft_id = draft.json.get("id")
    payload = get_application_create_payload()
    response = client.put(f"/draft/{draft_id}/submit", headers=headers, json=payload)
    assert response.json.get("applicationStatus") == "New"
    assert response.json.get("formId") == payload["formId"]
    assert response.json.get("submissionId") == payload["submissionId"]

    draft = Draft().query.get(draft_id)
    assert draft.status == "0"
    assert draft.data == {}
    assert draft.application_id == response.json.get("id")


def test_draft_tenant_authorization(app, client, session, jwt):
    """Tests if the draft detail is tenant authorized."""
    token = get_token(jwt, role="formsflow-designer", tenant_key="tenant1")
    headers = {"Authorization": f"Bearer {token}", "content-type": "application/json"}
    rv = client.post("/form", headers=headers, json=get_form_request_payload())
    form_id = rv.json.get("formId")
    assert FormProcessMapper().find_form_by_form_id(form_id) is not None
    assert FormProcessMapper().find_form_by_form_id(form_id).tenant == "tenant1"
    response = client.post(
        "/draft", headers=headers, json=get_draft_create_payload(form_id)
    )
    assert response.status_code == 201
    draft_id = response.json.get("id")
    rv = client.get(f"/draft/{draft_id}", headers=headers)
    assert rv.status_code == 200

    # tests if another tenant can get the draft created by different tenant
    token = get_token(jwt, tenant_key="tenant2")
    headers = {"Authorization": f"Bearer {token}", "content-type": "application/json"}
    rv = client.get(f"/draft/{draft_id}", headers=headers)
    assert rv.status_code == 400

    # tests if a tenant can create a draft for a form created by different tenant
    response = client.post(
        "/draft", headers=headers, json=get_draft_create_payload(form_id)
    )
    assert response.status_code == 403
    assert response.json == {
        "code": BusinessErrorCode.PERMISSION_DENIED.code,
        "details": [],
        "message": BusinessErrorCode.PERMISSION_DENIED.message,
    }


def test_anonymous_drafts(app, client, session, jwt):
    """Tests the anonymous draft endpoints."""
    # creates an anonymous form first
    form = FormProcessMapper(**get_anonymous_form_model_object())
    form.save()
    form_id = form.form_id
    headers = {
        "content-type": "application/json",
    }
    response = client.post(
        "/draft/public/create", headers=headers, json=get_draft_create_payload(form_id)
    )
    assert response.status_code == 201
    assert response.json.get("data") == get_draft_create_payload()["data"]
    application = Application.find_by_id(response.json.get("applicationId"))
    draft = Draft.query.get(response.json.get("id"))
    assert draft is not None
    assert application is not None
    assert application.created_by == ANONYMOUS_USER
    response = client.put(
        f"/draft/public/{draft.id}/submit",
        headers=headers,
        json=get_application_create_payload(form_id),
    )

    assert response.status_code == 200
    assert response.json.get("applicationStatus") == NEW_APPLICATION_STATUS
    assert (
        response.json.get("submissionId")
        == get_application_create_payload()["submissionId"]
    )
    assert response.json.get("formId") == get_application_create_payload()["formId"]
    assert response.json.get("createdBy") == ANONYMOUS_USER

    form2 = FormProcessMapper(**get_form_model_object())
    form2.save()
    form_id2 = form2.form_id
    headers = {
        "content-type": "application/json",
    }
    response = client.post(
        "/draft/public/create", headers=headers, json=get_draft_create_payload(form_id2)
    )
    assert response.status_code == 403
    assert response.json == {
        "code": BusinessErrorCode.PERMISSION_DENIED.code,
        "details": [],
        "message": BusinessErrorCode.PERMISSION_DENIED.message,
    }


def test_delete_draft(app, client, session, jwt):
    """Tests the delete draft endpoint."""
    token = get_token(jwt)
    headers = {"Authorization": f"Bearer {token}", "content-type": "application/json"}
    rv = client.post("/form", headers=headers, json=get_form_request_payload())
    assert rv.status_code == 201

    form_id = rv.json.get("formId")
    response = client.post(
        "/draft", headers=headers, json=get_draft_create_payload(form_id)
    )
    assert response.status_code == 201
    draft_id = response.json.get("id")
    rv = client.delete(f"/draft/{draft_id}", headers=headers)
    assert rv.status_code == 200

    # Tests if delete is user specific
    token = get_token(jwt, username="different_user")
    headers = {"Authorization": f"Bearer {token}", "content-type": "application/json"}
    rv = client.delete(f"/draft/{draft_id}", headers=headers)
    assert rv.status_code == 400


def test_capture_process_variables_draft_create_method(
    app, client, session, jwt, mock_redis_client
):
    """Tests the capturing of process variables in the draft create method."""
    token = get_token(jwt, role="formsflow-designer", username="designer")
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
    # Added task variable to the form
    payload = {
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
                "showInList": False,
            }
        ],
    }
    rv = client.post("/form", headers=headers, json=payload)
    assert rv.status_code == 201
    form_id = rv.json.get("formId")
    # Draft submission
    token = get_token(jwt)
    headers = {
        "Authorization": f"Bearer {token}",
        "content-type": "application/json",
    }
    draft = client.post(
        "/draft", headers=headers, json=get_draft_create_payload(form_id)
    )
    assert draft.status_code == 201
    draft_id = draft.json.get("id")
    payload = get_application_create_payload()
    payload["data"] = {
        "textField": "Test",
        "applicationId": "",
        "applicationStatus": "",
    }
    response = client.put(f"/draft/{draft_id}/submit", headers=headers, json=payload)
    processInstanceId = response.json.get("processInstanceId")
    assert processInstanceId is not None
    # Check variable added to process
    bpm_api_base = os.getenv("BPM_API_URL")
    url = f"{bpm_api_base}/engine-rest-ext/v1/process-instance/{processInstanceId}/variables"
    response = requests.get(url, headers=headers)
    assert response.status_code == 200
    assert response.json().get("textField") == {"type": "String", "value": "Test"}
