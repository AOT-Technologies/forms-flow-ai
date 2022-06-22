"""This exposes NRS demo services."""

from http import HTTPStatus

from formsflow_api.exceptions import BusinessException
from formsflow_api.models import NRSSelectDataMapper
from formsflow_api.models.nrs_demo import NRSFormDataMapper
from formsflow_api.schemas import NRSSelectDataMapperSchema


class NRSSelectDataMapperService:
    """This class manages NRS type of inspection data in select option."""

    @staticmethod
    def get_all_mappers():
        """Get all data."""
        mappers = NRSSelectDataMapper.find_all()
        mapper_schema = NRSSelectDataMapperSchema()
        return mapper_schema.dump(mappers, many=True)

    @staticmethod
    def get_mapper_count():
        """Get NRS data count."""
        return NRSSelectDataMapper.find_all_count()

    @staticmethod
    def create_mapper(data):
        """Create new mapper ."""
        return NRSSelectDataMapper.create_from_dict(data)

    @staticmethod
    def update_mapper(data_id, data):
        """Update form process mapper."""
        mapper = NRSSelectDataMapper.find_by_id(data_id=data_id)

        if mapper:
            mapper.update(data)
            return mapper

        raise BusinessException(
            {
                "type": "Invalid response data",
                "message": f"Unable to updated data_id - {data_id}",
            },
            HTTPStatus.BAD_REQUEST,
        )

    @staticmethod
    def delete_mapper(data_id):
        """Delete data by id."""
        mapper = NRSSelectDataMapper.find_by_id(data_id=data_id)
        if mapper:
            mapper.delete()
            return data_id

        raise BusinessException(
            {
                "type": "Invalid response data",
                "message": f"Unable to delete data_id - {data_id}",
            },
            HTTPStatus.BAD_REQUEST,
        )


class NRSFormDataMapperService:  # pylint: disable=too-few-public-methods
    """This class manages NRS form data service."""

    @staticmethod
    def create_mapper(data):
        """Create new mapper."""
        return NRSFormDataMapper.create_from_dict(data)
