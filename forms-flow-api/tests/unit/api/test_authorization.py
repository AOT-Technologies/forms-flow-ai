"""Test suite for authorization API endpoint."""
import json

from tests.utilities.base_test import factory_auth, get_token


class TestAuthorizationResource:
    """Test suite for the application endpoint."""

    def test_create_authorization(self, app, client, session, jwt):
        """Assert that create authorization returns correct response."""
        token = get_token(jwt)
        headers = {
            "Authorization": f"Bearer {token}",
            "content-type": "application/json",
        }
        auth_payload = {
            "resourceId": "1",
            "resourceDescription": "My Dashboard",
            "roles": ["clerk"],
        }
        response = client.post(
            "/authorizations/dashboard", headers=headers, data=json.dumps(auth_payload)
        )

        assert response.status_code == 200
        assert response.json == auth_payload

        # Create another auth with same resourceId and assert previous one is over written.
        auth_payload = {
            "resourceId": "1",
            "resourceDescription": "My Dashboard",
            "roles": ["clerk", "approver", "supervisor"],
        }
        client.post(
            "/authorizations/dashboard", headers=headers, data=json.dumps(auth_payload)
        )
        get_response = client.get("/authorizations/dashboard", headers=headers)
        assert get_response.status_code == 200
        assert get_response.json[0] == auth_payload

    def test_current_user_authorization(self, app, client, session, jwt):
        """Assert that authorization returns based on the user's role."""
        # 1. Create authorization for clerk role.
        # 2. Check current user with no clerk role for the access
        # 3. Check the current user with clerk role for the access
        factory_auth(
            resource_id="1",
            resource_desc="Test Dashboard",
            auth_type="dashboard",
            roles=["clerk", "approver"],
        )
        factory_auth(
            resource_id="2",
            resource_desc="Test Dashboard 2",
            auth_type="dashboard",
            roles=["clerk"],
        )
        token = get_token(jwt)
        headers = {
            "Authorization": f"Bearer {token}",
            "content-type": "application/json",
        }
        response = client.get("/authorizations/users/dashboard", headers=headers)
        assert response.status_code == 200
        assert len(response.json) == 0

        token = get_token(jwt, roles=["clerk"])
        headers = {
            "Authorization": f"Bearer {token}",
            "content-type": "application/json",
        }
        response = client.get("/authorizations/users/dashboard", headers=headers)
        assert response.status_code == 200
        assert len(response.json) == 2

        token = get_token(jwt, roles=["approver"])
        headers = {
            "Authorization": f"Bearer {token}",
            "content-type": "application/json",
        }
        response = client.get("/authorizations/users/dashboard", headers=headers)
        assert response.status_code == 200
        assert len(response.json) == 1
