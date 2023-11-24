"""Test suit for embed APIs."""

from tests.utilities.base_test import (
    get_embed_application_create_payload,
    get_embed_token,
    get_form_request_payload,
    get_token,
    get_form_payload,
)


def test_get_external_form_valid_request(app, client, session, jwt):
    """Testing the external get form by pathname."""
    token = get_token(jwt)
    assert token is not None
    headers = {"Authorization": f"Bearer {token}", "content-type": "application/json"}
    response = client.post(
        "/form",
        headers=headers,
        json=get_form_payload(),
    )
    assert response.status_code == 201
    token = get_embed_token()
    assert token is not None
    headers = {"Authorization": f"Bearer {token}", "content-type": "application/json"}
    rv = client.get("/embed/external/form/selectcheckresouce", headers=headers)
    assert rv.status_code == 200
    assert len(rv.json) >= 1


def test_get_external_form_invalid_request(app, client, session, jwt):
    """Testing the external get form by pathname."""
    token = get_embed_token(invalid=True)
    assert token is not None
    headers = {"Authorization": f"Bearer {token}", "content-type": "application/json"}
    rv = client.get("/embed/external/form/selectcheckresouce", headers=headers)
    assert rv.status_code == 401


def test_get_internal_form_valid_request(app, client, session, jwt):
    """Testing the internal get form by pathname."""
    token = get_token(jwt)
    assert token is not None
    headers = {"Authorization": f"Bearer {token}", "content-type": "application/json"}
    response = client.post(
        "/form",
        headers=headers,
        json=get_form_payload(),
    )
    assert response.status_code == 201
    rv = client.get("/embed/internal/form/selectcheckresouce", headers=headers)
    assert rv.status_code == 200
    assert len(rv.json) >= 1


def test_get_internal_form_invalid_request(app, client, session, jwt):
    """Testing the internal get form by pathname."""
    token = None
    headers = {"Authorization": f"Bearer {token}", "content-type": "application/json"}
    rv = client.get("/embed/internal/form/selectcheckresouce", headers=headers)
    assert rv.status_code == 401


def test_form_embed_external_submission(app, client, session, jwt):
    """Testing form process mapper update endpoint."""
    token = get_token(jwt)
    headers = {"Authorization": f"Bearer {token}", "content-type": "application/json"}
    response = client.post(
        "/form",
        headers=headers,
        json=get_form_request_payload(),
    )
    assert response.status_code == 201
    token = get_embed_token()
    headers = {"Authorization": f"Bearer {token}", "content-type": "application/json"}
    form_id = response.json["formId"]
    res = client.post(
        "/embed/external/application/create",
        headers=headers,
        json=get_embed_application_create_payload(form_id),
    )
    assert res.status_code == 201


def test_form_embed_internal_submission(app, client, session, jwt):
    """Testing form process mapper update endpoint."""
    token = get_token(jwt)
    headers = {"Authorization": f"Bearer {token}", "content-type": "application/json"}
    response = client.post(
        "/form",
        headers=headers,
        json=get_form_request_payload(),
    )
    assert response.status_code == 201
    form_id = response.json["formId"]
    res = client.post(
        "/embed/internal/application/create",
        headers=headers,
        json=get_embed_application_create_payload(form_id),
    )
    assert res.status_code == 201
