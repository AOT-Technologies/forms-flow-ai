"""Unit test for APIs of Keycloak Group."""
from tests import skip_in_ci
from tests.utilities.base_test import get_token, update_dashboard_payload


def test_group_list(app, client, session, jwt):
    """Passing case of Group List API."""
    token = get_token(jwt)
    headers = {"Authorization": f"Bearer {token}", "content-type": "application/json"}

    response = client.get("/groups", headers=headers)
    assert response.status_code == 200


def test_group_list_wrongmethod(app, client, session, jwt):
    """Instead of Get Request, what if POST request comes."""
    token = get_token(jwt)
    headers = {"Authorization": f"Bearer {token}", "content-type": "application/json"}

    response = client.post("/groups", headers=headers)
    assert response.status_code == 405
    assert response.json == {
        "message": "The method is not allowed for the requested URL."
    }


def test_group_list_wrong_auth_header(app, client, session):
    """Wrong Authorization header."""
    response = client.get("/groups")
    assert response.status_code == 401
    assert response.json == {
        "type": "Invalid Token Error",
        "message": "Access to formsflow.ai API Denied. Check if the "
        "bearer token is passed for Authorization or has expired.",
    }


def test_group_details(app, client, session, jwt):
    """Testing group details API."""
    token = get_token(jwt)
    headers = {"Authorization": f"Bearer {token}", "content-type": "application/json"}

    response = client.get("/groups", headers=headers)
    assert len(response.json) > 0

    id = response.json[0]["id"]
    response = client.get(f"/groups/{id}", headers=headers)
    assert response.status_code == 200
    assert len(response.json) > 0


@skip_in_ci
def test_groups_put_details(app, client, session, jwt):
    """Good cases."""
    token = get_token(jwt)
    headers = {"Authorization": f"Bearer {token}", "content-type": "application/json"}

    response = client.get("/groups", headers=headers)
    assert len(response.json) > 0
    id = response.json[0]["id"]

    response = client.put(
        f"/groups/{id}", headers=headers, json=update_dashboard_payload()
    )
    assert response.status_code == 200


def test_groups_put_wrong_details(app, client, session, jwt):
    """Wrong request object."""
    token = get_token(jwt)
    headers = {"Authorization": f"Bearer {token}", "content-type": "application/json"}

    response = client.get("/groups", headers=headers)
    assert len(response.json) > 0
    id = response.json[0]["id"]
    # missing dashboards attribute
    response = client.put(
        f"/groups/{id}", headers=headers, data={"test": [{100: "Test Dashboard"}]}
    )
    assert response.status_code == 400
