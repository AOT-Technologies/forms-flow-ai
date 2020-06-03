import uuid
from datetime import datetime as dt
import json
from marshmallow import Schema

from app.main import db
from ..model.process import Process,application_schema,applications_schema
from ..common.responses import response, successResponse, errorResponse, nodataResponse
from .dboperations import save_changes
from ..utils.dto import ApplicationDto,NewApplicationDto


def get_all_applications():
    try:
        process =  Process.query.filter_by(status="active").all()
        result = applications_schema.dump(process)
        response=  successResponse(result)
        response.last_modified = dt.utcnow()
        response.add_etag()
        return response
    except Exception as e:
        return errorResponse()


def get_a_application(applicationId):
    try:
        process_details = Process.query.filter_by(mapper_id = applicationId, status = "active").first()
        if not process_details:
            return nodataResponse()
        else:
            result = application_schema.dump(process_details)
            response = successResponse(result)
            response.last_modified = dt.utcnow()
            response.add_etag()
            return response
    except Exception as e:
        return errorResponse()

def save_new_application(data):
    try:
        new_application = Process(
            form_id = data['form_id'],
            form_name = data["form_name"],
            form_revision_number = data['form_revision_number'],
            process_definition_key = data['process_definition_key'],
            process_name = data['process_name'],
            status = "active",
            comments = data['comments'],
            created_by = data['created_by'],
            created_on = dt.datetime.utcnow(),
            modified_by = data['modified_by'],
            modified_on = dt.datetime.utcnow(),
            tenant_id  = data['tenant_id']
        )
        save_changes(new_application)
        response = successResponse(data)
        response.last_modified = dt.utcnow()
        response.add_etag()
        return response
    except Exception as e:
        return errorResponse()


def update_application(applicationId,data):
    try:
        application = Process.query.filter_by(mapper_id=applicationId, status = "active").first()
        if not application:
            return nodataResponse()
        else:
            
            application.form_id = data['form_id']
            application.form_name = data["form_name"]
            application.form_revision_number = data['form_revision_number']
            application.process_definition_key = data['process_definition_key']
            application.process_name = data['process_name']
            application.comments = data['comments']
            application.modified_by = data['modified_by']
            application.modified_on = dt.datetime.utcnow()
            application.tenant_id  = data['tenant_id']
            
            save_changes(application)
            response = successResponse(data)
            response.last_modified = dt.utcnow()
            response.add_etag()
            return response
    except Exception as e:
        return errorResponse()

def delete_application(applicationId):
    try:
        application = Process.query.filter_by(mapper_id=applicationId).first()
        if not application:
            return nodataResponse()
        else:
            application.status = "inactive"

            save_changes(application)
            response = successResponse()
            response.last_modified = dt.utcnow()
            response.add_etag()
            return response
    except Exception as e:
        return errorResponse()

        
