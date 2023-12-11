"""This exposes submission service."""

import json
from typing import Dict

from formsflow_api_utils.exceptions import BusinessException
from formsflow_api_utils.utils import ANONYMOUS_USER, DRAFT_APPLICATION_STATUS
from formsflow_api_utils.utils.enums import FormProcessMapperStatus
from formsflow_api_utils.utils.user_context import UserContext, user_context

from formsflow_api.constants import BusinessErrorCode
from formsflow_api.models import Application, Draft, FormProcessMapper
from formsflow_api.schemas import DraftSchema

from .application import ApplicationService


class DraftService:
    """This class manages submission service."""

    @staticmethod
    def __create_draft(data):
        """Create new draft entry."""
        return Draft.create_draft_from_dict(data)

    @staticmethod
    def __create_draft_application(data):
        """Create draft application."""
        application = Application.create_from_dict(data)
        return application

    @classmethod
    @user_context
    def create_new_draft(cls, application_payload, draft_payload, token=None, **kwargs):
        """Creates a new draft entry and draft application."""
        user: UserContext = kwargs["user"]
        user_id: str = user.user_name or ANONYMOUS_USER
        tenant_key = user.tenant_key
        application_payload["created_by"] = user_id
        mapper = FormProcessMapper.find_form_by_form_id(application_payload["form_id"])
        if mapper is None:
            if tenant_key:
                raise BusinessException(BusinessErrorCode.PERMISSION_DENIED)
            raise BusinessException(BusinessErrorCode.FORM_ID_NOT_FOUND)
        if (mapper.status == FormProcessMapperStatus.INACTIVE.value) or (
            not token and not mapper.is_anonymous
        ):
            raise BusinessException(BusinessErrorCode.PERMISSION_DENIED)
        if tenant_key is not None and mapper.tenant != tenant_key:
            raise BusinessException(BusinessErrorCode.PERMISSION_DENIED)
        application_payload["form_process_mapper_id"] = mapper.id

        application_payload["application_status"] = DRAFT_APPLICATION_STATUS
        application_payload["submission_id"] = None
        application = cls.__create_draft_application(application_payload)
        if not application:
            raise BusinessException(BusinessErrorCode.APPLICATION_CREATE_ERROR)
        draft_payload["application_id"] = application.id
        draft = cls.__create_draft(draft_payload)
        return draft

    @staticmethod
    @user_context
    def get_draft(draft_id: int, **kwargs):
        """Get submission."""
        user: UserContext = kwargs["user"]
        user_id: str = user.user_name
        draft = Draft.find_by_id(draft_id=draft_id, user_id=user_id)
        if draft:
            draft_schema = DraftSchema()
            return draft_schema.dump(draft)

        raise BusinessException(BusinessErrorCode.DRAFT_APPLICATION_NOT_FOUND)

    @staticmethod
    @user_context
    def update_draft(draft_id: int, data, **kwargs):
        """Update draft."""
        user: UserContext = kwargs["user"]
        user_id: str = user.user_name or ANONYMOUS_USER
        draft = Draft.get_by_id(draft_id, user_id)
        if draft:
            draft.update(data)
        else:
            raise BusinessException(BusinessErrorCode.DRAFT_APPLICATION_NOT_FOUND)

    @staticmethod
    @user_context
    def get_all_drafts(query_params, **kwargs):
        """Get all drafts."""
        user: UserContext = kwargs["user"]
        user_id: str = user.user_name
        page_number = query_params.get("page_no")
        limit = query_params.get("limit")
        sort_by = query_params.get("order_by", "id")
        sort_order = query_params.get("sort_order", "desc")
        form_name = query_params.get("form_name")
        draft_id = query_params.get("id")
        modified_from_date = query_params.get("modified_from_date")
        modified_to_date = query_params.get("modified_to_date")
        draft, count = Draft.find_all_active(
            user_id,
            page_number,
            limit,
            sort_by,
            sort_order,
            modified_from=modified_from_date,
            modified_to=modified_to_date,
            form_name=form_name,
            id=draft_id,
        )
        draft_schema = DraftSchema()
        return draft_schema.dump(draft, many=True), count

    @staticmethod
    @user_context
    def make_submission_from_draft(data: Dict, draft_id: str, token=None, **kwargs):
        """Makes the draft into an application."""
        user: UserContext = kwargs["user"]
        user_id: str = user.user_name or ANONYMOUS_USER
        draft = Draft.make_submission(draft_id, data, user_id)
        if not draft:
            raise BusinessException(BusinessErrorCode.DRAFT_APPLICATION_NOT_FOUND)

        application = Application.find_by_id(draft.application_id)
        mapper = FormProcessMapper.find_form_by_form_id(application.latest_form_id)
        if application.form_process_mapper_id != mapper.id:
            # The form mapper version got updated after the draft entry
            # was created, update the application with new mapper
            application.update({"form_process_mapper_id": mapper.id})
        task_variables = (
            json.loads(mapper.task_variable) if mapper.task_variable is not None else []
        )
        variables = ApplicationService.fetch_task_variable_values(
            task_variables, data.get("data", {})
        )
        payload = ApplicationService.get_start_task_payload(
            application, mapper, data["form_url"], data["web_form_url"], variables
        )
        ApplicationService.start_task(mapper, payload, token, application)
        return application

    @staticmethod
    @user_context
    def delete_draft(draft_id: int, **kwargs):
        """Delete draft."""
        user: UserContext = kwargs["user"]
        user_id: str = user.user_name
        draft = Draft.get_by_id(draft_id=draft_id, user_id=user_id)
        if draft:
            # deletes the draft and application entry related to the draft.
            draft.delete()
        else:
            raise BusinessException(BusinessErrorCode.DRAFT_APPLICATION_NOT_FOUND)
