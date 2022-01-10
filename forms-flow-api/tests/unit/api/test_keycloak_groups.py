"""Unit test for APIs of Keycloak Group"""
from tests.utilities.base_test import factory_auth_header


def test_group_list(client):
    """Passing case of Group List API"""
    token = factory_auth_header()
    headers = {"Authorization": f"Bearer {token}", "content-type": "application/json"}

    response = client.get("/groups", headers=headers)
    assert response.status_code == 200


def test_group_list_wrongmethod(client):
    """Instead of Get Request, what if POST request comes"""
    token = factory_auth_header()
    headers = {"Authorization": f"Bearer {token}", "content-type": "application/json"}

    response = client.post("/groups", headers=headers)
    assert response.status_code == 405
    assert response.json() == {
        "message": "The method is not allowed for the requested URL."
    }


def test_group_list_wrong_auth_header(client):
    """Wrong Authorization header"""
    response = client.get("/groups")
    assert response.status_code == 401
    assert response.json() == {
        "type": "Invalid Token Error",
        "message": "Access to formsflow.ai API Denied. Check if the bearer token is passed for Authorization or has expired.",
    }


def test_group_details(client):
    token = factory_auth_header()
    headers = {"Authorization": f"Bearer {token}", "content-type": "application/json"}

    response = client.get("/groups", headers=headers)
    assert len(response.json) > 0

    id = response.json[0]["id"]
    response = client.get(f"/groups/{id}", headers=headers)
    assert response.status_code == 200
    assert len(response.json()) > 0


# def test_non_existential_group_id(client):
#     """non-existential group id"""
#     token = factory_auth_header()
#     headers = {"Authorization": f"Bearer {token}", "content-type": "application/json"}

#     response = client.get("/groups/123", headers=headers)
#     assert response.status_code == 404


def test_groups_put_details(client):
    """good cases"""
    token = factory_auth_header()
    headers = {"Authorization": f"Bearer {token}", "content-type": "application/json"}

    response = client.get("/groups", headers=headers)
    assert len(response.json) > 0
    id = response.json[0]["id"]

    response = client.put(
        f"/groups/{id}", headers=headers, data={"dashboards": [{100: "Test Dashboard"}]}
    )
    assert response.status_code == 204


def test_groups_put_wrong_details(client):
    """wrong request object"""
    token = factory_auth_header()
    headers = {"Authorization": f"Bearer {token}", "content-type": "application/json"}

    response = client.get("/groups", headers=headers)
    assert len(response.json) > 0
    id = response.json[0]["id"]
    # missing dashboards attribute
    response = client.put(
        f"/groups/{id}", headers=headers, data={"test": [{100: "Test Dashboard"}]}
    )
    assert response.status_code == 400
    assert response.json() == {"message": "Invalid Request Object format"}
