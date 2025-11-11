"""Test suite for Task API endpoint."""

import json
from unittest.mock import patch

from formsflow_api_utils.utils import CREATE_SUBMISSIONS, get_token
from tests.utilities.base_test import (
    get_application_create_payload,
    task_outcome_config_payload,
)


class TestOutcomeResource:
    """Test suite for the task outcome configuration endpoint."""

    def test_create_task_outcome_configuration(self, app, client, session, jwt):
        """Assert that create task outcome returns correct response."""
        token = get_token(jwt)
        headers = {
            "Authorization": f"Bearer {token}",
            "content-type": "application/json",
        }
        response = client.post(
            "tasks/task-outcome-configuration", headers=headers, json=task_outcome_config_payload()
        )
        assert response.status_code == 201
        assert response.json["taskId"] == "19c06cb9-fb49-11ef-af3f-66318ba5bc56"
        assert response.json["taskTransitionMap"] == task_outcome_config_payload()["taskTransitionMap"]
        assert response.json["taskName"] == "Test Task"
        assert response.json["transitionMapType"] == "select"
        assert response.json["id"] == 1
        assert response.json["createdBy"] is not None
        assert response.json["tenant"] is None
        assert response.json["created"] is not None

    def test_create_task_outcome_configuration_invalid(self, app, client, session, jwt):
        """Assert that create task outcome returns 400 for invalid request."""
        token = get_token(jwt)
        headers = {
            "Authorization": f"Bearer {token}",
            "content-type": "application/json",
        }
        # Assert when taskTransitionMap is None
        task_outcome_config_payload = {
            "taskId": "19c06cb9-fb49-11ef-af3f-66318ba5bc56",
            "taskName": "Test Task",
            "taskTransitionMap": None,
            "transitionMapType": "select",
        }
        response = client.post(
            "tasks/task-outcome-configuration", headers=headers, data=json.dumps(task_outcome_config_payload)
        )
        assert response.status_code == 400
        assert response.json["message"] == "Validation failed"
        assert response.json["details"] == [
            {
                "code": "taskTransitionMap",
                "message": "Field may not be null."
            }
        ]
        # Assert when transitionMapType is None
        task_outcome_config_payload = {
            "taskId": "19c06cb9-fb49-11ef-af3f-66318ba5bc56",
            "taskName": "Test Task",
            "taskTransitionMap": [
                {"key": "approve", "label": "Approve"},
                {"key": "reject", "label": "Reject"},
            ],
            "transitionMapType": None,
        }
        response = client.post(
            "tasks/task-outcome-configuration", headers=headers, data=json.dumps(task_outcome_config_payload)
        )
        assert response.status_code == 400
        assert response.json["message"] == "Validation failed"
        assert response.json["details"] == [
            {
                "code": "transitionMapType",
                "message": "Field may not be null."
            }
        ]
        # Assert when required field is missing
        task_outcome_config_payload = {
            "taskName": "Test Task",
            "taskTransitionMap": [
                {"key": "approve", "label": "Approve"},
                {"key": "reject", "label": "Reject"},
            ],
            "transitionMapType": "select",
        }
        response = client.post(
            "tasks/task-outcome-configuration", headers=headers, data=json.dumps(task_outcome_config_payload)
        )
        assert response.status_code == 400
        assert response.json["message"] == "Validation failed"
        assert response.json["details"] == [
            {
                "code": "taskId",
                "message": "Missing data for required field."
            }
        ]

    def test_get_task_outcome_configuration_by_task_id(self, app, client, session, jwt):
        """Assert that get task outcome returns correct response."""
        token = get_token(jwt)
        headers = {
            "Authorization": f"Bearer {token}",
            "content-type": "application/json",
        }
        response = client.post(
            "tasks/task-outcome-configuration", headers=headers, json=task_outcome_config_payload()
        )
        assert response.status_code == 201
        response = client.get("tasks/task-outcome-configuration/19c06cb9-fb49-11ef-af3f-66318ba5bc56", headers=headers)
        assert response.status_code == 200

    def test_get_task_outcome_configuration_by_task_id_not_found(
        self, app, client, session, jwt
    ):
        """Assert that get task outcome returns 404 for not found."""
        token = get_token(jwt)
        headers = {
            "Authorization": f"Bearer {token}",
            "content-type": "application/json",
        }
        response = client.get("tasks/task-outcome-configuration/1", headers=headers)
        assert response.status_code == 400
        assert response.json["message"] == "Task outcome configuration not found for the given task Id"


class TaskCompletionTestResource:
    """Test suite for the task completion endpoint."""

    def task_completion_payload(self, application_id, form_id):
        """Returns a valid payload for task completion."""
        return {
            "formData": {
                "formId": {form_id},
                "data": {
                    "businessOperatingName": "Adrienne Hinton",
                    "applicationId": {application_id},
                    "applicationStatus": "Reviewed",
                }
            },
            "bpmnData": {
                "variables": {
                    "formUrl": {"value": "http://localhost/form/690b032bf089b0ad31b912a3/submission/690ded51944a118ff360502f"},
                    "applicationId": {"value": {application_id}},
                    "webFormUrl": {"value": "http://localhost/form/690b032bf089b0ad31b912a3/submission/690ded51944a118ff360502f"},
                    "action": {"value": "Reviewed"}
                }
            },
            "applicationData": {
                "applicationId": {application_id},
                "applicationStatus": "Reviewed",
                "formUrl": "http://localhost/form/690b032bf089b0ad31b912a3/submission/690ded51944a118ff360502f",
                "submittedBy": "John Doe",
                "privateNotes": "Test private notes"
            }
        }

    def test_task_complete_api_success(self, app, client, session, jwt, create_mapper):
        """Assert that completing a task returns correct response."""
        form_id = create_mapper["formId"]
        token = get_token(jwt, role=CREATE_SUBMISSIONS)
        headers = {
            "Authorization": f"Bearer {token}",
            "content-type": "application/json",
        }
        rv = client.post(
            "/application/create",
            headers=headers,
            json=get_application_create_payload(form_id),
        )
        assert rv.status_code == 201
        application_id = rv.json.get("id")
        token = get_token(jwt)
        headers = {
            "Authorization": f"Bearer {token}",
            "content-type": "application/json",
        }
        task_id = "f30c90f8-be30-11f0-88b5-f2154b5a3afb"
        # Mock only BPMService.complete_task
        with patch("formsflow_api.services.tasks.BPMService.complete_task") as mock_bpm:
            mock_bpm.return_value = None
            response = client.post(
                f"tasks/{task_id}/complete",
                headers=headers,
                json=self.task_completion_payload(application_id=application_id, form_id=form_id)
            )

        assert response.status_code == 200
        assert response.json["message"] == "Task completed successfully"

    def test_task_complete_api_invalid_request(self, app, client, session, jwt):
        """Assert that completing a task returns correct response."""
        token = get_token(jwt)
        headers = {
            "Authorization": f"Bearer {token}",
            "content-type": "application/json",
        }
        task_id = "f30c90f8-be30-11f0-88b5-f2154b5a3afb"
        payload = {
            "formData": {
                "formId": "690b032bf089b0ad31b912a3",
                "data": {
                    "businessOperatingName": "Adrienne Hinton",
                    "applicationId": 1,
                    "applicationStatus": "Reviewed",
                }
            }
        }
        response = client.post(
            f"tasks/{task_id}/complete",
            headers=headers,
            json=payload
        )
        assert response.status_code == 400
