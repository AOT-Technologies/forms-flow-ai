from flask import request
from flask_restplus import Resource

from ..common.responses import response
from ..service.submission_service import get_a_submission, get_all_submissions, save_new_submission, update_submission
from ..utils.dto import NewSubmissionsDto, SubmissionDto


submissionapi = SubmissionDto.api
_submission = SubmissionDto.submission

createsubmissionapi = NewSubmissionsDto.api
_newsubmission = NewSubmissionsDto.newsubmission


@submissionapi.route('/<applicationId>/submission')
@submissionapi.param('applicationId', 'The Application identifier')
class SubmissionList(Resource):
    @submissionapi.param('pageNo', 'PageNumber')
    @submissionapi.param('limit', 'Items per page')
    @submissionapi.response(response().error_code, response().error_message)
    @submissionapi.response(response().notfound_code, response().notfound_message)
    @submissionapi.doc('list_of_submissions')
    # @api.marshal_list_with(_submission, envelope='data')
    # @api.marshal_with(_submission)
    def get(self, applicationId):
        """List all applications"""
        pageNo = request.args.get('pageNo')
        limit = request.args.get('limit')
        return get_all_submissions(applicationId, pageNo, limit)

    @createsubmissionapi.response(response().created_code, response().created_message)
    @createsubmissionapi.response(response().error_code, response().error_message)
    @createsubmissionapi.response(response().notfound_code, response().notfound_message)
    @createsubmissionapi.doc('create a new submission')
    @createsubmissionapi.expect(_newsubmission, validate=True)
    def post(self, applicationId):
        """Create a new submission. """
        data = request.json
        return save_new_submission(data=data, Id=applicationId)


@submissionapi.route('/<applicationId>/submission/<submissionId>')
@submissionapi.param('applicationId', 'The Application identifier')
@submissionapi.param('submissionId', 'The Submission identifier')
class SubmissionDetails(Resource):
    @submissionapi.response(response().error_code, response().error_message)
    @submissionapi.response(response().notfound_code, response().notfound_message)
    @submissionapi.doc('get a submission details')
    # @api.marshal_with(_submission)
    def get(self, applicationId, submissionId):
        """Get a submission details"""
        return get_a_submission(applicationId, submissionId)

    @createsubmissionapi.response(response().created_code, response().created_message)
    @createsubmissionapi.response(response().error_code, response().error_message)
    @createsubmissionapi.response(response().notfound_code, response().notfound_message)
    @createsubmissionapi.doc('Update an application')
    @createsubmissionapi.expect(_newsubmission, validate=True)
    def put(self, applicationId, submissionId):
        """Update an application """
        data = request.json
        return update_submission(applicationId, submissionId, data=data)