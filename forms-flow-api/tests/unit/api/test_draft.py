"""Test suite for 'draft' namespace API endpoints."""

import os

import requests
from formsflow_api_utils.utils import (
    ANONYMOUS_USER,
    CREATE_DESIGNS,
    CREATE_SUBMISSIONS,
    DRAFT_APPLICATION_STATUS,
    NEW_APPLICATION_STATUS,
    VIEW_SUBMISSIONS,
)

from formsflow_api.constants import BusinessErrorCode
from formsflow_api.models import Application, Draft, FormProcessMapper
from tests.utilities.base_test import (
    get_anonymous_form_model_object,
    get_application_create_payload,
    get_draft_create_payload,
    get_form_model_object,
    get_formio_form_request_payload,
    get_token,
)


def test_draft_create_method(app, client, session, jwt, create_mapper):
    """Tests the draft create method with valid payload."""
    form_id = create_mapper["formId"]
    token = get_token(jwt, role=CREATE_SUBMISSIONS)
    headers = {"Authorization": f"Bearer {token}", "content-type": "application/json"}
    response = client.post(
        "/draft", headers=headers, json=get_draft_create_payload(form_id)
    )
    assert response.status_code == 201
    assert response.json.get("id") is not None
    assert response.json.get("applicationId") is not None
    assert response.json.get("data") == get_draft_create_payload(form_id)["data"]
    application_id = response.json.get("applicationId")
    token = get_token(jwt, role=VIEW_SUBMISSIONS)
    headers = {"Authorization": f"Bearer {token}", "content-type": "application/json"}
    rv = client.get(f"/application/{application_id}", headers=headers)
    assert rv.status_code == 200
    assert rv.json.get("applicationStatus") == DRAFT_APPLICATION_STATUS


def test_draft_detail_view(app, client, session, jwt, create_mapper):
    """Testing draft details endpoint."""
    token = get_token(jwt, role=CREATE_SUBMISSIONS)
    headers = {"Authorization": f"Bearer {token}", "content-type": "application/json"}
    form_id = create_mapper["formId"]
    response = client.post(
        "/draft", headers=headers, json=get_draft_create_payload(form_id)
    )
    assert response.status_code == 201
    application_id = response.json.get("applicationId")
    token = get_token(jwt, role=VIEW_SUBMISSIONS)
    headers = {"Authorization": f"Bearer {token}", "content-type": "application/json"}
    rv = client.get(f"/application/{application_id}", headers=headers)
    assert rv.status_code == 200
    assert rv.json.get("id") == application_id

    # tests if the draft detail is user specific
    token = get_token(jwt, username="different_user", role=VIEW_SUBMISSIONS)
    headers = {"Authorization": f"Bearer {token}", "content-type": "application/json"}
    rv = client.get(f"/application/{application_id}", headers=headers)
    assert rv.status_code == 403


def test_draft_update_details_api(app, client, session, jwt, create_mapper):
    """Tests the draft update endpoint with valid payload."""
    form_id = create_mapper["formId"]
    token = get_token(jwt, role=CREATE_SUBMISSIONS)
    headers = {"Authorization": f"Bearer {token}", "content-type": "application/json"}
    response = client.post(
        "/draft", headers=headers, json=get_draft_create_payload(form_id)
    )
    assert response.status_code == 201
    application_id = response.json.get("applicationId")
    token = get_token(jwt, role=VIEW_SUBMISSIONS)
    headers = {"Authorization": f"Bearer {token}", "content-type": "application/json"}
    rv = client.get(f"/application/{application_id}", headers=headers)
    payload = rv.json
    payload["data"] = {"name": "sample"}
    rv = client.put(f"/application/{application_id}", headers=headers, json=payload)
    assert rv.status_code == 200


def test_draft_submission_resource(app, client, session, jwt, create_mapper):
    """Tests the '/<int: draft_id>/submit' endpoint."""
    form_id = create_mapper["formId"]
    token = get_token(jwt, role=CREATE_SUBMISSIONS)
    headers = {"Authorization": f"Bearer {token}", "content-type": "application/json"}
    draft = client.post(
        "/draft", headers=headers, json=get_draft_create_payload(form_id)
    )
    assert draft.status_code == 201
    application_id = draft.json.get("applicationId")
    payload = get_application_create_payload()
    response = client.put(f"/application/{application_id}/submit", headers=headers, json=payload)
    assert response.json.get("applicationStatus") == "New"
    assert response.json.get("formId") == payload["formId"]
    assert response.json.get("submissionId") == payload["submissionId"]
    # Check draft entry in draft table is deleted on submission
    draft = Draft().query.get(draft.json.get("id"))
    assert draft is None


