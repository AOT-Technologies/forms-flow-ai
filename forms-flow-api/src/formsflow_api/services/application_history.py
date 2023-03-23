"""This exposes application audit service."""
import collections

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
        history_response = {"applications": [], "requests": []}
        application_history = ApplicationHistory.get_application_history(application_id)
        schema = ApplicationHistorySchema()
        history_data = schema.dump(application_history, many=True)

        grouped_req_history = collections.defaultdict(list)
        for history in history_data:
            history["formUrl"] = (
                f"{current_app.config.get('FORMIO_URL')}/form/"
                f"{history['formId']}/submission/{history['submissionId']}"
            )
            if history.get("isRequest", False):
                # Group the requests.
                grouped_req_history[history["requestType"]].append(history)
            else:
                history_response.get("applications").append(history)

        # Now iterate the group and create requests list.
        for request_type, history_group in grouped_req_history.items():
            request_type_history = {"requestType": request_type, "items": history_group}
            history_response.get("requests").append(request_type_history)
        return history_response
