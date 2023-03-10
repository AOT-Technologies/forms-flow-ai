"""Test suit for embed APIs."""

from formsflow_api.models import FormBundling, FormProcessMapper
from tests.utilities.base_test import get_token


def test_execute_form_bundling_rules(app, client, session, jwt):
    """Test the form bundling rule exection endpoint and assert results.."""
    token = get_token(jwt)
    headers = {"Authorization": f"Bearer {token}", "content-type": "application/json"}
    # Create a bundle record then execute the rules.
    mapper_1: FormProcessMapper = FormProcessMapper.create_from_dict(
        {
            "form_id": "123",
            "form_name": "Test_Form",
            "form_type": "form",
            "parent_form_id": "123",
            "status": "active",
            "created_by": "test",
        }
    )
    mapper_2: FormProcessMapper = FormProcessMapper.create_from_dict(
        {
            "form_id": "456",
            "form_name": "Test_Form_2",
            "form_type": "form",
            "parent_form_id": "456",
            "status": "active",
            "created_by": "test",
        }
    )
    # Create a mapper for bundle.
    bundle_mapper: FormProcessMapper = FormProcessMapper.create_from_dict(
        {
            "form_id": "789",
            "form_name": "My_Bundle_Form",
            "form_type": "form",
            "parent_form_id": "789",
            "status": "active",
            "created_by": "test",
        }
    )
    # Create bundle records
    FormBundling(
        rules=[],
        path_name="test_form_path_1",
        mapper_id=mapper_1.id,
        form_process_mapper_id=bundle_mapper.id,
        form_order=1,
        parent_form_id="123",
    ).save()
    bundle_2: FormBundling = FormBundling(
        rules=[],
        path_name="test_form_path_2",
        mapper_id=mapper_2.id,
        form_process_mapper_id=bundle_mapper.id,
        form_order=2,
        parent_form_id="456",
    ).save()

    # No rules are created, so all forms should be returned.
    response = client.post(
        f"/bundles/{bundle_mapper.id}/execute-rules",
        headers=headers,
        json={},
    )
    assert response.status_code == 200
    assert len(response.json) == 2

    # Create a rule and apply to bundle_2
    bundle_2.rules = ["isMinor == false and isApplyingPermit == true"]
    bundle_2.save()
    # Execute rules with no payload and assert only 1 is returned.
    response = client.post(
        f"/bundles/{bundle_mapper.id}/execute-rules",
        headers=headers,
        json={},
    )
    assert response.status_code == 200
    assert len(response.json) == 1
    assert response.json[0].get("formName") == mapper_1.form_name

    # Assert both forms are returned when skip_rules is passed as True,
    # this is invoked for preview forms, or list forms without executing any rules.
    response = client.post(
        f"/bundles/{bundle_mapper.id}/execute-rules?skipRules=true",
        headers=headers,
        json={},
    )
    assert response.status_code == 200
    assert len(response.json) == 2

    # Create a submission payload to pass the rule and assert both forms are returned.
    response = client.post(
        f"/bundles/{bundle_mapper.id}/execute-rules",
        headers=headers,
        json={"data": {"isMinor": False, "isApplyingPermit": True}},
    )
    assert response.status_code == 200
    assert len(response.json) == 2

    # create a new version of the form, and assert latest version form is returned.
    mapper_1.status = "inactive"
    mapper_1.save()
    new_form_id = "100"
    FormProcessMapper.create_from_dict(
        {
            "form_id": new_form_id,
            "form_name": "Test_Form_V2",
            "form_type": "form",
            "parent_form_id": "123",
            "status": "active",
            "created_by": "test",
        }
    )
    response = client.post(
        f"/bundles/{bundle_mapper.id}/execute-rules",
        headers=headers,
        json={"data": {"isMinor": False, "isApplyingPermit": True}},
    )
    assert response.status_code == 200
    assert len(response.json) == 2
    found_new_version: bool = False
    for form in response.json:
        if form.get("formId") == new_form_id:
            found_new_version = True
    assert found_new_version


def test_list_forms_inside_bundle(app, client, session, jwt):
    """Test the list forms inside bundle endpoint.."""
    token = get_token(jwt)
    headers = {"Authorization": f"Bearer {token}", "content-type": "application/json"}
    # Create forms.
    mapper_1: FormProcessMapper = FormProcessMapper.create_from_dict(
        {
            "form_id": "123",
            "form_name": "Test_Form_1",
            "form_type": "form",
            "parent_form_id": "123",
            "status": "active",
            "created_by": "test",
        }
    )
    mapper_2: FormProcessMapper = FormProcessMapper.create_from_dict(
        {
            "form_id": "456",
            "form_name": "Test_Form_2",
            "form_type": "form",
            "parent_form_id": "456",
            "status": "active",
            "created_by": "test",
        }
    )
    bundle_payload = {
        "formName": "sample bundle",
        "description": "sample bundle create",
        "formId": "64008d37ca2cc522e336c7a3",
        "formType": "bundle",
        "parentFormId": "64008d37ca2cc522e336c7a3",
        "selectedForms": [
            {
                "mapperId": mapper_1.id,
                "path": "",
                "rules": ["teaxt == pageYOffset", "age == 30"],
                "formOrder": 1,
                "parentFormId": "123",
            },
            {
                "mapperId": mapper_2.id,
                "path": "",
                "rules": [],
                "formOrder": 2,
                "parentFormId": "456",
            },
        ],
    }
    # Create bundle.
    token = get_token(jwt, role="formsflow-designer", username="designer")
    headers = {"Authorization": f"Bearer {token}", "content-type": "application/json"}
    response = client.post(
        "/bundles",
        headers=headers,
        json=bundle_payload,
    )
    assert response.status_code == 201
    assert response.json["BundleId"] is not None
    # Returns both active & inactive forms for designer.
    bundle_id = response.json["BundleId"]
    response = client.get(f"/bundles/{bundle_id}/forms", headers=headers)
    assert response.status_code == 200
    assert len(response.json) == 2
    # Update a form inside bundle to inactive.
    # Designer can still get 2 forms(both active & inactive)
    mapper_1.update({"status": "inactive"})
    response = client.get(f"/bundles/{bundle_id}/forms", headers=headers)
    assert response.status_code == 200
    assert len(response.json) == 2
    # List active forms inside bundle for reviewer & client role only if bundle status is active.
    token = get_token(jwt)
    headers = {"Authorization": f"Bearer {token}", "content-type": "application/json"}
    response = client.get(f"/bundles/{bundle_id}/forms", headers=headers)
    assert response.status_code == 200
    assert len(response.json) == 0
