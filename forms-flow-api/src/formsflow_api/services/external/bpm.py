"""This exposes BPM Service."""

from enum import IntEnum
from typing import Dict

from flask import current_app

from .base_bpm import BaseBPMService


class BPMEndpointType(IntEnum):
    """This enum provides the list of bpm endpoints type."""

    PROCESS_DEFINITION = 1
    TASK = 3
    HISTORY = 4
    PROCESS_DEFINITION_XML = 6
    MESSAGE_EVENT = 7
    PROCESS_INSTANCE = 8
    FORM_AUTH_DETAILS = 9


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
    def get_process_definition_xml(cls, process_key, token):
        """Get process details XML."""
        current_app.logger.debug(f"process detail xml process-key>> {process_key}")
        url = (
            cls._get_url_(BPMEndpointType.PROCESS_DEFINITION_XML) + process_key + "/xml"
        )
        current_app.logger.debug(f"process def url>> {url}")
        return cls.get_request(url, token)

    @classmethod
    def post_process_start(cls, process_key, payload, token):
        """Post process start."""
        url = (
            f"{cls._get_url_(BPMEndpointType.PROCESS_DEFINITION)}/"
            f"key/{process_key}/start"
        )
        return cls.post_request(url, token, payload=payload)

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
    def get_all_tasks(cls, token):
        """Get all tasks."""
        url = cls._get_url_(BPMEndpointType.HISTORY)
        return cls.get_request(url, token)

    @classmethod
    def get_task(cls, task_id, token):
        """Get task."""
        url = cls._get_url_(BPMEndpointType.HISTORY) + task_id
        return cls.get_request(url, token)

    @classmethod
    def claim_task(cls, task_id, data, token):
        """Claim a task."""
        url = cls._get_url_(BPMEndpointType.TASK) + task_id + "/claim"
        return cls.post_request(url, token, data)

    @classmethod
    def unclaim_task(cls, task_id, data, token):
        """Unclaim a task."""
        url = cls._get_url_(BPMEndpointType.TASK) + task_id + "/unclaim"
        return cls.post_request(url, token, data)

    @classmethod
    def complete_task(cls, task_id, data, token):
        """Complete a task."""
        url = cls._get_url_(BPMEndpointType.TASK) + task_id + "/complete"
        return cls.post_request(url, token, data)

    @classmethod
    def trigger_notification(cls, token):
        """Submit a form."""
        url = cls._get_url_(BPMEndpointType.PROCESS_DEFINITION) + "process/start"
        return cls.post_request(url, token)

    @classmethod
    def send_message(cls, data, token):
        """Submit a form."""
        url = cls._get_url_(BPMEndpointType.MESSAGE_EVENT)
        return cls.post_request(url, token, data)

    @classmethod
    def get_process_activity_instances(cls, process_instace_id, token):
        """Get task."""
        url = (
            cls._get_url_(BPMEndpointType.PROCESS_INSTANCE)
            + process_instace_id
            + "/activity-instances"
        )
        return cls.get_request(url, token)

    @classmethod
    def _get_url_(cls, endpoint_type: BPMEndpointType):
        """Get Url."""
        bpm_api_base = current_app.config.get("BPM_API_URL")
        try:
            if endpoint_type == BPMEndpointType.PROCESS_DEFINITION:
                url = f"{bpm_api_base}/engine-rest-ext/v1/process-definition"
            elif endpoint_type == BPMEndpointType.FORM_AUTH_DETAILS:
                url = f"{bpm_api_base}/engine-rest-ext/v1/admin/form/authorization"
            elif endpoint_type == BPMEndpointType.HISTORY:
                url = f"{bpm_api_base}/engine-rest-ext/v1/task/"
            elif endpoint_type == BPMEndpointType.TASK:
                url = f"{bpm_api_base}/engine-rest-ext/v1/task/"
            elif endpoint_type == BPMEndpointType.PROCESS_DEFINITION_XML:
                url = f"{bpm_api_base}/engine-rest-ext/v1/process-definition/key/"
            elif endpoint_type == BPMEndpointType.MESSAGE_EVENT:
                url = f"{bpm_api_base}/engine-rest-ext/v1/message/"
            elif endpoint_type == BPMEndpointType.PROCESS_INSTANCE:
                url = f"{bpm_api_base}/engine-rest-ext/v1/process-instance/"
            return url

        except BaseException:  # pylint: disable=broad-except
            return {
                "type": "Environment missing",
                "message": "Missing environment variable BPM_API_URL",
            }
