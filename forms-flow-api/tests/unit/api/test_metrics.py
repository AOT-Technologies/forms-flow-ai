"""Test suite for metrics API endpoint"""
import pytest
import datetime
from tests.utilities.base_test import (
    get_application_create_payload,
    get_form_request_payload,
    factory_auth_header,
)

METRICS_ORDER_BY_VALUES = ["created", "modified"]
today = datetime.date.today().strftime("%Y-%m-%dT%H:%M:%S+00:00").replace("+", "%2B")
tomorrow = (
    (datetime.date.today() + datetime.timedelta(days=1))
    .strftime("%Y-%m-%dT%H:%M:%S+00:00")
    .replace("+", "%2B")
)


@pytest.mark.parametrize("orderBy", METRICS_ORDER_BY_VALUES)
def test_metrics_get_200(orderBy, session, client, jwt, app):
    token = factory_auth_header()
    headers = {"Authorization": f"Bearer {token}", "content-type": "application/json"}
    rv = client.get(
        f"/metrics?from={today}&to={tomorrow}&orderBy={orderBy}", headers=headers
    )
    assert rv.status_code == 200


@pytest.mark.parametrize("orderBy", METRICS_ORDER_BY_VALUES)
def test_metrics_get_401(orderBy, session, client, jwt, app):
    rv = client.get(f"/metrics?from=2021-10-10&to=2021-10-31&orderBy={orderBy}")
    assert rv.status_code == 401


@pytest.mark.parametrize("orderBy", METRICS_ORDER_BY_VALUES)
def test_metrics_list_view(orderBy, session, client, jwt, app):
    token = factory_auth_header()
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
def test_metrics_detailed_get_401(orderBy, session, client, jwt, app):
    rv = client.get(f"/metrics/1?from=2021-10-10&to=2021-10-31&orderBy={orderBy}")
    assert rv.status_code == 401


@pytest.mark.parametrize("orderBy", METRICS_ORDER_BY_VALUES)
def test_metrics_detailed_view(orderBy, session, client, jwt, app):
    token = factory_auth_header()
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
    assert rv.json.get("applications")
