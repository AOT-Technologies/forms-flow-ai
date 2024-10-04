"""Test suite for Process API endpoints."""

from unittest.mock import patch

import pytest
from formsflow_api_utils.utils import CREATE_DESIGNS, MANAGE_TASKS

from formsflow_api.models import Process
from formsflow_api.services import ProcessService
from tests.utilities.base_test import (
    get_process_request_payload,
    get_process_request_payload_low_code,
    get_token,
)


def ensure_process_data_binary(process_id):
    """Convert process_data to binary if string."""
    process = Process.query.get(process_id)
    if isinstance(process.process_data, str):
        process.process_data = process.process_data.encode("utf-8")
        process.save()


class TestProcessCreate:
    """Test suite for the process create method."""

    def test_process_create_method(self, app, client, session, jwt):
        """Tests the process create method with valid payload."""
        token = get_token(jwt, role=CREATE_DESIGNS, username="designer")
        headers = {
            "Authorization": f"Bearer {token}",
            "content-type": "application/json",
        }
        response = client.post(
            "/process", headers=headers, json=get_process_request_payload()
        )

        assert response.status_code == 201
        assert response.json.get("id") is not None
        assert response.json.get("name") == "Testworkflow"

    def test_process_create_method_with_invalid_token(self, app, client, session, jwt):
        """Tests the process create method with invalid token."""
        token = get_token(jwt, role=MANAGE_TASKS, username="reviewer")
        headers = {
            "Authorization": f"Bearer {token}",
            "content-type": "application/json",
        }
        response = client.post(
            "/process", headers=headers, json=get_process_request_payload()
        )
        assert response.status_code == 401


class TestProcessUpdate:
    """Test suite for the process update method."""

    def test_process_update(self, app, client, session, jwt):
        """Tests the process update method with valid payload."""
        token = get_token(jwt, role=CREATE_DESIGNS, username="designer")
        headers = {
            "Authorization": f"Bearer {token}",
            "content-type": "application/json",
        }
        response = client.post(
            "/process", headers=headers, json=get_process_request_payload_low_code()
        )
        assert response.status_code == 201
        assert response.json.get("id") is not None
        process_id = response.json.get("id")
        ensure_process_data_binary(process_id)
        response = client.put(
            f"/process/{process_id}",
            headers=headers,
            json=get_process_request_payload_low_code(status="Published"),
        )
        assert response.status_code == 200
        assert response.json.get("status") == "Published"

    def test_process_update_invalid_token(self, app, client, session, jwt):
        """Tests the process update method with invalid token."""
        token = get_token(jwt, role=CREATE_DESIGNS, username="designer")
        headers = {
            "Authorization": f"Bearer {token}",
            "content-type": "application/json",
        }
        response = client.post(
            "/process", headers=headers, json=get_process_request_payload_low_code()
        )
        assert response.status_code == 201
        assert response.json.get("id") is not None
        process_id = response.json.get("id")
        token = get_token(jwt, role=MANAGE_TASKS)
        headers = {
            "Authorization": f"Bearer {token}",
            "content-type": "application/json",
        }
        response = client.put(
            f"/process/{process_id}",
            headers=headers,
            json=get_process_request_payload_low_code(status="Published"),
        )
        assert response.status_code == 401


class TestProcessList:
    """Test suite for the process list."""

    def test_process_list(self, app, client, session, jwt):
        """Testing process listing API."""
        token = get_token(jwt, role=CREATE_DESIGNS, username="designer")
        headers = {
            "Authorization": f"Bearer {token}",
            "content-type": "application/json",
        }
        response = client.post(
            "/process",
            headers=headers,
            json=get_process_request_payload(name="Testworkflow1"),
        )
        ensure_process_data_binary(response.json.get("id"))
        response = client.get("/process", headers=headers)
        assert response.status_code == 200
        assert response.json is not None
        assert response.json["totalCount"] == 1
        assert response.json["process"][0]["name"] == "Testworkflow1"

    @pytest.mark.parametrize(
        ("pageNo", "limit", "sortBy", "sortOrder"),
        ((1, 5, "id", "asc"), (1, 10, "id", "desc"), (1, 20, "id", "desc")),
    )
    def test_process_list_with_pagination_sorted_list(
        self, app, client, session, jwt, pageNo, limit, sortBy, sortOrder
    ):
        """Testing process listing API with pagination and sorted list."""
        token = get_token(jwt, role=CREATE_DESIGNS, username="designer")
        headers = {
            "Authorization": f"Bearer {token}",
            "content-type": "application/json",
        }
        response = client.post(
            "/process",
            headers=headers,
            json=get_process_request_payload(name="Testworkflow1"),
        )
        ensure_process_data_binary(response.json.get("id"))
        response = client.post(
            "/process",
            headers=headers,
            json=get_process_request_payload(name="Testworkflow2"),
        )
        ensure_process_data_binary(response.json.get("id"))
        response = client.get(
            f"/process?pageNo={pageNo}&limit={limit}&sortBy={sortBy}&sortOrder={sortOrder}",
            headers=headers,
        )
        assert response.status_code == 200
        assert response.json is not None

    def test_process_list_with_filters(self, app, client, session, jwt):
        """Testing process listing API with filters."""
        token = get_token(jwt, role=CREATE_DESIGNS, username="designer")
        headers = {
            "Authorization": f"Bearer {token}",
            "content-type": "application/json",
        }
        response = client.post(
            "/process",
            headers=headers,
            json=get_process_request_payload(name="Testworkflow1"),
        )
        ensure_process_data_binary(response.json.get("id"))
        response = client.post(
            "/process",
            headers=headers,
            json=get_process_request_payload_low_code(name="Testworkflow2"),
        )
        ensure_process_data_binary(response.json.get("id"))
        # testing with processType filter with status
        response = client.get(
            "/process?status=Draft&processType=LOWCODE&name=Test", headers=headers
        )
        assert response.status_code == 200
        assert response.json is not None
        assert response.json["totalCount"] == 1

    def test_process_list_with_invalid_token(self, app, client, session, jwt):
        """Testing process listing API."""
        token = get_token(jwt, role=MANAGE_TASKS, username="reviewer")
        headers = {
            "Authorization": f"Bearer {token}",
            "content-type": "application/json",
        }
        response = client.get("/process", headers=headers)
        assert response.status_code == 401


