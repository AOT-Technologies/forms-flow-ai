"""Test suit for formio role id cached endpoint."""

import jwt as pyjwt
from formsflow_api_utils.utils import cache
from formsflow_api_utils.utils.enums import FormioRoles

from tests.utilities.base_test import get_formio_roles, get_token


def test_formio_roles(app, client, session, jwt):
    """Passing case of role API."""
    role_ids_filtered = get_formio_roles()
    cache.set(
        "formio_role_ids",
        role_ids_filtered,
        timeout=0,
    )
    resource_id = "62cc9223b5cad9348f5880a9"
    cache.set("user_resource_id", resource_id, timeout=0)

    # Requesting from client role
    token = get_token(jwt, role="formsflow-client")
    headers = {"Authorization": f"Bearer {token}", "content-type": "application/json"}
    response = client.get("/formio/roles", headers=headers)

    assert response.status_code == 200
    assert response.json["form"][0]["roleId"] == 1
    assert response.json["form"][0]["type"] == FormioRoles.CLIENT.name
    assert response.json["form"][1]["type"] == FormioRoles.RESOURCE_ID.name
    assert response.json["form"][1]["roleId"] == resource_id
    assert response.headers["x-jwt-token"]
    decoded_token = pyjwt.decode(
        response.headers["x-jwt-token"],
        algorithms="HS256",
        key=app.config["FORMIO_JWT_SECRET"],
    )
    assert decoded_token["form"]["_id"] == resource_id

    # Requesting from reviewer role
    token = get_token(jwt, role="formsflow-reviewer")
    headers = {"Authorization": f"Bearer {token}", "content-type": "application/json"}
    response = client.get("/formio/roles", headers=headers)

    assert response.json["form"][0]["roleId"] == 2
    assert response.json["form"][0]["type"] == FormioRoles.REVIEWER.name
    assert response.json["form"][1]["type"] == FormioRoles.RESOURCE_ID.name
    assert response.json["form"][1]["roleId"] == "62cc9223b5cad9348f5880a9"

    # Requesting from designer role
    cache.set("user_resource_id", "123456789", timeout=0)

    token = get_token(jwt, role="formsflow-designer")
    headers = {"Authorization": f"Bearer {token}", "content-type": "application/json"}
    response = client.get("/formio/roles", headers=headers)

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
