import os
from datetime import datetime as dt
from http import HTTPStatus

from ..common.responses import errorResponse, nodataResponse, successResponse
from ..models.process import process_schema, processes_schema
from .bpm_service import httpGETRequest


BPM_API_BASE = os.getenv('BPM_API_BASE', '')
API_PROCESS = os.getenv('API_PROCESS', '')
BPM_API_PROCESS = BPM_API_BASE + API_PROCESS

class ProcessService():
    """This class manages process service."""

    @staticmethod
    def get_all_processes():
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
        return new_result


    @staticmethod
    def get_a_process(processKey):
        url = BPM_API_PROCESS + processKey
        process_details = httpGETRequest(url)
        if not process_details:
            return nodataResponse()
        else:
            result = process_schema.dump(process_details)
            response = successResponse(process_details)
            response.last_modified = dt.utcnow()
            response.add_etag()
            return response



    @staticmethod
    def get_a_process_action(processKey):
        url = BPM_API_PROCESS + processKey
        process_details = httpGETRequest(url)
        if not process_details:
            return nodataResponse()
        else:
            result = process_schema.dump(process_details)
            response = successResponse(process_details)
            response.last_modified = dt.utcnow()
            response.add_etag()
            return response

