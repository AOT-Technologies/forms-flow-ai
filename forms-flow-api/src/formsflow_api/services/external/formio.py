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

    @classmethod
    def get_access_token(cls):
        """Method to get formio access token."""
        headers = {"Content-Type": "application/json"}
        url = f"{current_app.config.get('FORMIO_URL')}/user/login"
        payload = {
            "data": {
                "email": current_app.config.get("FORMIO_USERNAME"),
                "password": current_app.config.get("FORMIO_PASSWORD"),
            }
        }
        response = requests.post(url, headers=headers, data=json.dumps(payload))
        if response.ok:
            access_token = response.headers["x-jwt-token"]
            token = jwt.decode(access_token, options={"verify_signature": False})
            timeout = token["exp"] - token["iat"]
            cache.set("access_token", access_token, timeout=timeout)
            return access_token
        raise BusinessException(
            "Unable to get access token from formio server", HTTPStatus.BAD_REQUEST
        )

    @classmethod
    def create_form(cls, data, access_token):
        """Method to create form."""
        headers = {"Content-Type": "application/json", "x-jwt-token": access_token}
        url = f"{current_app.config.get('FORMIO_URL')}/form"
        response = requests.post(url, headers=headers, data=json.dumps(data))
        if response.ok:
            return response.json()
        raise BusinessException(response.json(), HTTPStatus.BAD_REQUEST)
