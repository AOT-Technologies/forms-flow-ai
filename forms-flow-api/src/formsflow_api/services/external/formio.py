"""This exposes the Formio APIs."""
import json

import requests
from flask import current_app


class FormioService:
    """This class manages formio API calls."""

    @classmethod
    def post_request(cls):
        """Method to get formio access token."""
        headers = {"Content-Type": "application/json"}
        url = f"{current_app.config.get('FORMIO_URL')}/user/login"
        payload = {"data": {"email": "admin@example.com", "password": "aot123"}}
        payload = json.dumps(payload)
        current_app.logger.debug("url %s", url)
        response = requests.post(url, headers=headers, data=payload)
        if response.ok:
            return response.headers["x-jwt-token"]
        return None
