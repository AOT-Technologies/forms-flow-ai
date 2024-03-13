"""This exposes the Keycloak Admin APIs."""
import json

import requests
from flask import current_app
from formsflow_api_utils.utils import (
    FORMSFLOW_ROLES,
    HTTP_TIMEOUT,
    KEYCLOAK_DASHBOARD_BASE_GROUP,
    UserContext,
    profiletime,
    user_context,
)


class KeycloakAdminAPIService:
    """This class manages all the Keycloak service API calls."""

    def __init__(self):
        """Initializing the service."""
        self.session = requests.Session()
        bpm_token_api = current_app.config.get("BPM_TOKEN_API")
        bpm_client_id = current_app.config.get("BPM_CLIENT_ID")
        bpm_client_secret = current_app.config.get("BPM_CLIENT_SECRET")
        bpm_grant_type = current_app.config.get("BPM_GRANT_TYPE")
        headers = {"Content-Type": "application/x-www-form-urlencoded"}
        payload = {
            "client_id": bpm_client_id,
            "client_secret": bpm_client_secret,
            "grant_type": bpm_grant_type,
        }

        response = requests.post(
            bpm_token_api, headers=headers, data=payload, timeout=HTTP_TIMEOUT
        )
        data = json.loads(response.text)
        assert data["access_token"] is not None
        self.session.headers.update(
            {
                "Authorization": "Bearer " + data["access_token"],
                "Content-Type": "application/json",
            }
        )
        self.base_url = (
            f"{current_app.config.get('KEYCLOAK_URL')}/"
            f"{current_app.config.get('KEYCLOAK_URL_HTTP_RELATIVE_PATH', 'auth/')}admin/realms/"
            f"{current_app.config.get('KEYCLOAK_URL_REALM')}"
        )

    @profiletime
    def get_request(self, url_path):
        """Method to fetch get request of Keycloak Admin APIs.

        : url_path: The relative path of the API
        """
        current_app.logger.debug("Establishing new connection to keycloak...")
        url = f"{self.base_url}/{url_path}"
        response = self.session.request("GET", url)
        current_app.logger.debug(f"keycloak Admin API get request URL: {url}")
        current_app.logger.debug(f"Keycloak response: {response.json()}")
        response.raise_for_status()

        if response.ok:
            return response.json()
        return None

    def get_paginated_request(self, url_path, first, max_results):
        """Method to fetch GET paginated request of Keycloak Admin APIs.

        : url_path: The relative path of the API
        : first: The page_number
        : max_results: The max number of items per page
        """
        url = f"{self.base_url}/{url_path}?first={first}&max={max_results}"
        response = self.session.request("GET", url)
        response.raise_for_status()

        if response.ok:
            return response.json()
        return None

    def get_analytics_groups(self, page_no: int, limit: int):
        """Return groups for analytics users."""
        dashboard_group_list: list = []
        if page_no == 0 and limit == 0:
            group_list_response = self.get_request(url_path="groups")
        else:
            group_list_response = self.get_paginated_request(
                url_path="groups", first=page_no, max_results=limit
            )

        for group in group_list_response:
            if group["name"] == KEYCLOAK_DASHBOARD_BASE_GROUP:
                if group.get("subGroupCount", 0) > 0:
                    dashboard_group_list = self.get_subgroups(group["id"])
                else:
                    dashboard_group_list = list(group["subGroups"])
        return dashboard_group_list

    def get_analytics_roles(self, page_no: int, limit: int):
        """Return roles for analytics users."""
        current_app.logger.debug("Getting analytics roles")
        dashboard_roles_list: list = []
        client_id = self.get_client_id()
        # Look for exact match
        if page_no == 0 and limit == 0:
            roles = self.get_request(f"clients/{client_id}/roles")
        else:
            roles = self.get_paginated_request(
                url_path=f"clients/{client_id}/roles",
                first=page_no,
                max_results=limit,
            )
        current_app.logger.debug("Client roles %s", roles)
        for client_role in roles:
            if client_role["name"] not in FORMSFLOW_ROLES:
                client_role["path"] = client_role["name"]
                dashboard_roles_list.append(client_role)
        current_app.logger.debug("dashboard_roles_list %s", dashboard_roles_list)
        return dashboard_roles_list

    @user_context
    def get_client_id(self, **kwargs):
        """Get client id."""
        user: UserContext = kwargs["user"]
        client_name = current_app.config.get("JWT_OIDC_AUDIENCE")
        if current_app.config.get("MULTI_TENANCY_ENABLED"):
            client_name = f"{user.tenant_key}-{client_name}"
        current_app.logger.debug("Client name %s", client_name)
        # Find client id from keycloak using client name
        url_path = f"clients?clientId={client_name}&search=true"
        clients_response = self.get_request(url_path)
        # Look for exact match
        for client in clients_response:
            if client.get("clientId") == client_name:
                return client.get("id")
        return None

    @profiletime
    def update_request(  # pylint: disable=inconsistent-return-statements
        self, url_path, data=None
    ):
        """Method to fetch PUT request of Keycloak Admin APIs.

        : url_path: The relative path of the API
        : data: The request data object
        """
        url = f"{self.base_url}/{url_path}"
        try:
            response = self.session.request(
                "PUT",
                url,
                data=json.dumps(data),
            )
            current_app.logger.debug(f"keycloak Admin API PUT request URL: {url}")
            current_app.logger.debug(f"Keycloak Admin PUT API payload {data}")
            current_app.logger.debug(f"Keycloak response: {response}")
        except Exception as err_code:
            raise f"Request to Keycloak Admin APIs failed., {err_code}"
        response.raise_for_status()
        if response.status_code == 204:
            return f"Updated - {url_path}"

    def get_groups(self):
        """Return groups."""
        current_app.logger.debug("Getting groups")
        group_list_response = self.get_request(
            url_path="groups?briefRepresentation=false"
        )
        current_app.logger.debug("Groups %s", group_list_response)
        return group_list_response

    def get_subgroups(self, group_id):
        """Return sub groups."""
        current_app.logger.debug(f"Getting subgroups for groupID: {group_id}")
        group_list_response = self.get_request(
            url_path=f"groups/{group_id}/children?briefRepresentation=false"
        )
        current_app.logger.debug("Sub Groups %s", group_list_response)
        return group_list_response

    def get_roles(self, search: str = ""):
        """Return roles."""
        current_app.logger.debug("Getting roles")
        client_id = self.get_client_id()
        roles = self.get_request(f"clients/{client_id}/roles?search={search}")
        current_app.logger.debug("Client roles %s", roles)
        return roles

    @profiletime
    def delete_request(self, url_path, data=None) -> bool:
        """Method to invoke delete.

        : url_path: The relative path of the API
        """
        url = f"{self.base_url}/{url_path}"
        try:
            response = self.session.request("DELETE", url, data=json.dumps(data))
            current_app.logger.debug(f"keycloak Admin API DELETE request URL: {url}")
        except Exception as err_code:
            raise f"Request to Keycloak Admin APIs failed., {err_code}"
        response.raise_for_status()
        return response.status_code == 204

    @profiletime
    def create_request(  # pylint: disable=inconsistent-return-statements
        self, url_path, data=None
    ):
        """Method to create request of Keycloak Admin APIs.

        : url_path: The relative path of the API
        : data: The request data object
        """
        try:
            url = f"{self.base_url}/{url_path}"
            response = self.session.request(
                "POST",
                url,
                data=json.dumps(data),
            )
            current_app.logger.debug(f"keycloak Admin API POST request URL: {url}")
            current_app.logger.debug(f"Keycloak Admin POST API payload {data}")
            current_app.logger.debug(f"Keycloak response: {response}")
        except Exception as err_code:
            raise f"Request to Keycloak Admin APIs failed., {err_code}"
        response.raise_for_status()
        return response

    @profiletime
    def get_user_groups(self, user: str):
        """Return list of groups that the given user is part of."""
        return self.get_request(f"users/{user}/groups")

    @profiletime
    def get_user_roles(self, user: str):
        """Return list of roles that the given user is part of."""
        client_id = self.get_client_id()
        return self.get_request(
            f"users/{user}/role-mappings/clients/{client_id}/composite"
        )

    @profiletime
    def get_realm_users(self, search: str, page_no: int, limit: int):
        """Return list of users in the realm."""
        url = f"users?first={(page_no - 1) * limit}&max={limit}"
        if search:
            url += f"&search={search}"
        return self.get_request(url_path=url)

    @profiletime
    def get_realm_users_count(self, search: str):
        """Return users count in the realm."""
        url = "users/count"
        if search:
            url += f"?search={search}"
        return self.get_request(url_path=url)
