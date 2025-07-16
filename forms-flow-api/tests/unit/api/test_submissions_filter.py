"""Test suite for analyze submissions filter APIs."""

from formsflow_api_utils.utils import (
    ANALYZE_SUBMISSIONS_VIEW,
    get_token,
)


def filter_payload():
    """Payload for analyze submssions filter."""
    return {
        "parentFormId": "685bc0c99135c75802703046",
        "variables": [
            {
                "key": "applicationId",
                "label": "Submission Id",
                "name": "applicationId",
                "isChecked": True,
                "sortOrder": 1,
                "isFormVariable": False
            },
            {
                "key": "submitterName",
                "label": "Submitter Name",
                "name": "submitterName",
                "isChecked": True,
                "sortOrder": 2,
                "isFormVariable": False
            }
        ]
    }


def test_create_analyze_submissions_filter(app, client, session, jwt):
    """Test create analyze submissions filter."""
    token = get_token(jwt, role=ANALYZE_SUBMISSIONS_VIEW, username="reviewer")
    headers = {"Authorization": f"Bearer {token}", "content-type": "application/json"}
    # Test filter create api with valid payload
    response = client.post(
        "/submissions-filter", headers=headers, json=filter_payload()
    )
    assert response.status_code == 201
    assert response.json.get("id") is not None
    # Test filter create api with invalid payload
    payload = filter_payload()
    payload.pop("parentFormId")
    response = client.post(
        "/submissions-filter", headers=headers, json=payload
    )
    assert response.status_code == 400
    # Test filter create api with invalid token
    token = get_token(jwt, username="reviewer")
    headers = {"Authorization": f"Bearer {token}", "content-type": "application/json"}
    response = client.post(
        "/submissions-filter", headers=headers, json=filter_payload()
    )
    assert response.status_code == 401


def test_get_analyze_submissions_filter_list(app, client, session, jwt):
    """Test analyze submissions filter list."""
    token = get_token(jwt, role=ANALYZE_SUBMISSIONS_VIEW, username="reviewer")
    headers = {"Authorization": f"Bearer {token}", "content-type": "application/json"}
    # Test filter list api with no entries
    response = client.get("/submissions-filter", headers=headers)
    assert response.json == []
    response = client.post(
        "/submissions-filter", headers=headers, json=filter_payload()
    )
    assert response.status_code == 201
    assert response.json.get("id") is not None
    # Test filter list api with valid entries
    response = client.get("/submissions-filter", headers=headers)
    assert response.json != []
    assert response.json[0].get("id") is not None


def test_get_analyze_submissions_filter_by_id(app, client, session, jwt):
    """Test analyze submissions filter by id."""
    token = get_token(jwt, role=ANALYZE_SUBMISSIONS_VIEW, username="reviewer")
    headers = {"Authorization": f"Bearer {token}", "content-type": "application/json"}
    # Test get filter by id with invalid filter id
    response = client.get("/submissions-filter/123", headers=headers)
    assert response.status_code == 404
    response = client.post(
        "/submissions-filter", headers=headers, json=filter_payload()
    )
    assert response.status_code == 201
    assert response.json.get("id") is not None
    filter_id = response.json.get("id")
    # Test get filter by id with valid filter id
    response = client.get(f"/submissions-filter/{filter_id}", headers=headers)
    assert response.status_code == 200
    assert response.json.get("parentFormId") == "685bc0c99135c75802703046"


def test_delete_analyze_submissions_filter_by_id(app, client, session, jwt):
    """Test analyze submissions filter by id."""
    token = get_token(jwt, role=ANALYZE_SUBMISSIONS_VIEW, username="reviewer")
    headers = {"Authorization": f"Bearer {token}", "content-type": "application/json"}
    response = client.post(
        "/submissions-filter", headers=headers, json=filter_payload()
    )
    assert response.status_code == 201
    assert response.json.get("id") is not None
    filter_id = response.json.get("id")
    response = client.delete(f"/submissions-filter/{filter_id}", headers=headers)
    assert response.status_code == 200
    response = client.get(f"/submissions-filter/{filter_id}", headers=headers)
    assert response.status_code == 404
