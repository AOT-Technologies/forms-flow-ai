"""Unit tests for application Model"""
from formsflow_api.models import Application, FormProcessMapper


def test_application_model_can_create_application():
    """Test application model can create application."""
    form = FormProcessMapper(
        id=1,
        form_id=12324,
        form_name="One Step Approval",
        form_revision_number=1,
        process_key=121312,
        process_name="test",
        status="Pending",
        comments="test",
        tenant_id=12,
    )
    assert form.id == 1
    application1 = Application(
        application_name="Test Form Application",
        application_status="Approved",
        form_url="https://testsample.com/api/form/123/submission/2313",
        process_instance_id="213123",
        revision_no=1,
        form_process_mapper_id=1,
    )

    assert application1.application_name == "Test Form Application"
    assert application1.application_status == "Approved"
    assert (
        application1.form_url == "https://testsample.com/api/form/123/submission/2313"
    )
