"""This exposes form process mapper service."""

from http import HTTPStatus

from ..exceptions import BusinessException
from ..models import FormProcessMapper
from ..models.enums import FormProcessMapperStatus
from ..schemas import FormProcessMapperSchema


class FormProcessMapperService():
    """This class manages form process mapper service."""

    @staticmethod
    def get_all_mappers(page_number: int, limit: int):
        """Get all form process mappers."""
        if page_number:
            page_number = int(page_number)
        if limit:
            limit = int(limit)
        mappers = FormProcessMapper.find_all(page_number, limit)
        mapper_schema = FormProcessMapperSchema()
        return mapper_schema.dump(mappers, many=True)

    @staticmethod
    def get_mapper_count():
        """Get form process mapper count."""
        return FormProcessMapper.query.filter_by(status=FormProcessMapperStatus.Active).count()

    @staticmethod
    def get_mapper(form_process_mapper_id):
        """Get form process mapper."""
        mapper = FormProcessMapper.find_by_id(form_process_mapper_id)
        if mapper:
            mapper_schema = FormProcessMapperSchema()
            return mapper_schema.dump(mapper)

        raise BusinessException('Invalid application', HTTPStatus.BAD_REQUEST)

    @staticmethod
    def create_mapper(data):
        """Create new mapper between form and process."""
        return FormProcessMapper.create_from_dict(data)

    @staticmethod
    def update_mapper(form_process_mapper_id, data):
        """Update form process mapper."""
        mapper = FormProcessMapper.find_by_id(form_process_mapper_id)
        if mapper:
            mapper.update(data)
            return mapper

        raise BusinessException('Invalid application', HTTPStatus.BAD_REQUEST)

    @staticmethod
    def mark_inactive(form_process_mapper_id):
        """Mark form process mapper as inactive."""
        application = FormProcessMapper.find_by_id(form_process_mapper_id)
        if application:
            application.mark_inactive()
        else:
            raise BusinessException('Invalid application', HTTPStatus.BAD_REQUEST)
