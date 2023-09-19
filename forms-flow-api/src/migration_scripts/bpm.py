"""Expose bpm endpoints."""

import json
import os
from enum import Enum

import requests
from flask import current_app


class BPMEndpointType(Enum):
    """This enum provides the list of bpm endpoints type."""

    AUTHORIZATION = "AUTHORIZATION"
    FILTER_LIST = "FILTER_LIST"
    FILTER_PERMISSION = "FILTER_PERMISSION"


def get_headers(tenant_key=None):
    """Generate headers."""
    bpm_token_api = os.getenv("BPM_TOKEN_API")
    bpm_client_id = os.getenv("BPM_CLIENT_ID")
    bpm_client_secret = os.getenv("BPM_CLIENT_SECRET")
    bpm_grant_type = os.getenv("BPM_GRANT_TYPE", "client_credentials")
    multi_tenancy_enabled = (
        str(os.getenv("KEYCLOAK_ENABLE_CLIENT_AUTH", default="false")).lower() == "true"
    )
    if multi_tenancy_enabled and tenant_key:
        bpm_client_id = f"{tenant_key}-{bpm_client_id}"
        current_app.logger.debug(
            f"Multitenanacy enabled. BPM client ID : {bpm_client_id}"
        )

    headers = {"Content-Type": "application/x-www-form-urlencoded"}
    payload = {
        "client_id": bpm_client_id,
        "client_secret": bpm_client_secret,
        "grant_type": bpm_grant_type,
    }
    response = requests.post(bpm_token_api, headers=headers, data=payload)
    current_app.logger.debug(
        f"BPM token API {bpm_token_api} response status : {response.status_code}"
    )

    if response.ok:
        data = json.loads(response.text)
        return {
            "Authorization": "Bearer " + data["access_token"],
            "Content-Type": "application/json",
        }


def get_url(endpoint_type):
    """Get Url."""
    bpm_api_base = os.getenv("BPM_API_URL")
    if endpoint_type == BPMEndpointType.AUTHORIZATION:
        url = f"{bpm_api_base}/engine-rest-ext/v1/admin/form/authorization"
    elif endpoint_type == BPMEndpointType.FILTER_LIST:
        url = f"{bpm_api_base}/engine-rest-ext/v1/filter?resourceType=Task"
    elif endpoint_type == BPMEndpointType.FILTER_PERMISSION:
        url = f"{bpm_api_base}/engine-rest-ext/v1/authorization?resourceType=5"
    return url
