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
API_PROCESS = env.get('API_PROCESS')
BPM_API_PROCESS = BPM_API_BASE + API_PROCESS

def get_all_processes():
    try:
        url = BPM_API_PROCESS
        process = httpGETRequest(url)
        result = processes_schema.dump(process)
        seen = set()
        new_result = []
        for data in result:
            for d in data:
                    t = tuple(d.items())
                    if t not in seen:
                        seen.add(t)
                        new_result.append(d)
        response = successResponse(new_result)
        response.last_modified = dt.utcnow()
        response.add_etag()
        return response
    except Exception as e:
        return errorResponse()


def get_a_process(processId):
    try:
        url = BPM_API_PROCESS + processId
        process_details=  httpGETRequest(url)
        if not process_details:
            return nodataResponse()
        else:
            result = process_schema.dump(process_details)
            response = successResponse(process_details)
            response.last_modified = dt.utcnow()
            response.add_etag()
            return response
    except Exception as e:
        return errorResponse()

def get_a_process_action(processId):
    try:
        url = BPM_API_PROCESS + processId
        process_details=  httpGETRequest(url)
        if not process_details:
            return nodataResponse()
        else:
            result = process_schema.dump(process_details)
            response = successResponse(process_details)
            response.last_modified = dt.utcnow()
            response.add_etag()
            return response
    except Exception as e:
        return errorResponse()

