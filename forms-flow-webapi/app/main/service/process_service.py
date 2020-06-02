import uuid
import datetime
import json
from marshmallow import Schema

from app.main import db
from ..model.process import Process,process_schema,processes_schema
from ..common.responses import response, successResponse, errorResponse, nodataResponse
from .dboperations import save_changes
from ..service.bpm_service import  httpGETRequest,httpPOSTRequest

def get_all_processes():
    try:
        #process =  Process.query.filter_by(status="active").all()
        url = 'https://bpm1.aot-technologies.com/camunda/engine-rest/process-definition'
        process = httpGETRequest(url)
        result = processes_schema.dump(process)
        return successResponse(result)
    except Exception as e:
        return errorResponse()


def get_a_process(processId):
    try:
        #process_details = Process.query.filter_by(mapper_id = processId, status = "active").first()
        url = 'https://bpm1.aot-technologies.com/camunda/engine-rest/process-definition/'+processId
        process_details=  httpGETRequest(url)
        if not process_details:
            return nodataResponse()
        else:
            result = process_schema.dump(process_details)
            return successResponse(process_details)
    except Exception as e:
        return errorResponse()

def get_a_process_action(processId):
    try:
        process_details = Process.query.filter_by(mapper_id = processId, status = "active").first()
        if not process_details:
            return nodataResponse()
        else:
            result = process_schema.dump(process_details)
            return successResponse(result)
    except Exception as e:
        return errorResponse()

