"""This exposes Form history service."""

from http import HTTPStatus
from uuid import uuid1

from formsflow_api_utils.exceptions import BusinessException
from formsflow_api_utils.services.external import FormioService
from formsflow_api_utils.utils.user_context import UserContext, user_context

from formsflow_api.constants import BusinessErrorCode
from formsflow_api.models import FormHistory
from formsflow_api.schemas import FormHistorySchema


class FormHistoryService:
    """This class manages form history service."""

    @staticmethod
    @user_context
    def create_form_log_with_clone(data, **kwargs):
        """Create form history If the component changed then we can create a clone."""
        user: UserContext = kwargs["user"]
        assert data is not None
        if data.get("componentChanged") is True:
            form_id = data.get("_id")
            parent_form_id = data.get("parentFormId")
            # Delete id and machineName form form data
            data.pop("_id", None)
            data.pop("machineName", None)
            data.pop("parentFormId", None)
            # changing path name and form name and changing title
            name_and_path = f"{data.get('path')}-v-{uuid1().hex}"
            data["path"] = name_and_path
            data["name"] = name_and_path
            data["title"] += "-clone"
            # Get formio access token
            formio_service = FormioService()
            form_io_token = formio_service.get_formio_access_token()
            response = formio_service.create_form(data, form_io_token)
            # Version details is used set version number
            version_data_schema = FormHistorySchema()
            if data.get("newVersion") is True:
                version_number = "v" + str(
                    FormHistory.get_version_count(parent_form_id) + 1
                )
            else:
                version_data = version_data_schema.dump(
                    FormHistory.get_latest_version(parent_form_id)
                )
                version_number = (
                    version_data.get("changeLog")
                    and version_data.get("changeLog").get("version")
                ) or None
            # Form history data to save into form history table
            form_history_data = {
                "form_id": form_id,
                "parent_form_id": parent_form_id or form_id,
                "created_by": user.user_name,
                "component_change": True,
                "change_log": {
                    "cloned_form_id": response.get("_id"),
                    "new_version": data.get("newVersion") or False,
                    "version": version_number,
                },
            }
            create_form_history = FormHistory.create_history(form_history_data)
            return version_data_schema.dump(create_form_history)
        return None

    @staticmethod
    @user_context
    def create_form_logs_without_clone(data, **kwargs):
        """Create form history."""
        user: UserContext = kwargs["user"]
        assert data is not None
        user_name = user.user_name
        form_logs_data = {"change_log": {}}
        if data.get("statusChanged") is True:
            form_logs_data["status"] = True
            form_logs_data["change_log"] = {"status": data.get("status")}
        if data.get("workflowChanged") is True:
            form_logs_data["workflow"] = True
            form_logs_data["change_log"]["workFlow"] = data.get("processKey")
        if data.get("anonymousChanged") is True:
            form_logs_data["anonymous"] = True
            form_logs_data["change_log"]["anonymous"] = data.get("anonymous")
        if data.get("formTypeChanged") is True:
            form_logs_data["form_type"] = True
            form_logs_data["change_log"]["form_type"] = data.get("formType")
        if data.get("titleChanged") is True:
            form_logs_data["title"] = True
            form_logs_data["change_log"]["form_name"] = data.get("formName")
        if len(form_logs_data) > 1:
            form_logs_data["created_by"] = user_name
            form_logs_data["form_id"] = data.get("formId")
            form_logs_data["parent_form_id"] = data.get("parentFormId")
            history_schema = FormHistorySchema()
            create_form_history = FormHistory.create_history(form_logs_data)
            return history_schema.dump(create_form_history)
        return None

    @staticmethod
    def get_all_history(form_id: str):
        """Get all history."""
        assert form_id is not None
        form_histories = FormHistory.fetch_histories_by_parent_id(form_id)
        if form_histories:
            form_history_schema = FormHistorySchema(many=True)
            return form_history_schema.dump(form_histories), HTTPStatus.OK
        raise BusinessException(BusinessErrorCode.INVALID_FORM_ID)
