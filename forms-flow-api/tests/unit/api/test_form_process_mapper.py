"""Test suite for FormProcessMapper API endpoint"""
from tests.utilities.base_test import (
    get_token_header,
    get_token_body,
    get_form_request_payload,
)


def test_form_process_mapper_list(session, client, jwt, app):
    token = jwt.create_jwt(get_token_body(), get_token_header())
    headers = {"Authorization": f"Bearer {token}", "content-type": "application/json"}
    response = client.get("/form", headers=headers)
    assert response.status_code == 200


def test_form_process_mapper_creation(session, client, jwt, app):
    token = jwt.create_jwt(get_token_body(), get_token_header())
    headers = {"Authorization": f"Bearer {token}", "content-type": "application/json"}
    response = client.post("/form", headers=headers, json=get_form_request_payload())
    assert response.status_code == 201
    assert response.json.get("id") != None


def test_form_process_mapper_detail_view(session, client, jwt, app):
    token = jwt.create_jwt(get_token_body(), get_token_header())
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


def test_form_process_mapper_by_formid(client, jwt):
    token = jwt.create_jwt(get_token_body(), get_token_header())
    headers = {"Authorization": f"Bearer {token}", "content-type": "application/json"}
    response = client.post(
        "/form",
        headers=headers,
        json=get_form_request_payload(),
    )
    assert response.status_code == 201
    form_id = response.json.get("formId")
    rv = client.get(f"/form/formid/{form_id}", headers=headers)
    assert rv.status_code == 200
