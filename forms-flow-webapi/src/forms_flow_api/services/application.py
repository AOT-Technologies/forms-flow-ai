from datetime import datetime as dt
from http import HTTPStatus

from ..exceptions import BusinessException
from ..models import Application, Process
from .dboperations import save_changes
from ..schemas import AggregatedApplicationSchema, ApplicationSchema


class ApplicationService():
    """This class manages application service."""

    @staticmethod
    def get_all_applications(page_number, limit):
        if page_number != None:
            page_number = int(page_number)
        if limit != None:
            limit = int(limit)
        process = Process.find_all(page_number, limit)
        total = Process.query.filter_by(status='active').count()
        application_schema = ApplicationSchema(only=("mapper_id", "form_id", "form_name", "form_revision_number", "process_definition_key", "process_name",
                                                     "form_name", "status", "comments", "created_by", "created_on", "modified_on"))
        return application_schema.dump(process, many=True)

    @staticmethod
    def get_a_application(application_id):

        process_details = Process.find_by_id(application_id)
        if process_details:
            application_schema = ApplicationSchema(only=("mapper_id", "form_id", "form_name", "form_revision_number", "process_definition_key", "process_name",
                                                         "form_name", "status", "comments", "created_by", "created_on", "modified_on"))
            return application_schema.dump(process_details)
        else:
            raise BusinessException('Invalid application', HTTPStatus.BAD_REQUEST)

    @staticmethod
    def save_new_application(data):
        new_application = Process(
            form_id=data['form_id'],
            form_name=data['form_name'],
            form_revision_number=data['form_revision_number'],
            process_definition_key=data['process_definition_key'],
            process_name=data['process_name'],
            status='active',
            comments=data['comments'],
            created_by=data['created_by'],
            created_on=dt.utcnow(),
            modified_by=data['modified_by'],
            modified_on=dt.utcnow(),
            tenant_id=data['tenant_id']
        )
        save_changes(new_application)

    @staticmethod
    def update_application(applicationId, data):

        application = Process.find_by_id(applicationId)
        if not application:
            raise BusinessException('Invalid application', HTTPStatus.BAD_REQUEST)
        else:

            application.form_id = data['form_id']
            application.form_name = data['form_name']
            application.form_revision_number = data['form_revision_number']
            application.process_definition_key = data['process_definition_key']
            application.process_name = data['process_name']
            application.comments = data['comments']
            application.modified_by = data['modified_by']
            application.modified_on = dt.utcnow()
            application.tenant_id = data['tenant_id']

            save_changes(application)

    @staticmethod
    def delete_application(application_id):
        application = Process.find_by_id(application_id)
        if not application:
            raise BusinessException('Invalid application', HTTPStatus.BAD_REQUEST)
        else:
            application.status = 'inactive'
            save_changes(application)

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
