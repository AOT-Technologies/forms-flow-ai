"""This exposes application service."""
import logging
from http import HTTPStatus

from ..exceptions import BusinessException
from ..models import Application, FormProcessMapper
from ..schemas import (
    AggregatedApplicationSchema,
    ApplicationSchema,
    FormProcessMapperSchema,
)
from .external import BPMService


class ApplicationService:
    """This class manages application service."""

    @staticmethod
    def create_application(data, token):
        """Create new application."""
        data["application_status"] = "New"

        mapper = FormProcessMapper.find_form_by_form_id(data["form_id"])
        # temperory until the frontend can provide form_process_mapper_id
        data["form_process_mapper_id"] = mapper.id
        data["application_name"] = mapper.form_name
        application = Application.create_from_dict(data)
        if "process_instance_id" in data:
            application.update({"process_instance_id": data["process_instance_id"]})
        else:
            payload = {
                "variables": {
                    "applicationId": {"value": application.id},
                    "formUrl": {"value": application.form_url},
                    "formName": {"value": application.application_name},
                    "submitterName": {"value": application.created_by},
                    "submissionDate": {"value": application.created.__str__()},
                }
            }
            try:
                camunda_start_task = BPMService.post_process_start(
                    process_key=mapper.process_key, payload=payload, token=token
                )
                application.update({"process_instance_id": camunda_start_task["id"]})
            except BaseException as application_err:
                response = {
                    "systemErrors": application_err,
                    "message": "Camunda Process Mapper Key not provided",
                }, HTTPStatus.BAD_REQUEST
                return response

            return application

    @staticmethod
    def get_auth_applications_and_count(page_no, limit, token):
        """Get applications only from authorized groups."""
        if page_no:
            page_no = int(page_no)
        if limit:
            limit = int(limit)

        auth_form_details = BPMService.get_auth_form_details(token=token)
        form_names = []
        if auth_form_details:
            for auth_form_detail in auth_form_details:
                form_names.append(auth_form_detail["formName"])
            applications = Application.find_by_form_names(
                form_names=form_names, page_no=page_no, limit=limit
            )
            application_schema = ApplicationSchema()
            return (
                application_schema.dump(applications, many=True),
                applications.count(),
            )
        else:
            application_schema = ApplicationSchema()
            return (application_schema.dump([], many=True), 0)

    @staticmethod
    def get_all_applications(page_no, limit):
        """Get all applications."""
        if page_no:
            page_no = int(page_no)
        if limit:
            limit = int(limit)

        applications = Application.find_all(page_no=page_no, limit=limit)
        application_schema = ApplicationSchema()
        return application_schema.dump(applications, many=True)

    @staticmethod
    def get_all_applications_by_user(user_id, page_no, limit):
        """Get all applications based on user."""
        if page_no:
            page_no = int(page_no)
        if limit:
            limit = int(limit)

        applications = Application.find_all_by_user(
            user_id=user_id, page_no=page_no, limit=limit
        )
        application_schema = ApplicationSchema()
        return application_schema.dump(applications, many=True)

    @staticmethod
    def get_all_applications_ids(application_ids):
        applications = Application.find_by_ids(application_ids=application_ids)
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
    def get_all_applications_form_id(form_id, page_no, limit):
        """Get all applications."""
        if page_no:
            page_no = int(page_no)
        if limit:
            limit = int(limit)

        applications = Application.find_by_form_id(
            form_id=form_id, page_no=page_no, limit=limit
        )
        application_schema = ApplicationSchema()
        return application_schema.dump(applications, many=True)

    @staticmethod
    def get_all_applications_form_id_user(form_id, user_id, page_no, limit):
        """Get all applications."""
        if page_no:
            page_no = int(page_no)
        if limit:
            limit = int(limit)

        applications = Application.find_by_form_id_user(
            form_id=form_id, user_id=user_id, page_no=page_no, limit=limit
        )
        application_schema = ApplicationSchema()
        return application_schema.dump(applications, many=True)

    @staticmethod
    def get_all_applications_form_id_count(form_id):
        """Get application count."""
        return Application.find_all_by_form_id_count(form_id=form_id)

    @staticmethod
    def get_all_applications_form_id_user_count(form_id, user_id):
        """Get application count."""
        return Application.find_all_by_form_id_user_count(
            form_id=form_id, user_id=user_id
        )

    @staticmethod
    def get_application(application_id):
        """Get application by id."""
        return ApplicationSchema().dump(
            Application.find_by_id(application_id=application_id)
        )

    @staticmethod
    def update_application(application_id, data):
        """Update application."""
        application = Application.find_by_id(application_id=application_id)
        if application:
            application.update(data)
        else:
            raise BusinessException("Invalid application", HTTPStatus.BAD_REQUEST)

    @staticmethod
    def get_aggregated_applications(from_date: str, to_date: str):
        """Get aggregated applications."""
        applications = Application.find_aggregated_applications(
            from_date=from_date, to_date=to_date
        )
        schema = AggregatedApplicationSchema(exclude=("application_status",))
        return schema.dump(applications, many=True)

    @staticmethod
    def get_aggregated_application_status(mapper_id: int, from_date: str, to_date: str):
        """Get aggregated application status."""
        application_status = Application.find_aggregated_application_status(
            mapper_id=mapper_id, from_date=from_date, to_date=to_date
        )
        schema = AggregatedApplicationSchema(exclude=("form_process_mapper_id",))
        return schema.dump(application_status, many=True)

    @staticmethod
    def get_application_form_mapper_by_id(application_id):
        """Get form process mapper."""
        mapper = FormProcessMapper.find_by_application_id(application_id=application_id)
        if mapper:
            mapper_schema = FormProcessMapperSchema()
            return mapper_schema.dump(mapper)

        raise BusinessException("Invalid application", HTTPStatus.BAD_REQUEST)

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
        try:
            formurl = application["formUrl"]
            application["formId"] = formurl[
                formurl.find("/form/") + 6 : formurl.find("/submission/")
            ]
            application["submissionId"] = formurl[
                formurl.find("/submission/") + 12 : len(formurl)
            ]
            return application
        except KeyError as err:
            return (
                "The required fields of Input request are not passed",
                HTTPStatus.BAD_REQUEST,
            )
