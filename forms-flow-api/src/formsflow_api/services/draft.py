"""This exposes submission service."""

from http import HTTPStatus
from typing import Dict

from formsflow_api.exceptions import BusinessException
from formsflow_api.models import Application, Draft, FormProcessMapper
from formsflow_api.schemas import DraftSchema
from formsflow_api.utils import DRAFT_APPLICATION_STATUS
from formsflow_api.utils.user_context import UserContext, user_context

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
    def create_new_draft(cls, application_payload, draft_payload, token, **kwargs):
        """Creates a new draft entry and draft application."""
        user: UserContext = kwargs["user"]
        user_id: str = user.user_name
        tenant_key = user.tenant_key
        if token is not None:
            # for anonymous form submission
            application_payload["created_by"] = user_id
        mapper = FormProcessMapper.find_form_by_form_id(application_payload["form_id"])
        if mapper is None:
            if tenant_key:
                raise BusinessException(
                    f"Permission denied, formId - {application_payload['form_id']}.",
                    HTTPStatus.FORBIDDEN,
                )
            raise BusinessException(
                f"Mapper does not exist with formId - {application_payload['form_id']}.",
                HTTPStatus.BAD_REQUEST,
            )
        if tenant_key is not None and mapper.tenant != tenant_key:
            raise BusinessException(
                "Tenant authentication failed.", HTTPStatus.FORBIDDEN
            )
        application_payload["form_process_mapper_id"] = mapper.id

        application_payload["application_status"] = DRAFT_APPLICATION_STATUS
        application_payload["submission_id"] = None
        application = cls.__create_draft_application(application_payload)
        if not application:
            response, status = {
                "type": "Internal server error",
                "message": "Unable to create application",
            }, HTTPStatus.INTERNAL_SERVER_ERROR
            raise BusinessException(response, status)
        draft_payload["application_id"] = application.id
        draft = cls.__create_draft(draft_payload)
        return draft

    @staticmethod
    def get_draft(draft_id: int):
        """Get submission."""
        draft = Draft.find_by_id(draft_id=draft_id)
        if draft:
            draft_schema = DraftSchema()
            return draft_schema.dump(draft)

        response, status = {
            "type": "Bad request error",
            "message": f"Invalid request data - draft id {draft_id} does not exist",
        }, HTTPStatus.BAD_REQUEST
        raise BusinessException(response, status)

    @staticmethod
    def update_draft(draft_id: int, data):
        """Update draft."""
        draft = Draft.find_by_id(draft_id=draft_id)
        if draft:
            draft.update(data)
        else:
            response, status = {
                "type": "Bad request error",
                "message": f"Invalid request data - draft id {draft_id} does not exist",
            }, HTTPStatus.BAD_REQUEST
            raise BusinessException(response, status)

    @staticmethod
    def get_all_drafts():
        """Get all drafts."""
        draft = Draft.find_all_active()
        draft_schema = DraftSchema()
        return draft_schema.dump(draft, many=True)

    @staticmethod
    def make_submission_from_draft(data: Dict, draft_id: str, token):
        """Makes the draft into an application."""
        draft = Draft.make_submission(draft_id, data)
        if not draft:
            response, status = {
                "type": "Bad request error",
                "message": f"Invalid request data - draft id {draft_id} does not exist",
            }, HTTPStatus.BAD_REQUEST
            raise BusinessException(response, status)

        application = Application.find_by_id(draft.application_id)
        mapper = FormProcessMapper.find_form_by_form_id(application.latest_form_id)
        if application.form_process_mapper_id != mapper.id:
            # The form mapper version got updated after the draft entry
            # was created, update the application with new mapper
            application.update({"form_process_mapper_id": mapper.id})
        payload = ApplicationService.get_start_task_payload(
            application, mapper, data["form_url"]
        )
        ApplicationService.start_task(mapper, payload, token, application)
        return application
