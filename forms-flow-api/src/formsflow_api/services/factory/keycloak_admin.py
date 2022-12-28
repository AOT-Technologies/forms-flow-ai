"""Keycloak Admin abstract interface."""

from abc import ABC, abstractmethod
from typing import Dict, List


class KeycloakAdmin(ABC):
    """Keycloak Admin abstract interface."""

    @abstractmethod
    def get_analytics_groups(self, page_no: int, limit: int):
        """Get analytics groups."""

    @abstractmethod
    def get_group(self, group_id: str):
        """Get group by group_id."""

    @abstractmethod
    def update_group(self, group_id: str, data: Dict):
        """Update group."""

    @abstractmethod
    def get_users(self, **kwargs):
        """Get users."""

    @abstractmethod
    def get_groups_roles(self, search: str, sort_order: str):
        """Get groups."""

    @abstractmethod
    def delete_group(self, group_id: str):
        """Delete group by group_id."""

    @abstractmethod
    def create_group_role(self, data: Dict):
        """Create group/role."""

    def sort_results(self, data: List, sort_order: str):
        """Sort results by name."""
        if sort_order == "asc":
            return sorted(
                data, key=lambda k: k["name"].lower() if k.get("name") else ""
            )
        return sorted(
            data, key=lambda k: k["name"].lower() if k.get("name") else "", reverse=True
        )
