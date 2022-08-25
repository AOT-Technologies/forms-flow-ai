"""This exports all of the base externel service used by the application."""

import json

import requests
from flask import current_app
from formsflow_api_utils.utils.logging import log_bpm_error


class BaseBPMService:
    """This class manages all of the base externel service calls."""

    @classmethod
    def get_request(cls, url, token):
        """Get HTTP request to BPM API with auth header."""
        headers = cls._get_headers_(token)
        response = requests.get(url, headers=headers)
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

        return data

    @classmethod
    def post_request(cls, url, token, payload=None):
        """Post HTTP request to BPM API with auth header."""
        headers = cls._get_headers_(token)
        payload = json.dumps(payload)
        response = requests.post(url, data=payload, headers=headers, timeout=120)
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
            # response.raise_for_status()
        return data

    @classmethod
    def _get_headers_(cls, token):
        """Generate headers."""
        bpm_token_api = current_app.config.get("BPM_TOKEN_API")
        bpm_client_id = current_app.config.get("BPM_CLIENT_ID")
        bpm_client_secret = current_app.config.get("BPM_CLIENT_SECRET")
        bpm_grant_type = current_app.config.get("BPM_GRANT_TYPE")

        headers = {"Content-Type": "application/x-www-form-urlencoded"}
        payload = {
            "client_id": bpm_client_id,
            "client_secret": bpm_client_secret,
            "grant_type": bpm_grant_type,
        }
        if token:
            return {"Authorization": token, "content-type": "application/json"}

        response = requests.post(bpm_token_api, headers=headers, data=payload)
        data = json.loads(response.text)
        return {
            "Authorization": "Bearer " + data["access_token"],
            "Content-Type": "application/json",
        }
