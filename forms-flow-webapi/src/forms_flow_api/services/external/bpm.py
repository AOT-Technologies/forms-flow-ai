"""This exposes BPM Service."""

from enum import IntEnum

from flask import current_app

from .base_bpm import BaseBPMService


class BPMEndpointType(IntEnum):
    """This enum provides the list of bpm endpoints type."""

    ProcessDefinition = 1
    DecisionDefinition = 2
    Task = 3
    AllTask = 4
    TaskVariables = 5


class BPMService(BaseBPMService):
    """This class manages all of the Camunda BPM Service."""

    @classmethod
    def get_all_process(cls):
        """Get all process."""
        url = cls._get_url_(BPMEndpointType.ProcessDefinition)
        return cls.get_request(url)

    @classmethod
    def get_process_details(cls, process_key):
        """Get process details."""
        url = cls._get_url_(BPMEndpointType.ProcessDefinition) + process_key
        return cls.get_request(url)

    @classmethod
    def get_process_actions(cls, process_key):
        """Get process actions."""
        url = cls._get_url_(BPMEndpointType.ProcessDefinition) + process_key
        return cls.get_request(url)

    @classmethod
    def post_process_evaluate(cls, process_key):
        """Get process states."""
        url = f'{cls._get_url_(BPMEndpointType.DecisionDefinition)}key/{process_key}/evaluate'
        return cls.post_request(url)

    @classmethod
    def post_process_start(cls, process_key, payload):
        """Post process start."""
        url = f'{cls._get_url_(BPMEndpointType.ProcessDefinition)}key/{process_key}/start'
        return cls.post_request(url, payload=payload)

    @classmethod
    def get_all_tasks(cls):
        """Get all tasks."""
        url = cls._get_url_(BPMEndpointType.TaskHistory)
        return cls.get_request(url)

    @classmethod
    def get_task_details(cls, task_id):
        """Get task details."""
        url = cls._get_url_(BPMEndpointType.ProcessDefinition) + task_id
        return cls.get_request(url)

    @classmethod
    def claim_task(cls, task_id):
        """Claim a task."""
        url = cls._get_url_(BPMEndpointType.Task) + task_id + '/claim'
        return cls.post_request(url)

    @classmethod
    def unclaim_task(cls, task_id):
        """Unclaim a task."""
        url = cls._get_url_(BPMEndpointType.Task) + task_id + '/unclaim'
        return cls.post_request(url)

    @classmethod
    def set_action_request(cls, task_id):
        """Set an action for a task."""
        url = cls._get_url_(BPMEndpointType.Task) + task_id + '/complete'
        return cls.post_request(url)

    @classmethod
    def due_task(cls, task_id):
        """Set a due date for a task."""
        url = cls._get_url_(BPMEndpointType.Task) + task_id + '/due'
        return cls.post_request(url)

    @classmethod
    def trigger_notification(cls):
        """Submit a form."""
        url = cls._get_url_(BPMEndpointType.ProcessDefinition) + 'process/start'
        # TODO process= onestepapproval or email notification
        return cls.post_request(url)

    @classmethod
    def _get_url_(cls, endpoint_type: BPMEndpointType):
        """Get Url."""
        bpm_api_base = current_app.config.get('BPM_API_BASE')
        if not bpm_api_base.endswith('/'):
            bpm_api_base += '/'

        url = ''
        if endpoint_type == BPMEndpointType.ProcessDefinition:
            url = bpm_api_base + 'process-definition/'
        elif endpoint_type == BPMEndpointType.DecisionDefinition:
            url = bpm_api_base + 'decision-definition/'
        elif endpoint_type == BPMEndpointType.AllTask:
            url = bpm_api_base + 'history/task/'
        elif endpoint_type == BPMEndpointType.TaskVariables:
            url = bpm_api_base + 'history/variable-instance'

        if not url.endswith('/'):
            url += '/'

        return url
