"""Keycloak Admin implementation for client related operations."""
from typing import Dict

from flask import current_app

from formsflow_api.services import KeycloakAdminAPIService

from .keycloak_admin import KeycloakAdmin


class KeycloakClientService(KeycloakAdmin):
    """Keycloak Admin implementation for client related operations."""

    def __init__(self):
        """Initialize client."""
        self.client = KeycloakAdminAPIService()

    def get_analytics_groups(self, page_no: int, limit: int):
        """Get analytics roles."""
        return self.client.get_analytics_roles(page_no, limit)

    def get_group(self, group_id: str):
        """Get role by role name."""
        client_id = self.client.get_client_id()
        response = self.client.get_request(
            url_path=f"clients/{client_id}/roles/{group_id}"
        )
        response["id"] = response.get("name", None)
        return response

    def get_users(self, **kwargs):
        """Get users under this client with formsflow-reviewer role."""
        current_app.logger.debug(
            "Fetching client based users from keycloak with formsflow-reviewer role..."
        )
        client_id = self.client.get_client_id()
        return self.client.get_request(
            url_path=f"clients/{client_id}/roles/formsflow-reviewer/users"
        )

    def update_group(self, group_id: str, data: Dict):
        """Update keycloak role by role name."""
        client_id = self.client.get_client_id()
        return self.client.update_request(
            url_path=f"clients/{client_id}/roles/{group_id}",
            data=data,
        )

    def get_groups_roles(self, search: str, sort_order: str):
        """Get roles."""
        response = self.client.get_roles(search)
        for role in response:
            role["id"] = role.get("name")
            role["description"] = role.get("description")
        return self.sort_results(response, sort_order)

    def delete_group(self, group_id: str):
        """Delete role by role name."""
        client_id = self.client.get_client_id()
        return self.client.delete_request(
            url_path=f"clients/{client_id}/roles/{group_id}"
        )

    def create_group_role(self, data: Dict):
        """Create role."""
        client_id = self.client.get_client_id()
        response = self.client.create_request(
            url_path=f"clients/{client_id}/roles", data=data
        )
        role_name = response.headers["Location"].split("/")[-1]
        return {"id": role_name}
