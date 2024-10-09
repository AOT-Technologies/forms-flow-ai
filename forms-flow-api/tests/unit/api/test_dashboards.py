"""Unit test for APIs of Dashboards."""

from formsflow_api_utils.utils import (
    MANAGE_DASHBOARD_AUTHORIZATIONS,
    VIEW_DASHBOARDS,
)

from tests.utilities.base_test import get_token


def test_get_dashboards(app, client, session, jwt):
    """Testing the get dashboards endpoint."""
    token = get_token(jwt, role=MANAGE_DASHBOARD_AUTHORIZATIONS)
    headers = {"Authorization": f"Bearer {token}", "content-type": "application/json"}
    rv = client.get("/dashboards", headers=headers)
    assert rv.status_code == 200
    assert len(rv.json) >= 1


def test_get_dashboard_details(app, client, session, jwt):
    """Testing the get dashboard details endpoint."""
    token = get_token(jwt, role=MANAGE_DASHBOARD_AUTHORIZATIONS)
    headers = {"Authorization": f"Bearer {token}", "content-type": "application/json"}
    rv = client.get("/dashboards", headers=headers)
    assert rv.status_code == 200
    data = rv.json
    dashboard_id = data["results"][0]["id"]
    token = get_token(jwt, role=VIEW_DASHBOARDS)
    headers = {"Authorization": f"Bearer {token}", "content-type": "application/json"}
    rv = client.get(f"/dashboards/{dashboard_id}", headers=headers)
    assert rv.json is not None


def test_no_auth_get_dashboards(app, client, session):
    """Get dashboards with invalid authentication."""
    rv = client.get("/dashboards")
    assert rv.status_code == 401


def test_get_dashboard_error_details(app, client, session, jwt):
    """Get dashboards with invalid resource id."""
    token = get_token(jwt, role=VIEW_DASHBOARDS)
    headers = {"Authorization": f"Bearer {token}", "content-type": "application/json"}

    rv = client.get("/dashboards/10000", headers=headers)
    assert rv.json == {"message": "Dashboard - 10000 not accessible"}


def test_get_dashboard_error_details_tenant(app, client, session, jwt):
    """Get dashboards for tenant with analytics not created."""
    token = get_token(
        jwt, tenant_key="test-tenant", role=MANAGE_DASHBOARD_AUTHORIZATIONS
    )
    headers = {"Authorization": f"Bearer {token}", "content-type": "application/json"}

    rv = client.get("/dashboards", headers=headers)
    assert rv.status_code == 400
    assert rv.json["message"] == "Analytics is not enabled for this tenant"
