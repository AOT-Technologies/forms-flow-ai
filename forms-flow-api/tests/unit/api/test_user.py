"""Test suite for keycloak user API endpoint."""

# from tests import skip_in_ci
from tests.utilities.base_test import get_locale_update_valid_payload, get_token


class TestKeycloakUserServiceResource:
    """Test suite for the keycloak user service APIs."""

    # @skip_in_ci
    def test_successful_user_locale_update(self, app, client, session, jwt):
        """Assert that API /user when passed with valid payload returns 200 status code."""
        token = get_token(jwt, username="formsflow-reviewer")
        headers = {
            "Authorization": f"Bearer {token}",
            "content-type": "application/json",
        }
        rv = client.put(
            "/user/locale", headers=headers, json=get_locale_update_valid_payload()
        )
        assert rv.status_code == 200

    def test_unsuccessful_user_locale_update(self, app, client, session, jwt):
        """Assert that API/user when passed with invalid payload return 400 status code."""
        token = get_token(jwt, username="formsflow-reviewer")
        headers = {
            "Authorization": f"Bearer {token}",
            "content-type": "application/json",
        }
        rv = client.put("/user/locale", headers=headers, json={})
        assert rv.status_code == 400


def test_keycloak_users_list(app, client, session, jwt):
    """Test users list API with formsflow-reviewer group."""
    token = get_token(jwt)
    headers = {"Authorization": f"Bearer {token}", "content-type": "application/json"}
    rv = client.get("/user?memberOfGroup=formsflow/formsflow-reviewer", headers=headers)
    assert rv.status_code == 200
    users_list = rv.json
    for user in users_list.get("data"):
        assert user.get("role") is None

    user_list_with_role = client.get(
        "/user?memberOfGroup=formsflow/formsflow-reviewer&role=true", headers=headers
    )
    assert user_list_with_role.status_code == 200
    users_list = user_list_with_role.json.get("data")
    for user in users_list:
        assert user.get("role") is not None
        assert type(user.get("role")) == list
        assert len(user["role"]) != 0

    # Test without specifying group/role
    realm_users = client.get("/user?pageNo=1&limit=5&role=true", headers=headers)
    assert realm_users.status_code == 200
    for user in realm_users.json.get("data"):
        assert user.get("role") is not None
        assert type(user.get("role")) == list
        assert len(user["role"]) != 0
    realm_users = client.get("/user?role=true", headers=headers)
    assert realm_users.status_code == 400


def test_keycloak_users_list_invalid_group(app, client, session, jwt):
    """Test users list API with invalid group."""
    token = get_token(jwt)
    headers = {"Authorization": f"Bearer {token}", "content-type": "application/json"}
    rv = client.get("/user?memberOfGroup=test123", headers=headers)
    assert rv.status_code == 400
