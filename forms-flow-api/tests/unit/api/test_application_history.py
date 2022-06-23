"""Test suite for application History API endpoint."""
from tests.utilities.base_test import (
    get_application_create_payload,
    get_form_request_payload,
    get_token,
)


def test_get_application_history(app, client, session, jwt):
    """Get the json request for application /application/{application_id}/history."""
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
    application_id = rv.json["id"]
    rv = client.get(f"/application/{application_id}/history", headers=headers)
    assert rv.status_code == 200


def test_get_application_history_unauthorized(app, client, session):
    """Testing the response of unauthorized application /application/{application_id}/history."""
    rv = client.get("/application/1/history")
    assert rv.status_code == 401


def test_post_application_history_create_method(app, client, session, jwt):
    """Tests the application history create method."""
    token = get_token(jwt)
    headers = {"Authorization": f"Bearer {token}", "content-type": "application/json"}
    new_application = client.post(
        "/application/1/history",
        headers=headers,
        json={
            "applicationId": 1,
            "applicationStatus": "New",
            "formUrl": "http://testsample.com/form/23/submission/3423",
            "submittedBy": "client",
        },
    )
    assert new_application.status_code == 201
