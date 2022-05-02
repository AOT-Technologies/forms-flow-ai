"""Test suite for metrics API endpoint."""
import datetime

import pytest

from tests.utilities.base_test import (
    get_application_create_payload,
    get_form_request_payload,
    get_token,
)

METRICS_ORDER_BY_VALUES = ["created", "modified"]
today = datetime.date.today().strftime("%Y-%m-%dT%H:%M:%S+00:00").replace("+", "%2B")
tomorrow = (
    (datetime.date.today() + datetime.timedelta(days=1))
    .strftime("%Y-%m-%dT%H:%M:%S+00:00")
    .replace("+", "%2B")
)


@pytest.mark.parametrize("orderBy", METRICS_ORDER_BY_VALUES)
def test_metrics_get_200(orderBy, app, client, session, jwt):
    """Tests the API/metrics endpoint with valid param."""
    token = get_token(jwt)
    headers = {"Authorization": f"Bearer {token}", "content-type": "application/json"}
    rv = client.get(
        f"/metrics?from={today}&to={tomorrow}&orderBy={orderBy}", headers=headers
    )
    assert rv.status_code == 200


@pytest.mark.parametrize("orderBy", METRICS_ORDER_BY_VALUES)
def test_metrics_get_401(orderBy, app, client, session):
    """Tests the API/metrics endpoint with invalid param."""
    rv = client.get(f"/metrics?from=2021-10-10&to=2021-10-31&orderBy={orderBy}")
    assert rv.status_code == 401


@pytest.mark.parametrize("orderBy", METRICS_ORDER_BY_VALUES)
def test_metrics_list_view(orderBy, app, client, session, jwt):
    """Tests API/metrics endpoint with valid data."""
    token = get_token(jwt)
    headers = {"Authorization": f"Bearer {token}", "content-type": "application/json"}

    rv = client.post("/form", headers=headers, json=get_form_request_payload())
    assert rv.status_code == 201
    form_id = rv.json.get("formId")

    rv = client.post(
        "/application/create",
        headers=headers,
        json=get_application_create_payload(form_id),
    )
    assert rv.status_code == 201

    rv = client.get(
        f"/metrics?from={today}&to={tomorrow}&orderBy={orderBy}", headers=headers
    )
    assert rv.status_code == 200
    assert len(rv.json.get("applications")) == 1


@pytest.mark.parametrize("orderBy", METRICS_ORDER_BY_VALUES)
def test_metrics_detailed_get_401(orderBy, app, client, session):
    """Tests API/metrics/<mapper_id> endpoint with invalid data."""
    rv = client.get(f"/metrics/1?from=2021-10-10&to=2021-10-31&orderBy={orderBy}")
    assert rv.status_code == 401


@pytest.mark.parametrize("orderBy", METRICS_ORDER_BY_VALUES)
def test_metrics_detailed_view(orderBy, app, client, session, jwt):
    """Tests API/metrics/<mapper_id> endpoint with valid data."""
    token = get_token(jwt)
    headers = {"Authorization": f"Bearer {token}", "content-type": "application/json"}

    rv = client.post("/form", headers=headers, json=get_form_request_payload())
    assert rv.status_code == 201
    form_id = rv.json.get("formId")
    mapper_id = rv.json.get("id")

    rv = client.post(
        "/application/create",
        headers=headers,
        json=get_application_create_payload(form_id),
    )
    assert rv.status_code == 201

    rv = client.get(
        f"/metrics/{mapper_id}?from={today}&to={tomorrow}&orderBy={orderBy}",
        headers=headers,
    )
    assert rv.status_code == 200
    assert rv.json["applications"]
