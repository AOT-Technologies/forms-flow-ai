"""Keycloak implementation for keycloak group related operations."""
from typing import Dict, List

from flask import current_app

from formsflow_api.services import KeycloakAdminAPIService

from .keycloak_admin import KeycloakAdmin


class KeycloakGroupService(KeycloakAdmin):
    """Keycloak implementation for keycloak group related operations."""

    def __init__(self):
        """Initialize client."""
        self.client = KeycloakAdminAPIService()

    def get_analytics_groups(self, page_no: int, limit: int):
        """Get analytics groups."""
        return self.client.get_analytics_groups(page_no, limit)

    def get_group(self, group_id: str):
        """Get group by group_id."""
        return self.client.get_request(url_path=f"groups/{group_id}")

    def get_users(self, **kwargs):
        """Get users under formsflow-reviewer group."""
        response: List[Dict] = []
        group_name = kwargs.get("group_name")
        current_app.logger.debug(
            f"Fetching users from keycloak under {group_name} group..."
        )
        if group_name:
            group = self.client.get_request(url_path=f"group-by-path/{group_name}")
            group_id = group.get("id")
            response = self.client.get_request(url_path=f"groups/{group_id}/members")
        return response

    def update_group(self, group_id: str, dashboard_id_details: Dict):
        """Update group details."""
        return self.client.update_request(
            url_path=f"groups/{group_id}", data=dashboard_id_details
        )

    def get_groups_roles(self, page_no: int, limit: int):
        """Get groups."""
        response = self.client.get_groups(page_no, limit)
        # for data in response:
        #     print(data)
        #     response["description"] = data.get("attributes")
        return response

    def delete_group(self, group_id: str):
        """Delete role by role_id."""
        return self.client.delete_request(url_path=f"groups/{group_id}")
