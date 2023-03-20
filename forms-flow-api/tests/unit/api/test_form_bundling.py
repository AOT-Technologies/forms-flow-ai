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
    FormProcessMapper.create_from_dict(
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
            "form_type": "bundle",
            "parent_form_id": "789",
            "status": "active",
            "created_by": "test",
        }
    )
    # Create bundle records
    FormBundling(
        rules=[],
        form_process_mapper_id=bundle_mapper.id,
        form_order=1,
        parent_form_id="123",
    ).save()
    bundle_2: FormBundling = FormBundling(
        rules=[],
        form_process_mapper_id=bundle_mapper.id,
        form_order=2,
        parent_form_id="456",
    ).save()

    # No rules are created, so all forms should be returned.
    response = client.post(
        f"/form/{bundle_mapper.id}/bundles/execute-rules",
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
        f"/form/{bundle_mapper.id}/bundles/execute-rules",
        headers=headers,
        json={},
    )
    assert response.status_code == 200
    assert len(response.json) == 1
    assert response.json[0].get("formName") == mapper_1.form_name

    # Assert both forms are returned when skip_rules is passed as True,
    # this is invoked for preview forms, or list forms without executing any rules.
    response = client.post(
        f"/form/{bundle_mapper.id}/bundles/execute-rules?skipRules=true",
        headers=headers,
        json={},
    )
    assert response.status_code == 200
    assert len(response.json) == 2

    # Create a submission payload to pass the rule and assert both forms are returned.
    response = client.post(
        f"/form/{bundle_mapper.id}/bundles/execute-rules",
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
        f"/form/{bundle_mapper.id}/bundles/execute-rules",
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


def test_bundle_get_by_id(app, client, session, jwt):
    """Test bundle get by id endpoint.."""
    token = get_token(jwt)
    headers = {"Authorization": f"Bearer {token}", "content-type": "application/json"}
    # Create forms.
    FormProcessMapper.create_from_dict(
        {
            "form_id": "123",
            "form_name": "Test_Form_1",
            "form_type": "form",
            "parent_form_id": "123",
            "status": "active",
            "created_by": "test",
        }
    )
    FormProcessMapper.create_from_dict(
        {
            "form_id": "456",
            "form_name": "Test_Form_2",
            "form_type": "form",
            "parent_form_id": "456",
            "status": "active",
            "created_by": "test",
        }
    )
    # Create bundle form process mapper.
    bundle_mapper: FormProcessMapper = FormProcessMapper.create_from_dict(
        {
            "form_id": "100",
            "form_name": "Bundle Form",
            "form_type": "bundle",
            "parent_form_id": "100",
            "status": "active",
            "created_by": "test",
        }
    )
    # Payload for adding forms undef bundle
    bundle_payload = {
        "selectedForms": [
            {
                "rules": ["teaxt == pageYOffset", "age == 30"],
                "formOrder": 1,
                "parentFormId": "123",
            },
            {
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
        f"/form/{bundle_mapper.id}/bundles",
        headers=headers,
        json=bundle_payload,
    )

    assert response.status_code == 201

    response = client.get(
        f"/form/{bundle_mapper.id}/bundles", headers=headers, json=bundle_payload
    )
    assert response.status_code == 200
    assert len(response.json) == 2
    # Access get bundle by id with client token
    token = get_token(jwt)
    headers = {"Authorization": f"Bearer {token}", "content-type": "application/json"}
    response = client.get(
        f"/form/{bundle_mapper.id}/bundles", headers=headers, json=bundle_payload
    )
    assert response.status_code == 200
    assert len(response.json) == 2
    # Update bundle to inactive
    bundle_mapper.update({"status": "inactive"})
    # Since bundle is inactive client will get empty list.
    response = client.get(
        f"/form/{bundle_mapper.id}/bundles", headers=headers, json=bundle_payload
    )
    assert response.status_code == 200
    assert len(response.json) == 0


def test_bundle_update(app, client, session, jwt):
    """Test update bundle endpoint.."""
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
    # Create bundle form process mapper.
    bundle_mapper: FormProcessMapper = FormProcessMapper.create_from_dict(
        {
            "form_id": "100",
            "form_name": "Bundle Form",
            "form_type": "bundle",
            "parent_form_id": "100",
            "status": "active",
            "created_by": "test",
        }
    )
    # Payload for adding forms undef bundle
    bundle_payload = {
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
        f"/form/{bundle_mapper.id}/bundles",
        headers=headers,
        json=bundle_payload,
    )

    assert response.status_code == 201
    # new form created
    mapper_3: FormProcessMapper = FormProcessMapper.create_from_dict(
        {
            "form_id": "789",
            "form_name": "Test_Form_2",
            "form_type": "form",
            "parent_form_id": "789",
            "status": "active",
            "created_by": "test",
        }
    )
    # Update payload
    # form with mapper_1 updated
    # form with mapper_2 removed from bundle
    # form with mapper_3 added to bundle
    bundle_payload = {
        "selectedForms": [
            {
                "mapperId": mapper_1.id,
                "path": "",
                "rules": [],
                "formOrder": 1,
                "parentFormId": "123",
            },
            {
                "mapperId": mapper_3.id,
                "path": "",
                "rules": ["teaxt == pageYOffset"],
                "formOrder": 2,
                "parentFormId": "789",
            },
        ],
    }
    response = client.put(
        f"/form/{bundle_mapper.id}/bundles", headers=headers, json=bundle_payload
    )
    assert response.status_code == 201
    assert len(response.json) == 2
    for form in response.json:
        if form.get("mapperId") == mapper_3.id:
            new_form_added = True
        if form.get("mapperId") != mapper_2.id:
            deleted_form = True
        if form.get("mapperId") == mapper_1.id:
            # assert rules for with mapper id - mapper_1 updated.
            assert form["rules"] == []
    # assert form with mapper id - mapper_3 added to bundle.
    assert new_form_added
    # assert form with mapper id - mapper_2 deleted from bundle.
    assert deleted_form
