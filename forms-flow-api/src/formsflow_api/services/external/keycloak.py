"""This exposes the Keycloak Admin APIs."""
import json

import requests
from flask import current_app
from formsflow_api_utils.utils import (
    FORMSFLOW_ROLES,
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

        response = requests.post(bpm_token_api, headers=headers, data=payload)
        data = json.loads(response.text)
        assert data["access_token"] is not None
        self.session.headers.update(
            {
                "Authorization": "Bearer " + data["access_token"],
                "Content-Type": "application/json",
            }
        )
        self.base_url = (
            f"{current_app.config.get('KEYCLOAK_URL')}/auth/admin/realms/"
            f"{current_app.config.get('KEYCLOAK_URL_REALM')}"
        )

    @profiletime
    def get_request(self, url_path):
        """Method to fetch get request of Keycloak Admin APIs.

        : url_path: The relative path of the API
        """
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
                dashboard_group_list = list(group["subGroups"])
                for dashboard_group in dashboard_group_list:
                    dashboard_group["dashboards"] = (
                        self.get_request(url_path=f"groups/{dashboard_group['id']}")
                        .get("attributes")
                        .get("dashboards")
                    )
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
                client_role["dashboards"] = (
                    self.get_request(
                        url_path=f"roles-by-id/{client_role['id']}?client={client_id}"
                    )
                    .get("attributes")
                    .get("dashboards")
                )
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
        """Method to fetch get request of Keycloak Admin APIs.

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
        if response.status_code == 204:
            return f"Updated - {url_path}"
