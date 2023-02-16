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
    # assert len(rv.json.get("applications")) == 1


@pytest.mark.parametrize("orderBy", METRICS_ORDER_BY_VALUES)
def test_metrics_detailed_get_401(orderBy, app, client, session):
    """Tests API/metrics/<form_id> endpoint with invalid data."""
    rv = client.get(
        f"/metrics/63e333f56bda305e2ecbc86c?from=2021-10-10&to=2021-10-31&orderBy={orderBy}"
    )
    assert rv.status_code == 401


@pytest.mark.parametrize("orderBy", METRICS_ORDER_BY_VALUES)
def test_metrics_detailed_view(orderBy, app, client, session, jwt):
    """Tests API/metrics/<form_id> endpoint with valid data."""
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
        f"/metrics/{form_id}?from={today}&to={tomorrow}&orderBy={orderBy}&formType=form",
        headers=headers,
    )
    assert rv.status_code == 200
    assert rv.json["applications"]


@pytest.mark.parametrize("orderBy", METRICS_ORDER_BY_VALUES)
@pytest.mark.parametrize(("pageNo", "limit"), ((1, 5), (1, 10), (1, 20)))
def test_metrics_paginated_list(orderBy, pageNo, limit, app, client, session, jwt):
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
        f"/metrics?from={today}&to={tomorrow}&orderBy={orderBy}&pageNo={pageNo}&limit={limit}",
        headers=headers,
    )
    assert rv.status_code == 200


@pytest.mark.parametrize("orderBy", METRICS_ORDER_BY_VALUES)
@pytest.mark.parametrize(
    ("pageNo", "limit", "sortBy", "sortOrder"),
    (
        (1, 5, "formName", "asc"),
        (1, 10, "formName", "desc"),
        (1, 20, "formName", "desc"),
    ),
)
def test_metrics_paginated_sorted_list(
    orderBy, pageNo, limit, sortBy, sortOrder, app, client, session, jwt
):
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
        f"/metrics?from={today}&to={tomorrow}&orderBy={orderBy}&pageNo={pageNo}&limit={limit}&sortBy={sortBy}&sortOrder={sortOrder}",
        headers=headers,
    )
    assert rv.status_code == 200


@pytest.mark.parametrize("orderBy", METRICS_ORDER_BY_VALUES)
@pytest.mark.parametrize(
    ("pageNo", "limit", "formName"),
    (
        (1, 5, "sample"),
        (1, 10, "form"),
        (1, 20, "sampleform"),
    ),
)
def test_metrics_paginated_filtered_list(
    orderBy, pageNo, limit, formName, app, client, session, jwt
):
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
        f"/metrics?from={today}&to={tomorrow}&orderBy={orderBy}&pageNo={pageNo}&limit={limit}&formName={formName}",
        headers=headers,
    )
    assert rv.status_code == 200
