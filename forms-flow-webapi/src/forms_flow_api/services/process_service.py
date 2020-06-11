import os
from datetime import datetime as dt
from http import HTTPStatus

from ..exceptions import BusinessException
from ..schemas import ProcessListSchema, ProcessDefinitionSchema, ProcessActionListSchema
from .bpm_service import httpGETRequest


BPM_API_BASE = os.getenv('BPM_API_BASE', '')
API_PROCESS = os.getenv('API_PROCESS', '')
BPM_API_PROCESS = BPM_API_BASE + API_PROCESS

class ProcessService():
    """This class manages process service."""

    @staticmethod
    def get_all_processes():
        try:
            url = BPM_API_PROCESS
            process = httpGETRequest(url)
            if process == [] :
                return process
            else:
                result = ProcessListSchema.dump(process)
                seen = set()
                new_result = []
                for data in result:
                    for d in data:
                        t = tuple(d.items())
                        if t not in seen:
                            seen.add(t)
                            new_result.append(d)
                return new_result
        except Exception as err:
            return "Error"


    @staticmethod
    def get_a_process(processKey):
        url = BPM_API_PROCESS + processKey
        process_details = httpGETRequest(url)
        if not process_details:
            raise BusinessException('Invalid process', HTTPStatus.BAD_REQUEST)
        else:
            return ProcessDefinitionSchema.dump(process_details)

    @staticmethod
    def get_a_process_action(processKey):
        url = BPM_API_PROCESS + processKey
        process_details = httpGETRequest(url)
        if not process_details:
            raise BusinessException('Invalid process', HTTPStatus.BAD_REQUEST)
        else:
            return ProcessActionListSchema.dump(process_details)

