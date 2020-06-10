"""API endpoints for managing submission resource."""

from http import HTTPStatus
from flask import request
from flask import jsonify
from flask_restx import Namespace, Resource, cors
from marshmallow import ValidationError

from ..exceptions import BusinessException
from ..services import SubmissionService
from ..utils.util import cors_preflight
from ..schemas import SubmissionSchema
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
        pageNo = request.args.get('pageNo')
        limit = request.args.get('limit')
        return jsonify({
            'submissions': SubmissionService.get_all_submissions(applicationId, pageNo, limit)
        }), HTTPStatus.OK

    @staticmethod
    @cors.crossdomain(origin='*')
    def post(applicationId):
        """Post a new submission using the request body."""
        submission_json = request.get_json()

        try:
            submission_schema = SubmissionResource()
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
            submisssion = SubmissionService.update_submission(applicationId, submissionId, submission_json)

            return 'Updated successfully', HTTPStatus.OK
        except ValidationError as submission_err:
            return {'systemErrors': submission_err.messages}, HTTPStatus.BAD_REQUEST



# from flask import request
# from flask_restx import Resource

# from ..common.responses import response
# from ..services.submission_service import get_a_submission, get_all_submissions, save_new_submission, update_submission
# from ..utils.dto import NewSubmissionsDto, SubmissionDto


# submissionapi = SubmissionDto.api
# _submission = SubmissionDto.submission

# createsubmissionapi = NewSubmissionsDto.api
# _newsubmission = NewSubmissionsDto.newsubmission


# @submissionapi.route('/<applicationId>/submission')
# @submissionapi.param('applicationId', 'The Application identifier')
# class SubmissionList(Resource):
#     @submissionapi.param('pageNo', 'PageNumber')
#     @submissionapi.param('limit', 'Items per page')
#     @submissionapi.response(response().error_code, response().error_message)
#     @submissionapi.response(response().notfound_code, response().notfound_message)
#     @submissionapi.doc('list_of_submissions')
#     def get(self, applicationId):
#         """List all applications"""
#         pageNo = request.args.get('pageNo')
#         limit = request.args.get('limit')
#         return get_all_submissions(applicationId, pageNo, limit)

#     @createsubmissionapi.response(response().created_code, response().created_message)
#     @createsubmissionapi.response(response().error_code, response().error_message)
#     @createsubmissionapi.response(response().notfound_code, response().notfound_message)
#     @createsubmissionapi.doc('create a new submission')
#     @createsubmissionapi.expect(_newsubmission, validate=True)
#     def post(self, applicationId):
#         """Create a new submission. """
#         data = request.json
#         return save_new_submission(data=data, Id=applicationId)


# @submissionapi.route('/<applicationId>/submission/<submissionId>')
# @submissionapi.param('applicationId', 'The Application identifier')
# @submissionapi.param('submissionId', 'The Submission identifier')
# class SubmissionDetails(Resource):
#     @submissionapi.response(response().error_code, response().error_message)
#     @submissionapi.response(response().notfound_code, response().notfound_message)
#     @submissionapi.doc('get a submission details')
#     def get(self, applicationId, submissionId):
#         """Get a submission details"""
#         return get_a_submission(applicationId, submissionId)

#     @createsubmissionapi.response(response().created_code, response().created_message)
#     @createsubmissionapi.response(response().error_code, response().error_message)
#     @createsubmissionapi.response(response().notfound_code, response().notfound_message)
#     @createsubmissionapi.doc('Update an application')
#     @createsubmissionapi.expect(_newsubmission, validate=True)
#     def put(self, applicationId, submissionId):
#         """Update an application """
#         data = request.json
#         return update_submission(applicationId, submissionId, data=data)
