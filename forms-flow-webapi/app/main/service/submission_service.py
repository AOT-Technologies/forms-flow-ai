import uuid
from datetime import datetime as dt
import json
from marshmallow import Schema

from app.main import db
from ..model.application import Application,application_schema,applications_schema
from ..common.responses import response, successResponse, errorResponse, nodataResponse
from .dboperations import save_changes

def save_new_submission(data,Id):
    try:
        new_application = Application(
            application_name = data['application_name'],
            application_status = "active",
            mapper_id = Id,
            created_by = data['created_by'],
            created_on = dt.datetime.utcnow(),
            modified_by = data['modified_by'],
            modified_on = dt.datetime.utcnow(),
            submission_id = data['submission_id'],
            process_instance_id = data['process_instance_id'],
            revision_no = data['revision_no']
        )
        save_changes(new_application)
        response = successResponse(data)
        response.last_modified = dt.utcnow()
        response.add_etag()
        return response
    except Exception as e:
        return errorResponse()


def get_all_submissions(applicationId):
    try:
        applications =  Application.query.filter_by(application_status="active",mapper_id = applicationId).all()
        result = applications_schema.dump(applications)
        response = successResponse(result)
        response.last_modified = dt.utcnow()
        response.add_etag()
        return response
    except Exception as e:
        return errorResponse()


def get_a_submission(applicationId, submissionId):
    try:
        application_details = Application.query.filter_by(mapper_id = applicationId, submission_id = submissionId, application_status = "active").first()
        if not application_details:
            return nodataResponse()
        else:
            result = application_schema.dump(application_details)
            response = successResponse(result)
            response.last_modified = dt.utcnow()
            response.add_etag()
            return response
    except Exception as e:
        return errorResponse()

def update_submission(applicationId, submissionId, data):
    try:
        application = Application.query.filter_by(mapper_id = applicationId, submission_id = submissionId, application_status = "active").first()
        if not application:
            return nodataResponse()
        else:
            application.application_name = data['application_name']
            application.mapper_id = data['mapper_id']
            application.modified_by = data['modified_by']
            application.modified_on = dt.datetime.utcnow()
            application.process_instance_id = data['process_instance_id']
            application.revision_no = data['revision_no']
            
            save_changes(application)
            response = successResponse(data)
            response.last_modified = dt.utcnow()
            response.add_etag()
            return response
    except Exception as e:
        return errorResponse()


        
