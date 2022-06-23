"""Keycloak Admin abstract interface."""

from abc import ABC, abstractmethod
from typing import Dict


class KeycloakAdmin(ABC):
    """Keycloak Admin abstract interface."""

    @abstractmethod
    def get_analytics_groups(self, page_no: int, limit: int):
        """Get analytics groups."""

    @abstractmethod
    def get_group(self, group_id: str):
        """Get group by group_id."""

    @abstractmethod
    def update_group(self, group_id: str, dashboard_id_details: Dict):
        """Update group."""
