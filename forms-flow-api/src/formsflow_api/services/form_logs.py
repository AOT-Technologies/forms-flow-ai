"""This exposes submission service."""
from http import HTTPStatus

from formsflow_api_utils.utils.user_context import UserContext, user_context

from formsflow_api.models import FormLogs
from formsflow_api.schemas import FormLogsResponseSchema


class FormlogService:
    """This class manages Formlogs service."""

    @user_context
    @staticmethod
    def create_form_logs(data, ):
        """This is for create form logs."""
        try:
            if data:
                print(data)
                
                # saved_data = FormLogs.create_form_log(data)

                # return form_logs_response_schema.dump(saved_data)
            return None
        except Exception as err:
            raise err

    @staticmethod
    def get_form_logs_by_id(form_id):
        """Return form logs by form id."""
        try:
            assert form_id is not None
            form_logs = FormLogs.get_form_logs(form_id)
            if form_logs:
                form_logs_response_schema = FormLogsResponseSchema()
                return form_logs_response_schema.dump(form_logs), HTTPStatus.OK
            return {
                    "type": "Bad request error",
                    "message": "Invalid form id",
                   }, HTTPStatus.BAD_REQUEST
        except Exception as err:
            raise err

    
