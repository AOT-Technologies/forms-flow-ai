"""This exposes BPM Service."""

from enum import IntEnum
from typing import Dict

from flask import current_app
from formsflow_api_utils.exceptions import BusinessException

from formsflow_api.constants import BusinessErrorCode

from .base_bpm import BaseBPMService


class BPMEndpointType(IntEnum):
    """This enum provides the list of bpm endpoints type."""

    PROCESS_DEFINITION = 1
    FORM_AUTH_DETAILS = 2
    MESSAGE_EVENT = 3


class BPMService(BaseBPMService):
    """This class manages all of the Camunda BPM Service."""

    @classmethod
    def get_all_process(cls, token):
        """Get all process."""
        url = cls._get_url_(BPMEndpointType.PROCESS_DEFINITION) + "?latestVersion=true"
        current_app.logger.debug(url)
        return cls.get_request(url, token)

    @classmethod
    def get_process_details_by_key(cls, process_key, token):
        """Get process details."""
        current_app.logger.debug(
            "Getting process details. Process Key : %s", process_key
        )
        for process_definition in cls.get_all_process(token):
            if process_definition.get("key") == process_key:
                current_app.logger.debug(
                    "Found Process Definition. process_definition : %s",
                    process_definition,
                )
                return process_definition
        return None

    @classmethod
    def post_process_start(cls, process_key, payload, token, tenant_key):
        """Post process start."""
        url = (
            f"{cls._get_url_(BPMEndpointType.PROCESS_DEFINITION)}/"
            f"key/{process_key}/start"
        )
        return cls.post_request(url, token, payload=payload, tenant_key=tenant_key)

    @classmethod
    def post_process_start_tenant(
        cls, process_key: str, payload: Dict, token: str, tenant_key: str
    ):
        """Post process start based on tenant key."""
        url = (
            f"{cls._get_url_(BPMEndpointType.PROCESS_DEFINITION)}/"
            f"key/{process_key}/start?tenantId=" + tenant_key
        )
        return cls.post_request(url, token, payload=payload)

    @classmethod
    def get_auth_form_details(cls, token):
        """Get authorized form details."""
        url = cls._get_url_(BPMEndpointType.FORM_AUTH_DETAILS)
        return cls.get_request(url, token)

    @classmethod
    def send_message(cls, data, token):
        """Correlate a Message."""
        url = cls._get_url_(BPMEndpointType.MESSAGE_EVENT)
        return cls.post_request(url, token, data)

    @classmethod
    def _get_url_(cls, endpoint_type: BPMEndpointType):
        """Get Url."""
        bpm_api_base = current_app.config.get("BPM_API_URL")
        try:
            if endpoint_type == BPMEndpointType.PROCESS_DEFINITION:
                url = f"{bpm_api_base}/engine-rest-ext/v1/process-definition"
            elif endpoint_type == BPMEndpointType.FORM_AUTH_DETAILS:
                url = f"{bpm_api_base}/engine-rest-ext/v1/admin/form/authorization"
            elif endpoint_type == BPMEndpointType.MESSAGE_EVENT:
                url = f"{bpm_api_base}/engine-rest-ext/v1/message"
            return url

        except BaseException as e:  # pylint: disable=broad-except
            raise BusinessException(BusinessErrorCode.BPM_BASE_URL_NOT_SET) from e
