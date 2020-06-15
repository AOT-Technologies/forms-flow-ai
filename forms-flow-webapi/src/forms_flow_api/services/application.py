"""This exposes application service."""

from datetime import datetime as dt
from http import HTTPStatus

from ..exceptions import BusinessException
from ..models import ApplicationSubmission, Application
from ..schemas import AggregatedApplicationSchema, ApplicationSchema


class ApplicationService():
    """This class manages application service."""

    @staticmethod
    def get_all_applications(page_number: int, limit: int):
        """Get all applications."""
        if page_number:
            page_number = int(page_number)
        if limit:
            limit = int(limit)
        applications = Application.find_all(page_number, limit)
        application_schema = ApplicationSchema()
        return application_schema.dump(applications, many=True)

    @staticmethod
    def get_application_count():
        """Get application count."""
        return Application.query.filter_by(status='active').count()

    @staticmethod
    def get_application(application_id):
        """Get application."""
        application_details = Application.find_by_id(application_id)
        if application_details:
            application_schema = ApplicationSchema()
            return application_schema.dump(application_details)

        raise BusinessException('Invalid application', HTTPStatus.BAD_REQUEST)

    @staticmethod
    def create_application(data):
        """Create new application."""
        application = Application(
            form_id=data['form_id'],
            form_name=data['form_name'],
            form_revision_number=data['form_revision_number'],
            process_definition_key=data['process_definition_key'],
            process_name=data['process_name'],
            status='active',
            comments=data['comments'],
            created_by='test',  # TODO: Use data from keycloak token
            created_on=dt.utcnow(),
            modified_by='test',  # TODO: Use data from keycloak token
            modified_on=dt.utcnow(),
            tenant_id=data['tenant_id']
        )
        application.save()

    @staticmethod
    def update_application(application_id, data):
        """Update application."""
        application = Application.find_by_id(application_id)
        if application:
            application.form_id = data['form_id']
            application.form_name = data['form_name']
            application.form_revision_number = data['form_revision_number']
            application.process_definition_key = data['process_definition_key']
            application.process_name = data['process_name']
            application.comments = data['comments']
            application.modified_by = 'test'  # TODO: Use data from keycloak token
            application.modified_on = dt.utcnow()
            application.tenant_id = data['tenant_id']
            return application.save()

        raise BusinessException('Invalid application', HTTPStatus.BAD_REQUEST)

    @staticmethod
    def delete_application(application_id):
        """Mark application as inactive."""
        application = Application.find_by_id(application_id)
        if application:
            application.status = 'inactive'
            return application.save()

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
