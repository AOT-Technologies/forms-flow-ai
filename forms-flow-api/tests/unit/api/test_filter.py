"""Test suite for Filter API endpoint."""

from tests.utilities.base_test import get_filter_payload, get_token


def test_create_filter(app, client, session, jwt):
    """Test create filter with valid payload."""
    token = get_token(jwt, role="formsflow-reviewer", username="reviewer")
    headers = {"Authorization": f"Bearer {token}", "content-type": "application/json"}
    response = client.post(
        "/filter", headers=headers, json=get_filter_payload(roles=["clerk"])
    )
    assert response.status_code == 201
    assert response.json.get("id") is not None
    assert response.json.get("name") == "Test Task"


def test_get_user_filters(app, client, session, jwt):
    """Test - Get filters based on user role."""
    token = get_token(jwt, role="formsflow-reviewer", username="reviewer")
    headers = {"Authorization": f"Bearer {token}", "content-type": "application/json"}
    # Create filter for clerk role
    response = client.post(
        "/filter",
        headers=headers,
        json=get_filter_payload(name="Clerk Task", roles=["clerk"]),
    )
    assert response.status_code == 201
    # Create filter for reviewer role
    response = client.post(
        "/filter",
        headers=headers,
        json=get_filter_payload(name="Reviewer Task", roles=["formsflow-reviewer"]),
    )
    assert response.status_code == 201
    # Test '/filter/user' endpoint with reviewer token
    # Since reviewer created both filters response will include both.
    response = client.get("/filter/user", headers=headers)
    assert response.status_code == 200
    assert len(response.json) == 2
    assert response.json[0].get("name") == "Clerk Task"
    assert response.json[1].get("name") == "Reviewer Task"


def test_filter_update(app, client, session, jwt):
    """Test filter update with valid payload."""
    token = get_token(jwt, role="formsflow-reviewer", username="reviewer")
    headers = {"Authorization": f"Bearer {token}", "content-type": "application/json"}
    response = client.post(
        "/filter",
        headers=headers,
        json=get_filter_payload(name="Clerk Task", roles=["clerk"]),
    )
    assert response.status_code == 201
    filter_id = response.json.get("id")
    payload = {"description": "Clerk Task"}
    response = client.put(f"/filter/{filter_id}", headers=headers, json=payload)
    assert response.status_code == 200
    assert response.json.get("description") == "Clerk Task"


def test_filter_delete(app, client, session, jwt):
    """Test filter delete."""
    token = get_token(jwt, role="formsflow-reviewer", username="reviewer")
    headers = {"Authorization": f"Bearer {token}", "content-type": "application/json"}
    response = client.post(
        "/filter", headers=headers, json=get_filter_payload(roles=["clerk"])
    )
    assert response.status_code == 201
    filter_id = response.json.get("id")
    response = client.delete(f"/filter/{filter_id}", headers=headers)
    assert response.status_code == 200
    assert response.json == "Deleted"
    response = client.get(f"/filter/{filter_id}", headers=headers)
    assert response.status_code == 400


def test_create_filter_current_user_task(app, client, session, jwt):
    """Test create filter for current user's tasks."""
    token = get_token(jwt, role="formsflow-reviewer", username="reviewer")
    headers = {"Authorization": f"Bearer {token}", "content-type": "application/json"}
    filter_payload = get_filter_payload(name="My Tasks")
    filter_payload.update({"isMyTasksEnabled": True})
    response = client.post("/filter", headers=headers, json=filter_payload)
    assert response.status_code == 201
    assert response.json.get("id") is not None
    assert response.json.get("name") == "My Tasks"
    assert (
        response.json.get("criteria", {}).get("assigneeExpression")
        == "${ currentUser() }"
    )


def test_create_filter_current_user_group_task(app, client, session, jwt):
    """Test create filter based on the roles of the currently logged-in user."""
    token = get_token(jwt, role="formsflow-reviewer", username="reviewer")
    headers = {"Authorization": f"Bearer {token}", "content-type": "application/json"}
    filter_payload = get_filter_payload(name="My Group Tasks")
    filter_payload.update({"isTasksForCurrentUserGroupsEnabled": True})
    response = client.post("/filter", headers=headers, json=filter_payload)
    assert response.status_code == 201
    assert response.json.get("id") is not None
    assert response.json.get("name") == "My Group Tasks"
    assert (
        response.json.get("criteria", {}).get("candidateGroupsExpression")
        == "${currentUserGroups()}"
    )
