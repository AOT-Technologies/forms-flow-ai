"""Test suite for FormProcessMapper API endpoint."""
from tests.utilities.base_test import (
    factory_auth_header,
    get_application_create_payload,
    get_form_request_anonymous_payload,
    get_form_request_payload,
)


def test_form_process_mapper_list(app, client, session):
    """Testing form process mapper listing API."""
    token = factory_auth_header()
    headers = {"Authorization": f"Bearer {token}", "content-type": "application/json"}
    response = client.get("/form", headers=headers)
    assert response.status_code == 200
    assert response.json is not None


def test_form_process_mapper_creation(app, client, session):
    """Testing form process mapper create API."""
    token = factory_auth_header()
    headers = {"Authorization": f"Bearer {token}", "content-type": "application/json"}
    response = client.post("/form", headers=headers, json=get_form_request_payload())
    assert response.status_code == 201
    assert response.json.get("id") is not None


def test_anonymous_form_process_mapper_creation(app, client, session):
    """Testing anonymous form process mapper creation."""
    token = factory_auth_header()
    headers = {"Authorization": f"Bearer {token}", "content-type": "application/json"}
    response = client.post(
        "/form", headers=headers, json=get_form_request_anonymous_payload()
    )
    assert response.status_code == 201
    assert response.json.get("id") is not None


def test_form_process_mapper_detail_view(app, client, session):
    """Testing form process mapper details endpoint."""
    token = factory_auth_header()
    headers = {"Authorization": f"Bearer {token}", "content-type": "application/json"}
    response = client.post(
        "/form",
        headers=headers,
        json=get_form_request_payload(),
    )
    assert response.status_code == 201
    mapper_id = response.json.get("id")
    rv = client.get(f"/form/{mapper_id}", headers=headers)
    assert rv.status_code == 200
    assert rv.json.get("id") == mapper_id


def test_form_process_mapper_by_formid(app, client, session):
    """Testing API/form/formid/<formid> with valid data."""
    token = factory_auth_header()
    headers = {"Authorization": f"Bearer {token}", "content-type": "application/json"}
    response = client.post(
        "/form",
        headers=headers,
        json=get_form_request_payload(),
    )
    assert response.status_code == 201
    form_id = response.json.get("formId")
    assert form_id is not None
    rv = client.get(f"/form/formid/{form_id}", headers=headers)
    assert rv.status_code == 200


def test_form_process_mapper_id_deletion(app, client, session):
    """Testing form process mapper delete endpoint."""
    token = factory_auth_header()
    headers = {"Authorization": f"Bearer {token}", "content-type": "application/json"}
    response = client.post(
        "/form",
        headers=headers,
        json=get_form_request_payload(),
    )
    assert response.status_code == 201

    response = client.get("/form", headers=headers)
    assert response.status_code == 200

    data = response.json
    form_id = data["forms"][0]["id"]
    r = client.delete(f"/form/{form_id}", headers=headers)
    assert r.json == "Deleted"
    assert r.status_code == 200


def test_form_process_mapper_test_update(app, client, session):
    """Testing form process mapper update endpoint."""
    token = factory_auth_header()
    headers = {"Authorization": f"Bearer {token}", "content-type": "application/json"}
    response = client.post(
        "/form",
        headers=headers,
        json=get_form_request_payload(),
    )
    assert response.status_code == 201

    response = client.get("/form", headers=headers)
    assert response.status_code == 200
    form_id = response.json["forms"][0]["id"]
    rv = client.put(
        f"/form/{form_id}", headers=headers, json=get_form_request_payload()
    )
    assert rv.status_code == 200
    assert rv.json == f"Updated FormProcessMapper ID {form_id} successfully"


def test_anonymous_form_process_mapper_test_update(app, client, session):
    """Testing anonymous form process mapper update endpoint."""
    token = factory_auth_header()
    headers = {"Authorization": f"Bearer {token}", "content-type": "application/json"}
    response = client.post(
        "/form",
        headers=headers,
        json=get_form_request_payload(),
    )
    assert response.status_code == 201

    response = client.get("/form", headers=headers)
    assert response.status_code == 200
    data = response.json
    form_id = data["forms"][0]["id"]
    rv = client.put(
        f"/form/{form_id}", headers=headers, json=get_form_request_anonymous_payload()
    )
    assert rv.status_code == 200
    data = rv.json
    assert data == f"Updated FormProcessMapper ID {form_id} successfully"


def test_get_application_count_based_on_form_process_mapper_id(app, client, session):
    """Testing the count API for applications corresponding to mapper id."""
    token = factory_auth_header()
    headers = {"Authorization": f"Bearer {token}", "content-type": "application/json"}
    response = client.post(
        "/form",
        headers=headers,
        json=get_form_request_payload(),
    )
    assert response.status_code == 201

    response = client.get("/form", headers=headers)
    assert response.status_code == 200
    data = response.json
    form_id = data["forms"][0]["id"]

    rv = client.get(f"/form/{form_id}/application/count", headers=headers)
    assert rv.status_code == 200
    assert rv.json == {'message': 'No Applications found', 'value': 0}


def test_get_application_count_based_on_form_process_mapper_id1(app, client, session):
    """Testing the count api."""
    token = factory_auth_header()
    headers = {
        "Authorization": f"Bearer {token}",
        "content-type": "application/json",
    }
    rv = client.post("/form", headers=headers, json=get_form_request_payload())
    assert rv.status_code == 201

    form_id = rv.json.get("formId")

    rv = client.post(
        "/application/create",
        headers=headers,
        json=get_application_create_payload(form_id),
    )
    assert rv.status_code == 201

    rv = client.get(f"/form/{form_id}/application/count", headers=headers)
    assert rv.status_code == 200
