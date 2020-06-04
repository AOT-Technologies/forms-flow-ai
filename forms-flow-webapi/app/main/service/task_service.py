import uuid
from datetime import datetime as dt
import json
from marshmallow import Schema

from app.main import db
from ..model.process import Process,process_schema,processes_schema
from ..common.responses import response, successResponse, errorResponse, nodataResponse
from .dboperations import save_changes
from ..service.bpm_service import  httpGETRequest,httpPOSTRequest
from os import environ as env

BPM_API_BASE = env.get('BPM_API_BASE')
API_TASK = env.get('API_TASK')
API_TASK_HISTORY = env.get('API_TASK_HISTORY')
BPM_API_TASK = BPM_API_BASE + API_TASK
BPM_API_TASK_HISTORY = BPM_API_BASE + API_TASK_HISTORY

def get_all_tasks():
    try:
        url = BPM_API_TASK_HISTORY
        task = httpGETRequest(url)
        #result = processes_schema.dump(task)
        response = successResponse(task)
        response.last_modified = dt.utcnow()
        response.add_etag()
        return response
    except Exception as e:
        return errorResponse()


def get_a_task(taskId):
    try:
        url = BPM_API_TASK + taskId
        task_details=  httpGETRequest(url)
        if not task_details:
            return nodataResponse()
        else:
            #result = task_schema.dump(task_details)
            response = successResponse(task_details)
            response.last_modified = dt.utcnow()
            response.add_etag()
            return response
    except Exception as e:
        return errorResponse()

def claim_a_task(taskId):
    try:
        url = BPM_API_TASK + taskId +'/claim'
        task_claim =  httpPOSTRequest(url)
        if task_claim.status == 204:
            response = successResponse()
            response.last_modified = dt.utcnow()
            response.add_etag()
            return response
        else :
            return errorResponse()
    except Exception as e:
        return errorResponse()

def unclaim_a_task(taskId):
    try:
        url = BPM_API_TASK + taskId +'/unclaim'
        task_claim=  httpPOSTRequest(url)
        if task_claim.status == 204:
            response = successResponse()
            response.last_modified = dt.utcnow()
            response.add_etag()
            return response
        else :
            return errorResponse()
    except Exception as e:
        return errorResponse()

def set_action_a_task(taskId):
    try:
        url = BPM_API_TASK + taskId +'/complete'
        task_claim=  httpPOSTRequest(url)
        if task_claim.status == 204:
            response = successResponse()
            response.last_modified = dt.utcnow()
            response.add_etag()
            return response
        else :
            return errorResponse()
    except Exception as e:
        return errorResponse()


def due_a_task(taskId):
    try:
        url = BPM_API_TASK + taskId +'/unclaim'
        task_claim=  httpPOSTRequest(url)
        if task_claim.status == 204:
            response = successResponse()
            response.last_modified = dt.utcnow()
            response.add_etag()
            return response
        else :
            return errorResponse()
    except Exception as e:
        return errorResponse()

