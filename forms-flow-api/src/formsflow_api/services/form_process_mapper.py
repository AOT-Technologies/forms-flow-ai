"""This exposes form process mapper service."""

from http import HTTPStatus

from formsflow_api.exceptions import BusinessException
from formsflow_api.models import FormProcessMapper
from formsflow_api.schemas import FormProcessMapperSchema
from formsflow_api.utils.enums import FormProcessMapperStatus


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
    def get_mapper(form_process_mapper_id: int):
        """Get form process mapper."""
        mapper = FormProcessMapper.find_form_by_id_active_status(
            form_process_mapper_id=form_process_mapper_id
        )
        if mapper:
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
    def get_mapper_by_formid(form_id):
        """Get form process mapper."""
        mapper = FormProcessMapper.find_form_by_form_id(form_id=form_id)
        if mapper:
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
    def create_mapper(data):
        """Create new mapper between form and process."""
        return FormProcessMapper.create_from_dict(data)

    @staticmethod
    def update_mapper(form_process_mapper_id, data):
        """Update form process mapper."""
        mapper = FormProcessMapper.find_form_by_id(
            form_process_mapper_id=form_process_mapper_id
        )
        if not data.get("process_key") and data.get("process_name"):
            data["process_key"] = None
            data["process_name"] = None

        if not data.get("comments"):
            data["comments"] = None

        if mapper:
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
    def mark_inactive(form_process_mapper_id):
        """Mark form process mapper as inactive and deleted."""
        application = FormProcessMapper.find_form_by_id_active_status(
            form_process_mapper_id=form_process_mapper_id
        )
        if application:
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
