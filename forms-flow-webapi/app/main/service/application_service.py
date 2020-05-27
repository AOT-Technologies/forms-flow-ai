import uuid
import datetime

from app.main import db
from ..model.application import Application
from ..common.responses import response
from .dboperations import save_changes

def save_new_application(data):
    new_application = Application(
        application_name = data['application_name'],
        application_status = "1",
        mapper_id = data['mapper_id'],
        created_by = data['created_by'],
        created_on = datetime.datetime.utcnow(),
        modified_by = data['modified_by'],
        modified_on = datetime.datetime.utcnow(),
        submission_id = data['submission_id'],
        process_instance_id = data['process_instance_id'],
        revision_no = data['revision_no']
    )
    save_changes(new_application)
    return response.success_message, response.SUCCESS_CODE


def get_all_applications():
    return Application.query.all()


def get_a_application(applicationId):
    return Application.query.filter_by(application_id=applicationId).first()

def update_application(applicationId,data):
    application = Application.query.filter_by(application_id=applicationId).first()
    if not application:
        return response.nodata_message, response.nodata_code
    else:
        
        application.application_name = data['application_name']
        application.application_status = "1"
        application.mapper_id = data['mapper_id']
        application.modified_by = data['modified_by']
        application.modified_on = datetime.datetime.utcnow()
        application.submission_id = data['submission_id']
        application.process_instance_id = data['process_instance_id']
        application.revision_no = data['revision_no']
        
        save_changes(application)
        return response.success_message, response.SUCCESS_CODE

def delete_application(applicationId):
    application = Application.query.filter_by(application_id=applicationId).first()
    if not application:
        return response.nodata_message, response.nodata_code
    else:
        application.application_status = "0"

        save_changes(application)
        return response.success_message, response.SUCCESS_CODE
        
