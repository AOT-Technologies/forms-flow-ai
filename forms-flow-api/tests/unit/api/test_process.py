"""Test suite for Process API endpoints."""

import pytest
from formsflow_api_utils.utils import CREATE_DESIGNS, MANAGE_TASKS
from formsflow_api.models import Process
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
        assert response.json.get("name") == "Test workflow"

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
            json=get_process_request_payload(name="Test workflow 1"),
        )
        ensure_process_data_binary(response.json.get("id"))
        response = client.get("/process", headers=headers)
        assert response.status_code == 200
        assert response.json is not None
        assert response.json["totalCount"] == 1
        assert response.json["process"][0]["name"] == "Test workflow 1"

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
            json=get_process_request_payload(name="Test workflow 1"),
        )
        ensure_process_data_binary(response.json.get("id"))
        response = client.post(
            "/process",
            headers=headers,
            json=get_process_request_payload(name="Test workflow 2"),
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
            json=get_process_request_payload(name="Test workflow 1"),
        )
        ensure_process_data_binary(response.json.get("id"))
        response = client.post(
            "/process",
            headers=headers,
            json=get_process_request_payload_low_code(name="Test workflow 2"),
        )
        ensure_process_data_binary(response.json.get("id"))
        # testing with processType filter with status
        response = client.get("/process?status=Draft&processType=LOWCODE&name=Test", headers=headers)
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
