"""This exposes application service."""
from http import HTTPStatus

from ..exceptions import BusinessException
from ..models import Application, FormProcessMapper
from ..schemas import AggregatedApplicationSchema, ApplicationSchema
from .external import BPMService
from ..schemas import FormProcessMapperSchema

import logging



class ApplicationService():
    """This class manages application service."""

    @staticmethod
    def create_application(data, token):
        """Create new application."""
        data['application_status'] = 'new'

        mapper = FormProcessMapper.find_by_form_id(data['form_id'])
        # temperory until the frontend can provide form_process_mapper_id
        data['form_process_mapper_id'] = mapper.id
        data['application_name'] = mapper.form_name

        application = Application.create_from_dict(data)

        payload = {'variables': data['variables']}
        payload['variables']['applicationId'] = {'value': application.id}
        response = BPMService.post_process_start(mapper.process_key, payload, token)

        application.update({'process_instance_id': response['id']})

        return application

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
    def get_all_applications_by_user(user_id, page_no, limit):
        """Get all applications."""
        if page_no:
            page_no = int(page_no)
        if limit:
            limit = int(limit)

        applications = Application.find_all_by_user(user_id, page_no, limit)
        application_schema = ApplicationSchema()
        return application_schema.dump(applications, many=True)


    @staticmethod
    def get_all_applications_ids(application_ids):
        applications = Application.find_by_ids(application_ids)
        application_schema = ApplicationSchema()
        return application_schema.dump(applications, many=True)

    @staticmethod
    def get_all_application_count():
        """Get application count."""
        return Application.query.count()

    @staticmethod
    def get_all_application_by_user_count(user_id):
        """Get application count."""
        return Application.find_all_by_user_count(user_id)


    @staticmethod
    def get_all_applications_form_id(form_id,page_no, limit):
        """Get all applications."""
        if page_no:
            page_no = int(page_no)
        if limit:
            limit = int(limit)

        applications = Application.find_by_form_id(form_id, page_no, limit)
        application_schema = ApplicationSchema()
        return application_schema.dump(applications, many=True)

    @staticmethod
    def get_all_applications_form_id_user(form_id,user_id,page_no, limit):
        """Get all applications."""
        if page_no:
            page_no = int(page_no)
        if limit:
            limit = int(limit)

        applications = Application.find_by_form_id_user(form_id,user_id, page_no, limit)
        application_schema = ApplicationSchema()
        return application_schema.dump(applications, many=True)

    @staticmethod
    def get_all_applications_form_id_count(form_id):
        """Get application count."""
        return Application.find_all_by_form_id_count(form_id)

    @staticmethod
    def get_all_applications_form_id_user_count(form_id, user_id):
        """Get application count."""
        return Application.find_all_by_form_id_user_count(form_id,user_id)

    @staticmethod
    def get_application(application_id):
        """Get application by id."""
        return ApplicationSchema().dump(Application.find_by_id(application_id))

    @staticmethod
    def update_application(application_id, data):
        """Update application."""
        application = Application.find_by_id(application_id)
        if application:
            application.update(data)
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
        schema = AggregatedApplicationSchema(exclude=('form_process_mapper_id',))
        return schema.dump(application_status, many=True)
      
    @staticmethod
    def get_application_form_mapper_by_id(application_id):
        """Get form process mapper."""
        mapper = FormProcessMapper.find_by_application_id(application_id)
        if mapper:
            mapper_schema = FormProcessMapperSchema()
            return mapper_schema.dump(mapper)

        raise BusinessException('Invalid application', HTTPStatus.BAD_REQUEST)   
        
    @staticmethod
    def apply_custom_attributes(application_schema):
        if isinstance(application_schema, list):
            for entry in application_schema:
                ApplicationSchemaWrapper.apply_attributes(entry)
        else:
            ApplicationSchemaWrapper.apply_attributes(application_schema)
        return application_schema

class ApplicationSchemaWrapper:
    @staticmethod
    def apply_attributes(application):
        formurl = application['formUrl']
        application['formId'] = formurl[formurl.find("/form/")+6:formurl.find("/submission/")]
        application['submissionId'] = formurl[formurl.find("/submission/")+12:len(formurl)]
        return application
