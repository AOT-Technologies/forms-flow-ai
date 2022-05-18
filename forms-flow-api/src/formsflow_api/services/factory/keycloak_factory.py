"""Keycloak factory implementation."""
from flask import current_app

from .keycloak_admin import KeycloakAdmin
from .keycloak_client_service import KeycloakClientService
from .keycloak_group_service import KeycloakGroupService


class KeycloakFactory:  # pylint:disable=too-few-public-methods
    """Keycloak factory implementation."""

    @staticmethod
    def get_instance() -> KeycloakAdmin:
        """Get instance for keycloak implementation."""
        _instance: KeycloakAdmin = None
        if current_app.config.get("KEYCLOAK_ENABLE_CLIENT_AUTH"):
            _instance = KeycloakClientService()
        else:
            _instance = KeycloakGroupService()
        return _instance
