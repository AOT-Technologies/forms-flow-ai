"""Keycloak Admin implementation for client related operations."""

import re
from http import HTTPStatus
from typing import Dict

from flask import current_app
from formsflow_api_utils.exceptions import BusinessException
from formsflow_api_utils.utils.user_context import UserContext, user_context

from formsflow_api.constants import BusinessErrorCode

from .keycloak_group_service import KeycloakGroupService


class KeycloakClientService(KeycloakGroupService):
    """Keycloak Admin implementation for client related operations."""

    @user_context
    def get_analytics_groups(self, page_no: int, limit: int, **kwargs):
        """Get analytics roles."""
        user: UserContext = kwargs["user"]
        tenant_key = user.tenant_key
        groups = super().get_analytics_groups(page_no=page_no, limit=limit)
        response = [
            group for group in groups if group["name"].startswith(f"/{tenant_key}")
        ]
        if page_no and limit:
            response = self.user_service.paginate(
                response, page_number=page_no, page_size=limit
            )
        return response

    def update_group(self, group_id: str, data: Dict):
        """Update keycloak group."""
        data = self.append_tenant_key(data)
        return super().update_group(group_id, data)

    def create_group_role(self, data: Dict):
        """Create group."""
        current_app.logger.debug("Creating tenant group...")
        self.append_tenant_key(data)
        return super().create_group_role(data)

    @user_context
    def get_tenant_users(
        self,
        search: str,
        page_no: int,
        limit: int,
        count: bool,
        **kwargs,
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
            # Add user to group
            for role in data.get("roles"):
                group_id = role.get("role_id")
                role_data = {
                    "userId": user_id,
                    "groupId": group_id,
                }
                current_app.logger.debug(
                    f"Adding user: {user_email} to role {role.get('name')}."
                )
                self.client.update_request(
                    url_path=f"users/{user_id}/groups/{group_id}", data=role_data
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
