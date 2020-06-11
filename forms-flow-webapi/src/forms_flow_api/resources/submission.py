"""API endpoints for managing submission resource."""

from http import HTTPStatus
from flask import request
from flask import jsonify
from flask_restx import Namespace, Resource, cors
from marshmallow import ValidationError

from ..exceptions import BusinessException
from ..services import SubmissionService
from ..utils.util import cors_preflight
from ..schemas import SubmissionSchema, ApplicationListReqSchema, SubmissionReqSchema
from ..models import Application

API = Namespace('Submission', description='Submission')


@cors_preflight('GET,POST,OPTIONS')
@API.route('/<int:applicationId>/submission', methods=['GET', 'POST', 'OPTIONS'])
class SubmissionResource(Resource):
    """Resource for managing submissions."""

    @staticmethod
    @cors.crossdomain(origin='*')
    def get(applicationId):
        """Get submissions."""
        request_schema = ApplicationListReqSchema()
        dict_data = request_schema.load(request.args)
        pageNo = dict_data['pageNo']
        limit = dict_data['limit']
        return jsonify({
            'submissions': SubmissionService.get_all_submissions(applicationId, pageNo, limit), 
            'totalCount': SubmissionService.get_all_submissions_count(),
            'limit':limit,
            'pageNo':pageNo
        }),HTTPStatus.OK

    @staticmethod
    @cors.crossdomain(origin='*')
    def post(applicationId):
        """Post a new submission using the request body."""
        submission_json = request.get_json()

        try:
            submission_schema = SubmissionReqSchema()
            dict_data = submission_schema.load(submission_json)
            application = SubmissionService.save_new_submission(dict_data, applicationId)

            response, status = submission_schema.dump(application), HTTPStatus.CREATED
        except ValidationError as application_err:
            response, status = {'systemErrors': application_err.messages}, \
                HTTPStatus.BAD_REQUEST
        return response, status


@cors_preflight('GET,PUT,OPTIONS')
@API.route('/<int:applicationId>/submission/<submissionId>', methods=['GET', 'PUT', 'OPTIONS'])
class ApplicationResourceById(Resource):
    """Resource for submissions."""

    @staticmethod
    @cors.crossdomain(origin='*')
    def get(applicationId, submissionId):
        """Get submission by id."""
        try:
            return SubmissionService.get_a_submission(applicationId, submissionId), HTTPStatus.OK
        except BusinessException as err:
            return err.error, err.status_code

    @staticmethod
    @cors.crossdomain(origin='*')
    def put(applicationId, submissionId):
        """Update submission details."""
        submission_json = request.get_json()
        try:
            submission_schema = SubmissionReqSchema()
            dict_data = submission_schema.load(submission_json)
            submisssion = SubmissionService.update_submission(applicationId, submissionId, submission_json)
            return 'Updated successfully', HTTPStatus.OK
        except ValidationError as submission_err:
            return {'systemErrors': submission_err.messages}, HTTPStatus.BAD_REQUEST
