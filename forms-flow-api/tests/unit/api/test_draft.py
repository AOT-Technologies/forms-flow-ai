"""Test suite for 'draft' namespace API endpoints."""
from formsflow_api.models import Application, Draft
from formsflow_api.utils import DRAFT_APPLICATION_STATUS
from tests.utilities.base_test import (
    get_application_create_payload,
    get_draft_create_payload,
    get_form_request_payload,
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
    assert len(response.json) == 2

    # tests if the draft listing is user specific
    token = get_token(jwt, username="different_user")
    headers = {"Authorization": f"Bearer {token}", "content-type": "application/json"}
    response = client.get("/draft", headers=headers)
    assert response.status_code == 200
    assert response.json is not None
    assert len(response.json) == 0


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
        rv.json.get("message")
        == f"Invalid request data - draft id {draft_id} does not exist"
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
