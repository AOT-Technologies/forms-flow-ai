"""API endpoints for managing application resource."""

from http import HTTPStatus

from flask import g, jsonify, request
from flask_restx import Namespace, Resource, cors
from marshmallow import ValidationError

from ..exceptions import BusinessException
from ..schemas.aggregated_application import AggregatedApplicationReqSchema
from ..schemas.application import ApplicationListReqSchema, ApplicationSchema, ApplicationUpdateSchema
from ..services import ApplicationService, ApplicationAuditService
from ..utils.auth import auth
from ..utils.util import cors_preflight


API = Namespace('Application', description='Application')


@cors_preflight('GET,POST,OPTIONS')
@API.route('', methods=['GET', 'POST', 'OPTIONS'])
class ApplicationsResource(Resource):
    """Resource for managing applications."""

    @staticmethod
    @cors.crossdomain(origin='*')
    @auth.require
    def get():
        """Get applications."""
        dict_data = ApplicationListReqSchema().load(request.args)
        page_no = dict_data['page_no']
        limit = dict_data['limit']
        return jsonify({
            'applications': ApplicationService.get_all_applications(page_no, limit),
            'totalCount': ApplicationService.get_all_application_count(),
            'limit': limit,
            'pageNo': page_no
        }), HTTPStatus.OK

    @staticmethod
    @cors.crossdomain(origin='*')
    @auth.require
    def post():
        """Post a new application using the request body."""
        application_json = request.get_json()

        try:
            application_schema = ApplicationSchema()
            dict_data = application_schema.load(application_json)
            sub = g.token_info.get('sub')
            dict_data['created_by'] = sub
            application = ApplicationService.create_application(dict_data, request.headers["Authorization"])

            response, status = application_schema.dump(application), HTTPStatus.CREATED
        except ValidationError as application_err:
            response, status = {'systemErrors': application_err.messages}, \
                HTTPStatus.BAD_REQUEST
        return response, status


@cors_preflight('GET,PUT,OPTIONS')
@API.route('/<int:application_id>', methods=['GET', 'PUT', 'OPTIONS'])
class ApplicationResourceById(Resource):
    """Resource for submissions."""

    @staticmethod
    @cors.crossdomain(origin='*')
    @auth.require
    def get(application_id):
        """Get application by id."""
        try:
            return ApplicationService.get_application(application_id), HTTPStatus.OK
        except BusinessException as err:
            return err.error, err.status_code

    @staticmethod
    @cors.crossdomain(origin='*')
    @auth.require
    def put(application_id):
        """Update application details."""
        application_json = request.get_json()
        try:
            application_schema = ApplicationUpdateSchema()
            dict_data = application_schema.load(application_json)
            sub = g.token_info.get('sub')
            dict_data['modified_by'] = sub
            ApplicationService.update_application(application_id, dict_data)
            return 'Updated successfully', HTTPStatus.OK
        except ValidationError as submission_err:
            return {'systemErrors': submission_err.messages}, HTTPStatus.BAD_REQUEST


@cors_preflight('GET,OPTIONS')
@API.route('/metrics', methods=['GET', 'OPTIONS'])
class AggregatedApplicationsResource(Resource):
    """Resource for managing aggregated applications."""

    @staticmethod
    @cors.crossdomain(origin='*')
    @auth.require
    def get():
        """Get aggregated applications."""
        try:
            request_schema = AggregatedApplicationReqSchema()
            dict_data = request_schema.load(request.args)
            from_date = dict_data['from_date']
            to_date = dict_data['to_date']

            return jsonify({
                'applications': ApplicationService.get_aggregated_applications(from_date, to_date)
            }), HTTPStatus.OK
        except ValidationError as agg_err:
            return {'systemErrors': agg_err.messages}, HTTPStatus.BAD_REQUEST


@cors_preflight('GET,OPTIONS')
@API.route('/metrics/<int:mapper_id>', methods=['GET', 'OPTIONS'])
class AggregatedApplicationStatusResource(Resource):
    """Resource for managing aggregated applications."""

    @staticmethod
    @cors.crossdomain(origin='*')
    @auth.require
    def get(mapper_id):
        """Get aggregated application status."""
        try:
            request_schema = AggregatedApplicationReqSchema()
            dict_data = request_schema.load(request.args)
            from_date = dict_data['from_date']
            to_date = dict_data['to_date']

            return jsonify({
                'applicationStatus': ApplicationService.get_aggregated_application_status(mapper_id, from_date, to_date)
            }), HTTPStatus.OK
        except ValidationError as agg_err:
            return {'systemErrors': agg_err.messages}, HTTPStatus.BAD_REQUEST


@cors_preflight('GET,OPTIONS')
@API.route('/<string:application_id>/history', methods=['GET', 'POST', 'OPTIONS'])
class ApplicationAuditResource(Resource):
    """Resource for managing state."""

    @staticmethod
    @cors.crossdomain(origin='*')
    @auth.require
    def get(application_id):
        """Get application histry."""
        #dict_data = ApplicationAuditReqSchema().load(request.args)
        #application_id = dict_data['application_id']
        return jsonify({
            'applications': ApplicationAuditService.get_application_history(application_id)
        }), HTTPStatus.OK            
