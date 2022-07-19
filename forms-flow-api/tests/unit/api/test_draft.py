"""Test suite for draft API endpoint."""

from tests.utilities.base_test import (
    get_draft_create_payload, 
    get_token, 
    get_application_create_payload, 
    get_form_request_payload
)


def test_draft_list(app, client, session, jwt):
    """Testing draft listing API."""
    token = get_token(jwt)
    headers = {"Authorization": f"Bearer {token}", "content-type": "application/json"}
    response = client.get("/draft", headers=headers)
    assert response.status_code == 200
    assert response.json is not None

def test_draft_create_method(app, client, session, jwt):
    """Tests the draft create method with valid payload."""
    token = get_token(jwt)
    headers = {"Authorization": f"Bearer {token}", "content-type": "application/json"}
    rv = client.post("/form", headers=headers, json=get_form_request_payload())
    assert rv.status_code == 201

    form_id = rv.json.get("formId")

    rv = client.post(
        "/application/create",
        headers=headers,
        json=get_application_create_payload(form_id),
    )
    assert rv.status_code == 201
    response = client.post("/draft", headers=headers, json=get_draft_create_payload(form_id))
    assert response.status_code == 201
    assert response.json.get("id") is not None

def test_draft_detail_view(app, client, session, jwt):
    """Testing draft details endpoint."""
    token = get_token(jwt)
    headers = {"Authorization": f"Bearer {token}", "content-type": "application/json"}
    rv = client.post("/form", headers=headers, json=get_form_request_payload())
    assert rv.status_code == 201

    form_id = rv.json.get("formId")

    rv = client.post(
        "/application/create",
        headers=headers,
        json=get_application_create_payload(form_id),
    )
    assert rv.status_code == 201
    response = client.post("/draft", headers=headers, json=get_draft_create_payload(form_id))
    assert response.status_code == 201
    draft_id = response.json.get("id")
    rv = client.get(f"/draft/{draft_id}", headers=headers)
    assert rv.status_code == 200
    assert rv.json.get("id") == draft_id

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

    rv = client.post(
        "/application/create",
        headers=headers,
        json=get_application_create_payload(form_id),
    )
    assert rv.status_code == 201
    response = client.post("/draft", headers=headers, json=get_draft_create_payload(form_id))
    assert response.status_code == 201
    draft_id = response.json.get("id")
    rv = client.get(f"/draft/{draft_id}", headers=headers)
    payload = rv.json
    payload["data"] = {"name": "sample"}
    rv = client.put(f"/draft/{draft_id}", headers=headers, json=payload)
    assert rv.status_code == 200
