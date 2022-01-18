"""Test suite for application History API endpoint"""
from tests.utilities.base_test import (
    get_application_create_payload,
    get_form_request_payload,
    factory_auth_header,
)


# def test_get_application_history(client, jwt):
#     """Get the json request for application /application/{application_id}/history"""
#     token = factory_auth_header()
#     headers = {"Authorization": f"Bearer {token}", "content-type": "application/json"}

#     rv = client.post("/form", headers=headers, json=get_form_request_payload())
#     assert rv.status_code == 201

#     form_id = rv.json.get("formId")

#     rv = client.post(
#         "/application/create",
#         headers=headers,
#         json=get_application_create_payload(form_id),
#     )
#     assert rv.status_code == 201

#     ## This application create fails because of pessimistic DB management

#     application_id = rv.json.get("applicationId")

#     rv = client.get(f"/application/{application_id}/history", headers=headers)
#     assert rv.status_code == 200


def test_get_application_history_unauthorized(client):
    """Testing the response of unauthorized application /application/{application_id}/history"""
    rv = client.get("/application/1/history")
    assert rv.status_code == 401


# def test_post_application_history_create_method(client, jwt):
#     token = factory_auth_header()
#     headers = {"Authorization": f"Bearer {token}", "content-type": "application/json"}

#     rv = client.post("/form", headers=headers, json=get_form_request_payload())
#     assert rv.status_code == 201
#     form_id = rv.json.get("formId")

#     rv = client.post(
#         "/application/create",
#         headers=headers,
#         json=get_application_create_payload(form_id),
#     )
#     assert rv.status_code == 201
#     application_id = rv.json.get("applicationId")
#     new_application = client.post(
#         f"/application/{application_id}/history",
#         headers=headers,
#         json={
#             "applicationId": 1,
#             "applicationStatus": "New",
#             "formUrl": "http://testsample.com/form/23/submission/3423",
#         },
#     )
#     assert new_application.status_code == 201
