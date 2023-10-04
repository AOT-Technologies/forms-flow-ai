"""This exposes form process mapper service."""

from typing import Set

from flask import current_app
from formsflow_api_utils.exceptions import BusinessException
from formsflow_api_utils.utils.enums import FormProcessMapperStatus
from formsflow_api_utils.utils.user_context import UserContext, user_context

from formsflow_api.constants import BusinessErrorCode
from formsflow_api.models import (
    Authorization,
    AuthType,
    Draft,
    FormProcessMapper,
)
from formsflow_api.schemas import FormProcessMapperSchema
from formsflow_api.services.external.bpm import BPMService


class FormProcessMapperService:
    """This class manages form process mapper service."""

    @staticmethod
    @user_context
    def get_all_forms(
        page_number: int,
        limit: int,
        form_name: str,
        sort_by: str,
        sort_order: str,
        form_type: str,
        is_active,
        is_designer: bool,
        **kwargs,
    ):  # pylint: disable=too-many-arguments, too-many-locals
        """Get all forms."""
        user: UserContext = kwargs["user"]
        authorized_form_ids: Set[str] = []
        form_ids = Authorization.find_all_resources_authorized(
            auth_type=AuthType.DESIGNER if is_designer else AuthType.FORM,
            roles=user.group_or_roles,
            user_name=user.user_name,
            tenant=user.tenant_key,
            include_created_by=is_designer,
        )
        for forms in form_ids:
            authorized_form_ids.append(forms.resource_id)
        designer_filters = {
            "is_active": is_active,
            "form_type": form_type,
        }
        list_form_mappers = (
            FormProcessMapper.find_all_forms
            if is_designer
            else FormProcessMapper.find_all_active_by_formid
        )
        mappers, get_all_mappers_count = list_form_mappers(
            page_number=page_number,
            limit=limit,
            form_name=form_name,
            sort_by=sort_by,
            sort_order=sort_order,
            form_ids=authorized_form_ids,
            **designer_filters if is_designer else {},
        )
        mapper_schema = FormProcessMapperSchema()
        return (
            mapper_schema.dump(mappers, many=True),
            get_all_mappers_count,
        )

    @staticmethod
    def get_all_mappers(
        page_number: int,
        limit: int,
        form_name: str,
        sort_by: str,
        sort_order: str,
        process_key: list = None,
    ):  # pylint: disable=too-many-arguments
        """Get all form process mappers."""
        mappers, get_all_mappers_count = FormProcessMapper.find_all_active(
            page_number=page_number,
            limit=limit,
            form_name=form_name,
            sort_by=sort_by,
            sort_order=sort_order,
            process_key=process_key,
        )
        mapper_schema = FormProcessMapperSchema()
        return (
            mapper_schema.dump(mappers, many=True),
            get_all_mappers_count,
        )

    @staticmethod
    def get_mapper_count(form_name=None):
        """Get form process mapper count."""
        if form_name:
            return FormProcessMapper.find_count_form_name(form_name)

        return FormProcessMapper.find_all_count()

    @staticmethod
    @user_context
    def get_mapper(form_process_mapper_id: int, **kwargs):
        """Get form process mapper."""
        user: UserContext = kwargs["user"]
        tenant_key = user.tenant_key
        mapper = FormProcessMapper.find_form_by_id_active_status(
            form_process_mapper_id=form_process_mapper_id
        )
        if mapper:
            if tenant_key is not None and mapper.tenant != tenant_key:
                raise PermissionError("Tenant authentication failed.")
            mapper_schema = FormProcessMapperSchema()
            return mapper_schema.dump(mapper)

        raise BusinessException(BusinessErrorCode.INVALID_FORM_PROCESS_MAPPER_ID)

    @staticmethod
    @user_context
    def get_mapper_by_formid(form_id: str, **kwargs):
        """Get form process mapper."""
        user: UserContext = kwargs["user"]
        tenant_key = user.tenant_key
        mapper = FormProcessMapper.find_form_by_form_id(form_id=form_id)
        if mapper:
            if tenant_key is not None and mapper.tenant != tenant_key:
                raise PermissionError("Tenant authentication failed.")
            mapper_schema = FormProcessMapperSchema()
            response = mapper_schema.dump(mapper)
            if response.get("deleted") is False:
                return response

        raise BusinessException(BusinessErrorCode.INVALID_FORM_PROCESS_MAPPER_ID)

    @staticmethod
    @user_context
    def create_mapper(data, **kwargs):
        """Create new mapper between form and process."""
        user: UserContext = kwargs["user"]
        data["created_by"] = user.user_name
        data["tenant"] = user.tenant_key
        FormProcessMapperService._update_process_tenant(data, user)
        return FormProcessMapper.create_from_dict(data)

    @staticmethod
    def _update_process_tenant(data, user):
        # For multi tenant environment find if the process is deployed for a tenant.
        if current_app.config.get("MULTI_TENANCY_ENABLED") and (
            process_key := data.get("process_key", None)
        ):
            current_app.logger.info("Finding Tenant ID for process %s ", process_key)
            data["process_tenant"] = BPMService.get_process_details_by_key(
                process_key, user.bearer_token
            ).get("tenantId", None)

    @staticmethod
    @user_context
    def update_mapper(form_process_mapper_id, data, **kwargs):
        """Update form process mapper."""
        user: UserContext = kwargs["user"]
        tenant_key = user.tenant_key
        data["modified_by"] = user.user_name
        mapper = FormProcessMapper.find_form_by_id(
            form_process_mapper_id=form_process_mapper_id
        )
        if not data.get("process_key") and data.get("process_name"):
            data["process_key"] = None
            data["process_name"] = None

        if not data.get("comments"):
            data["comments"] = None
        if mapper:
            if tenant_key is not None and mapper.tenant != tenant_key:
                raise BusinessException(BusinessErrorCode.PERMISSION_DENIED)
            FormProcessMapperService._update_process_tenant(data, user)
            mapper.update(data)
            return mapper

        raise BusinessException(BusinessErrorCode.INVALID_FORM_PROCESS_MAPPER_ID)

    @staticmethod
    @user_context
    def mark_inactive_and_delete(form_process_mapper_id: int, **kwargs) -> None:
        """Mark form process mapper as inactive and deleted."""
        user: UserContext = kwargs["user"]
        tenant_key = user.tenant_key
        application = FormProcessMapper.find_form_by_id(
            form_process_mapper_id=form_process_mapper_id
        )
        if application:
            if tenant_key is not None and application.tenant != tenant_key:
                raise PermissionError("Tenant authentication failed.")
            application.mark_inactive()
            # fetching all draft application application and delete it
            draft_applications = Draft.get_draft_by_parent_form_id(
                parent_form_id=application.parent_form_id
            )
            if draft_applications:
                for draft in draft_applications:
                    draft.delete()
        else:
            raise BusinessException(BusinessErrorCode.INVALID_FORM_PROCESS_MAPPER_ID)

    @staticmethod
    def mark_unpublished(form_process_mapper_id):
        """Mark form process mapper as inactive."""
        mapper = FormProcessMapper.find_form_by_id_active_status(
            form_process_mapper_id=form_process_mapper_id
        )
        if mapper:
            mapper.mark_unpublished()
            return
        raise BusinessException(BusinessErrorCode.INVALID_FORM_PROCESS_MAPPER_ID)

    @staticmethod
    def get_mapper_by_formid_and_version(form_id: int, version: int):
        """Returns a serialized form process mapper given a form_id and version."""
        mapper = FormProcessMapper.find_mapper_by_form_id_and_version(form_id, version)
        if mapper:
            mapper_schema = FormProcessMapperSchema()
            return mapper_schema.dump(mapper)

        return None

    @staticmethod
    def unpublish_previous_mapper(mapper_data: dict) -> None:
        """
        This method unpublishes the previous version of the form process mapper.

        : mapper_data: serialized create mapper payload
        : Should be called with create_mapper method
        """
        form_id = mapper_data.get("previous_form_id") or mapper_data.get("form_id")
        version = mapper_data.get("version")
        if version is None or form_id is None:
            return
        version = int(version) - 1
        previous_mapper = FormProcessMapperService.get_mapper_by_formid_and_version(
            form_id, version
        )
        previous_status = previous_mapper.get("status")
        if previous_mapper and previous_status == FormProcessMapperStatus.ACTIVE.value:
            previous_mapper_id = previous_mapper.get("id")
            FormProcessMapperService.mark_unpublished(previous_mapper_id)

    @staticmethod
    @user_context
    def check_tenant_authorization(mapper_id: int, **kwargs) -> int:
        """Check if tenant has permission to access the resource."""
        user: UserContext = kwargs["user"]
        tenant_key = user.tenant_key
        if tenant_key is None:
            return 0
        mapper = FormProcessMapper.find_form_by_id(form_process_mapper_id=mapper_id)
        if mapper is not None and mapper.tenant != tenant_key:
            raise BusinessException(BusinessErrorCode.PERMISSION_DENIED)
        return 0

    @staticmethod
    @user_context
    def check_tenant_authorization_by_formid(form_id: int, **kwargs) -> int:
        """Check if tenant has permission to access the resource."""
        user: UserContext = kwargs["user"]
        tenant_key = user.tenant_key
        if tenant_key is None:
            return
        mapper = FormProcessMapper.find_form_by_form_id(form_id=form_id)
        if mapper is not None and mapper.tenant != tenant_key:
            raise BusinessException(BusinessErrorCode.PERMISSION_DENIED)
        return
