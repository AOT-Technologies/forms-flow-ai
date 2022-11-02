"""This exposes submission service."""
from formsflow_api_utils.utils.user_context import UserContext, user_context

from formsflow_api.models import FormLogs
from formsflow_api.schemas import FormLogsResponseSchema


class FormlogService:
    """This class manages Formlogs service."""

    @user_context
    @staticmethod
    def create_form_logs( data, **kwargs):
        """this is for create form logs """
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
        """return form logs by form id"""
        try:
            if form_id:
                form_logs = FormLogs.get_form_logs(form_id)
                form_logs_response_schema = FormLogsResponseSchema()
                return form_logs_response_schema.dump(form_logs)
            return None
        except Exception as err:
            raise err

    @user_context
    @staticmethod
    def update_form_logs(form_id, data, **kwargs):
        """update form logs"""
        try:
            user: UserContext = kwargs["user"]
            if form_id:
                saved_data = FormLogs.update_form_logs(
                    form_id, {**data, "modifed_by": user.user_name}
                )
                form_logs_response_schema = FormLogsResponseSchema()
                return form_logs_response_schema.dump(saved_data)
            return None
        except Exception as err:
            raise err

    @staticmethod
    def delete_form_logs(form_id):
        """delete form logs"""
        try:
            if form_id:
                FormLogs.delete_form_logs(form_id)
        except Exception as err:
            raise err
