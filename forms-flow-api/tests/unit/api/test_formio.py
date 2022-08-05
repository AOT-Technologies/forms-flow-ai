"""Test suit for formio role id cached endpoint."""
from formsflow_api_utils.utils import cache
from tests.utilities.base_test import get_formio_roles, get_token


def test_formio_roles(app, client, session, jwt):
    """Passing case of role API."""
    role_ids_filtered = get_formio_roles()
    cache.set(
        "formio_role_ids",
        role_ids_filtered,
        timeout=0,
    )
    token = get_token(jwt, role="formsflow-client")
    headers = {"Authorization": f"Bearer {token}", "content-type": "application/json"}

    response = client.get("/formio/roles", headers=headers)
    assert response.status_code == 200
    assert response.json is not None
    assert response.json["roles"][0]["id"] == 1
