"""This exposes submission service."""

from http import HTTPStatus

from formsflow_api.exceptions import BusinessException
from formsflow_api.models import Draft, FormProcessMapper
from formsflow_api.schemas import DraftSchema
from formsflow_api.utils import DRAFT_APPLICATION_STATUS
from formsflow_api.utils.user_context import UserContext, user_context


class DraftService:
    """This class manages submission service."""

    @staticmethod
    def create_draft(data):
        """Create new mapper between form and process."""
        return Draft.create_draft_dict(data)

    @staticmethod
    @user_context
    def create_draft_application(data, token, **kwargs):
        """Create new application."""
        user: UserContext = kwargs["user"]
        user_id: str = user.user_name
        tenant_key = user.tenant_key
        if token is not None:
            # for anonymous form submission
            data["created_by"] = user_id
        data["application_status"] = DRAFT_APPLICATION_STATUS
        mapper = FormProcessMapper.find_form_by_form_id(data["form_id"])
        if mapper is None:
            if tenant_key:
                raise PermissionError(f"Permission denied, formId - {data['form_id']}.")
            raise KeyError(f"Mapper does not exist with formId - {data['form_id']}.")
        if tenant_key is not None and mapper.tenant != tenant_key:
            raise PermissionError("Tenant authentication failed.")
        data["form_process_mapper_id"] = mapper.id
        # Function to create application in DB
        application = Draft.create_from_dict(data)
        return application, HTTPStatus.CREATED

    @staticmethod
    def get_draft(draft_id: int):
        """Get submission."""
        draft = Draft.find_by_id(draft_id=draft_id)
        if draft:
            draft_schema = DraftSchema()
            return draft_schema.dump(draft)

        raise BusinessException("Invalid submission", HTTPStatus.BAD_REQUEST)

    @staticmethod
    def update_draft(draft_id: int, data):
        """Update draft."""
        draft = Draft.find_by_id(draft_id=draft_id)
        if draft:
            draft.update(data)
        else:
            raise BusinessException("Invalid draft", HTTPStatus.BAD_REQUEST)

    @staticmethod
    def get_all_drafts():
        """Get all drafts."""
        draft = Draft.find_all()
        draft_schema = DraftSchema()
        return draft_schema.dump(draft, many=True)
