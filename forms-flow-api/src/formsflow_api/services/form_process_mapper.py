"""This exposes form process mapper service."""

from http import HTTPStatus

from formsflow_api.exceptions import BusinessException
from formsflow_api.models import FormProcessMapper
from formsflow_api.schemas import FormProcessMapperSchema


class FormProcessMapperService:
    """This class manages form process mapper service."""

    @staticmethod
    def get_all_mappers(page_number: int, limit: int, form_name: str, sort_by: str, sort_order: str):
        """Get all form process mappers."""
        mappers, get_all_mappers_count = FormProcessMapper.find_all_active(
            page_number=page_number,
            limit=limit,
            form_name=form_name,
            sort_by=sort_by,
            sort_order=sort_order,
        )
        mapper_schema = FormProcessMapperSchema()
        return (
            mapper_schema.dump(mappers, many=True),
            get_all_mappers_count,
        )

    @staticmethod
    def get_mapper_count():
        """Get form process mapper count."""
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
                "message": f"FormProcessMapper with FormID - {form_id} not stored in DB",
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
                "message": f"Unable to updated FormProcessMapperId - {form_process_mapper_id}",
            },
            HTTPStatus.BAD_REQUEST,
        )

    @staticmethod
    def mark_inactive(form_process_mapper_id):
        """Mark form process mapper as inactive."""
        application = FormProcessMapper.find_form_by_id_active_status(
            form_process_mapper_id=form_process_mapper_id
        )
        if application:
            application.mark_inactive()
        else:
            raise BusinessException(
                {
                    "type": "Invalid response data",
                    "message": f"Unable to set FormProcessMapperId - {form_process_mapper_id} inactive",
                },
                HTTPStatus.BAD_REQUEST,
            )
