"""Unit tests for FormProcessMapper Model"""
from formsflow_api.models import FormProcessMapper


def test_formprocessmapper_creation():
    """Test FormProcessMapper can create"""
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
    assert form.form_id == 12324
