"""This exposes form process mapper service."""

from http import HTTPStatus

from flask import current_app
from formsflow_api_utils.exceptions import BusinessException
from formsflow_api_utils.utils.enums import FormProcessMapperStatus
from formsflow_api_utils.utils.user_context import UserContext, user_context

from formsflow_api.models import FormProcessMapper
from formsflow_api.schemas import FormProcessMapperSchema
from formsflow_api.services.external.bpm import BPMService


class FormProcessMapperService:
    """This class manages form process mapper service."""

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

        raise BusinessException(
            {
                "type": "Invalid response data",
                "message": f"Invalid form process mapper id - {form_process_mapper_id}",
            },
            HTTPStatus.BAD_REQUEST,
        )

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
            return mapper_schema.dump(mapper)

        raise BusinessException(
            {
                "type": "No Response",
                "message": (
                    f"FormProcessMapper with FormID -{form_id} not stored in DB"
                ),
            },
            HTTPStatus.NO_CONTENT,
        )

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
                raise PermissionError("Tenant authentication failed.")
            FormProcessMapperService._update_process_tenant(data, user)
            mapper.update(data)
            return mapper

        raise BusinessException(
            {
                "type": "Invalid response data",
                "message": (
                    f"Unable to update FormProcessMapperId- {form_process_mapper_id}"
                ),
            },
            HTTPStatus.BAD_REQUEST,
        )

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
        else:
            raise BusinessException(
                {
                    "type": "Invalid response data",
                    "message": (
                        "Unable to set FormProcessMapperId -"
                        f"{form_process_mapper_id} inactive"
                    ),
                },
                HTTPStatus.BAD_REQUEST,
            )

    @staticmethod
    def mark_unpublished(form_process_mapper_id):
        """Mark form process mapper as inactive."""
        try:
            mapper = FormProcessMapper.find_form_by_id_active_status(
                form_process_mapper_id=form_process_mapper_id
            )
            if mapper:
                mapper.mark_unpublished()
                return
        except Exception as err:
            raise err

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
        try:
            form_id = mapper_data.get("form_id")
            version = mapper_data.get("version")
            if version is None or form_id is None:
                return
            version = int(version) - 1
            previous_mapper = FormProcessMapperService.get_mapper_by_formid_and_version(
                form_id, version
            )
            previous_status = previous_mapper.get("status")
            if (
                previous_mapper
                and previous_status == FormProcessMapperStatus.ACTIVE.value
            ):
                previous_mapper_id = previous_mapper.get("id")
                FormProcessMapperService.mark_unpublished(previous_mapper_id)

        except Exception as err:
            raise err

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
            raise PermissionError("Tenant authorization failed.")
        return 0
