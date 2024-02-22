"""Keycloak Admin implementation for client related operations."""

from typing import Dict, List

from flask import current_app
from formsflow_api_utils.exceptions import BusinessException
from formsflow_api_utils.utils.user_context import UserContext, user_context

from formsflow_api.constants import BusinessErrorCode
from formsflow_api.services import KeycloakAdminAPIService, UserService

from .keycloak_admin import KeycloakAdmin


class KeycloakClientService(KeycloakAdmin):
    """Keycloak Admin implementation for client related operations."""

    def __init__(self):
        """Initialize client."""
        self.client = KeycloakAdminAPIService()
        self.user_service = UserService()

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
        """Get role by role name."""
        client_id = self.client.get_client_id()
        response = self.client.get_request(
            url_path=f"clients/{client_id}/roles/{group_id}"
        )
        response["id"] = response.get("name", None)
        return response

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
        """Update keycloak role by role name."""
        client_id = self.client.get_client_id()
        return self.client.update_request(
            url_path=f"clients/{client_id}/roles/{group_id}",
            data=data,
        )

    def get_groups_roles(self, search: str, sort_order: str):
        """Get roles."""
        response = self.client.get_roles(search)
        for role in response:
            role["id"] = role.get("id")
            role["description"] = role.get("description")
        return self.sort_results(response, sort_order)

    def delete_group(self, group_id: str):
        """Delete role by role name."""
        client_id = self.client.get_client_id()
        return self.client.delete_request(
            url_path=f"clients/{client_id}/roles/{group_id}"
        )

    def create_group_role(self, data: Dict):
        """Create role."""
        client_id = self.client.get_client_id()
        response = self.client.create_request(
            url_path=f"clients/{client_id}/roles", data=data
        )
        role_name = response.headers["Location"].split("/")[-1]
        return {"id": role_name}

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
