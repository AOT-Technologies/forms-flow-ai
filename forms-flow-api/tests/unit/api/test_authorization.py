"""Test suite for authorization API endpoint."""

import json

from tests.utilities.base_test import factory_auth, get_token


class TestAuthorizationResource:
    """Test suite for the application endpoint."""

    def test_create_dashboard_authorization(self, app, client, session, jwt):
        """Assert that create authorization returns correct response."""
        token = get_token(jwt)
        headers = {
            "Authorization": f"Bearer {token}",
            "content-type": "application/json",
        }
        auth_payload = {
            "resourceId": "1",
            "resourceDetails": {"name": "My Dashboard"},
            "roles": ["clerk"],
        }
        auth_response = {**auth_payload, "userName": None}

        response = client.post(
            "/authorizations/dashboard", headers=headers, data=json.dumps(auth_payload)
        )

        assert response.status_code == 200
        assert response.json == auth_response

        # Create another auth with same resourceId and assert previous one is over written.
        auth_payload = {
            "resourceId": "1",
            "resourceDetails": {"name": "My Dashboard"},
            "roles": ["clerk", "approver", "supervisor"],
        }
        auth_response = {**auth_payload, "userName": None}
        client.post(
            "/authorizations/dashboard", headers=headers, data=json.dumps(auth_payload)
        )

        get_response = client.get("/authorizations/dashboard", headers=headers)
        assert get_response.status_code == 200
        assert get_response.json[0] == auth_response

    def test_current_user_dashboard_authorization(self, app, client, session, jwt):
        """Assert that authorization returns based on the user's role."""
        # 1. Create authorization for clerk role.
        # 2. Check current user with no clerk role for the access
        # 3. Check the current user with clerk role for the access
        factory_auth(
            resource_id="1",
            resource_details={"name": "Test Dashboard"},
            auth_type="dashboard",
            roles=["clerk", "approver"],
        )

        factory_auth(
            resource_id="2",
            resource_details={"name": "Test Dashboard 2"},
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

    def test_create_filter_and_authorization(self, app, client, session, jwt):
        """Assert that create authorization returns correct response."""
        token = get_token(jwt)
        headers = {
            "Authorization": f"Bearer {token}",
            "content-type": "application/json",
        }
        auth_payload = {
            "resourceId": "1",
            "resourceDetails": {"name": "Clerk Filter", "conditions": {}},
            "roles": ["clerk"],
        }
        auth_response = {**auth_payload, "userName": None}
        response = client.post(
            "/authorizations/filter", headers=headers, data=json.dumps(auth_payload)
        )

        assert response.status_code == 200
        assert response.json == auth_response

        # Create another auth with same resourceId and assert previous one is over written.
        auth_payload = {
            "resourceId": "1",
            "resourceDetails": {"name": "Clerk Filter 2", "conditions": {}},
            "roles": ["clerk", "approver", "supervisor"],
        }
        auth_response = {**auth_payload, "userName": None}
        client.post(
            "/authorizations/filter", headers=headers, data=json.dumps(auth_payload)
        )
        get_response = client.get("/authorizations/filter", headers=headers)

        assert get_response.status_code == 200
        assert get_response.json[0] == auth_response

    def test_create_form_authorization(self, app, client, session, jwt):
        """Assert that create formid authorization returns correct response."""
        token = get_token(jwt)
        headers = {
            "Authorization": f"Bearer {token}",
            "content-type": "application/json",
        }
        auth_payload = {
            "resourceId": "1234",
            "resourceDetails": {},
            "roles": ["/formsflow/formsflow-reviewer"],
        }
        auth_response = {**auth_payload, "userName": None}
        response = client.post(
            "/authorizations/form", headers=headers, data=json.dumps(auth_payload)
        )

        assert response.status_code == 200
        assert response.json == auth_response

    def test_form_authorization_list(self, app, client, session, jwt):
        """Assert formid authorization list API when passed with valid token returns 200 status code."""
        token = get_token(jwt)
        headers = {
            "Authorization": f"Bearer {token}",
            "content-type": "application/json",
        }

        response = client.get("/authorizations/form", headers=headers)
        assert response.status_code == 200

    def test_current_user_form_authorization(self, app, client, session, jwt):
        """Assert that formid authorization returns based on the user's role."""
        factory_auth(
            resource_id="1234",
            resource_details={},
            auth_type="form",
            roles=["formsflow-reviewer"],
        )
        factory_auth(
            resource_id="12345",
            resource_details={},
            auth_type="form",
            roles=["formsflow-approver"],
        )

        token = get_token(jwt)
        headers = {
            "Authorization": f"Bearer {token}",
            "content-type": "application/json",
        }

        response = client.get("/authorizations/users/form", headers=headers)
        assert response.status_code == 200
        assert len(response.json) == 0

        token = get_token(jwt, roles=["formsflow-reviewer"])
        headers = {
            "Authorization": f"Bearer {token}",
            "content-type": "application/json",
        }
        response = client.get("/authorizations/users/form", headers=headers)
        assert response.status_code == 200
        assert len(response.json) == 1
