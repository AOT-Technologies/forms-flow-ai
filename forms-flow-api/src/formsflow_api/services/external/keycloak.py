"""This exposes the Keycloak Admin APIs"""
import json
import requests
from flask import current_app
from formsflow_api.utils import profiletime


class KeycloakAdminAPIService(object):
    """This class manages all the Keycloak service API calls"""

    def __init__(self):
        self.session = requests.Session()
        username = current_app.config.get("KEYCLOAK_ADMIN_USERNAME")
        password = current_app.config.get("KEYCLOAK_ADMIN_PASSWORD")

        headers = {"Content-Type": "application/x-www-form-urlencoded"}
        payload = {
            "client_id": "admin-cli",
            "username": username,
            "password": password,
            "grant_type": "password",
        }

        token_api = f"{current_app.config.get('KEYCLOAK_URL')}/auth/realms/master/protocol/openid-connect/token"
        response = requests.post(token_api, headers=headers, data=payload)
        data = json.loads(response.text)
        assert data["access_token"] is not None
        self.session.headers.update(
            {
                "Authorization": "Bearer " + data["access_token"],
                "Content-Type": "application/json",
            }
        )
        self.base_url = f"{current_app.config.get('KEYCLOAK_URL')}/auth/admin/realms/{current_app.config.get('KEYCLOAK_URL_REALM')}"

    @profiletime
    def get_request(self, url_path):
        """Method to fetch get request of Keycloak Admin APIs
        :param url_path: The relative path of the API
        """
        url = f"{self.base_url}/{url_path}"
        response = self.session.request("GET", url)
        response.raise_for_status()

        if response.ok:
            return response.json()
        else:
            return None

    def get_paginated_request(self, url_path, first, max):
        """Method to fetch GET paginated request of Keycloak Admin APIs
        :param url_path: The relative path of the API
        :param first: The page_number
        :param max: The max number of items per page
        """
        url = f"{self.base_url}/{url_path}?first={first}&max={max}"
        response = self.session.request("GET", url)
        response.raise_for_status()

        if response.ok:
            return response.json()
        else:
            return None

    @profiletime
    def update_request(self, url_path, data=None):
        """Method to fetch get request of Keycloak Admin APIs
        :param url_path: The relative path of the API
        :param data: The request data object
        """
        url = f"{self.base_url}/{url_path}"
        try:
            response = self.session.request(
                "PUT",
                url,
                data=json.dumps(data),
            )
        except Exception as e:
            raise f"Request to Keycloak Admin APIs failed., {e}"
        else:
            if response.status_code == 204:
                return f"Updated - {url_path}"
