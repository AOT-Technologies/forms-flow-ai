"""Keycloak Admin implementation for client related operations."""

import re
from http import HTTPStatus
from typing import Dict

from flask import current_app
from formsflow_api_utils.exceptions import BusinessException
from formsflow_api_utils.utils.user_context import UserContext, user_context

from formsflow_api.constants import BusinessErrorCode

from .keycloak_group_service import KeycloakGroupService

import json

import requests
from flask import current_app
from formsflow_api_utils.exceptions import BusinessException
from formsflow_api_utils.utils import (
    HTTP_TIMEOUT,
    UserContext,
    profiletime,
    user_context,
)

from formsflow_api.constants import BusinessErrorCode

class BCGovSharedRealm(KeycloakGroupService):
    """Keycloak Admin implementation for client related operations."""

    def __init__(self):
        """Initializing the service."""
        self.session = requests.Session()
        css_client = current_app.config.get("CSS_API_CLIENT_ID")
        css_secret = current_app.config.get("CSS_API_SECRET")
        css_login_url = current_app.config.get("CSS_API_LOGIN_URL")
        headers = {"Content-Type": "application/x-www-form-urlencoded"}
        payload = {
            "client_id": css_client,
            "client_secret": css_secret,
            "grant_type": "client_credentials",
        }

        response = requests.post(
            css_login_url, headers=headers, data=payload, timeout=HTTP_TIMEOUT
        )
        data = json.loads(response.text)
        assert data["access_token"] is not None
        self.session.headers.update(
            {
                "Authorization": "Bearer " + data["access_token"],
                "Content-Type": "application/json",
            }
        )
        self.base_url = current_app.config.get("CSS_API_BASE_URL")

    @user_context
    def search_realm_users(  # pylint: disable-msg=too-many-arguments, too-many-positional-arguments
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
        if not search and not permission:
            return [], 0

        if permission and not search:
            return self.get_users(page_no, limit, role, permission, count, search)

        css_env = current_app.config.get("CSS_ENV")
        css_integration_id = current_app.config.get("CSS_INTEGRATION_ID")
        css_idps = current_app.config.get("CSS_IDP_LIST").split(",")
        users_list = []
        for css_idp in css_idps:
            param_name = 'name' if css_idp == 'github-bcgov' else 'firstName'
            url = f"{css_env}/{css_idp}/users?{param_name}={search}"
            response = self.session.request("GET", f'{self.base_url}/{url}')
            if response.json():
                for user in response.json().get("data"):
                    _user = {**{"id": user.get("username")}, **user, 'role': []}
                    # Find roles for this user
                    url = f"integrations/{css_integration_id}/{css_env}/users/{_user.get('username')}/roles"
                    user_roles = self.session.request("GET", f'{self.base_url}/{url}')

                    for user_role in user_roles.json().get("data"):
                        _user['role'].append({
                            "id": user_role.get("name"),
                            "name": user_role.get("name"),
                            "path": user_role.get("name"),
                            "subGroups": []
                        })

                    users_list.append(_user)
        return users_list, len(users_list) #TODO Fix this once API supports

    @user_context
    def get_users(
        self, page_no, limit, role, group_name, count, search, **kwargs
    ):
        """Search users in a realm."""
        if not search and not group_name:
            return [], 0
        if page_no == 0:
            page_no = 1
        if limit ==0:
            limit = 50
        css_env = current_app.config.get("CSS_ENV")
        css_integration_id = current_app.config.get("CSS_INTEGRATION_ID")
        user_name_display_claim = current_app.config.get("USER_NAME_DISPLAY_CLAIM")
        url = f"integrations/{css_integration_id}/{css_env}/roles/{group_name}/users?page={page_no}&max={limit}"
        response = self.session.request("GET", f'{self.base_url}/{url}')
        current_app.logger.info(" response ")
        current_app.logger.info(response.json())
        users_list = []
        if response.json():
            for user in response.json().get("data"):
                _id = user.get("username")
                _user_name = self.get_user_id_from_response(user, user_name_display_claim)
                _user = {**user, **{"id": _id, "username": _user_name},  'role': []}
                # Find roles for this user
                url = f"integrations/{css_integration_id}/{css_env}/users/{_id}/roles"
                user_roles = self.session.request("GET", f'{self.base_url}/{url}')

                for user_role in user_roles.json().get("data"):
                    _user['role'].append({
                        "id": user_role.get("name"),
                        "name": user_role.get("name"),
                        "path": user_role.get("name"),
                        "subGroups": []
                    })
                users_list.append(_user)
        return users_list, len(users_list)  # TODO Fix this once API supports


    def add_user_to_group(self, user_id: str, group_id: str, payload: Dict):
        """Add user to group."""
        css_env = current_app.config.get("CSS_ENV")
        css_integration_id = current_app.config.get("CSS_INTEGRATION_ID")

        # Initial url
        url = f"integrations/{css_integration_id}/{css_env}/users/{user_id}/roles"
        data = [{"name":group_id}]
        response = self.session.request("POST", f'{self.base_url}/{url}', data=json.dumps(data))
        response.raise_for_status()
        return payload

    def remove_user_from_group(self, user_id: str, group_id: str, payload: Dict = None):
        """Remove user to group."""
        css_env = current_app.config.get("CSS_ENV")
        css_integration_id = current_app.config.get("CSS_INTEGRATION_ID")

        # Initial url
        url = f"integrations/{css_integration_id}/{css_env}/users/{user_id}/roles/{group_id}"
        response = self.session.request("DELETE", f'{self.base_url}/{url}')
        response.raise_for_status()
        return response.status_code == 204

    @user_context
    def get_groups_roles(self, search: str, sort_order: str, **kwargs):
        """Get groups."""
        user: UserContext = kwargs["user"]
        css_env = current_app.config.get("CSS_ENV")
        css_integration_id = current_app.config.get("CSS_INTEGRATION_ID")

        # Initial url
        url = f"integrations/{css_integration_id}/{css_env}/roles"
        response = self.session.request("GET", f'{self.base_url}/{url}')
        roles = response.json().get("data")
        groups = []
        for role in roles:
            if role.get("composite"):
                role_name = role.get("name")
                role_response = {
                    "id": role_name,
                    "name": role_name,
                    "path": role_name,
                    "description": "",
                    "permissions": []
                }
                permissions_url = f"integrations/{css_integration_id}/{css_env}/roles/{role_name}/composite-roles"
                response = self.session.request("GET", f'{self.base_url}/{permissions_url}')
                comp_roles = response.json().get("data")
                for comp_role in comp_roles:
                    role_response.get("permissions").append(comp_role.get("name"))
                groups.append(role_response)

        return groups

    @user_context
    def get_analytics_groups(self, page_no: int, limit: int, **kwargs):
        """Query all the client roles which starts with the prefix."""
        return self.get_groups_roles(search=None, sort_order=None)

    def update_group(self, group_id: str, data: Dict):
        """Update keycloak group."""
        css_env = current_app.config.get("CSS_ENV")
        css_integration_id = current_app.config.get("CSS_INTEGRATION_ID")
        # First get the composite role and it's associated roles. Find the missing ones and delete them, add the new role.
        permissions_url = f"integrations/{css_integration_id}/{css_env}/roles/{group_id}/composite-roles"
        response = self.session.request("GET", f'{self.base_url}/{permissions_url}')
        comp_roles = response.json().get("data")
        existing_roles = []
        for comp_role in comp_roles:
            if (name:=comp_role.get("name")) not in data.get("permissions"):
                current_app.logger.debug("deleting composite role ", name)
                self.session.request("DELETE", f'{self.base_url}/{permissions_url}/{name}')
            else:
                existing_roles.append(name)
        post_payload = []
        current_app.logger.debug("existing_roles ", existing_roles)

        for new_role in list(set(data.get("permissions")) - set(existing_roles)):
            post_payload.append({"name": new_role})
        current_app.logger.debug("post_payload ", post_payload)
        response = self.session.request("POST", f'{self.base_url}/{permissions_url}', data=json.dumps(post_payload))
        response.raise_for_status()
        return data

    def create_group_role(self, data: Dict):
        """Create group."""
        current_app.logger.debug("Creating role...")
        css_env = current_app.config.get("CSS_ENV")
        css_integration_id = current_app.config.get("CSS_INTEGRATION_ID")
        # First create a role, then add composite roles
        roles_url = f"integrations/{css_integration_id}/{css_env}/roles"
        response = self.session.request("POST", f'{self.base_url}/{roles_url}', data = json.dumps({'name': data.get("name")}))
        response.raise_for_status()

        comp_role_payload = []
        for permission in data.get("permissions"):
            comp_role_payload.append({"name": permission})

        response = self.session.request("POST", f'{self.base_url}/{roles_url}/{data.get("name")}/composite-roles', data=json.dumps(comp_role_payload))
        response.raise_for_status()
        return data
