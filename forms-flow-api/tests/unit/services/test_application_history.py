"""Tests to assure the Application History Service."""
from formsflow_api.services import ApplicationHistoryService

application_history_service = ApplicationHistoryService()


def test_create_application_history(app, client, session):
    """Tests the application history creation with valid payload."""
    payload = {
        "application_status": "Pending",
        "form_url": "http://sample.com/form/23232/submission/2342",
        "submitted_by": "client",
    }
    payload["application_id"] = 1222  # sample value
    application_history = application_history_service.create_application_history(
        data=payload
    )
    assert application_history.application_id == 1222
    assert application_history.application_status == "Pending"
    assert (
        application_history.form_url == "http://sample.com/form/23232/submission/2342"
    )
    assert application_history.submitted_by == "client"


def test_get_application_history(app, client, session):
    """Tests the application history retrieval."""
    # Need to have at least one application before running this test
    application_history = application_history_service.get_application_history(
        application_id=1
    )
    assert not application_history
