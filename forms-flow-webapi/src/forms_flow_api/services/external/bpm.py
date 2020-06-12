"""This exposes BPM Service."""
import json

import requests
from flask import current_app


class BPMService():
    """Service to manage Camunda BPM API calls."""

    # TODO: Change this to specific function's instead of generic one or
    # make this as a base class and extend according to seperate service.

    @staticmethod
    def get_request(url):
        """Get HTTP request to Camunda BPM."""
        headers = BPMService._get_headers_()
        r = requests.get(url, headers=headers)
        return json.loads(r.text)

    @staticmethod
    def post_request(url):
        """Post HTTP request to Camunda BPM."""
        headers = BPMService._get_headers_()
        r = requests.post(url, headers=headers)
        return json.loads(r.text)

    @staticmethod
    def _get_headers_():
        """Generate headers."""
        bpm_token_api = current_app.config.get('BPM_TOKEN_API')
        bpm_client_id = current_app.config.get('BPM_CLIENT_ID')
        bpm_client_secret = current_app.config.get('BPM_CLIENT_SECRET')
        bpm_grant_type = current_app.config.get('BPM_GRANT_TYPE')

        headers = {'Content-Type': 'application/x-www-form-urlencoded'}
        payload = {
            'client_id': bpm_client_id,
            'client_secret': bpm_client_secret,
            'grant_type': bpm_grant_type
        }
        response = requests.post(bpm_token_api, headers=headers, data=payload)
        data = json.loads(response.text)

        return {
            'Authorization': 'Bearer ' + data['access_token']
        }
