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
            # pylint: disable=no-member
            # self.client is initialized by all subclasses in their __init__ methods
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

    def get_user_federated_identity(self, user_id: str):
        """Get federated identity providers linked to a user.

        Calls Keycloak Admin API to fetch federated identity details.
        Returns login method information (internal IDP vs external IDP).

        Sample output for internal user:
        {"loginType": "internal"}

        Sample output for external user:
        {"loginType": "external", "identityProvider": "google"}
        """
        current_app.logger.debug(f"Fetching federated identity for user: {user_id}")
        # pylint: disable=no-member
        # self.client is initialized by all subclasses in their __init__ methods
        federated_identities = self.client.get_user_federated_identity(user_id)

        if federated_identities:
            # External user - return login type and first identity provider name
            return {
                "loginType": "external",
                "identityProvider": federated_identities[0].get("identityProvider"),
            }

        # Internal user - return only login type
        return {"loginType": "internal"}

    def update_user_profile(  # pylint: disable=too-many-branches
        self, user_id: str, logged_in_user_id: str, data: Dict
    ) -> Dict:
        """Update user profile in Keycloak.

        Args:
            user_id: The Keycloak user ID from the URL path
            logged_in_user_id: The logged-in user's Keycloak ID from the token
            data: The profile data to update (firstName, lastName, username, email, attributes)

        Returns:
            Dict: The updated user profile

        Raises:
            BusinessException: If validation fails or Keycloak request fails
        """
        current_app.logger.debug(f"Updating user profile for user {user_id}")

        # Validation 1: Verify userId matches the logged-in user's ID
        if user_id != logged_in_user_id:
            current_app.logger.warning(
                f"User ID mismatch: path user_id={user_id}, "
                f"logged_in_user_id={logged_in_user_id}"
            )
            raise BusinessException(BusinessErrorCode.USER_ID_MISMATCH)

        # pylint: disable=no-member
        # self.client is initialized by all subclasses in their __init__ methods

        # Get current user data from Keycloak
        current_user = self.client.get_user_by_id(user_id)
        if not current_user:
            raise BusinessException(BusinessErrorCode.USER_NOT_FOUND)

        # Validation 2: If username is included, check realm settings and uniqueness
        if "username" in data and data["username"]:
            new_username = data["username"]
            current_username = current_user.get("username")

            # Only validate if username is actually changing
            if new_username != current_username:
                # Check if username editing is allowed
                realm_info = self.client.get_realm_info()
                if not realm_info.get("editUsernameAllowed", False):
                    current_app.logger.warning("Username editing is not allowed")
                    raise BusinessException(BusinessErrorCode.USERNAME_NOT_EDITABLE)

                # Check if username is already taken
                existing_users = self.client.get_user_by_username(new_username)
                if existing_users:
                    # Filter out the current user
                    other_users = [u for u in existing_users if u.get("id") != user_id]
                    if other_users:
                        current_app.logger.warning(
                            f"Username {new_username} is already taken"
                        )
                        raise BusinessException(BusinessErrorCode.USERNAME_ALREADY_EXISTS)

        # Validation 3: If email is included, check uniqueness
        if "email" in data and data["email"]:
            new_email = data["email"]
            current_email = current_user.get("email")

            # Only validate if email is actually changing
            if new_email != current_email:
                existing_users = self.client.get_user_by_email(new_email)
                if existing_users:
                    # Filter out the current user
                    other_users = [u for u in existing_users if u.get("id") != user_id]
                    if other_users:
                        current_app.logger.warning(f"Email {new_email} is already taken")
                        raise BusinessException(BusinessErrorCode.EMAIL_ALREADY_EXISTS)

        # Build the update payload - merge with existing user data
        update_payload = {
            "id": user_id,
            "username": current_user.get("username"),
            "email": current_user.get("email"),
            "firstName": current_user.get("firstName"),
            "lastName": current_user.get("lastName"),
            "attributes": current_user.get("attributes", {}),
        }

        # Apply updates from the request data
        if "firstName" in data and data["firstName"]:
            update_payload["firstName"] = data["firstName"]
        if "lastName" in data and data["lastName"]:
            update_payload["lastName"] = data["lastName"]
        if "username" in data and data["username"]:
            update_payload["username"] = data["username"]
        if "email" in data and data["email"]:
            update_payload["email"] = data["email"]
        if "attributes" in data and data["attributes"]:
            # Merge attributes
            for key, value in data["attributes"].items():
                update_payload["attributes"][key] = value

        try:
            # Call Keycloak PUT API to update user
            self.client.update_request(url_path=f"users/{user_id}", data=update_payload)
            current_app.logger.debug(
                f"User profile updated successfully for user {user_id}"
            )

            # Return the updated profile data
            return {
                "firstName": update_payload.get("firstName"),
                "lastName": update_payload.get("lastName"),
                "username": update_payload.get("username"),
                "email": update_payload.get("email"),
                "attributes": update_payload.get("attributes"),
            }
        except BusinessException:
            raise
        except Exception as err:
            current_app.logger.error(
                f"Failed to update user profile for user {user_id}: {err}",
                exc_info=True,
            )
            raise BusinessException(BusinessErrorCode.KEYCLOAK_REQUEST_FAIL) from err

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