def test_draft_tenant_authorization(app, client, session, jwt, create_mapper_custom):
    """Tests if the draft detail is tenant authorized."""
    payload = {
        "formId": "1234",
        "formName": "Sample form",
        "processKey": "onestepapproval",
        "processName": "One Step Approval",
        "status": "active",
        "comments": "test",
        "anonymous": False,
        "formType": "form",
        "parentFormId": "1234",
    }
    rv = create_mapper_custom(payload, tenant="tenant1")
    form_id = rv["formId"]
    assert FormProcessMapper().find_form_by_form_id(form_id) is not None
    assert FormProcessMapper().find_form_by_form_id(form_id).tenant == "tenant1"
    token = get_token(jwt, role=CREATE_SUBMISSIONS, tenant_key="tenant1")
    headers = {"Authorization": f"Bearer {token}", "content-type": "application/json"}
    response = client.post(
        "/draft", headers=headers, json=get_draft_create_payload(form_id)
    )
    assert response.status_code == 201
    application_id = response.json.get("applicationId")
    token = get_token(jwt, role=CREATE_SUBMISSIONS)
    headers = {"Authorization": f"Bearer {token}", "content-type": "application/json"}
    rv = client.get(f"/application/{application_id}", headers=headers)
    assert rv.status_code == 200

    # tests if another tenant can get the draft created by different tenant
    token = get_token(jwt, tenant_key="tenant2", role=CREATE_SUBMISSIONS)
    headers = {"Authorization": f"Bearer {token}", "content-type": "application/json"}
    rv = client.get(f"/application/{application_id}", headers=headers)
    assert rv.status_code == 403

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
    application = Application.find_draft_application_by_user(response.json.get("applicationId"), user_id=ANONYMOUS_USER)
    draft = Draft.query.get(response.json.get("id"))
    assert draft is not None
    assert application is not None
    assert application.created_by == ANONYMOUS_USER
    response = client.put(
        f"/application/public/{draft.application_id}/submit",
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


def test_delete_draft(app, client, session, jwt, create_mapper):
    """Tests the delete draft endpoint."""
    form_id = create_mapper["formId"]
    token = get_token(jwt, role=CREATE_SUBMISSIONS)
    headers = {"Authorization": f"Bearer {token}", "content-type": "application/json"}
    response = client.post(
        "/draft", headers=headers, json=get_draft_create_payload(form_id)
    )
    assert response.status_code == 201
    application_id = response.json.get("applicationId")
    rv = client.delete(f"/application/{application_id}", headers=headers)
    assert rv.status_code == 200

    # Tests if delete is user specific
    token = get_token(jwt, username="different_user", role=CREATE_SUBMISSIONS)
    headers = {"Authorization": f"Bearer {token}", "content-type": "application/json"}
    rv = client.delete(f"/application/{application_id}", headers=headers)
    assert rv.status_code == 400


def test_capture_process_variables_draft_create_method(
    app, client, session, jwt, mock_redis_client
):
    """Tests the capturing of process variables in the draft create method."""
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
        "formId": form_id,
        "id": mapper_id,
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
    rv = client.put(f"/form/{mapper_id}", headers=headers, json={"mapper": payload})
    assert rv.status_code == 200
    form_id = rv.json.get("mapper").get("formId")
    # Draft submission
    token = get_token(jwt, role=CREATE_SUBMISSIONS)
    headers = {
        "Authorization": f"Bearer {token}",
        "content-type": "application/json",
    }
    draft = client.post(
        "/draft", headers=headers, json=get_draft_create_payload(form_id)
    )
    assert draft.status_code == 201
    application_id = draft.json.get("applicationId")
    payload = get_application_create_payload()
    payload["data"] = {
        "textField": "Test",
        "applicationId": "",
        "applicationStatus": "",
    }
    response = client.put(f"/application/{application_id}/submit", headers=headers, json=payload)
    process_instance_id = response.json.get("processInstanceId")
    assert process_instance_id is not None
    # Check variable added to process
    bpm_api_base = os.getenv("BPM_API_URL")
    url = f"{bpm_api_base}/engine-rest-ext/v1/process-instance/{process_instance_id}/variables"
    response = requests.get(url, headers=headers)
    assert response.status_code == 200
    assert response.json().get("textField") == {"type": "String", "value": "Test"}