class TestProcessDelete:
    """Test suite for the process delete method."""

    def test_process_delete_method(self, app, client, session, jwt):
        """Tests the process delete method."""
        token = get_token(jwt, role=CREATE_DESIGNS, username="designer")
        headers = {
            "Authorization": f"Bearer {token}",
            "content-type": "application/json",
        }
        response = client.post(
            "/process", headers=headers, json=get_process_request_payload()
        )
        assert response.status_code == 201
        assert response.json.get("id") is not None
        process_id = response.json.get("id")
        ensure_process_data_binary(process_id)
        response = client.delete(f"/process/{process_id}", headers=headers)
        assert response.status_code == 200
        assert response.json.get("message") == "Process deleted."
        response = client.get(f"/process/{process_id}", headers=headers)
        assert response.status_code == 400

    def test_process_delete_method_with_invalid_token(self, app, client, session, jwt):
        """Tests the process delete method with invalid token."""
        token = get_token(jwt, role=CREATE_DESIGNS, username="designer")
        headers = {
            "Authorization": f"Bearer {token}",
            "content-type": "application/json",
        }
        response = client.post(
            "/process", headers=headers, json=get_process_request_payload()
        )
        assert response.status_code == 201
        assert response.json.get("id") is not None
        process_id = response.json.get("id")
        token = get_token(jwt, role=MANAGE_TASKS)
        headers = {
            "Authorization": f"Bearer {token}",
            "content-type": "application/json",
        }
        response = client.delete(f"/process/{process_id}", headers=headers)
        assert response.status_code == 401


