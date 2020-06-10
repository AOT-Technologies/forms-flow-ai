"""API endpoints for managing application resource."""

from http import HTTPStatus
from flask import request
from flask import jsonify
from flask_restplus import Namespace, Resource, cors
from marshmallow import ValidationError

from ..exceptions import BusinessException
from ..services import ApplicationService
from ..utils.util import cors_preflight
from ..schemas import ApplicationSchema
from ..models import Process

API = Namespace('Application', description='Application')


@cors_preflight('GET,POST,OPTIONS')
@API.route('', methods=['GET', 'POST', 'OPTIONS'])
class ApplicationResource(Resource):
    """Resource for managing applications."""

    @staticmethod
    @cors.crossdomain(origin='*')
    def get():
        """Get Applications."""
        pageNo = request.args.get('pageNo')
        limit = request.args.get('limit')
        return jsonify({
            'applications': ApplicationService.get_all_applications(pageNo, limit)
        }), HTTPStatus.OK

    @staticmethod
    @cors.crossdomain(origin='*')
    def post():
        """Post a new application using the request body."""
        application_json = request.get_json()

        try:
            application_schema = ApplicationSchema()
            dict_data = application_schema.load(application_json)
            application = ApplicationService.save_new_application(dict_data)

            response, status = application_schema.dump(application), HTTPStatus.CREATED
        except ValidationError as application_err:
            response, status = {'systemErrors': application_err.messages}, \
                HTTPStatus.BAD_REQUEST
        return response, status

@cors_preflight('GET,PUT,DELETE,OPTIONS')
@API.route('/<int:applicationId>', methods=['GET', 'PUT', 'DELETE', 'OPTIONS'])
class ApplicationResourceById(Resource):
    """Resource for managing application."""

    @staticmethod
    @cors.crossdomain(origin='*')
    def get(applicationId):
        """Get application by id."""
        try:
            return ApplicationService.get_a_application(applicationId), HTTPStatus.OK
        except BusinessException as err:
            return err.error, err.status_code

    @staticmethod
    @cors.crossdomain(origin='*')
    def delete(applicationId):
        """Delete application."""
        try:
            ApplicationService.delete_application(applicationId)
            return 'Deleted', HTTPStatus.OK
        except BusinessException as err:
            return err.error, err.status_code

    @staticmethod
    @cors.crossdomain(origin='*')
    def put(applicationId):
        """Update application details."""
        application_json = request.get_json()

        try:
            application = ApplicationService.update_application(applicationId,application_json)

            return 'Updated successfully', HTTPStatus.OK
        except ValidationError as project_err:
            return {'systemErrors': project_err.messages}, HTTPStatus.BAD_REQUEST


