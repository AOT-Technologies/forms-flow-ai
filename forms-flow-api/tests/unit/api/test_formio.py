"""Test suit for formio role id cached endpoint."""

from unittest.mock import MagicMock

import jwt as pyjwt
from formsflow_api_utils.utils import (
    CREATE_DESIGNS,
    CREATE_SUBMISSIONS,
    MANAGE_TASKS,
    Cache,
)
from formsflow_api_utils.utils.enums import FormioRoles

from tests.utilities.base_test import get_formio_roles, get_token


def get_roles(client, headers):
    """Get formio roles."""
    return client.get("/formio/roles", headers=headers)


def test_formio_roles(app, client, session, jwt, mock_redis_client):
    """Passing case of role API."""
    role_ids_filtered = get_formio_roles()
    Cache.set(
        "formio_role_ids",
        role_ids_filtered,
        timeout=0,
    )
    resource_id = "62cc9223b5cad9348f5880a9"
    Cache.set("user_resource_id", resource_id, timeout=0)

    # Requesting from client role
    token = get_token(jwt, role=CREATE_SUBMISSIONS, roles=["/formsflow-client"])
    headers = {"Authorization": f"Bearer {token}", "content-type": "application/json"}
    client = MagicMock()
    payload = {
            "external": True,
            "form": {
                "_id": "62cc9223b5cad9348f5880a9"
            },
            "user": {
                "_id": "test",
                "roles": [
                    "65f808c6d5af8b9fccc9c330",
                    "65f808c8d5af8b9fccc9c35b"
                ],
                "customRoles": ["/formsflow-client"]
            }
    }
    mock_jwt_token = pyjwt.encode(payload, app.config["FORMIO_JWT_SECRET"], algorithm="HS256")

    # Mock response
    mock_response = MagicMock()
    mock_response.status_code = 200
    mock_response.json = {"form": []}
    mock_response.headers = {"x-jwt-token": mock_jwt_token}
    client.get.return_value = mock_response

    response = get_roles(client, headers)

    assert response.status_code == 200
    assert response.json["form"] == []
    assert response.headers["x-jwt-token"]
    decoded_token = pyjwt.decode(
        response.headers["x-jwt-token"],
        algorithms="HS256",
        key=app.config["FORMIO_JWT_SECRET"],
    )
    assert decoded_token["form"]["_id"] == resource_id
    assert decoded_token["user"]["customRoles"] == ["/formsflow-client"]

    # Requesting from reviewer role
    token = get_token(jwt, role=MANAGE_TASKS)
    headers = {"Authorization": f"Bearer {token}", "content-type": "application/json"}
    response = get_roles(client, headers)

    assert response.status_code == 200
    assert response.json["form"] == []

    # Requesting from designer role
    Cache.set("user_resource_id", "123456789", timeout=0)

    token = get_token(jwt, role=CREATE_DESIGNS)
    headers = {"Authorization": f"Bearer {token}", "content-type": "application/json"}
    # Mock response
    mock_response = MagicMock()
    mock_response.status_code = 200
    mock_response.json = {
        "form": [
            {"roleId": 1, "type": "CLIENT"},
            {"roleId": 2, "type": "REVIEWER"},
            {"roleId": 3, "type": "DESIGNER"},
            {"roleId": "123456789", "type": "RESOURCE_ID"}
        ]
    }
    client.get.return_value = mock_response

    response = get_roles(client, headers)

    assert response.json["form"][0]["roleId"] == 1
    assert response.json["form"][0]["type"] == FormioRoles.CLIENT.name
    assert response.json["form"][3]["type"] == FormioRoles.RESOURCE_ID.name
    assert response.json["form"][3]["roleId"] == "123456789"

    assert response.json["form"][1]["roleId"] == 2
    assert response.json["form"][1]["type"] == FormioRoles.REVIEWER.name
    assert response.json["form"][3]["type"] == FormioRoles.RESOURCE_ID.name
    assert response.json["form"][3]["roleId"] == "123456789"

    assert response.json["form"][2]["roleId"] == 3
    assert response.json["form"][2]["type"] == FormioRoles.DESIGNER.name
    assert response.json["form"][3]["type"] == FormioRoles.RESOURCE_ID.name
    assert response.json["form"][3]["roleId"] == "123456789"
