"""Test suite for keycloak roles API endpoint."""

from tests.utilities.base_test import get_token


class TestKeycloakRolesResource:
    """Test suite for the keycloak roles APIs."""

    def test_keycloak_roles_list(self, app, client, session, jwt):
        """Test roles list API."""
        token = get_token(jwt)
        headers = {
            "Authorization": f"Bearer {token}",
            "content-type": "application/json",
        }
        rv = client.get("/roles", headers=headers)
        assert rv.status_code == 200

    def test_keycloak_role_crud(self, app, client, session, jwt):
        """Test role CRUD APIs."""
        token = get_token(jwt)
        headers = {
            "Authorization": f"Bearer {token}",
            "content-type": "application/json",
        }
        # Create new user group.
        data = {"name": "new-test-group", "description": "Group"}
        rv = client.post("/roles", headers=headers, json=data)
        assert rv.status_code == 201
        assert rv.json.get("id") is not None
        id = rv.json.get("id")
        # Update group.
        data = {"name": "new-test-group", "description": "Test Group"}
        rv = client.put(f"/roles/{id}", headers=headers, json=data)
        assert rv.status_code == 200
        # Get group by id.
        rv = client.get(f"/roles/{id}", headers=headers)
        assert rv.json.get("description") == "Test Group"
        # Delete group.
        rv = client.delete(f"/roles/{id}", headers=headers)
        rv = client.get(f"/roles/{id}", headers=headers)
        assert rv.status_code == 400
