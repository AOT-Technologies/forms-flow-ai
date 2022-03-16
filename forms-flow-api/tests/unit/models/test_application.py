"""Unit tests for application Model"""
from formsflow_api.models import Application, FormProcessMapper


def test_application_model_can_create_application(app, client, session):
    """Test application model can create application."""
    form = FormProcessMapper(
        id=1,
        form_id=12324,
        form_name="One Step Approval",
        process_name="test",
        process_key="test",
        status="Pending",
        comments="test",
        created_by="test-user",
    )
    assert form.id == 1
    form.save()
    application1 = Application(
        application_status="Approved",
        form_url="https://testsample.com/api/form/123/submission/2313",
        process_instance_id="213123",
        form_process_mapper_id=1,
        created_by="test-user",
    )

    assert application1.application_status == "Approved"
    assert (
        application1.form_url == "https://testsample.com/api/form/123/submission/2313"
    )
    application1.save()
