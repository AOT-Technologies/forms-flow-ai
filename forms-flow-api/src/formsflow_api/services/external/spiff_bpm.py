"""This exposes BPM Service."""

import json
from enum import IntEnum
import time
from typing import Dict

from flask import current_app
from formsflow_api_utils.exceptions import BusinessException

from formsflow_api.constants import BusinessErrorCode
from formsflow_api.models import (
    Application,
    FormProcessMapper,
)
from .base_bpm import BaseBPMService


class BPMEndpointType(IntEnum):
    """This enum provides the list of bpm endpoints type."""

    PROCESS_DEFINITION = 1
    PROCESS_INSTANCES = 2
    MESSAGE_EVENT = 3
    DECISION_DEFINITION = 4
    DEPLOYMENT = 5
    PROCESS_INSTANCE = 6


class SpiffBPMService(BaseBPMService):
    """This class manages all of the Spiff BPM Service."""

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
    def post_process_start(cls, process_key, payload, token, tenant_key, message_key: str = None):
        """Post process start."""
        # Using message events for start with spiff, construct the URL using the message key.
        #TODO This should be done as part of the publish endpoint, adding it here since we dont have that in this version.
        url = (
            f"{cls._get_url_(BPMEndpointType.PROCESS_INSTANCES)}/{process_key}/start"
        )
        process_data = cls.post_request(url, token, payload={}, tenant_key=tenant_key)
        # Wait for Spiff to fully initialize the process instance
        cls._wait_for_process_instance(process_data["id"], token)  # type: ignore

        url = (
            f"{cls._get_url_(BPMEndpointType.MESSAGE_EVENT)}/{message_key}"
        )
        send_event_req = cls.post_request(url, token, payload=payload, tenant_key=tenant_key)
        current_app.logger.debug(f"Process start response payload---> {send_event_req}")
        return send_event_req.get("process_instance")

    @classmethod
    def post_process_start_tenant(
            cls, process_key: str, payload: Dict, token: str, tenant_key: str, message_key: str = None
    ):
        """Post process start based on tenant key."""
        url = (
                f"{cls._get_url_(BPMEndpointType.PROCESS_DEFINITION)}/"
                f"key/{process_key}/start?tenantId=" + tenant_key
        )
        process_data = cls.post_request(url, token, payload={}, tenant_key=tenant_key)
        # Wait for Spiff to fully initialize the process instance
        cls._wait_for_process_instance(process_data["id"], token)  # type: ignore

        url = (
            f"{cls._get_url_(BPMEndpointType.MESSAGE_EVENT)}/{message_key}"
        )
        send_event_req = cls.post_request(url, token, payload=payload, tenant_key=tenant_key)
        current_app.logger.debug(f"Process start response payload---> {send_event_req}")
        return send_event_req.get("process_instance")

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
        response = cls.post_request(url, token, payload, tenant_key, files)
        return response

    @classmethod
    def _get_url_(cls, endpoint_type: BPMEndpointType) -> str:
        """Get Url."""
        bpm_api_base = current_app.config.get("BPM_API_URL")
        try:
            url = None
            if endpoint_type == BPMEndpointType.PROCESS_DEFINITION:
                url = f"{bpm_api_base}/v1.0/process-definition"
            elif endpoint_type == BPMEndpointType.PROCESS_INSTANCES:
                url = f"{bpm_api_base}/v1.0/key"
            elif endpoint_type == BPMEndpointType.MESSAGE_EVENT:
                url = f"{bpm_api_base}/v1.0/messages"
            elif endpoint_type == BPMEndpointType.DECISION_DEFINITION:
                url = f"{bpm_api_base}/v1.0/decision-definition"
            elif endpoint_type == BPMEndpointType.DEPLOYMENT:
                url = f"{bpm_api_base}/v1.0/deployment/create"
            elif endpoint_type == BPMEndpointType.PROCESS_INSTANCE:
                url = f"{bpm_api_base}/v1.0/process-instance"
            return url
        except BaseException as e:  # pylint: disable=broad-except
            raise BusinessException(BusinessErrorCode.BPM_BASE_URL_NOT_SET) from e

    @staticmethod
    def get_start_task_payload(
            application: Application,
            mapper: FormProcessMapper,
            form_url: str,
            web_form_url: str,
            variables: Dict,
    ) -> Dict:
        """Returns the payload for initiating the task."""
        return {
            **variables,
            "applicationId": application.id,
            "formUrl": form_url,
            "webFormUrl": web_form_url,
            "formName": mapper.form_name,
            "submitterName": application.created_by,
            "submissionDate": str(application.created),
            "tenantKey": mapper.tenant,
            "formId": mapper.form_id,
            "skipReview": False
        }

    @staticmethod
    def fetch_task_variable_values(task_variable, form_data):
        """Fetch task variable values from form data."""
        variables: Dict = {}
        if task_variable and form_data:
            task_keys = [val["key"] for val in task_variable]
            variables = {
                key: json.dumps(form_data[key]) if isinstance(form_data[key], (dict, list)) else form_data[key]
                for key in task_keys
                if key in form_data
            }
        return variables

    @classmethod
    def _wait_for_process_instance(cls, process_instance_id: int, token: str, retry_count: int = 3):
        """Checks and waits for the process instance to be initialized

        Arguments:
            process_instance_id {int} -- Unique ID of process instance
            token {str} -- JWT token of authenticated user

        Keyword Arguments:
            retry_count {int} -- Max number of attempts before failure (default: {3})
        """
        url = f"{cls._get_url_(BPMEndpointType.PROCESS_INSTANCE)}/{process_instance_id}/is-initialized"
        for attempt in range(1, retry_count + 1):
            response = cls.get_request(url, token)

            if response["status"]:
                current_app.logger.debug(f"Process instance {process_instance_id} is initialized.")
                return
            current_app.logger.debug(f"Waiting for process instance {process_instance_id} to be initialized. {attempt = }")
            time.sleep(5 * attempt)  # increase retry duration by 1 second each time
        raise BusinessException(BusinessErrorCode.PROCESS_NOT_INITIALIZED)
