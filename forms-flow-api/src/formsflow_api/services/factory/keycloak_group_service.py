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

    def update_group(self, group_id: str, data: Dict):
        """Update group details."""
        data = self.add_description(data)
        return self.client.update_request(url_path=f"groups/{group_id}", data=data)

    def get_groups_roles(self, search: str, sort_order: str):
        """Get groups."""
        response = self.client.get_groups()
        return self.sort_results(response, sort_order)

    def delete_group(self, group_id: str):
        """Delete role by role_id."""
        return self.client.delete_request(url_path=f"groups/{group_id}")

    def create_group_role(self, data: Dict):
        """Create group."""
        data = self.add_description(data)
        return self.client.create_request(url_path="groups", data=data)

    def add_description(self, data: Dict):
        """Group based doesn't have description field.

        Description is added to attributes field.
        """
        dict_description = {}
        dict_description["description"] = [data.get("description")]
        data["attributes"] = dict_description
        data.pop("description", None)
        return data
