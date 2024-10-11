"""This exports all of the base externel service used by the application."""

import json

import requests
from flask import current_app
from formsflow_api_utils.exceptions import BusinessException
from formsflow_api_utils.utils import HTTP_TIMEOUT, log_bpm_error

from formsflow_api.constants import BusinessErrorCode


class BaseBPMService:
    """This class manages all of the base externel service calls."""

    @classmethod
    def get_request(cls, url, token):
        """Get HTTP request to BPM API with auth header."""
        headers = cls._get_headers_(token)
        response = requests.get(url, headers=headers, timeout=HTTP_TIMEOUT)
        data = None
        current_app.logger.debug(
            "GET URL : %s, Response Code : %s", url, response.status_code
        )
        if response.ok:
            data = json.loads(response.text)
        else:
            log_bpm_error(
                "ERROR:Create - status_code: "
                + str(response.status_code)
                + ", "
                + response.text
            )
            raise BusinessException(BusinessErrorCode.INVALID_BPM_RESPONSE)
        return data

    @classmethod
    def post_request(
        cls, url, token, payload=None, tenant_key=None, files=None
    ):  # pylint: disable=too-many-arguments, too-many-positional-arguments
        """Post HTTP request to BPM API with auth header."""
        headers = cls._get_headers_(token, tenant_key, files)
        payload = payload if files else json.dumps(payload)
        response = requests.post(
            url, data=payload, headers=headers, timeout=120, files=files
        )
        current_app.logger.debug(
            "POST URL : %s, Response Code : %s", url, response.status_code
        )
        data = None
        if response.ok:
            if response.text:
                data = json.loads(response.text)
            else:
                data = True
        else:
            log_bpm_error(
                "ERROR:Create - status_code: "
                + str(response.status_code)
                + ", "
                + response.text
            )
            raise BusinessException(BusinessErrorCode.INVALID_BPM_RESPONSE)

        return data

    @classmethod
    def _get_headers_(cls, token, tenant_key=None, files=None):
        """Generate headers."""
        bpm_token_api = current_app.config.get("BPM_TOKEN_API")
        bpm_client_id = current_app.config.get("BPM_CLIENT_ID")
        bpm_client_secret = current_app.config.get("BPM_CLIENT_SECRET")
        bpm_grant_type = current_app.config.get("BPM_GRANT_TYPE")
        if current_app.config.get("MULTI_TENANCY_ENABLED") and tenant_key:
            bpm_client_id = f"{tenant_key}-{bpm_client_id}"

        headers = {"Content-Type": "application/x-www-form-urlencoded"}
        payload = {
            "client_id": bpm_client_id,
            "client_secret": bpm_client_secret,
            "grant_type": bpm_grant_type,
        }
        if token:
            if files:
                return {"Authorization": token}
            return {"Authorization": token, "content-type": "application/json"}

        response = requests.post(
            bpm_token_api, headers=headers, data=payload, timeout=HTTP_TIMEOUT
        )
        data = json.loads(response.text)
        return {
            "Authorization": "Bearer " + data["access_token"],
            "Content-Type": "application/json",
        }
