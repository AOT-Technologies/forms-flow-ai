"""Keycloak Admin implementation for client related operations."""
from typing import Dict, List

from flask import current_app
from formsflow_api_utils.exceptions import BusinessException
from formsflow_api_utils.utils.user_context import UserContext, user_context

from formsflow_api.constants import BusinessErrorCode
from formsflow_api.services import KeycloakAdminAPIService

from .keycloak_admin import KeycloakAdmin


class KeycloakClientService(KeycloakAdmin):
    """
    Keycloak Admin implementation for client related operations.

    This class provides methods for managing clients, roles, and users
    within the Keycloak administration.
    """

    def __init__(self):
        """Initialize the KeycloakClientService."""
        self.client = KeycloakAdminAPIService()

    def __populate_user_roles(self, user_list: List) -> List:
        """
        Populate user roles for a given list of users.

        Args:
            user_list (List): List of users.

        Returns:
            List: List of users with populated roles.
        """
        for user in user_list:
            user["role"] = (
                self.client.get_user_roles(user.get("id")) if user.get("id") else []
            )
        return user_list

    def __get_users_count(self, client_id: str, group_name: str):
        """
        Get the count of users under a specific group.

        Args:
            client_id (str): Client ID.
            group_name (str): Group name.

        Returns:
            int: Count of users under the group.
        """
        url_path = f"clients/{client_id}/roles/{group_name}/users"
        user_list = self.client.get_request(url_path)
        return len(user_list)

    def get_analytics_groups(self, page_no: int, limit: int):
        """
        Get analytics roles.

        Args:
            page_no (int): Page number.
            limit (int): Limit per page.

        Returns:
            List: List of analytics roles.
        """
        return self.client.get_analytics_roles(page_no, limit)

    def get_group(self, group_id: str):
        """
        Get role by role name.

        Args:
            group_id (str): Group ID.

        Returns:
            Dict: Role details.
        """
        client_id = self.client.get_client_id()
        response = self.client.get_request(
            url_path=f"clients/{client_id}/roles/{group_id}"
        )
        response["id"] = response.get("name", None)
        return response

    def get_users(
        self, page_no: int, limit: int, role: bool, group_name: str, count: bool
    ):
        """
        Get users under this client with formsflow-reviewer role.

        Args:
            page_no (int): Page number.
            limit (int): Limit per page.
            role (bool): Flag indicating whether to include roles for users.
            group_name (str): Name of the group.
            count (bool): Flag indicating whether to include user count.

        Returns:
            Tuple: Tuple containing list of users and optional user count.
        """
        current_app.logger.debug(
            "Fetching client based users from Keycloak with formsflow-reviewer role..."
        )
        client_id = self.client.get_client_id()
        url = f"clients/{client_id}/roles/{group_name}/users"
        if page_no and limit:
            url += f"?first={(page_no - 1) * limit}&max={limit}"
        users_list = self.client.get_request(url)
        users_count = self.__get_users_count(client_id, group_name) if count else None
        if role:
            users_list = self.__populate_user_roles(users_list)
        return users_list, users_count

    def update_group(self, group_id: str, data: Dict):
        """
        Update Keycloak role by role name.

        Args:
            group_id (str): Group ID.
            data (Dict): Data to update.

        Returns:
            Dict: Updated role details.
        """
        client_id = self.client.get_client_id()
        return self.client.update_request(
            url_path=f"clients/{client_id}/roles/{group_id}",
            data=data,
        )

    def get_groups_roles(self, search: str, sort_order: str):
        """
        Get roles.

        Args:
            search (str): Search query.
            sort_order (str): Sorting order.

        Returns:
            List: List of roles.
        """
        response = self.client.get_roles(search)
        for role in response:
            role["id"] = role.get("id")
            role["description"] = role.get("description")
        return self.sort_results(response, sort_order)

    def delete_group(self, group_id: str):
        """
        Delete role by role name.

        Args:
            group_id (str): Group ID.

        Returns:
            Dict: Deletion status.
        """
        client_id = self.client.get_client_id()
        return self.client.delete_request(
            url_path=f"clients/{client_id}/roles/{group_id}"
        )

    def create_group_role(self, data: Dict):
        """
        Create role.

        Args:
            data (Dict): Role data.

        Returns:
            Dict: Created role details.
        """
        client_id = self.client.get_client_id()
        response = self.client.create_request(
            url_path=f"clients/{client_id}/roles", data=data
        )
        role_name = response.headers["Location"].split("/")[-1]
        return {"id": role_name}

    def add_user_to_group_role(self, user_id: str, group_id: str, payload: Dict):
        """
        Add user to role.

        Args:
            user_id (str): User ID.
            group_id (str): Group ID.
            payload (Dict): Payload data.

        Returns:
            Dict: Status of adding user to role.
        """
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
        """
        Remove user from role.

        Args:
            user_id (str): User ID.
            group_id (str): Group ID.
            payload (Dict): Payload data.

        Returns:
            Dict: Status of removing user from role.
        """
        client_id = self.client.get_client_id()
        data = {
            "containerId": client_id,
            "id": group_id,
            "name": payload.get("name"),
        }
        return self.client.delete_request(
            url_path=f"users/{user_id}/role-mappings/clients/{client_id}", data=[data]
        )

    def search_realm_users(
        self, search: str, page_no: int, limit: int, role: bool, count: bool
    ):
        """
        Search users in a realm.

        Args:
            search (str): Search query.
            page_no (int): Page number.
            limit (int): Limit per page.
            role (bool): Flag indicating whether to include roles for users.
            count (bool): Flag indicating whether to include user count.

        Returns:
            Tuple: Tuple containing list of users and optional user count.
        """
        if not page_no or not limit:
            raise BusinessException(BusinessErrorCode.MISSING_PAGINATION_PARAMETERS)

        user_list, users_count = self.get_tenant_users(search, page_no, limit, count)
        if role:
            user_list = self.__populate_user_roles(user_list)
        return user_list, users_count

    @user_context
    def get_tenant_users(
        self, search: str, page_no: int, limit: int, count: bool, **kwargs
    ):
        """
        Return list of users in the tenant.

        Args:
            search (str): Search query.
            page_no (int): Page number.
            limit (int): Limit per page.
            count (bool): Flag indicating whether to include user count.
            **kwargs: Additional keyword arguments.

        Returns:
            Tuple: Tuple containing list of users and optional user count.

        Raises:
            BusinessException: If pagination parameters are missing.
        """
        if not page_no or not limit:
            raise BusinessException(BusinessErrorCode.MISSING_PAGINATION_PARAMETERS)

        user: UserContext = kwargs["user"]
        tenant_key = user.tenant_key
        url = f"users?q=tenantKey:{tenant_key}"
        current_app.logger.debug("Getting tenant users...")
        result = self.client.get_request(url)
        search_fields = ["username", "firstName", "lastName", "email"]
        if search:
            result = [
                item
                for item in result
                if any(search in item[key] for key in search_fields)
            ]
        count = len(result) if count else None
        result = self.paginate(result, page_no, limit)
        return result, count

    def paginate(self, data, page_number, page_size):
        """
        Paginate data.

        Args:
            data (List): List of data to paginate.
            page_number (int): Page number.
            page_size (int): Page size.

        Returns:
            List: Paginated data.
        """
        start_index = (page_number - 1) * page_size
        end_index = start_index + page_size
        return data[start_index:end_index]
