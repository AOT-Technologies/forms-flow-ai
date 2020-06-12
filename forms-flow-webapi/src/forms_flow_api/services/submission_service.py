from datetime import datetime as dt
from http import HTTPStatus

from ..common.responses import errorResponse, nodataResponse, successListResponse, successResponse
from ..models.application import Application, application_schema, applications_schema
from .dboperations import save_changes
from ..schemas import SubmissionSchema
from ..exceptions import BusinessException

class SubmissionService():
    """This class manages submission service."""

    @staticmethod
    def save_new_submission(data, Id):
        new_application = Application(
            application_name=data['application_name'],
            application_status="active",
            mapper_id=Id,
            created_by=data['created_by'],
            created_on=dt.utcnow(),
            modified_by=data['modified_by'],
            modified_on=dt.utcnow(),
            submission_id=data['submission_id'],
            process_instance_id=data['process_instance_id'],
            revision_no=data['revision_no']
        )
        save_changes(new_application)
        #TODO Call triger notification BPM API

    @staticmethod
    def get_all_submissions(applicationId, page_number, limit):
        if page_number != None:
            page_number = int(page_number)
        if limit != None:
            limit = int(limit)

        submissions = Application.query.filter_by(application_status="active", mapper_id=applicationId).paginate(page_number, limit, False).items
        submission_schema = SubmissionSchema()
        return submission_schema.dump(submissions, many=True)

    @staticmethod 
    def get_all_submissions_count():
        return Application.query.filter_by(application_status="active").count()

    @staticmethod
    def get_a_submission(applicationId, submissionId):

        application_details = Application.query.filter_by(mapper_id=applicationId, submission_id=submissionId, application_status="active").first()
        if application_details:
            submission_schema = SubmissionSchema()
            return submission_schema.dump(application_details)
        else:
            raise BusinessException('Invalid submission', HTTPStatus.BAD_REQUEST)

    @staticmethod
    def update_submission(applicationId, submissionId, data):
        application = Application.query.filter_by(mapper_id=applicationId, submission_id=submissionId, application_status="active").first()
        if not application:
            raise BusinessException('Invalid submission', HTTPStatus.BAD_REQUEST)
        else:
            application.application_name = data['application_name']
            application.mapper_id = data['mapper_id']
            application.modified_by = data['modified_by']
            application.modified_on = dt.utcnow()
            application.process_instance_id = data['process_instance_id']
            application.revision_no = data['revision_no']

            save_changes(application)
            #TODO Call triger notification BPM API