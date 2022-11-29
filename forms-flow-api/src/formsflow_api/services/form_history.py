"""This exposes Form history service."""

from http import HTTPStatus

from formsflow_api_utils.utils.user_context import UserContext, user_context
from formsflow_api_utils.exceptions import BusinessException
from formsflow_api_utils.services.external import FormioService
from formsflow_api.models import FormHistory
from formsflow_api.schemas import FormHistorySchema


class FormHistoryService:
    """This class manages form history service."""

    @staticmethod
    @user_context
    def create_form_history(data, **kwargs):
        """Create form history"""
        user: UserContext = kwargs["user"]
        assert data is not None
        user_name = (user.user_name,)
        history_schema = FormHistorySchema()
        parent_form_id = data.get("_id")
        history_count = FormHistory.get_count_of_all_history(parent_form_id)
        del data["_id"]
        del data["machineName"]
        name_and_path = f"{data.get('path')}-v{history_count+1}"
        data["path"] = name_and_path
        data["name"] = name_and_path
        formio_service = FormioService()
        form_io_token = formio_service.get_formio_access_token()
        response = formio_service.create_form(data, form_io_token)
        form_history_data = {
            "parent_form_id": parent_form_id,
            "cloned_form_id": response.get("_id"),
            "created_by": user_name,
        }
        create_form_history = FormHistory.create_history(form_history_data)
        return history_schema.dump(create_form_history)

    @staticmethod
    def get_all_history(parent_form_id: str):
        """Get all history"""
        assert parent_form_id is not None
        form_histories = FormHistory.fetch_histories_by_parent_id(parent_form_id)
        if form_histories:
            form_history_schema = FormHistorySchema(many=True)
            return form_history_schema.dump(form_histories), HTTPStatus.OK
        raise BusinessException(
            {
                "type": "Invalid response data",
                "message": ("Invalid Form Id"),
            },
            HTTPStatus.BAD_REQUEST,
        )
