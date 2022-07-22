"""Test suite for FormProcessMapper API endpoint."""
import pytest

from tests.utilities.base_test import (
    get_application_create_payload,
    get_form_request_anonymous_payload,
    get_form_request_payload,
    get_formio_form_request_payload,
    get_token,
)


def test_form_process_mapper_list(app, client, session, jwt):
    """Testing form process mapper listing API."""
    token = get_token(jwt)
    headers = {"Authorization": f"Bearer {token}", "content-type": "application/json"}
    response = client.get("/form", headers=headers)
    assert response.status_code == 200
    assert response.json is not None


def test_form_process_mapper_creation(app, client, session, jwt):
    """Testing form process mapper create API."""
    token = get_token(jwt)
    headers = {"Authorization": f"Bearer {token}", "content-type": "application/json"}
    response = client.post("/form", headers=headers, json=get_form_request_payload())
    assert response.status_code == 201
    assert response.json.get("id") is not None


@pytest.mark.parametrize(("pageNo", "limit"), ((1, 5), (1, 10), (1, 20)))
def test_form_process_mapper_paginated_list(app, client, session, jwt, pageNo, limit):
    """Testing form process mapper paginated list."""
    token = get_token(jwt)
    headers = {"Authorization": f"Bearer {token}", "content-type": "application/json"}
    response = client.get(f"/form?pageNo={pageNo}&limit={limit}", headers=headers)
    assert response.status_code == 200


@pytest.mark.parametrize(
    ("pageNo", "limit", "sortBy", "sortOrder"),
    ((1, 5, "id", "asc"), (1, 10, "id", "desc"), (1, 20, "id", "desc")),
)
def test_form_process_mapper_paginated_sorted_list(
    app, client, session, jwt, pageNo, limit, sortBy, sortOrder
):
    """Testing form process mapper paginated sorted list."""
    token = get_token(jwt)
    headers = {"Authorization": f"Bearer {token}", "content-type": "application/json"}
    response = client.get(
        f"/application?pageNo={pageNo}&limit={limit}&sortBy={sortBy}&sortOrder={sortOrder}",
        headers=headers,
    )
    assert response.status_code == 200


@pytest.mark.parametrize(
    ("pageNo", "limit", "filters"),
    (
        (1, 5, "formName=free"),
        (1, 10, "formName=Free"),
        (1, 20, "formName=privacy"),
    ),
)
def test_form_process_mapper_paginated_filtered_list(
    app, client, session, jwt, pageNo, limit, filters
):
    """Testing form process mapper paginated filtered list."""
    token = get_token(jwt)
    headers = {"Authorization": f"Bearer {token}", "content-type": "application/json"}
    response = client.post("/form", headers=headers, json=get_form_request_payload())
    assert response.status_code == 201
    rv = client.get(f"/form?pageNo={pageNo}&limit={limit}&{filters}", headers=headers)
    assert rv.status_code == 200


def test_anonymous_form_process_mapper_creation(app, client, session, jwt):
    """Testing anonymous form process mapper creation."""
    token = get_token(jwt)
    headers = {"Authorization": f"Bearer {token}", "content-type": "application/json"}
    response = client.post(
        "/form", headers=headers, json=get_form_request_anonymous_payload()
    )
    assert response.status_code == 201
    assert response.json.get("id") is not None


def test_form_process_mapper_detail_view(app, client, session, jwt):
    """Testing form process mapper details endpoint."""
    token = get_token(jwt)
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


def test_form_process_mapper_by_formid(app, client, session, jwt):
    """Testing API/form/formid/<formid> with valid data."""
    token = get_token(jwt)
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


def test_form_process_mapper_id_deletion(app, client, session, jwt):
    """Testing form process mapper delete endpoint."""
    token = get_token(jwt)
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


def test_form_process_mapper_test_update(app, client, session, jwt):
    """Testing form process mapper update endpoint."""
    token = get_token(jwt)
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


def test_anonymous_form_process_mapper_test_update(app, client, session, jwt):
    """Testing anonymous form process mapper update endpoint."""
    token = get_token(jwt)
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


def test_get_application_count_based_on_form_process_mapper_id(
    app, client, session, jwt
):
    """Testing the count API for applications corresponding to mapper id."""
    token = get_token(jwt)
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
    assert rv.json == {"message": "No Applications found", "value": 0}


def test_get_application_count_based_on_form_process_mapper_id1(
    app, client, session, jwt
):
    """Testing the count api."""
    token = get_token(jwt)
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


def test_get_task_variable_based_on_form_process_mapper_id(app, client, session, jwt):
    """Assert that API when passed with valid payload returns 200 status code."""
    token = get_token(jwt)
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

    application_id = rv.json.get("id")

    rv = client.get(f"/form/applicationid/{application_id}", headers=headers)
    assert rv.status_code == 200


def test_formio_form_creation(app, client, session, jwt):
    """Testing formio form create API."""
    token = get_token(jwt, role="formsflow-designer", username="designer")
    headers = {"Authorization": f"Bearer {token}", "content-type": "application/json"}
    response = client.post(
        "/form/form-create", headers=headers, json=get_formio_form_request_payload()
    )
    assert response.status_code == 201
