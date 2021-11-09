"""This exposes the Keycloak Admin APIs"""
import json
import requests
from flask import current_app


class KeycloakAdmin:
    """This class manages all the Keycloak service API calls"""

    def get_request(self, url):
        headers = self._get_headers_()
        response = requests.get(url, headers=headers)

        if response.ok:
            return response.json()
        else:
            return None

    def post_request(self, url, payload=None):
        headers = self._get_headers_()
        response = requests.post(url, headers=headers, json=payload)

        # TODO - Need to handle the error response
        if response.ok:
            return response.json()
        else:
            return None

    def update_request(self, url, payload=None):
        headers = self._get_headers_()
        response = requests.put(url, headers=headers, json=payload)

        # TODO - Need to handle the error response
        if response.ok:
            return response.json()
        else:
            return None

    def _get_headers_(self):
        """This method returns the headers for the Keycloak Admin API calls"""
        username = current_app.config["KEYCLOAK_ADMIN_USERNAME"]
        password = current_app.config["KEYCLOAK_ADMIN_PASSWORD"]

        headers = {"Content-Type": "application/x-www-form-urlencoded"}
        payload = {
            "client_id": "admin-cli",
            "username": username,
            "password": password,
            "grant_type": "password",
        }

        token_api = f"{current_app.config['KEYCLOAK_ADMIN_TOKEN_API']}/auth/realms/master/protocol/openid-connect/token"
        response = requests.post(token_api, headers=headers, data=payload)
        data = json.loads(response.text)
        return {
            "Authorization": "Bearer " + data["access_token"],
            "Content-Type": "application/json",
        }
