"""This exposes the Formio APIs."""
import json
from http import HTTPStatus

import jwt
import requests
from flask import current_app

from formsflow_api.exceptions import BusinessException
from formsflow_api.utils import cache


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
            "Unable to get access token from formio server", HTTPStatus.BAD_REQUEST
        )

    def create_form(self, data, formio_token):
        """Post request to formio API to create form."""
        headers = {"Content-Type": "application/json", "x-jwt-token": formio_token}
        url = f"{self.base_url}/form"
        response = requests.post(url, headers=headers, data=json.dumps(data))
        if response.ok:
            return response.json()
        raise BusinessException(response.json(), HTTPStatus.BAD_REQUEST)
