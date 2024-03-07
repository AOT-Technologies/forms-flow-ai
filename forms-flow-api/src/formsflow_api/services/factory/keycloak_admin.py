"""Keycloak Admin abstract interface."""

from abc import ABC, abstractmethod
from typing import Dict, List


class KeycloakAdmin(ABC):
    """Keycloak Admin abstract interface."""

    @abstractmethod
    def get_analytics_groups(self, page_no: int, limit: int):
        """Get analytics groups."""
        raise NotImplementedError("Method not implemented")

    @abstractmethod
    def get_group(self, group_id: str):
        """Get group by group_id."""
        raise NotImplementedError("Method not implemented")

    @abstractmethod
    def update_group(self, group_id: str, data: Dict):
        """Update group."""
        raise NotImplementedError("Method not implemented")

    @abstractmethod
    def get_users(  # pylint: disable-msg=too-many-arguments
        self,
        page_no: int,
        limit: int,
        role: bool,
        group_name: str,
        count: bool,
        search: str,
    ):
        """Get users."""
        raise NotImplementedError("Method not implemented")

    @abstractmethod
    def get_groups_roles(self, search: str, sort_order: str):
        """Get groups."""
        raise NotImplementedError("Method not implemented")

    @abstractmethod
    def delete_group(self, group_id: str):
        """Delete group by group_id."""
        raise NotImplementedError("Method not implemented")

    @abstractmethod
    def create_group_role(self, data: Dict):
        """Create group/role."""
        raise NotImplementedError("Method not implemented")

    @abstractmethod
    def add_user_to_group_role(self, user_id: str, group_id: str, payload: Dict):
        """Add user to role / group."""
        raise NotImplementedError("Method not implemented")

    @abstractmethod
    def remove_user_from_group_role(
        self, user_id: str, group_id: str, payload: Dict = None
    ):
        """Remove user to role / group."""
        raise NotImplementedError("Method not implemented")

    @abstractmethod
    def search_realm_users(  # pylint: disable-msg=too-many-arguments
        self, search: str, page_no: int, limit: int, role: bool, count: bool
    ):
        """Get users in a realm."""
        raise NotImplementedError("Method not implemented")

    def sort_results(self, data: List, sort_order: str):
        """Sort results by name."""
        if sort_order == "asc":
            return sorted(
                data, key=lambda k: k["name"].lower() if k.get("name") else ""
            )
        return sorted(
            data, key=lambda k: k["name"].lower() if k.get("name") else "", reverse=True
        )
