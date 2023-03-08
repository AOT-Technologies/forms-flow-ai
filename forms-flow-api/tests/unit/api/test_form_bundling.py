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
