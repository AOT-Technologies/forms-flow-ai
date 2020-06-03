import uuid
import datetime
import json
from marshmallow import Schema

from app.main import db
from ..model.process import Process,process_schema,processes_schema
from ..common.responses import response, successResponse, errorResponse, nodataResponse
from .dboperations import save_changes
from ..service.bpm_service import  httpGETRequest,httpPOSTRequest

def get_all_tasks():
    try:
        url = 'https://bpm1.aot-technologies.com/camunda/engine-rest/task'
        task = httpGETRequest(url)
        #result = processes_schema.dump(task)
        return successResponse(task)
    except Exception as e:
        return errorResponse()


def get_a_task(taskId):
    try:
        url = 'https://bpm1.aot-technologies.com/camunda/engine-rest/task/'+taskId
        task_details=  httpGETRequest(url)
        if not task_details:
            return nodataResponse()
        else:
            #result = task_schema.dump(task_details)
            return successResponse(task_details)
    except Exception as e:
        return errorResponse()

def claim_a_task(taskId):
    try:
        process_details = Process.query.filter_by(mapper_id = processId, status = "active").first()
        if not process_details:
            return nodataResponse()
        else:
            result = process_schema.dump(process_details)
            return successResponse(result)
    except Exception as e:
        return errorResponse()

