"""Keycloak implementation for keycloak group related operations."""

from typing import Dict, List

import requests
from flask import current_app
from formsflow_api_utils.exceptions import BusinessException

from formsflow_api.constants import BusinessErrorCode
from formsflow_api.services import KeycloakAdminAPIService, UserService

from .keycloak_admin import KeycloakAdmin


class KeycloakGroupService(KeycloakAdmin):
    """Keycloak implementation for keycloak group related operations."""

    def __init__(self):
        """Initialize client."""
        self.client = KeycloakAdminAPIService()
        self.user_service = UserService()

    def __populate_user_groups(self, user_list: List) -> List:
        """Collect groups for a user list and populate the role attribute."""
        for user in user_list:
            user["role"] = (
                self.client.get_user_groups(user.get("id")) if user.get("id") else []
            )
        return user_list

    def get_analytics_groups(self, page_no: int, limit: int):
        """Get analytics groups."""
        return self.client.get_analytics_groups(page_no, limit)

    def get_group(self, group_id: str):
        """Get group by group_id."""
        response = self.client.get_request(url_path=f"groups/{group_id}")
        return self.format_response(response)

    def get_users(  # pylint: disable-msg=too-many-arguments
        self,
        page_no: int,
        limit: int,
        role: bool,
        group_name: str,
        count: bool,
        search: str,
    ):
        """Get users under formsflow-reviewer group."""
        user_list: List[Dict] = []
        current_app.logger.debug(
            f"Fetching users from keycloak under {group_name} group..."
        )
        if group_name:
            group = self.client.get_request(url_path=f"group-by-path/{group_name}")
            group_id = group.get("id")
            url_path = f"groups/{group_id}/members"
            user_list = self.client.get_request(url_path)
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
        data = self.add_description(data)
        data["name"] = data["name"].split("/")[-1]
        return self.client.update_request(url_path=f"groups/{group_id}", data=data)

    def get_groups_roles(self, search: str, sort_order: str):
        """Get groups."""
        response = self.client.get_groups()
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
        data = self.add_description(data)
        data["name"] = (
            data["name"].lstrip("/") if data["name"].startswith("/") else data["name"]
        )
        groups = data["name"].split("/")
        url_path = "groups"
        groups_length = len(groups)
        if groups_length == 1:
            response = self.client.create_request(url_path=url_path, data=data)
            group_id = response.headers["Location"].split("/")[-1]
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
                                BusinessErrorCode.DUPLICATE_ROLE
                            ) from err
                        group_path = "/".join(groups[: index + 1])
                        response = self.client.get_request(
                            url_path=f"group-by-path/{group_path}"
                        )
                        group_id = response["id"]
                url_path = f"groups/{group_id}/children"
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
                lambda data: search.lower() in data["name"].lower()
                if data.get("name")
                else "",
                data,
            )
        )
        return search_list

    def format_response(self, data):
        """Format group response."""
        data["description"] = ""
        data["name"] = data.get("path")
        if data.get("attributes") != {}:  # Reaarange description
            data["description"] = (
                data["attributes"]["description"][0]
                if data["attributes"].get("description")
                else ""
            )
        return data

    def add_user_to_group_role(self, user_id: str, group_id: str, payload: Dict):
        """Add user to group."""
        data = {
            "realm": current_app.config.get("KEYCLOAK_URL_REALM"),
            "userId": payload.get("userId"),
            "groupId": payload.get("groupId"),
        }
        return self.client.update_request(
            url_path=f"users/{user_id}/groups/{group_id}", data=data
        )

    def remove_user_from_group_role(
        self, user_id: str, group_id: str, payload: Dict = None
    ):
        """Remove user to group."""
        return self.client.delete_request(url_path=f"users/{user_id}/groups/{group_id}")

    def search_realm_users(  # pylint: disable-msg=too-many-arguments
        self, search: str, page_no: int, limit: int, role: bool, count: bool
    ):
        """Search users in a realm."""
        if not page_no or not limit:
            raise BusinessException(BusinessErrorCode.MISSING_PAGINATION_PARAMETERS)

        user_list = self.client.get_realm_users(search, page_no, limit)
        users_count = self.client.get_realm_users_count(search) if count else None
        if role:
            user_list = self.__populate_user_groups(user_list)
        return (user_list, users_count)
