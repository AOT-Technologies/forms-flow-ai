"""This exposes the Keycloak Admin APIs."""

import json
import time
from urllib.parse import quote

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


class KeycloakAdminAPIService:
    """This class manages all the Keycloak service API calls."""

    def __init__(self):
        """Initializing the service."""
        self.session = requests.Session()
        self._realm_info_cache = None
        self._realm_info_cache_time = 0
        self._realm_info_cache_ttl = 300
        bpm_token_api = current_app.config.get("BPM_TOKEN_API")
        bpm_client_id = current_app.config.get("BPM_CLIENT_ID")
        bpm_client_secret = current_app.config.get("BPM_CLIENT_SECRET")
        bpm_grant_type = current_app.config.get("BPM_GRANT_TYPE")

        # Validate required configuration
        if not all([bpm_token_api, bpm_client_id, bpm_client_secret]):
            current_app.logger.error(
                "Missing BPM configuration. Required: BPM_TOKEN_API, BPM_CLIENT_ID, BPM_CLIENT_SECRET"
            )
            raise BusinessException(BusinessErrorCode.BPM_CONFIG_MISSING)

        headers = {"Content-Type": "application/x-www-form-urlencoded"}
        payload = {
            "client_id": bpm_client_id,
            "client_secret": bpm_client_secret,
            "grant_type": bpm_grant_type,
        }

        try:
            response = requests.post(
                bpm_token_api, headers=headers, data=payload, timeout=HTTP_TIMEOUT
            )
            response.raise_for_status()
            data = json.loads(response.text)
            if not data.get("access_token"):
                current_app.logger.error(
                    f"Failed to obtain access token from Keycloak. Response: {data}"
                )
                raise BusinessException(BusinessErrorCode.KEYCLOAK_REQUEST_FAIL)
        except requests.exceptions.RequestException as err:
            current_app.logger.error(f"Failed to connect to Keycloak token endpoint: {err}")
            raise BusinessException(BusinessErrorCode.KEYCLOAK_REQUEST_FAIL) from err

        self.session.headers.update(
            {
                "Authorization": "Bearer " + data["access_token"],
                "Content-Type": "application/json",
            }
        )
        self.base_url = (
            f"{current_app.config.get('KEYCLOAK_URL')}{current_app.config.get('KEYCLOAK_URL_HTTP_RELATIVE_PATH')}"
            f"/admin/realms/"
            f"{current_app.config.get('KEYCLOAK_URL_REALM')}"
        )

    @profiletime
    def get_request(self, url_path):
        """Method to fetch get request of Keycloak Admin APIs.

        : url_path: The relative path of the API
        """
        current_app.logger.debug("Establishing new connection to keycloak...")
        url = f"{self.base_url}/{url_path}"
        try:
            response = self.session.request("GET", url)
            current_app.logger.debug(f"keycloak Admin API get request URL: {url}")
            current_app.logger.debug(f"Keycloak response status: {response.status_code}")

            if response.status_code == 401:
                current_app.logger.error(
                    f"Keycloak Admin API returned 401 Unauthorized for {url}. "
                    "Check if the BPM service account has proper realm-management roles "
                    "(e.g., view-identity-providers, manage-users)."
                )
                raise BusinessException(BusinessErrorCode.KEYCLOAK_REQUEST_FAIL)

            response.raise_for_status()

            if response.ok:
                return response.json()
            return None
        except requests.exceptions.HTTPError as err:
            current_app.logger.error(f"Keycloak Admin API request failed: {err}")
            raise BusinessException(BusinessErrorCode.KEYCLOAK_REQUEST_FAIL) from err

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
            raise BusinessException(
                BusinessErrorCode.KEYCLOAK_REQUEST_FAIL
            ) from err_code
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
            raise BusinessException(
                BusinessErrorCode.KEYCLOAK_REQUEST_FAIL
            ) from err_code
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
            raise BusinessException(
                BusinessErrorCode.KEYCLOAK_REQUEST_FAIL
            ) from err_code
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

    @profiletime
    def get_user_federated_identity(self, user_id: str):
        """Return federated identity providers linked to the user.

        This calls GET /admin/realms/{realm}/users/{userId}/federated-identity
        to determine if a user logs in via internal IDP or external IDP
        (e.g., Google, Microsoft, etc.).
        """
        return self.get_request(url_path=f"users/{user_id}/federated-identity")

    @profiletime
    def get_realm_info(self, force_refresh: bool = False):
        """Return realm information including settings like editUsernameAllowed.

        This calls GET /admin/realms/{realm} to get the realm configuration.
        """
        if (
            not force_refresh
            and self._realm_info_cache
            and (time.time() - self._realm_info_cache_time) < self._realm_info_cache_ttl
        ):
            return self._realm_info_cache
        # The base_url already includes /admin/realms/{realm}
        # So we just need to call get_request with empty path
        url = f"{self.base_url}"
        try:
            response = self.session.request("GET", url)
            current_app.logger.debug(f"keycloak Admin API get realm info URL: {url}")
            current_app.logger.debug(f"Keycloak response status: {response.status_code}")
            response.raise_for_status()
            if response.ok:
                realm_info = response.json()
                self._realm_info_cache = realm_info
                self._realm_info_cache_time = time.time()
                return realm_info
            return None
        except requests.exceptions.HTTPError as err:
            current_app.logger.error(f"Keycloak Admin API get realm info failed: {err}")
            raise BusinessException(BusinessErrorCode.KEYCLOAK_REQUEST_FAIL) from err

    @profiletime
    def get_user_by_username(self, username: str):
        """Check if a username already exists in the realm.

        This calls GET /admin/realms/{realm}/users?exact=true&username={username}
        Returns list of users with exact username match.
        """
        encoded_username = quote(username, safe="")
        url_path = f"users?exact=true&username={encoded_username}"
        return self.get_request(url_path=url_path)

    @profiletime
    def get_user_by_email(self, email: str):
        """Check if an email already exists in the realm.

        This calls GET /admin/realms/{realm}/users?exact=true&email={email}
        Returns list of users with exact email match.
        """
        encoded_email = quote(email, safe="")
        url_path = f"users?exact=true&email={encoded_email}"
        return self.get_request(url_path=url_path)

    @profiletime
    def get_user_by_id(self, user_id: str):
        """Get user by ID.

        This calls GET /admin/realms/{realm}/users/{userId}
        Returns the user representation.
        """
        return self.get_request(url_path=f"users/{user_id}")
