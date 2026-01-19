"""Keycloak Admin abstract interface."""

from abc import ABC, abstractmethod
from typing import Any, Dict, List, Union
from urllib.parse import quote

from flask import current_app

from formsflow_api_utils.exceptions import BusinessException

from formsflow_api.constants import BusinessErrorCode

DEFAULT_USER_CLAIM = "username"  # Default fallback claim


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
    def get_users(  # pylint: disable-msg=too-many-arguments, too-many-positional-arguments
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
    def add_user_to_group(self, user_id: str, group_id: str, payload: Dict):
        """Add user to group."""
        raise NotImplementedError("Method not implemented")

    @abstractmethod
    def add_role_to_user(self, user_id: str, role_id: str, payload: Dict):
        """Add role to user."""
        raise NotImplementedError("Method not implemented")

    @abstractmethod
    def remove_user_from_group(self, user_id: str, group_id: str):
        """Remove group from user."""
        raise NotImplementedError("Method not implemented")

    @abstractmethod
    def remove_role_from_user(self, user_id: str, group_id: str, payload: Dict = None):
        """Remove role from user."""
        raise NotImplementedError("Method not implemented")

    @abstractmethod
    def search_realm_users(  # pylint: disable-msg=too-many-arguments, too-many-positional-arguments
        self,
        search: str,
        page_no: int,
        limit: int,
        role: bool,
        count: bool,
        permission: str,
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

    @abstractmethod
    def add_user_to_tenant(self, data: Dict):
        """Add user in a tenant."""
        raise NotImplementedError("Method not implemented")

    def reset_password_email(self, user_id: str, client_id: str, redirect_uri: str):
        """Trigger reset password email for a user via Keycloak Admin API.

        Args:
            user_id: The Keycloak user ID
            client_id: The client ID from the token (azp claim)
            redirect_uri: The redirect URI for the password reset link

        Returns:
            bool: True if the email was sent successfully

        Raises:
            BusinessException: If the request fails
        """
        current_app.logger.debug(
            f"Triggering reset password email for user {user_id} with client {client_id}"
        )

        # Validate redirect_uri
        if not redirect_uri:
            raise BusinessException("redirect_uri cannot be empty or None")

        # URL encode the redirect_uri to handle special characters
        encoded_redirect_uri = quote(redirect_uri, safe="")

        # Build the URL path with query parameters
        url_path = (
            f"users/{user_id}/reset-password-email"
            f"?client_id={client_id}&redirect_uri={encoded_redirect_uri}"
        )

        try:
            # Use update_request with empty data (Keycloak expects empty body for this endpoint)
            # The update_request method handles PUT requests and returns success message for 204
            self.client.update_request(url_path=url_path, data={})
            current_app.logger.debug(
                f"Reset password email triggered successfully for user {user_id}"
            )
            return True
        except Exception as err:
            current_app.logger.error(
                f"Failed to trigger reset password email for user {user_id}: {err}",
                exc_info=True,
            )
            raise BusinessException(
                BusinessErrorCode.KEYCLOAK_REQUEST_FAIL
            ) from err

    @classmethod
    def get_user_id_from_response(
        cls, response: Dict[str, Any], user_name_attribute: str
    ) -> Union[str, None]:
        """
        Retrieve a user ID from a response JSON.

        If the resolved value is a list, return the first element.
        Falls back to DEFAULT_USER_CLAIM if the attribute is not found.
        """
        value = response.get("attributes", {}).get(user_name_attribute)
        # If it's a list, take the first element
        if isinstance(value, list) and value:
            value = value[0]
        # If not found, fall back to the default user claim (like "username")
        if value is None:
            value = response.get(DEFAULT_USER_CLAIM)

        return str(value) if value else None
