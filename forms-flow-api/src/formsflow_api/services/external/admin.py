"""This exposes the Admin API."""

import json

import requests
from flask import current_app
from formsflow_api_utils.exceptions import BusinessException
from formsflow_api_utils.utils import HTTP_TIMEOUT

from formsflow_api.constants import BusinessErrorCode


class AdminService:  # pylint: disable=too-few-public-methods
    """This class manages external calls to admin api service."""

    @classmethod
    def get_request(cls, url, token):
        """Get HTTP request to Admin API with auth header."""
        headers = {"Authorization": token, "content-type": "application/json"}
        try:
            response = requests.get(url, headers=headers, timeout=HTTP_TIMEOUT)
            current_app.logger.debug(
                "GET URL : %s, Response Code : %s", url, response.status_code
            )
            if response.ok:
                return json.loads(response.text)
            raise BusinessException(BusinessErrorCode.INVALID_ADMIN_RESPONSE)
        except requests.ConnectionError as e:
            raise BusinessException(BusinessErrorCode.ADMIN_SERVICE_UNAVAILABLE) from e
