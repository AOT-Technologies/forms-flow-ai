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
    def create_form_log_with_clone(data, **kwargs):
        """Create form history"""
        user: UserContext = kwargs["user"]
        assert data is not None
        """If the component changed then we can create a clone"""
        if data.get("componentChanged") == True:
            form_id = data.get("_id")
            history_count = FormHistory.get_count_of_all_history(form_id)
            del data["_id"]
            del data["machineName"]
            name_and_path = f"{data.get('path')}-v{history_count+1}"
            data["path"] = name_and_path
            data["name"] = name_and_path
            formio_service = FormioService()
            form_io_token = formio_service.get_formio_access_token()
            response = formio_service.create_form(data, form_io_token)
            user_name = (user.user_name,)
            form_history_data = {
                "form_id": form_id,
                "created_by": user_name,
                "component_changed": True,
                "change_log": { "cloned_form_id": response.get("_id")},
            }
            history_schema = FormHistorySchema()
            create_form_history = FormHistory.create_history(form_history_data)
            return history_schema.dump(create_form_history)
        
    @staticmethod
    @user_context
    def created_form_logs_without_clone(data, **kwargs):
        """Create form history"""
        user: UserContext = kwargs["user"]
        assert data is not None
        user_name = (user.user_name,)
        form_logs_data = {"change_log":{}}
        if data.get("statusChanged") == True:
            form_logs_data["status"]=True
            form_logs_data["change_log"] = {"status": data.get("status")}
        if data.get("workflowChanged") == True:
            form_logs_data["workflow"] == True
            form_logs_data["change_log"]["workFlow"] = data.get("processKey")
        if data.get("anonymousChanged") == True:
            form_logs_data["anonymous"] == True
            form_logs_data["change_log"]["anonymous"]= data.get("anonymous")
        if data.get("titleChanged") == True:
            form_logs_data["title"] = True
            form_logs_data["change_log"]["title"] = data.get("title")
            
        if len(form_logs_data.values()) > 1:
            form_logs_data["created_by"] =user_name
            form_logs_data["form_id"] = data.get("formId")
            history_schema = FormHistorySchema()
            create_form_history = FormHistory.create_history(form_logs_data)
            return history_schema.dump(create_form_history)
            
                   

    @staticmethod
    def get_all_history(form_id: str):
        """Get all history"""
        assert form_id is not None
        form_histories = FormHistory.fetch_histories_by_parent_id(form_id)
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
