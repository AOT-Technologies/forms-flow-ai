"""Keycloak implementation for keycloak group related operations."""
from http import HTTPStatus
from typing import Dict, List

import requests
from flask import current_app
from formsflow_api_utils.exceptions import BusinessException

from formsflow_api.services import KeycloakAdminAPIService

from .keycloak_admin import KeycloakAdmin


class KeycloakGroupService(KeycloakAdmin):
    """Keycloak implementation for keycloak group related operations."""

    def __init__(self):
        """Initialize client."""
        self.client = KeycloakAdminAPIService()

    def get_analytics_groups(self, page_no: int, limit: int):
        """Get analytics groups."""
        return self.client.get_analytics_groups(page_no, limit)

    def get_group(self, group_id: str):
        """Get group by group_id."""
        response = self.client.get_request(url_path=f"groups/{group_id}")
        return self.format_response(response)

    def get_users(self, **kwargs):
        """Get users under formsflow-reviewer group."""
        response: List[Dict] = []
        group_name = kwargs.get("group_name")
        current_app.logger.debug(
            f"Fetching users from keycloak under {group_name} group..."
        )
        if group_name:
            group = self.client.get_request(url_path=f"group-by-path/{group_name}")
            group_id = group.get("id")
            response = self.client.get_request(url_path=f"groups/{group_id}/members")
        return response

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
                                "Role already exists.", HTTPStatus.BAD_REQUEST
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

    def flat(self, data, response):
        """Flatten response to single list of dictionary.

        Keycloak response has subgroups as list of dictionary.
        Flatten response to single list of dictionary
        """
        for group in data:
            subgroups = group.pop("subGroups", data)
            group = self.format_response(group)
            if subgroups == []:
                response.append(group)
            elif subgroups != []:
                response.append(group)
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
