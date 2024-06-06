"""Keycloak Admin implementation for client related operations."""

import re
from http import HTTPStatus
from typing import Dict, List

from flask import current_app
from formsflow_api_utils.exceptions import BusinessException
from formsflow_api_utils.utils.user_context import UserContext, user_context

from formsflow_api.constants import BusinessErrorCode
from formsflow_api.services import KeycloakAdminAPIService, UserService

from .keycloak_admin import KeycloakAdmin
from .keycloak_group_service import KeycloakGroupService


class KeycloakClientService(KeycloakAdmin):
    """Keycloak Admin implementation for client related operations."""

    def __init__(self):
        """Initialize client."""
        self.client = KeycloakAdminAPIService()
        self.user_service = UserService()
        self.group_service = KeycloakGroupService()

    def __populate_user_roles(self, user_list: List) -> List:
        """Collects roles for a user list and populates the role attribute."""
        for user in user_list:
            user["role"] = (
                self.client.get_user_roles(user.get("id")) if user.get("id") else []
            )
        return user_list

    def get_analytics_groups(self, page_no: int, limit: int):
        """Get analytics roles."""
        return self.client.get_analytics_roles(page_no, limit)

    def get_group(self, group_id: str):
        """Get group by group_id."""
        return self.group_service.get_group(group_id)

    def get_users(  # pylint: disable-msg=too-many-arguments
        self,
        page_no: int,
        limit: int,
        role: bool,
        group_name: str,
        count: bool,
        search: str,
    ):
        """Get users under this client with formsflow-reviewer role."""
        # group_name was hardcoded before as `formsflow-reviewer` make sure
        # neccessary changes in the client side are made for role based env
        current_app.logger.debug(
            "Fetching client based users from keycloak with formsflow-reviewer role..."
        )
        client_id = self.client.get_client_id()
        url = f"clients/{client_id}/roles/{group_name}/users"
        users_list = self.client.get_request(url)
        if search:
            users_list = self.user_service.user_search(search, users_list)
        users_count = len(users_list) if count else None
        if page_no and limit:
            users_list = self.user_service.paginate(users_list, page_no, limit)
        if role:
            users_list = self.__populate_user_roles(users_list)
        return (users_list, users_count)

    def update_group(self, group_id: str, data: Dict):
        """Update keycloak group."""
        data = self.append_tenant_key(data)
        return self.group_service.update_group(group_id, data)

    def get_groups_roles(self, search: str, sort_order: str):
        """Get groups."""
        return self.group_service.get_groups_roles(search, sort_order)

    def delete_group(self, group_id: str):
        """Delete group."""
        return self.client.delete_request(url_path=f"groups/{group_id}")

    def create_group_role(self, data: Dict):
        """Create group."""
        current_app.logger.debug("Creating tenant group...")
        self.append_tenant_key(data)
        return self.group_service.create_group_role(data)

    def add_user_to_group_role(self, user_id: str, group_id: str, payload: Dict):
        """Add user to role."""
        client_id = self.client.get_client_id()
        data = {
            "containerId": client_id,
            "id": group_id,
            "name": payload.get("name"),
        }
        return self.client.create_request(
            url_path=f"users/{user_id}/role-mappings/clients/{client_id}", data=[data]
        )

    def remove_user_from_group_role(
        self, user_id: str, group_id: str, payload: Dict = None
    ):
        """Remove user to role."""
        client_id = self.client.get_client_id()
        data = {
            "containerId": client_id,
            "id": group_id,
            "name": payload.get("name"),
        }
        return self.client.delete_request(
            url_path=f"users/{user_id}/role-mappings/clients/{client_id}", data=[data]
        )

    def search_realm_users(  # pylint: disable-msg=too-many-arguments
        self, search: str, page_no: int, limit: int, role: bool, count: bool
    ):
        """Search users in a realm."""
        if not page_no or not limit:
            raise BusinessException(BusinessErrorCode.MISSING_PAGINATION_PARAMETERS)

        user_list, users_count = self.get_tenant_users(search, page_no, limit, count)
        if role:
            user_list = self.__populate_user_roles(user_list)
        return (user_list, users_count)

    @user_context
    def get_tenant_users(
        self, search: str, page_no: int, limit: int, count: bool, **kwargs
    ):  # pylint: disable=too-many-arguments
        """Return list of users in the tenant."""
        # Search and attribute search (q) in Keycloak doesn't work together.
        # Count endpoint doesn't accommodate attribute search.
        # These issues have been addressed on the webapi.
        # TODO: Upon Keycloak issue resolution, direct fetching will be done. # pylint: disable=fixme
        user: UserContext = kwargs["user"]
        tenant_key = user.tenant_key
        url = f"users?q=tenantKey:{tenant_key}"
        current_app.logger.debug("Getting tenant users...")
        result = self.client.get_request(url)
        if search:
            result = self.user_service.user_search(search, result)
        count = len(result) if count else None
        result = self.user_service.paginate(result, page_no, limit)
        return result, count

    @user_context
    def add_user_to_tenant(
        self, data: Dict, **kwargs
    ):  # pylint: disable=too-many-locals
        """Add tenant to user."""
        user: UserContext = kwargs["user"]
        tenant_key = user.tenant_key
        user_email = data.get("user")

        current_app.logger.debug(f"Checking user: {user_email} exist in keycloak...")
        # Check if the input matches the email pattern
        is_email = re.match(r"^\S+@\S+\.\S+$", user_email) is not None
        url = "users?exact=true&"
        user_identifier = "email" if is_email else "username"
        url += f"{user_identifier}={user_email}"
        user_response = self.client.get_request(url)

        if user_response:
            current_app.logger.debug(f"User: {user_email} found.")
            user = user_response[0]
            user_id = user.get("id")
            attributes = user.get("attributes", {})
            tenant_keys = attributes.get("tenantKey", [])
            current_app.logger.debug(f"Adding tenantKey {tenant_key} to user attribute")
            # Add a new tenant key only if it's not already present
            if tenant_key not in tenant_keys:
                tenant_keys.append(tenant_key)
            payload = {"attributes": {"tenantKey": tenant_keys}}
            self.client.update_request(f"users/{user_id}", payload)
            # Add user to role
            client_id = self.client.get_client_id()
            for role in data.get("roles"):
                role_data = {
                    "containerId": client_id,
                    "id": role.get("role_id"),
                    "name": role.get("name"),
                }
                current_app.logger.debug(
                    f"Adding user: {user_email} to role {role.get('name')}."
                )
                self.client.create_request(
                    url_path=f"users/{user_id}/role-mappings/clients/{client_id}",
                    data=[role_data],
                )
            return {"message": "User added to tenant"}, HTTPStatus.OK
        raise BusinessException(BusinessErrorCode.USER_NOT_FOUND)

    @user_context
    def append_tenant_key(self, data, **kwargs):  # pylint: disable=too-many-locals
        """Append tenantkey to main group."""
        user: UserContext = kwargs["user"]
        tenant_key = user.tenant_key
        name = data["name"].lstrip("/")
        # Prefix the tenant_key to the main group
        data["name"] = f"{tenant_key}-{name}"
        current_app.logger.debug(f"Tenant group: {data['name']}")
        return data
