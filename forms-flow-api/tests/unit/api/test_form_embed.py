"""Test suit for embed APIs."""

from formsflow_api_utils.utils import CREATE_DESIGNS

from tests.utilities.base_test import (
    get_embed_application_create_payload,
    get_embed_token,
    get_form_payload,
    get_token,
)


def test_get_external_form_valid_request(
    app, client, session, jwt, mock_redis_client, create_mapper_custom
):
    """Testing the external get form by pathname."""
    token = get_token(jwt, role=CREATE_DESIGNS)
    assert token is not None
    headers = {"Authorization": f"Bearer {token}", "content-type": "application/json"}
    create_mapper_custom(data=get_form_payload())
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


def test_get_internal_form_valid_request(
    app, client, session, jwt, mock_redis_client, create_mapper_custom
):
    """Testing the internal get form by pathname."""
    token = get_token(jwt, role=CREATE_DESIGNS)
    assert token is not None
    headers = {"Authorization": f"Bearer {token}", "content-type": "application/json"}
    create_mapper_custom(data=get_form_payload())
    rv = client.get("/embed/internal/form/selectcheckresouce", headers=headers)
    assert rv.status_code == 200
    assert len(rv.json) >= 1


def test_get_internal_form_invalid_request(app, client, session, jwt):
    """Testing the internal get form by pathname."""
    token = None
    headers = {"Authorization": f"Bearer {token}", "content-type": "application/json"}
    rv = client.get("/embed/internal/form/selectcheckresouce", headers=headers)
    assert rv.status_code == 401


def test_form_embed_external_submission(
    app, client, session, jwt, mock_redis_client, create_mapper
):
    """Testing form process mapper update endpoint."""
    token = get_embed_token()
    headers = {"Authorization": f"Bearer {token}", "content-type": "application/json"}
    form_id = create_mapper["formId"]
    res = client.post(
        "/embed/external/application/create",
        headers=headers,
        json=get_embed_application_create_payload(form_id),
    )
    assert res.status_code == 201


def test_form_embed_internal_submission(
    app, client, session, jwt, mock_redis_client, create_mapper
):
    """Testing form process mapper update endpoint."""
    token = get_token(jwt, role=CREATE_DESIGNS)
    headers = {"Authorization": f"Bearer {token}", "content-type": "application/json"}

    form_id = create_mapper["formId"]
    res = client.post(
        "/embed/internal/application/create",
        headers=headers,
        json=get_embed_application_create_payload(form_id),
    )
    assert res.status_code == 201
