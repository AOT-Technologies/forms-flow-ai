"""API endpoints for managing submission resource."""

from http import HTTPStatus

from flask import jsonify, request
from flask_restx import Namespace, Resource, cors
from marshmallow import ValidationError

from ..exceptions import BusinessException
from ..schemas import ApplicationListReqSchema, SubmissionSchema
from ..services import SubmissionService
from ..utils.util import cors_preflight


API = Namespace('Submission', description='Submission')


@cors_preflight('GET,POST,OPTIONS')
@API.route('/<int:application_id>/submission', methods=['GET', 'POST', 'OPTIONS'])
class SubmissionResource(Resource):
    """Resource for managing submissions."""

    @staticmethod
    @cors.crossdomain(origin='*')
    def get(application_id):
        """Get submissions."""
        request_schema = ApplicationListReqSchema()
        dict_data = request_schema.load(request.args)
        page_no = dict_data['page_no']
        limit = dict_data['limit']
        return jsonify({
            'submissions': SubmissionService.get_all_submissions(application_id, page_no, limit),
            'totalCount': SubmissionService.get_all_submissions_count(),
            'limit': limit,
            'pageNo': page_no
        }), HTTPStatus.OK

    @staticmethod
    @cors.crossdomain(origin='*')
    def post(application_id):
        """Post a new submission using the request body."""
        submission_json = request.get_json()

        try:
            submission_schema = SubmissionSchema()
            dict_data = submission_schema.load(submission_json)
            application = SubmissionService.save_new_submission(dict_data, application_id)

            response, status = submission_schema.dump(application), HTTPStatus.CREATED
        except ValidationError as application_err:
            response, status = {'systemErrors': application_err.messages}, \
                HTTPStatus.BAD_REQUEST
        return response, status


@cors_preflight('GET,PUT,OPTIONS')
@API.route('/<int:application_id>/submission/<int:submission_id>', methods=['GET', 'PUT', 'OPTIONS'])
class ApplicationResourceById(Resource):
    """Resource for submissions."""

    @staticmethod
    @cors.crossdomain(origin='*')
    def get(application_id, submission_id):
        """Get submission by id."""
        try:
            return SubmissionService.get_a_submission(application_id, submission_id), HTTPStatus.OK
        except BusinessException as err:
            return err.error, err.status_code

    @staticmethod
    @cors.crossdomain(origin='*')
    def put(application_id, submission_id):
        """Update submission details."""
        submission_json = request.get_json()
        try:
            submission_schema = SubmissionSchema()
            dict_data = submission_schema.load(submission_json)
            SubmissionService.update_submission(application_id, submission_id, dict_data)
            return 'Updated successfully', HTTPStatus.OK
        except ValidationError as submission_err:
            return {'systemErrors': submission_err.messages}, HTTPStatus.BAD_REQUEST
