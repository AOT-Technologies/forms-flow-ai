"""This exposes the Formio APIs."""
import json
from http import HTTPStatus

import jwt
import requests
from flask import current_app

from formsflow_api.exceptions import BusinessException
from formsflow_api.utils import cache


class FormioService:  # pylint: disable=too-few-public-methods
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
        payload = json.dumps(payload)
        response = requests.post(url, headers=headers, data=payload)
        if response.ok:
            access_token = response.headers["x-jwt-token"]
            token = jwt.decode(access_token, options={"verify_signature": False})
            timeout = token["exp"] - token["iat"]
            cache.set("access_token", access_token, timeout=timeout)
            return access_token
        raise BusinessException(
            "Unable to get access token from formio server", HTTPStatus.BAD_REQUEST
        )
