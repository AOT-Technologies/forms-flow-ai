"""Test suite for Theme API endpoint."""

import json

from formsflow_api_utils.utils import ADMIN

from tests.utilities.base_test import get_token

payload = {
    "logoName": "logo 2",
    "type": "url",
    "logoData": "61ef7aa2555663dsef",
    "applicationTitle": "Public Plandsfsdf",
    "themeJson": {"sample": "test123sdfsfsdf"},
}


def test_create_theme(app, client, session, jwt):
    """Test create theme with valid payload."""
    token = get_token(jwt, role=ADMIN, username="admin")
    headers = {"Authorization": f"Bearer {token}", "content-type": "application/json"}
    response = client.post("/themes", headers=headers, data=json.dumps(payload))
    assert response.status_code == 201


def test_get_theme(app, client, session, jwt):
    """Testing Theme customization get endpoint."""
    token = get_token(jwt, role=ADMIN, username="admin")
    headers = {"Authorization": f"Bearer {token}", "content-type": "application/json"}
    response = client.post(
        "/themes",
        headers=headers,
        data=json.dumps(payload),
    )
    assert response.status_code == 201

    response = client.get("/themes")
    assert response.status_code == 200


def test_theme_update(app, client, session, jwt):
    """Testing Theme customization update endpoint."""
    token = get_token(jwt, role=ADMIN, username="admin")
    headers = {"Authorization": f"Bearer {token}", "content-type": "application/json"}
    response = client.post(
        "/themes",
        headers=headers,
        data=json.dumps(payload),
    )
    assert response.status_code == 201

    response = client.get("/themes", headers=headers)
    assert response.status_code == 200
    update_payload = {
        "type": "base64",
        "logoData": "61ef7aa25556eeffna",
    }
    rv = client.put("/themes", headers=headers, data=json.dumps(update_payload))
    assert rv.status_code == 200
