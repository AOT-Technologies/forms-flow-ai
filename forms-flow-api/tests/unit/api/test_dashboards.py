"""Unit test for APIs of Dashboards"""
from tests.utilities.base_test import factory_auth_header


def test_get_dashboards(client):
    token = factory_auth_header()
    headers = {"Authorization": f"Bearer {token}", "content-type": "application/json"}
    rv = client.get("/dashboards", headers=headers)
    assert rv.status_code == 200
    assert len(rv.json) >= 1


def test_get_dashboard_details(client):
    token = factory_auth_header()
    headers = {"Authorization": f"Bearer {token}", "content-type": "application/json"}

    rv = client.get("/dashboards/1", headers=headers)
    assert rv.json() is not None
    assert rv.status_code == 200


def test_no_auth_get_dashboards(client):
    rv = client.get("/dashboards")
    assert rv.status_code == 401


def test_get_dashboard_error_details(client):
    token = factory_auth_header()
    headers = {"Authorization": f"Bearer {token}", "content-type": "application/json"}

    rv = client.get("/dashboards/10000", headers=headers)
    assert rv.json == {"message": "Dashboard not found"}
