"""This exposes BPM Service."""

import logging
from enum import IntEnum

from flask import current_app

from .base_bpm import BaseBPMService


class BPMEndpointType(IntEnum):
    """This enum provides the list of bpm endpoints type."""

    ProcessDefinition = 1
    DecisionDefinition = 2
    Task = 3
    History = 4
    TaskVariables = 5
    ProcessDefinitionXML = 6
    MessageEvent = 7
    ProcessInstance = 8
    AuthFormDetails = 9


class BPMService(BaseBPMService):
    """This class manages all of the Camunda BPM Service."""

    @classmethod
    def get_all_process(cls, token):
        """Get all process."""
        url = cls._get_url_(BPMEndpointType.ProcessDefinition)
        return cls.get_request(url, token)

    @classmethod
    def get_process_details(cls, process_key, token):
        """Get process details."""
        url = cls._get_url_(BPMEndpointType.ProcessDefinition) + process_key
        return cls.get_request(url, token)

    @classmethod
    def get_process_definition_xml(cls, process_key, token):
        """Get process details XML."""
        logging.log(logging.DEBUG, "process detail xml process-key>>" + process_key)
        url = cls._get_url_(BPMEndpointType.ProcessDefinitionXML) + process_key + "/xml"
        logging.log(logging.DEBUG, "process def url>>" + url)
        return cls.get_request(url, token)

    @classmethod
    def get_process_actions(cls, process_key, token):
        """Get process actions."""
        url = cls._get_url_(BPMEndpointType.ProcessDefinition) + process_key
        return cls.get_request(url, token)

    @classmethod
    def post_process_evaluate(cls, payload, token):
        """Get states by evaluating process."""
        url = f"{cls._get_url_(BPMEndpointType.DecisionDefinition)}key/state-decision/evaluate"
        return cls.post_request(url, token, payload=payload)

    @classmethod
    def post_process_start(cls, process_key, payload, token):
        """Post process start."""
        url = (
            f"{cls._get_url_(BPMEndpointType.ProcessDefinition)}key/{process_key}/start"
        )
        return cls.post_request(url, token, payload=payload)

    @classmethod
    def get_auth_form_details(cls, token):
        """Get authorized form details."""
        url = cls._get_url_(BPMEndpointType.AuthFormDetails)
        return cls.get_request(url, token)

    @classmethod
    def get_all_tasks(cls, token):
        """Get all tasks."""
        url = cls._get_url_(BPMEndpointType.History)
        return cls.get_request(url, token)

    @classmethod
    def get_task(cls, task_id, token):
        """Get task."""
        url = cls._get_url_(BPMEndpointType.History) + task_id
        return cls.get_request(url, token)

    @classmethod
    def claim_task(cls, task_id, data, token):
        """Claim a task."""
        url = cls._get_url_(BPMEndpointType.Task) + task_id + "/claim"
        return cls.post_request(url, token, data)

    @classmethod
    def unclaim_task(cls, task_id, data, token):
        """Unclaim a task."""
        url = cls._get_url_(BPMEndpointType.Task) + task_id + "/unclaim"
        return cls.post_request(url, token, data)

    @classmethod
    def complete_task(cls, task_id, data, token):
        """Complete a task."""
        url = cls._get_url_(BPMEndpointType.Task) + task_id + "/complete"
        return cls.post_request(url, token, data)

    @classmethod
    def trigger_notification(cls, token):
        """Submit a form."""
        url = cls._get_url_(BPMEndpointType.ProcessDefinition) + "process/start"
        return cls.post_request(url, token)

    @classmethod
    def send_message(cls, data, token):
        """Submit a form."""
        url = cls._get_url_(BPMEndpointType.MessageEvent)
        return cls.post_request(url, token, data)

    @classmethod
    def get_process_activity_instances(cls, process_instace_id, token):
        """Get task."""
        url = (
            cls._get_url_(BPMEndpointType.ProcessInstance)
            + process_instace_id
            + "/activity-instances"
        )
        return cls.get_request(url, token)

    @classmethod
    def _get_url_(cls, endpoint_type: BPMEndpointType):
        """Get Url."""
        bpm_api_base = current_app.config.get("BPM_API_BASE")
        try:
            if not bpm_api_base.endswith("/"):
                bpm_api_base += "/"

            url = ""
            if endpoint_type == BPMEndpointType.ProcessDefinition:
                url = bpm_api_base + "engine-rest/process-definition"
            elif endpoint_type == BPMEndpointType.DecisionDefinition:
                url = bpm_api_base + "engine-rest/decision-definition"
            elif endpoint_type == BPMEndpointType.AuthFormDetails:
                url = bpm_api_base + "engine-rest-ext/form"
            elif endpoint_type == BPMEndpointType.History:
                url = bpm_api_base + "engine-rest-ext/task"
            elif endpoint_type == BPMEndpointType.Task:
                url = bpm_api_base + "engine-rest/task"
            elif endpoint_type == BPMEndpointType.ProcessDefinitionXML:
                url = bpm_api_base + "engine-rest/process-definition/key"
            elif endpoint_type == BPMEndpointType.MessageEvent:
                url = bpm_api_base + "engine-rest/message"
            elif endpoint_type == BPMEndpointType.ProcessInstance:
                url = bpm_api_base + "engine-rest/process-instance"
            if not url.endswith("/"):
                url += "/"

            return url

        except BaseException as form_err:
            return {
                "type": "Missing environment variable CAMUNDA_API_URL",
                "message": form_err.messages,
            }
