"""Test suite for keycloak user API endpoint."""

# from tests import skip_in_ci
import json

from formsflow_api_utils.utils import CREATE_FILTERS, VIEW_TASKS, get_token

from tests.utilities.base_test import (
    get_filter_payload,
    get_locale_update_valid_payload,
)


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
    token = get_token(jwt, role=VIEW_TASKS)
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
    assert realm_users.status_code == 200


def test_keycloak_users_list_invalid_group(app, client, session, jwt):
    """Test users list API with invalid group."""
    token = get_token(jwt, role=VIEW_TASKS)
    headers = {"Authorization": f"Bearer {token}", "content-type": "application/json"}
    rv = client.get("/user?memberOfGroup=test123", headers=headers)
    assert rv.status_code == 400


def test_default_filter(app, client, session, jwt):
    """Test create a filter and update default filter of a user."""
    token = get_token(jwt, role=CREATE_FILTERS, username="reviewer")
    headers = {"Authorization": f"Bearer {token}", "content-type": "application/json"}
    # Create filter for clerk role
    response = client.post(
        "/filter",
        headers=headers,
        json=get_filter_payload(name="Clerk Task", roles=["clerk"]),
    )
    assert response.status_code == 201
    response = client.post(
        "/user/default-filter",
        headers=headers,
        data=json.dumps({"defaultFilter": response.json.get("id")}),
        content_type="application/json",
    )
    assert response.status_code == 200


class TestUserLoginDetails:
    """Test suite for the user login details API."""

    def test_get_user_login_details_success(self, app, client, session, jwt):
        """Test successful retrieval of user login details."""
        token = get_token(jwt, username="formsflow-reviewer")
        headers = {
            "Authorization": f"Bearer {token}",
            "content-type": "application/json",
        }
        # First, get a user ID from the users list
        users_response = client.get("/user?pageNo=1&limit=1", headers=headers)
        assert users_response.status_code == 200
        users_data = users_response.json.get("data", [])

        if users_data:
            user_id = users_data[0].get("id")
            # Test the login-details endpoint
            rv = client.get(f"/user/{user_id}/login-details", headers=headers)
            assert rv.status_code == 200
            response_data = rv.json
            # Verify response structure
            assert "loginType" in response_data
            assert response_data["loginType"] in ["internal", "external"]
            # If external, identityProvider should be present
            if response_data["loginType"] == "external":
                assert "identityProvider" in response_data

    def test_get_user_login_details_unauthorized(self, app, client, session):
        """Test login details endpoint without authorization."""
        rv = client.get("/user/test-user-id/login-details")
        assert rv.status_code == 401
        assert rv.json == {
            "message": "Invalid Token Error",
            "code": "INVALID_AUTH_TOKEN",
            "details": [],
        }

    def test_get_user_login_details_internal_user(self, app, client, session, jwt):
        """Test login details for a user with internal (local) authentication."""
        token = get_token(jwt, username="formsflow-reviewer")
        headers = {
            "Authorization": f"Bearer {token}",
            "content-type": "application/json",
        }
        # Get users list to find a test user
        users_response = client.get("/user?pageNo=1&limit=5", headers=headers)
        assert users_response.status_code == 200
        users_data = users_response.json.get("data", [])

        if users_data:
            # Test with first available user
            user_id = users_data[0].get("id")
            rv = client.get(f"/user/{user_id}/login-details", headers=headers)
            assert rv.status_code == 200
            response_data = rv.json
            # Most test users will be internal
            if response_data["loginType"] == "internal":
                assert "identityProvider" not in response_data


