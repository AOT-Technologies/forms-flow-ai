"""This exposes application audit service."""
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
        return schema.dump(application_history, many=True)
