"""Test suite for application History API endpoint."""
from typing import Dict, List

from tests.utilities.base_test import get_token


def get_history_create_payload():
    """Returns the payload for creating application history entry."""
    return {
        "applicationId": 1,
        "applicationStatus": "New",
        "formUrl": "http://testsample.com/form/23/submission/3423",
        "submittedBy": "client",
    }


def get_request_history_create_payload(request_type: str = "Request1"):
    """Returns the payload for creating request history entry."""
    return {
        "applicationId": 1,
        "formUrl": "http://testsample.com/form/23/submission/3423",
        "submittedBy": "client",
        "requestType": request_type,
        "requestStatus": "Pending",
        "isRequest": True,
    }


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
        json=get_history_create_payload(),
    )
    assert new_application.status_code == 201
    assert new_application.json["formId"] == "23"
    assert new_application.json["submissionId"] == "3423"
    assert new_application.json["applicationStatus"] == "New"
    assert new_application.json["submittedBy"] == "client"


def test_get_application_history(app, client, session, jwt):
    """Get the json request for application /application/{application_id}/history."""
    token = get_token(jwt)
    headers = {"Authorization": f"Bearer {token}", "content-type": "application/json"}
    new_entry = client.post(
        "/application/1/history",
        headers=headers,
        json=get_history_create_payload(),
    )
    assert new_entry.status_code == 201
    rv = client.get("/application/1/history", headers=headers)
    assert rv.status_code == 200
    assert isinstance(rv.json, Dict)
    assert isinstance(rv.json["applications"], List)
    assert len(rv.json["applications"]) == 1
    assert rv.json["applications"][0]["formId"] == "23"
    assert rv.json["applications"][0]["submissionId"] == "3423"
    assert rv.json["applications"][0]["submittedBy"] == "client"
    assert rv.json["applications"][0]["applicationStatus"] == "New"


def test_application_history_get_un_authorized(app, client, session, jwt):
    """Tests if the get endpoint is accessible without authentication."""
    token = get_token(jwt)
    headers = {"Authorization": f"Bearer {token}", "content-type": "application/json"}
    new_entry = client.post(
        "/application/1/history", headers=headers, json=get_history_create_payload()
    )
    assert new_entry.status_code == 201
    # sending get request withouttoken
    rv = client.get("/application/1/history")
    assert rv.status_code == 401


def test_post_request_history_create_method(app, client, session, jwt):
    """Tests the request history create method."""
    token = get_token(jwt)
    headers = {"Authorization": f"Bearer {token}", "content-type": "application/json"}
    new_application = client.post(
        "/application/1/history",
        headers=headers,
        json=get_request_history_create_payload(),
    )
    assert new_application.status_code == 201
    assert new_application.json["applicationStatus"] is None
    assert new_application.json[
        "requestStatus"
    ] == get_request_history_create_payload().get("requestStatus")
    assert new_application.json["submittedBy"] == "client"


def test_get_application_history_with_request(app, client, session, jwt):
    """Get the json request for application /application/{application_id}/history."""
    token = get_token(jwt)
    headers = {"Authorization": f"Bearer {token}", "content-type": "application/json"}
    # Insert one application history and 3 request history, then assert values
    app_history_entry = client.post(
        "/application/1/history",
        headers=headers,
        json=get_history_create_payload(),
    )
    assert app_history_entry.status_code == 201
    req_history_entry_1 = client.post(
        "/application/1/history",
        headers=headers,
        json=get_request_history_create_payload(),
    )
    assert req_history_entry_1.status_code == 201

    req_history_entry_1 = client.post(
        "/application/1/history",
        headers=headers,
        json=get_request_history_create_payload(),
    )
    assert req_history_entry_1.status_code == 201

    req_history_entry_2 = client.post(
        "/application/1/history",
        headers=headers,
        json=get_request_history_create_payload(request_type="Request2"),
    )
    assert req_history_entry_2.status_code == 201

    rv = client.get("/application/1/history", headers=headers)
    assert rv.status_code == 200
    assert isinstance(rv.json, Dict)
    assert isinstance(rv.json["applications"], List)
    assert isinstance(rv.json["requests"], List)
    assert len(rv.json["applications"]) == 1
    # 2 items, 1 with 2 Request1 entries and 1 with 1 Request2 entry.
    assert len(rv.json["requests"]) == 2
    for request_history in rv.json.get("requests"):
        if request_history.get("requestType") == "Request1":
            assert len(request_history.get("items")) == 2
        elif request_history.get("requestType") == "Request2":
            assert len(request_history.get("items")) == 1
