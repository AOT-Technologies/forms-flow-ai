from datetime import datetime as dt
from http import HTTPStatus

from ..models.applicationsubmission import ApplicationSubmission
from .dboperations import save_changes
from ..schemas import SubmissionSchema
from ..exceptions import BusinessException


class SubmissionService():
    """This class manages submission service."""

    @staticmethod
    def save_new_submission(data, id):
        new_application = ApplicationSubmission(
            application_name=data['application_name'],
            application_status='active',
            mapper_id=id,
            created_by=data['created_by'],
            created_on=dt.utcnow(),
            modified_by=data['modified_by'],
            modified_on=dt.utcnow(),
            submission_id=data['submission_id'],
            process_instance_id=data['process_instance_id'],
            revision_no=data['revision_no']
        )
        save_changes(new_application)
        # TODO Call triger notification BPM API

    @staticmethod
    def get_all_submissions(applicationId, page_number, limit):
        if page_number != None:
            page_number = int(page_number)
        if limit != None:
            limit = int(limit)

        submissions = ApplicationSubmission.query.filter_by(application_status="active", mapper_id=applicationId).paginate(page_number, limit, False).items
        submission_schema = SubmissionSchema()
        return submission_schema.dump(submissions, many=True)

    @staticmethod
    def get_all_submissions_count():
        return ApplicationSubmission.query.filter_by(application_status="active").count()

    @staticmethod
    def get_a_submission(application_id, submission_id):

        application_details = ApplicationSubmission.query.filter_by(mapper_id=application_id, submission_id=submission_id, application_status="active").first()
        if application_details:
            submission_schema = SubmissionSchema()
            return submission_schema.dump(application_details)
        else:
            raise BusinessException('Invalid submission', HTTPStatus.BAD_REQUEST)

    @staticmethod
    def update_submission(application_id, submission_id, data):
        application = ApplicationSubmission.query.filter_by(mapper_id=application_id, submission_id=submission_id, application_status="active").first()
        if application:
            application.application_name = data['application_name']
            application.mapper_id = data['mapper_id']
            application.modified_by = data['modified_by']
            application.modified_on = dt.utcnow()
            application.process_instance_id = data['process_instance_id']
            application.revision_no = data['revision_no']

            save_changes(application)
            # TODO Call triger notification BPM API
            
        else:
            raise BusinessException('Invalid submission', HTTPStatus.BAD_REQUEST)