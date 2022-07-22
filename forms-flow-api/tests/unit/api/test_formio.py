"""Test suit for formio role id cached endpoint."""
from formsflow_api.utils import cache
from formsflow_api.utils.enums import FormioRoles
from tests.utilities.base_test import get_formio_roles, get_token


def test_formio_roles(app, client, session, jwt):
    """Passing case of role API."""
    role_ids_filtered = get_formio_roles()
    cache.set(
        "formio_role_ids",
        role_ids_filtered,
        timeout=0,
    )

    # Requesting from client role
    token = get_token(jwt, role="formsflow-client")
    headers = {"Authorization": f"Bearer {token}", "content-type": "application/json"}
    response = client.get("/formio/roles", headers=headers)

    assert response.status_code == 200
    assert response.json is not None
    assert response.json["form"][0]["roleId"] == 1
    assert response.json["form"][0]["type"] == FormioRoles.CLIENT.name
    assert response.json["form"][1]["type"] == FormioRoles.RESOURCE_ID.name
    assert response.json["form"][1]["roleId"] is None

    # Requesting from reviewer role
    token = get_token(jwt, role="formsflow-reviewer")
    headers = {"Authorization": f"Bearer {token}", "content-type": "application/json"}
    response = client.get("/formio/roles", headers=headers)

    assert response.json["form"][0]["roleId"] == 2
    assert response.json["form"][0]["type"] == FormioRoles.REVIEWER.name
    assert response.json["form"][1]["type"] == FormioRoles.RESOURCE_ID.name
    assert response.json["form"][1]["roleId"] is None

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
