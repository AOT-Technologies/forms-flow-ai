"""This exposes submission service."""

from http import HTTPStatus
from typing import Dict

from formsflow_api_utils.exceptions import BusinessException
from formsflow_api_utils.utils import ANONYMOUS_USER, DRAFT_APPLICATION_STATUS
from formsflow_api_utils.utils.enums import FormProcessMapperStatus
from formsflow_api_utils.utils.user_context import UserContext, user_context
from formsflow_api.models import FormLogs
from formsflow_api.schemas import FormLogsResponseSchema



class FormlogService:
    """This class manages submission service."""

    @staticmethod
    def create_form_log(data):
        if data:
            log_data = {"form_id":data["form_id"],"logs":[
                        {"mapper_version":data["mapper_version"],
                         "process_name":data["process_name"],
                         "form_name":data["form_name"],
                         "form_revision":data["form_revision"],
                        }]}
            saved_data = FormLogs.create_form_log(log_data)
            form_logs_response_schema = FormLogsResponseSchema()
            print(saved_data)
            return form_logs_response_schema.dump(saved_data)
            
        

        
 