"""Unit tests for FormProcessMapper Model."""
from formsflow_api.models import FormProcessMapper


def test_formprocessmapper_creation(app, client, session):
    """Test FormProcessMapper can create."""
    form = FormProcessMapper(
        id=1,
        form_id=12324,
        form_name="One Step Approval",
        process_key=121312,
        process_name="test",
        status="Pending",
        comments="test",
        tenant="test-org",
    )
    assert form.id == 1
    assert form.form_id == 12324


def test_formprocessmapper_anonymous_creation(app, client, session):
    """Test Anonymous FormProcessMapper can create forms."""
    form = FormProcessMapper(
        id=5,
        form_id=12324,
        form_name="Two Step Approval",
        process_key=121312,
        process_name="test",
        status="Pending",
        comments="test",
        tenant="test-org",
        is_anonymous=True,
    )

    assert form.id == 5
    assert form.form_id == 12324
    assert form.is_anonymous is True
