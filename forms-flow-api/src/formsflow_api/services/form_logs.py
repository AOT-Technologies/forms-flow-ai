"""This exposes submission service."""
from http import HTTPStatus

from formsflow_api_utils.utils.user_context import UserContext, user_context

from formsflow_api.models import FormLogs
from formsflow_api.schemas import FormLogsResponseSchema


class FormlogService:
    """This class manages Formlogs service."""

    @user_context
    @staticmethod
    def create_form_logs(data, **kwargs):
        """This is for create form logs."""
        user: UserContext = kwargs["user"]
        try:
            if data:
                log_data = {
                    "form_id": data["form_id"],
                    "logs": [
                        {
                            "mapper_version": data["mapper_version"],
                            "process_name": data["process_name"],
                            "form_name": data["form_name"],
                            "form_revision": data["form_revision"],
                            "modifed_by": user.user_name,
                        }
                    ],
                }
                saved_data = FormLogs.create_form_log(log_data)
                form_logs_response_schema = FormLogsResponseSchema()
                return form_logs_response_schema.dump(saved_data)
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

    @user_context
    @staticmethod
    def update_form_logs(form_id, data, **kwargs):
        """Update form logs."""
        try:
            user: UserContext = kwargs["user"]
            assert form_id is not None
            saved_data = FormLogs.update_form_logs(
                form_id, {**data, "modifed_by": user.user_name}
            )
            if saved_data:
                form_logs_response_schema = FormLogsResponseSchema()
                return form_logs_response_schema.dump(saved_data), HTTPStatus.OK
            return {
                    "type": "Bad request error",
                    "message": "Invalid form id",
                   }, HTTPStatus.BAD_REQUEST
        except Exception as err:
            raise err

    @staticmethod
    def delete_form_logs(form_id):
        """Delete form logs."""
        try:
            assert form_id is not None
            deleted = FormLogs.delete_form_logs(form_id)
            if deleted:
                return {"message": "successfully deleted"}, HTTPStatus.OK
            return {
                    "type": "Bad request error",
                    "message": "Invalid form id",
                   }, HTTPStatus.BAD_REQUEST
        except Exception as err:
            raise err
