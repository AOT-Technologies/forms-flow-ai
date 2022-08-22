"""This exposes the Formio APIs."""
import json
from http import HTTPStatus

import jwt
import requests
from flask import current_app

from formsflow_api_utils.exceptions import BusinessException
from formsflow_api_utils.utils import cache


class FormioService:
    """This class manages formio API calls."""

    def __init__(self):
        """Initializing the service."""
        self.base_url = current_app.config.get("FORMIO_URL")

    @classmethod
    def decode_timeout(cls, token):
        """Method to decode token and get timeout."""
        token = jwt.decode(token, options={"verify_signature": False})
        timeout = token["exp"] - token["iat"]
        return timeout

    def get_formio_access_token(self):
        """Method to get formio access token."""
        formio_token = cache.get("formio_token")
        if formio_token is None:
            formio_token = self.generate_formio_token()
            cache.set(
                "formio_token",
                formio_token,
                timeout=self.decode_timeout(formio_token),
            )
        return formio_token

    def generate_formio_token(self):
        """Method to generate formio token using formio login API."""
        headers = {"Content-Type": "application/json"}
        url = f"{self.base_url}/user/login"
        payload = {
            "data": {
                "email": current_app.config.get("FORMIO_USERNAME"),
                "password": current_app.config.get("FORMIO_PASSWORD"),
            }
        }
        current_app.logger.info("Generate formio token using formio login API.")
        response = requests.post(url, headers=headers, data=json.dumps(payload))
        if response.ok:
            form_io_token = response.headers["x-jwt-token"]
            return form_io_token
        raise BusinessException(
            "Unable to get access token from formio server",
            HTTPStatus.SERVICE_UNAVAILABLE,
        )

    def create_form(self, data, formio_token):
        """Post request to formio API to create form."""
        headers = {"Content-Type": "application/json", "x-jwt-token": formio_token}
        url = f"{self.base_url}/form"
        response = requests.post(url, headers=headers, data=json.dumps(data))
        if response.ok:
            return response.json()
        raise BusinessException(response.json(), HTTPStatus.BAD_REQUEST)

    def get_role_ids(self):
        """Get request to forio API to retrieve role ids."""
        url = f"{self.base_url}/role"
        headers = {"x-jwt-token": self.get_formio_access_token()}
        current_app.logger.info("Role id fetching started...")

        response = requests.get(url, headers=headers)
        if response.ok:
            current_app.logger.info("Role ids collected successfully...")
            return response.json()
        current_app.logger.error("Failed to fetch role ids !!!")
        raise BusinessException(response.json(), HTTPStatus.SERVICE_UNAVAILABLE)

    def get_user_resource_ids(self):
        """Get request to Formio API to retrieve user resource ids."""
        url = f"{self.base_url}/user"
        current_app.logger.info("Fetching user resource ids...")
        response = requests.get(url)
        if response.ok:
            current_app.logger.info("User resource ids collected successfully.")
            return response.json()
        current_app.logger.error("Failed to fetch user resource ids!")
        raise BusinessException(response.json(), HTTPStatus.SERVICE_UNAVAILABLE)

    def get_form(self, data, formio_token):
        """Get request to formio API to get form details."""
        headers = {"Content-Type": "application/json", "x-jwt-token": formio_token}
        url = f"{self.base_url}/form/" + data["form_id"]
        response = requests.get(url, headers=headers)
        if response.ok:
            return response.json()
        raise BusinessException(response.json(), HTTPStatus.BAD_REQUEST)

    def get_submission(self, data, formio_token):
        """Get request to formio API to get submission details."""
        headers = {"Content-Type": "application/json", "x-jwt-token": formio_token}
        url = (
            f"{self.base_url}/form/" + data["form_id"] + "/submission/" + data["sub_id"]
        )
        response = requests.get(url, headers=headers, data=json.dumps(data))
        if response.ok:
            return response.json()
        raise BusinessException(response.json(), HTTPStatus.BAD_REQUEST)