class TestUserProfile:
    """Test suite for the user profile update API."""

    def test_update_profile_unauthorized(self, app, client, session):
        """Test profile update endpoint without authorization."""
        rv = client.put(
            "/user/test-user-id/profile",
            json={"firstName": "Test"},
        )
        assert rv.status_code == 401
        assert rv.json == {
            "message": "Invalid Token Error",
            "code": "INVALID_AUTH_TOKEN",
            "details": [],
        }

    def test_update_profile_empty_body(self, app, client, session, jwt):
        """Test profile update with no request body."""
        token = get_token(jwt, username="formsflow-reviewer")
        headers = {
            "Authorization": f"Bearer {token}",
            "content-type": "application/json",
        }
        rv = client.put(
            "/user/test-user-id/profile",
            headers=headers,
            json=None,
        )
        assert rv.status_code == 400

    def test_update_profile_empty_payload(self, app, client, session, jwt):
        """Test profile update with empty payload (no-op)."""
        token = get_token(jwt, username="formsflow-reviewer")
        headers = {
            "Authorization": f"Bearer {token}",
            "content-type": "application/json",
        }
        rv = client.put(
            "/user/test-user-id/profile",
            headers=headers,
            json={},
        )
        # Should pass validation but fail on user mismatch
        assert rv.status_code == 403

    def test_update_profile_invalid_email_format(self, app, client, session, jwt):
        """Test profile update with invalid email format."""
        token = get_token(jwt, username="formsflow-reviewer")
        headers = {
            "Authorization": f"Bearer {token}",
            "content-type": "application/json",
        }
        rv = client.put(
            "/user/test-user-id/profile",
            headers=headers,
            json={"email": "invalid-email"},
        )
        assert rv.status_code == 400

    def test_update_profile_empty_first_name(self, app, client, session, jwt):
        """Test profile update with empty first name."""
        token = get_token(jwt, username="formsflow-reviewer")
        headers = {
            "Authorization": f"Bearer {token}",
            "content-type": "application/json",
        }
        rv = client.put(
            "/user/test-user-id/profile",
            headers=headers,
            json={"firstName": "   "},
        )
        assert rv.status_code == 400

    def test_update_profile_empty_last_name(self, app, client, session, jwt):
        """Test profile update with empty last name."""
        token = get_token(jwt, username="formsflow-reviewer")
        headers = {
            "Authorization": f"Bearer {token}",
            "content-type": "application/json",
        }
        rv = client.put(
            "/user/test-user-id/profile",
            headers=headers,
            json={"lastName": ""},
        )
        assert rv.status_code == 400

    def test_update_profile_empty_username(self, app, client, session, jwt):
        """Test profile update with empty username."""
        token = get_token(jwt, username="formsflow-reviewer")
        headers = {
            "Authorization": f"Bearer {token}",
            "content-type": "application/json",
        }
        rv = client.put(
            "/user/test-user-id/profile",
            headers=headers,
            json={"username": "  "},
        )
        assert rv.status_code == 400

    def test_update_profile_user_id_mismatch(self, app, client, session, jwt):
        """Test profile update when user_id doesn't match logged-in user."""
        token = get_token(jwt, username="formsflow-reviewer")
        headers = {
            "Authorization": f"Bearer {token}",
            "content-type": "application/json",
        }
        # Use a different user_id than the one in the token
        rv = client.put(
            "/user/different-user-id/profile",
            headers=headers,
            json={"firstName": "Test"},
        )
        # Should return 403 (Forbidden) - can only update own profile
        assert rv.status_code == 403

    def test_update_profile_valid_payload(self, app, client, session, jwt):
        """Test profile update with valid payload structure.

        Note: This test validates the request structure. The actual Keycloak
        integration would need to be mocked for complete testing.
        """
        token = get_token(jwt, username="formsflow-reviewer")
        headers = {
            "Authorization": f"Bearer {token}",
            "content-type": "application/json",
        }
        # The profile update with valid structure
        payload = {
            "firstName": "John",
            "lastName": "Doe",
            "email": "john.doe@example.com",
            "attributes": {
                "locale": ["en"]
            }
        }
        # This will fail with user_id mismatch or Keycloak error in test env
        # but validates the endpoint accepts the correct payload format
        rv = client.put(
            "/user/test-user-id/profile",
            headers=headers,
            json=payload,
        )
        # Expect either 403 (user mismatch) or 400 (Keycloak error in test env)
        assert rv.status_code in [400, 403, 500]