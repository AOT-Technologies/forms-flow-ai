"""Keycloak implementation for keycloak group related operations."""

from http import HTTPStatus
from typing import Dict, List
from urllib.parse import quote

import requests
from flask import current_app
from formsflow_api_utils.exceptions import BusinessException
from formsflow_api_utils.utils import VIEW_DASHBOARDS, UserContext, user_context

from formsflow_api.constants import BusinessErrorCode
from formsflow_api.services import KeycloakAdminAPIService, UserService

from .keycloak_admin import KeycloakAdmin


class KeycloakGroupService(KeycloakAdmin):  # pylint: disable=too-many-public-methods
    """Keycloak implementation for keycloak group related operations."""

    def __init__(self):
        """Initialize client."""
        self.client = KeycloakAdminAPIService()
        self.user_service = UserService()

    @user_context
    def __populate_user_groups(self, user_list: List, **kwargs) -> List:
        """Collect groups for a user list and populate the role attribute."""
        for user in user_list:
            user_groups = (
                self.client.get_user_groups(user.get("id")) if user.get("id") else []
            )
            if current_app.config.get("MULTI_TENANCY_ENABLED"):
                logged_user: UserContext = kwargs["user"]
                user_groups = [
                    group
                    for group in user_groups
                    if group["path"].startswith(f"/{logged_user.tenant_key}")
                ]
            user["role"] = user_groups
        return user_list

    def __populate_user_roles(self, user_list: List) -> List:
        """Collects roles for a user list and populates the role attribute."""
        for user in user_list:
            user["role"] = (
                self.client.get_user_roles(user.get("id")) if user.get("id") else []
            )
        return user_list

    def get_analytics_groups(self, page_no: int, limit: int):
        """Get analytics groups."""
        dashboard_group_list: list = []
        group_list_response = self.client.get_request(
            url_path="groups?briefRepresentation=false"
        )
        group_list_response = self.flat(group_list_response, dashboard_group_list)
        response = [
            group
            for group in group_list_response
            if VIEW_DASHBOARDS in group.get("permissions", [])
        ]
        if (
            page_no
            and limit
            and current_app.config.get("MULTI_TENANCY_ENABLED") is False
        ):
            response = self.user_service.paginate(
                response, page_number=page_no, page_size=limit
            )
        return response

    def get_group(self, group_id: str):
        """Get group by group_id."""
        response = self.client.get_request(url_path=f"groups/{group_id}")
        return self.format_response(response)

    @user_context
    def get_users(  # pylint: disable-msg=too-many-arguments, too-many-positional-arguments
        self,
        page_no: int,
        limit: int,
        role: bool,
        group_name: str,
        count: bool,
        search: str,
        **kwargs,
    ):
        """Get users under formsflow-reviewer group."""
        user: UserContext = kwargs["user"]
        user_list: List[Dict] = []
        current_app.logger.debug(
            f"Fetching users from keycloak under {group_name} group..."
        )
        user_count = None
        user_list = []
        if group_name:
            if current_app.config.get(
                "MULTI_TENANCY_ENABLED"
            ) and not group_name.startswith(f"/{user.tenant_key}-"):
                group_name = group_name.replace("/", f"/{user.tenant_key}-", 1)

            group = self.client.get_request(url_path=f"group-by-path/{group_name}")
            group_id = group.get("id")
            url_path = f"groups/{group_id}/members"
            user_list = self.client.get_request(url_path)
            if (
                user_name_display_claim := current_app.config.get(
                    "USER_NAME_DISPLAY_CLAIM"
                )
            ) is not None:
                for user in user_list:
                    user["username"] = self.get_user_id_from_response(
                        user, user_name_display_claim
                    )

        if search:
            user_list = self.user_service.user_search(search, user_list)
        user_count = len(user_list) if count else None
        if page_no and limit:
            user_list = self.user_service.paginate(user_list, page_no, limit)
        if role:
            user_list = self.__populate_user_groups(user_list)
        return (user_list, user_count)

    def update_group(self, group_id: str, data: Dict):
        """Update group details."""
        permissions = data.pop("permissions")
        data = self.add_description(data)
        data["name"] = data["name"].split("/")[-1]
        self.update_group_permission_mapping(group_id, permissions)
        return self.client.update_request(url_path=f"groups/{group_id}", data=data)

    @user_context
    def get_groups_roles(self, search: str, sort_order: str, **kwargs):
        """Get groups."""
        response = self.client.get_groups()
        if current_app.config.get("MULTI_TENANCY_ENABLED"):
            current_app.logger.debug("Getting groups for tenant...")
            user: UserContext = kwargs["user"]
            response = [
                group for group in response if group["name"].startswith(user.tenant_key)
            ]
        flat_response: List[Dict] = []
        result_list = self.sort_results(self.flat(response, flat_response), sort_order)
        if search:
            result_list = self.search_group(search, result_list)
        return result_list

    def delete_group(self, group_id: str):
        """Delete role by role_id."""
        return self.client.delete_request(url_path=f"groups/{group_id}")

    def create_group_role(self, data: Dict):
        """Create group or subgroup.

        Split name parameter to create group/subgroups
        """
        permissions = data.pop("permissions")
        data = self.add_description(data)
        data["name"] = (
            data["name"].lstrip("/") if data["name"].startswith("/") else data["name"]
        )
        groups = data["name"].split("/")
        url_path = "groups"
        groups_length = len(groups)
        if groups_length == 1:
            try:
                response = self.client.create_request(url_path=url_path, data=data)
                group_id = response.headers["Location"].split("/")[-1]
            except requests.exceptions.HTTPError as err:
                if err.response.status_code == 409:
                    raise BusinessException(BusinessErrorCode.ROLE_ERROR) from err
        else:
            for index, group_name in enumerate(groups):
                try:
                    data["name"] = group_name
                    response = self.client.create_request(url_path=url_path, data=data)
                    group_id = response.headers["Location"].split("/")[-1]
                except requests.exceptions.HTTPError as err:
                    if err.response.status_code == 409:
                        if index == (groups_length - 1):
                            raise BusinessException(
                                BusinessErrorCode.ROLE_ERROR
                            ) from err
                        group_path = "/".join(groups[: index + 1])
                        response = self.client.get_request(
                            url_path=f"group-by-path/{group_path}"
                        )
                        group_id = response["id"]
                url_path = f"groups/{group_id}/children"
        client_id = self.client.get_client_id()
        try:
            self.create_group_permission_mapping(group_id, permissions, client_id)
        except Exception as err:
            current_app.logger.debug(f"Role mapping creation failed: {err}")
            self.delete_group(group_id)
            raise BusinessException(BusinessErrorCode.ROLE_MAPPING_FAILED) from err
        return {"id": group_id}

    def add_description(self, data: Dict):
        """Group based doesn't have description field.

        Description is added to attributes field.
        """
        dict_description = {}
        dict_description["description"] = [data.get("description")]
        data["attributes"] = dict_description
        data.pop("description", None)
        return data

    def sub_groups(self, group_id, response):
        """Fetch subgroups of the group if subGroupCount greater than 0."""
        sub_group = self.client.get_subgroups(group_id)
        for group in sub_group:
            group = self.format_response(group)
            response.append(group)
            if group.get("subGroupCount", 0) > 0:
                self.sub_groups(group.get("id"), response)
        return response

    def flat(self, data, response):
        """Flatten response to single list of dictionary.

        Keycloak response has subgroups as list of dictionary.
        Flatten response to single list of dictionary
        """
        for group in data:
            subgroups = group.pop("subGroups", data)
            group = self.format_response(group)
            response.append(group)
            if subgroups == []:
                if group.get("subGroupCount", 0) > 0:
                    response = self.sub_groups(group.get("id"), response)
            elif subgroups != []:
                self.flat(subgroups, response)
        return response

    def search_group(self, search, data):
        """Search group by name."""
        search_list = list(
            filter(
                lambda data: (
                    search.lower() in data["name"].lower() if data.get("name") else ""
                ),
                data,
            )
        )
        return search_list

    @user_context
    def format_response(self, data, **kwargs):
        """Format group response."""
        user: UserContext = kwargs["user"]
        tenant_key = user.tenant_key
        data["description"] = ""
        data["permissions"] = []
        data["name"] = data.get("path")
        if data.get("attributes") != {}:  # Reaarange description
            data["description"] = (
                data["attributes"]["description"][0]
                if data["attributes"].get("description")
                else ""
            )
        if data.get("clientRoles") != {}:  # Reaarange permissions
            client_name = current_app.config.get("JWT_OIDC_AUDIENCE")
            client_role = f"{tenant_key}-{client_name}" if tenant_key else client_name
            current_app.logger.debug("Client name %s", client_role)
            client_roles = data["clientRoles"].get(client_role)
            if client_roles:
                data["permissions"] = client_roles
        return data

    def add_user_to_group(self, user_id: str, group_id: str, payload: Dict):
        """Add user to group."""
        data = {
            "realm": current_app.config.get("KEYCLOAK_URL_REALM"),
            "userId": payload.get("userId"),
            "groupId": payload.get("groupId"),
        }
        return self.client.update_request(
            url_path=f"users/{user_id}/groups/{group_id}", data=data
        )

    def add_role_to_user(self, user_id: str, role_id: str, payload: Dict):
        """Add user to role."""
        client_id = self.client.get_client_id()
        data = {
            "containerId": client_id,
            "id": role_id,
            "name": payload.get("name"),
        }
        return self.client.create_request(
            url_path=f"users/{user_id}/role-mappings/clients/{client_id}", data=[data]
        )

    def remove_user_from_group(self, user_id: str, group_id: str):
        """Remove user to group."""
        return self.client.delete_request(url_path=f"users/{user_id}/groups/{group_id}")

    def remove_role_from_user(self, user_id: str, group_id: str, payload: Dict = None):
        """Remove role from user."""
        client_id = self.client.get_client_id()
        data = {
            "containerId": client_id,
            "id": group_id,
            "name": payload.get("name"),
        }
        return self.client.delete_request(
            url_path=f"users/{user_id}/role-mappings/clients/{client_id}", data=[data]
        )

    @user_context
    def search_realm_users(  # pylint: disable-msg=too-many-arguments, too-many-positional-arguments, too-many-locals
        self,
        search: str,
        page_no: int,
        limit: int,
        role: bool,
        count: bool,
        permission: str,
        **kwargs,
    ):
        """Search users in a realm."""
        user: UserContext = kwargs["user"]
        multitenancy = current_app.config.get("MULTI_TENANCY_ENABLED", False)
        tenant_key = user.tenant_key

        # Build the URL based on input parameters
        url = self._build_search_url(multitenancy, tenant_key, page_no, limit, search)

        current_app.logger.debug(
            f"{'Getting tenant users...' if multitenancy else 'Getting users...'}"
        )
        user_list = self.client.get_request(url)
        # iterate users and set the username if a user name claim is set.
        if (
            user_name_display_claim := current_app.config.get("USER_NAME_DISPLAY_CLAIM")
        ) is not None:
            for user in user_list:
                user["username"] = self.get_user_id_from_response(
                    user, user_name_display_claim
                )

        # Process username display
        user_list = self._process_username_display(user_list)

        # Process permissions if needed
        if permission:
            users_with_roles = self.__populate_user_roles(user_list=user_list)
            user_list = self.user_service.filter_by_permission(
                users_with_roles, permission=permission
            )

        # Handle multitenancy search and counting
        user_list, users_count = self._handle_multitenancy_and_count(
            user_list, multitenancy, search, count, page_no, limit
        )

        # Add user groups if needed
        if role:
            user_list = self.__populate_user_groups(user_list)

        return (user_list, users_count)

    def _build_search_url(  # pylint: disable=too-many-arguments, too-many-positional-arguments
        self,
        multitenancy,
        tenant_key,
        page_no,
        limit,
        search,
    ):
        """Build the search URL based on parameters."""
        if multitenancy:
            return f"users?q=tenantKey:{tenant_key}"

        url = "users?"

        if page_no and limit:
            url = f"users?first={(page_no - 1) * limit}&max={limit}"

        if search:
            url += f"{'' if url.endswith('?') else '&'}search={search}"

        return url

    def _process_username_display(self, user_list):
        """Process username display based on configured claim."""
        user_name_display_claim = current_app.config.get("USER_NAME_DISPLAY_CLAIM")

        if user_name_display_claim is not None:
            for user in user_list:
                user["username"] = self.get_user_id_from_response(
                    user, user_name_display_claim
                )

        return user_list

    def _handle_multitenancy_and_count(  # pylint: disable=too-many-arguments, too-many-positional-arguments
        self, user_list, multitenancy, search, count, page_no, limit
    ):
        """Handle multitenancy-specific filtering and counting."""
        users_count = None

        if multitenancy and search:
            user_list = self.user_service.user_search(search, user_list)

        if count:
            if current_app.config.get("MULTI_TENANCY_ENABLED"):
                users_count = len(user_list)
            else:
                users_count = self.client.get_realm_users_count(search)

        if multitenancy and page_no and limit:
            user_list = self.user_service.paginate(user_list, page_no, limit)

        return user_list, users_count

    def add_user_to_tenant(self, data: Dict):
        """Add user to a tenant."""
        return {
            "message": "The requested operation is not supported."
        }, HTTPStatus.BAD_REQUEST

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

    def create_group_permission_mapping(self, group_id, permissions, client_id):
        """Set permission mapping to group."""
        current_app.logger.debug("Setting permission mapping to group")
        roles = self.client.get_roles()
        role_data_list = []
        for role in roles:
            if permissions and role.get("name") in permissions:
                role_data = {
                    "containerId": client_id,
                    "id": role.get("id"),
                    "clientRole": True,
                    "name": role.get("name"),
                }
                role_data_list.append(role_data)
        self.client.create_request(
            url_path=f"groups/{group_id}/role-mappings/clients/{client_id}",
            data=role_data_list,
        )

    def update_group_permission_mapping(self, group_id, permissions):
        """Update permission mapping to group."""
        current_app.logger.debug("Updating permission mapping to group")
        client_id = self.client.get_client_id()
        permission_list = self.client.get_request(
            url_path=f"groups/{group_id}/role-mappings/clients/{client_id}"
        )

        # Determine permissions to remove
        role_remove_data_list = []
        for permission in permission_list:
            if permission["name"] not in permissions:
                role_remove_data_list.append(permission)
        self.client.delete_request(
            url_path=f"groups/{group_id}/role-mappings/clients/{client_id}",
            data=role_remove_data_list,
        )
        # Add permissions
        self.create_group_permission_mapping(group_id, permissions, client_id)
