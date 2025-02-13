"""This exposes submission service."""

import asyncio
import json
from typing import Dict

from flask import current_app
from formsflow_api_utils.exceptions import BusinessException
from formsflow_api_utils.utils import ANONYMOUS_USER, DRAFT_APPLICATION_STATUS
from formsflow_api_utils.utils.enums import FormProcessMapperStatus
from formsflow_api_utils.utils.user_context import UserContext, user_context

from formsflow_api.constants import BusinessErrorCode
from formsflow_api.models import Application, Draft, FormProcessMapper

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
        application.commit()
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
        application_payload["is_draft"] = True
        application = cls.__create_draft_application(application_payload)
        if not application:
            raise BusinessException(BusinessErrorCode.APPLICATION_CREATE_ERROR)
        draft_payload["application_id"] = application.id
        draft = cls.__create_draft(draft_payload)
        return draft

    @staticmethod
    @user_context
    def make_submission_from_draft(
        data: Dict, application_id: str, token=None, **kwargs
    ):
        """Makes the draft into an application."""
        user: UserContext = kwargs["user"]
        user_id: str = user.user_name or ANONYMOUS_USER
        application = None
        try:
            application = ApplicationService.make_submission(
                application_id, data, user_id
            )
            if not application:
                raise BusinessException(BusinessErrorCode.DRAFT_APPLICATION_NOT_FOUND)

            mapper = FormProcessMapper.find_form_by_form_id(application.latest_form_id)
            update_dict = {"is_draft": False}
            if application.form_process_mapper_id != mapper.id:
                # The form mapper version got updated after the draft entry
                # was created, update the application with new mapper
                update_dict["form_process_mapper_id"] = mapper.id
            application.update(update_dict)
            task_variables = (
                json.loads(mapper.task_variable)
                if mapper.task_variable is not None
                else []
            )
            variables = ApplicationService.fetch_task_variable_values(
                task_variables, data.get("data", {})
            )
            payload = ApplicationService.get_start_task_payload(
                application, mapper, data["form_url"], data["web_form_url"], variables
            )
            application.commit()

            asyncio.run(
                ApplicationService.start_task(mapper, payload, token, application.id)
            )

        except Exception as e:
            current_app.logger.error("Error occurred during application creation %s", e)
            if (
                application
            ):  # If application instance is created, rollback the transaction.
                application.rollback()
            raise BusinessException(BusinessErrorCode.APPLICATION_CREATE_ERROR) from e
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
