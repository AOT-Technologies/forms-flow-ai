"""Unit test for APIs of Dashboards"""
from tests.utilities.base_test import factory_auth_header


def test_get_dashboards(app, client, session):
    token = factory_auth_header()
    headers = {"Authorization": f"Bearer {token}", "content-type": "application/json"}
    rv = client.get("/dashboards", headers=headers)
    assert rv.status_code == 200
    assert len(rv.json) >= 1


def test_get_dashboard_details(app, client, session):
    token = factory_auth_header()
    headers = {"Authorization": f"Bearer {token}", "content-type": "application/json"}
    rv = client.get("/dashboards", headers=headers)
    assert rv.status_code == 200
    data = rv.json
    dashboard_id = data["results"][0]["id"]
    rv = client.get(f"/dashboards/{dashboard_id}", headers=headers)
    assert rv.json is not None


def test_no_auth_get_dashboards(app, client, session):
    rv = client.get("/dashboards")
    assert rv.status_code == 401


def test_get_dashboard_error_details(app, client, session):
    token = factory_auth_header()
    headers = {"Authorization": f"Bearer {token}", "content-type": "application/json"}

    rv = client.get("/dashboards/10000", headers=headers)
    assert rv.json == {"message": "Dashboard - 10000 not accessible"}
