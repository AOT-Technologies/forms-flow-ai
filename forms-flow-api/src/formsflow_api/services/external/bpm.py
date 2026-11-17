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
    DECISION_DEFINITION = 4
    DEPLOYMENT = 5
    COMPLETE_TASK = 6


class BPMService(BaseBPMService):
    """This class manages all of the Camunda BPM Service."""

    @classmethod
    def get_all_process(cls, token, url_path=None):
        """Get all process."""
        url = cls._get_url_(BPMEndpointType.PROCESS_DEFINITION) + "?latestVersion=true"
        url = url + url_path if url_path else url
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
    def get_decision(cls, token, url_path=None):
        """Get decision details."""
        current_app.logger.debug("Getting decision details.")
        url = cls._get_url_(BPMEndpointType.DECISION_DEFINITION)
        url = url + url_path if url_path else url
        current_app.logger.debug(url)
        return cls.get_request(url, token)

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
    def process_definition_xml(cls, process_key, token, tenant_key):
        """Get process definition xml."""
        url = (
            f"{cls._get_url_(BPMEndpointType.PROCESS_DEFINITION)}/"
            f"key/{process_key}/xml"
        )
        if tenant_key:
            url += f"?tenantId={tenant_key}"
        return cls.get_request(url, token)

    @classmethod
    def decision_definition_xml(cls, decision_key, token, tenant_key):
        """Get decision definition xml."""
        url = (
            f"{cls._get_url_(BPMEndpointType.DECISION_DEFINITION)}/"
            f"key/{decision_key}/xml"
        )
        if tenant_key:
            url += f"?tenantId={tenant_key}"
        return cls.get_request(url, token)

    @classmethod
    def post_deployment(cls, token, payload, tenant_key, files):
        """Create new deployment."""
        url = f"{cls._get_url_(BPMEndpointType.DEPLOYMENT)}"
        return cls.post_request(url, token, payload, tenant_key, files)

    @classmethod
    def complete_task(cls, task_id, payload, token):
        """Complete task."""
        url = cls._get_url_(BPMEndpointType.COMPLETE_TASK).replace("{task_id}", task_id)
        return cls.post_request(url, token, payload=payload)

    @classmethod
    def _get_url_(cls, endpoint_type: BPMEndpointType):
        """Get Url."""
        bpm_api_base = current_app.config.get("BPM_API_URL")
        try:
            url = None
            if endpoint_type == BPMEndpointType.PROCESS_DEFINITION:
                url = f"{bpm_api_base}/engine-rest-ext/v1/process-definition"
            elif endpoint_type == BPMEndpointType.FORM_AUTH_DETAILS:
                url = f"{bpm_api_base}/engine-rest-ext/v1/admin/form/authorization"
            elif endpoint_type == BPMEndpointType.MESSAGE_EVENT:
                url = f"{bpm_api_base}/engine-rest-ext/v1/message"
            elif endpoint_type == BPMEndpointType.DECISION_DEFINITION:
                url = f"{bpm_api_base}/engine-rest-ext/v1/decision-definition"
            elif endpoint_type == BPMEndpointType.DEPLOYMENT:
                url = f"{bpm_api_base}/engine-rest-ext/v1/deployment/create"
            elif endpoint_type == BPMEndpointType.COMPLETE_TASK:
                url = f"{bpm_api_base}/engine-rest-ext/v1/task/{{task_id}}/submit-form"
            return url

        except BaseException as e:  # pylint: disable=broad-except
            raise BusinessException(BusinessErrorCode.BPM_BASE_URL_NOT_SET) from e
