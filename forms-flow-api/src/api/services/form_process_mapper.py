"""This exposes form process mapper service."""

from http import HTTPStatus

from ..exceptions import BusinessException
from ..models import FormProcessMapper
from ..models.enums import FormProcessMapperStatus
from ..schemas import FormProcessMapperSchema


class FormProcessMapperService:
    """This class manages form process mapper service."""

    @staticmethod
    def get_all_mappers(page_number: int, limit: int):
        """Get all form process mappers."""
        if page_number:
            page_number = int(page_number)
        if limit:
            limit = int(limit)
        mappers = FormProcessMapper.find_all_active(page_number, limit)
        mapper_schema = FormProcessMapperSchema()
        return mapper_schema.dump(mappers, many=True)

    @staticmethod
    def get_mapper_count():
        """Get form process mapper count."""
        return FormProcessMapper.find_all_count()

    @staticmethod
    def get_mapper(form_process_mapper_id):
        """Get form process mapper."""
        mapper = FormProcessMapper.find_form_by_id_active_status(form_process_mapper_id)
        if mapper:
            mapper_schema = FormProcessMapperSchema()
            return mapper_schema.dump(mapper)

        raise BusinessException(
            "Invalid form process mapper id", HTTPStatus.BAD_REQUEST
        )

    @staticmethod
    def get_mapper_by_formid(form_id):
        """Get form process mapper."""
        mapper = FormProcessMapper.find_form_by_form_id(form_id)
        if mapper:
            mapper_schema = FormProcessMapperSchema()
            return mapper_schema.dump(mapper)

        raise BusinessException(f"Invalid form id - {form_id}", HTTPStatus.BAD_REQUEST)

    @staticmethod
    def create_mapper(data):
        """Create new mapper between form and process."""
        return FormProcessMapper.create_from_dict(data)

    @staticmethod
    def update_mapper(form_process_mapper_id, data):
        """Update form process mapper."""
        mapper = FormProcessMapper.find_form_by_id(form_process_mapper_id)
        if mapper:
            mapper.update(data)
            return mapper

        raise BusinessException(
            f"Unable to updated FormProcessMapperId - {form_process_mapper_id}",
            HTTPStatus.BAD_REQUEST,
        )

    @staticmethod
    def mark_inactive(form_process_mapper_id):
        """Mark form process mapper as inactive."""
        application = FormProcessMapper.find_form_by_id_active_status(
            form_process_mapper_id
        )
        if application:
            application.mark_inactive()
        else:
            raise BusinessException(
                f"Unable to set FormProcessMapperId - {form_process_mapper_id} inactive",
                HTTPStatus.BAD_REQUEST,
            )
