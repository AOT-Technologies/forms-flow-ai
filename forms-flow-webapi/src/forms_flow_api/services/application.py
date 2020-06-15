"""This exposes application service."""
from http import HTTPStatus

from ..exceptions import BusinessException
from ..models import Application
from ..schemas import AggregatedApplicationSchema, ApplicationSchema


class ApplicationService():
    """This class manages application service."""

    @staticmethod
    def create_application(data):
        """Create new application."""
        return Application.create_from_dict(data)
        # TODO Call triger notification BPM API

    @staticmethod
    def get_all_applications(page_no, limit):
        """Get all applications."""
        if page_no:
            page_no = int(page_no)
        if limit:
            limit = int(limit)

        applications = Application.find_all(page_no, limit)
        application_schema = ApplicationSchema()
        return application_schema.dump(applications, many=True)

    @staticmethod
    def get_all_application_count():
        """Get application count."""
        return Application.query.count()

    @staticmethod
    def get_application(application_id):
        """Get application by id."""
        application_details = Application.find_by_id(application_id)
        if application_details:
            application_schema = Application()
            return application_schema.dump(application_details)

        raise BusinessException('Invalid application', HTTPStatus.BAD_REQUEST)

    @staticmethod
    def update_application(application_id, data):
        """Update application."""
        application = Application.find_by_id(application_id)
        if application:
            application.update(data)
            # TODO Call triger notification BPM API
        else:
            raise BusinessException('Invalid application', HTTPStatus.BAD_REQUEST)

    @staticmethod
    def get_aggregated_applications(from_date: str, to_date: str):
        """Get aggregated applications."""
        applications = Application.find_aggregated_applications(from_date, to_date)
        schema = AggregatedApplicationSchema(exclude=('application_status',))
        return schema.dump(applications, many=True)

    @staticmethod
    def get_aggregated_application_status(mapper_id: int, from_date: str, to_date: str):
        """Get aggregated application status."""
        application_status = Application.find_aggregated_application_status(mapper_id, from_date, to_date)
        schema = AggregatedApplicationSchema(exclude=('mapper_id',))
        return schema.dump(application_status, many=True)
