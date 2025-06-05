"""Test suite for Task API endpoint."""

import json

from formsflow_api_utils.utils import get_token

from tests.utilities.base_test import task_outcome_config_payload


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
