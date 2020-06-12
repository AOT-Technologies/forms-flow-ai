"""This exposes BPM Service."""
import json
import os

import requests
from flask import current_app
from .base_service import BaseService

BPM_API_BASE = os.getenv('BPM_API_BASE', '')
API_PROCESS = os.getenv('API_PROCESS', '')
BPM_API_PROCESS = BPM_API_BASE + API_PROCESS

API_TASK = os.getenv('API_TASK', '')
API_TASK_HISTORY = os.getenv('API_TASK_HISTORY', '')
BPM_API_TASK = BPM_API_BASE + API_TASK
BPM_API_TASK_HISTORY = BPM_API_BASE + API_TASK_HISTORY

class ExtendedBPMService():
    """This class manages all of the Camunda BPM Service."""

    @classmethod
    def _get_headers_(cls):
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

    @classmethod
    def get_all_process(cls):
        """Get HTTP request to get all process."""
        headers = ExtendedBPMService._get_headers_()
        url = BPM_API_PROCESS
        r = BaseService.get_request(url,headers)
        return json.loads(r.text)

    @classmethod
    def get_process_details(cls,processKey):
        """Get HTTP request to get a process details."""
        url = BPM_API_PROCESS + processKey
        headers = ExtendedBPMService._get_headers_()
        r = BaseService.get_request(url,headers)
        return json.loads(r.text)

    @classmethod
    def get_process_actions(cls,processKey):
        """Get HTTP request to get process actions."""
        url = BPM_API_PROCESS + processKey
        headers = ExtendedBPMService._get_headers_()
        r = BaseService.get_request(url,headers)
        return json.loads(r.text)

    @classmethod
    def get_all_tasks(cls):
        """Get HTTP request to get all tasks."""
        url = BPM_API_TASK_HISTORY
        headers = ExtendedBPMService._get_headers_()
        r = BaseService.get_request(url,headers)
        return json.loads(r.text)

    @classmethod
    def get_task_details(cls,taskId):
        """Get HTTP request to get a task details."""
        url = BPM_API_PROCESS + taskId
        headers = ExtendedBPMService._get_headers_()
        r = BaseService.get_request(url,headers)
        return json.loads(r.text)

    @classmethod
    def claim_task(cls,taskId):
        """Post HTTP request to claim a task."""
        url = BPM_API_TASK + taskId + '/claim'
        headers = ExtendedBPMService._get_headers_()
        r = BaseService.post_request(url,headers)
        return json.loads(r.text)

    @classmethod
    def unclaim_task(cls,taskId):
        """Post HTTP request to unclaim a task."""
        url = BPM_API_TASK + taskId + '/unclaim'
        headers = ExtendedBPMService._get_headers_()
        r = BaseService.post_request(url,headers)
        return json.loads(r.text)

    @classmethod
    def set_action_request(cls,taskId):
        """Post HTTP request to set an action for a task."""
        url = BPM_API_TASK + taskId + '/complete'
        headers = ExtendedBPMService._get_headers_()
        r = BaseService.post_request(url,headers)
        return json.loads(r.text)

    @classmethod
    def due_a_task(cls,taskId):
        """Post HTTP request to set a due date for a task"""
        url = BPM_API_TASK + taskId + '/due'
        headers = ExtendedBPMService._get_headers_()
        r = BaseService.post_request(url,headers)
        return json.loads(r.text)

    @classmethod
    def trigger_notification(cls,taskId):
        """Post HTTP request to submit a form"""
        url = BPM_API_PROCESS+'process'+'/start' #TODO process= onestepapproval or email notification
        headers = ExtendedBPMService._get_headers_()
        r = BaseService.post_request(url,headers)
        return json.loads(r.text)

