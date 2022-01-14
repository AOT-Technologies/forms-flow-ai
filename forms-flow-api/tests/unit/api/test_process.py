"""Test suite for process API endpoint"""
from tests.utilities.base_test import factory_auth_header


def test_process_get_all_processes(client, session, jwt):
    """Test process get all processes"""
    token = factory_auth_header()
    headers = {"Authorization": f"Bearer {token}", "content-type": "application/json"}
    response = client.get("/application", headers=headers)
    assert response.status_code == 200


# TODO: Add integration test using BPM Mock APIs
# def test_process_xml_details(client, session, jwt):
#     response = client.get("/process/one-step-approval/xml", headers=headers)
#     assert response.status_code == response
