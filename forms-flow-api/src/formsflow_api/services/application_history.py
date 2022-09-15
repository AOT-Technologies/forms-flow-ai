"""This exposes application audit service."""
from flask import current_app
from formsflow_api_utils.utils import get_form_and_submission_id_from_form_url

from formsflow_api.models import ApplicationHistory
from formsflow_api.schemas import ApplicationHistorySchema


class ApplicationHistoryService:
    """This class manages application service."""

    @staticmethod
    def create_application_history(data):
        """Create new application history."""
        (form_id, submission_id) = get_form_and_submission_id_from_form_url(
            data["form_url"]
        )
        data["form_id"] = form_id
        data["submission_id"] = submission_id
        application = ApplicationHistory.create_from_dict(data)

        return application

    @staticmethod
    def get_application_history(application_id):
        """Get application by id."""
        application_history = ApplicationHistory.get_application_history(application_id)
        schema = ApplicationHistorySchema()
        history_data = schema.dump(application_history, many=True)
        # This to make the API backward compatible by constructing the formUrl.
        # Response is coming as single object and nor array if there is only 1 element. Need to investigate.
        history_response = []
        for history in history_data:
            history["formUrl"] = (
                f"{current_app.config.get('FORMIO_URL')}/form/"
                f"{history['formId']}/submission/{history['submissionId']}"
            )
            history_response.append(history)
        return history_response
