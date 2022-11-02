"""Keycloak Admin implementation for client related operations."""
from typing import Dict

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
        """Get role by role_id."""
        client_id = self.client.get_client_id()
        return self.client.get_request(
            url_path=f"roles-by-id/{group_id}?client={client_id}"
        )

    def get_users(self, **kwargs):
        """Get users under this client with formsflow-reviewer role."""
        client_id = self.client.get_client_id()
        return self.client.get_request(
            url_path=f"clients/{client_id}/roles/formsflow-reviewer/users"
        )

    def update_group(self, group_id: str, dashboard_id_details: Dict):
        """Update keycloak role."""
        client_id = self.client.get_client_id()
        return self.client.update_request(
            url_path=f"roles-by-id/{group_id}?client={client_id}",
            data=dashboard_id_details,
        )