class TestProcessHistory:
    """Test suite for the process version history endpoint."""

    def test_process_version_history_success(self, app, client, session, jwt):
        """Test the process version history endpoint success case."""
        # Mock token
        token = get_token(jwt, role=CREATE_DESIGNS, username="designer")
        headers = {
            "Authorization": f"Bearer {token}",
            "content-type": "application/json",
        }
        with patch.object(ProcessService, "get_all_history") as mock_import_service:
            mock_response = (
                [
                    {
                        "id": "3",
                        "processName": "test",
                        "createdBy": "formsflow-designer",
                        "created": "2024-09-12 06:33:31.101156",
                        "majorVersion": 3,
                        "minorVersion": 0,
                    },
                    {
                        "id": "2",
                        "processName": "test",
                        "createdBy": "formsflow-designer",
                        "created": "2024-09-12 06:33:06.454344",
                        "majorVersion": 2,
                        "minorVersion": 0,
                    },
                    {
                        "id": "1",
                        "processName": "test",
                        "createdBy": "formsflow-designer",
                        "created": "2024-09-12 06:32:59.930011",
                        "majorVersion": 1,
                        "minorVersion": 0,
                    },
                ],
                3,
            )

            mock_import_service.return_value = mock_response
            response = client.get(
                "/process/process-history/test/versions", headers=headers
            )
            # Assertions
            assert response.status_code == 200
            assert response.json is not None
            response_json = response.json["processHistory"]
            assert len(response_json) == 3
            assert response_json[0]["id"] == "3"
            assert response_json[0]["processName"] == "test"
            assert response_json[0]["createdBy"] == "formsflow-designer"
            assert response_json[0]["created"] == "2024-09-12 06:33:31.101156"
            assert response_json[0]["majorVersion"] == 3
            assert response_json[0]["minorVersion"] == 0

            assert response_json[1]["id"] == "2"
            assert response_json[1]["processName"] == "test"
            assert response_json[1]["createdBy"] == "formsflow-designer"
            assert response_json[1]["created"] == "2024-09-12 06:33:06.454344"
            assert response_json[1]["majorVersion"] == 2
            assert response_json[1]["minorVersion"] == 0

            assert response_json[2]["id"] == "1"
            assert response_json[2]["processName"] == "test"
            assert response_json[2]["createdBy"] == "formsflow-designer"
            assert response_json[2]["created"] == "2024-09-12 06:32:59.930011"
            assert response_json[2]["majorVersion"] == 1
            assert response_json[2]["minorVersion"] == 0

            assert response.json["totalCount"] == 3

    def test_process_version_history_non_existent_process(
        self, app, client, session, jwt
    ):
        """Test version history of a non-existent process."""
        token = get_token(jwt, role=CREATE_DESIGNS, username="designer")
        headers = {
            "Authorization": f"Bearer {token}",
            "content-type": "application/json",
        }

        # Call the process version history endpoint with a non-existent process name
        response = client.get(
            "/process/process-history/non_existent_process/versions", headers=headers
        )
        assert response.status_code == 400
        assert response.json.get("message") == "The specified process ID does not exist"

    def test_process_version_history_invalid_token(self, app, client, session, jwt):
        """Test version history with an invalid token."""
        token = get_token(jwt, role=MANAGE_TASKS, username="reviewer")  # Incorrect role
        headers = {
            "Authorization": f"Bearer {token}",
            "content-type": "application/json",
        }

        response = client.get(
            "/process/process-history/Testworkflow/versions", headers=headers
        )
        assert response.status_code == 401


class TestProcessValidation:
    """Test suite for the process validation endpoint."""

    def test_process_validation_invalid(self, app, client, session, jwt):
        """Test process validation api with already exists process key/name."""
        token = get_token(jwt, role=CREATE_DESIGNS, username="designer")
        headers = {
            "Authorization": f"Bearer {token}",
            "content-type": "application/json",
        }
        response = client.post(
            "/process",
            headers=headers,
            json=get_process_request_payload(),
        )
        assert response.status_code == 201
        assert response.json.get("id") is not None
        ensure_process_data_binary(response.json.get("id"))
        response = client.get(
            "/process/validate?processKey=Testworkflow&processName=Testworkflow",
            headers=headers,
        )
        assert response.status_code == 400
        assert (
            response.json.get("message")
            == "The BPMN name or ID already exists. It must be unique."
        )

    def test_process_validate_missing_params(app, client, session, jwt):
        """Testing process name validation with missing parameters."""
        token = get_token(jwt, role=CREATE_DESIGNS)
        headers = {
            "Authorization": f"Bearer {token}",
            "content-type": "application/json",
        }
        response = client.get("/process/validate", headers=headers)
        assert response.status_code == 400
        assert (
            response.json.get("message")
            == "At least one query parameter (name, key) must be provided."
        )

    def test_process_validate_unauthorized(app, client, session, jwt):
        """Testing process name validation without proper authorization."""
        response = client.get("/process/validate")
        assert response.status_code == 401

    def test_process_validation_success(self, app, client, session, jwt):
        """Test process validation api with success."""
        token = get_token(jwt, role=CREATE_DESIGNS, username="designer")
        headers = {
            "Authorization": f"Bearer {token}",
            "content-type": "application/json",
        }
        # Validate process validate api with no exists process key & name
        response = client.get(
            "/process/validate?processKey=Testworkflow&processName=Testworkflow",
            headers=headers,
        )
        assert response.status_code == 200

        # Validate process validate api excluding a specific parent process key
        # Which will be used in edit process
        response = client.post(
            "/process",
            headers=headers,
            json=get_process_request_payload(
                name="Testworkflow", parent_process_key="Testworkflow"
            ),
        )
        assert response.status_code == 201
        assert response.json.get("id") is not None
        ensure_process_data_binary(response.json.get("id"))
        response = client.post(
            "/process",
            headers=headers,
            json=get_process_request_payload(
                name="Testworkflow",
                parent_process_key="Testworkflow",
                major_version=2,
                minor_version=0,
            ),
        )
        assert response.status_code == 201
        assert response.json.get("id") is not None
        ensure_process_data_binary(response.json.get("id"))
        # Invoke the process validation endpoint with parentProcessKey=Testworkflow,
        # which excludes rows with the specified parent key during validation.
        response = client.get(
            "/process/validate?processKey=Testworkflow&processName=Testworkflow&parentProcessKey=Testworkflow",
            headers=headers,
        )
        assert response.status_code == 200
