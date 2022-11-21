"""This exposes form logs service."""
from http import HTTPStatus


from formsflow_api.models import FormLogs
from formsflow_api.schemas import FormLogsRequestAndResponseSchema


class FormlogService:
    """This class manages Formlogs service."""

    @staticmethod
    def create_form_logs(data):
        """This is for create form logs."""
        try:
            if data:
                logs_schema = FormLogsRequestAndResponseSchema()
                logs_data = logs_schema.load(data)
                logs_data["mapper_id"] = data["id"]
                FormLogs.create_form_log(logs_data)
        except Exception as err:
            raise err

    @staticmethod
    def get_form_logs_by_id(form_id):
        """Return form logs by form id."""
        try:
            assert form_id is not None
            form_logs = FormLogs.get_form_logs(form_id)
            if form_logs:
                form_logs_response_schema = FormLogsRequestAndResponseSchema(many=True)
                return form_logs_response_schema.dump(form_logs), HTTPStatus.OK
            return {
                "type": "Bad request error",
                "message": "Invalid form id",
            }, HTTPStatus.BAD_REQUEST
        except Exception as err:
            raise err
