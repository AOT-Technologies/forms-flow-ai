import os
from http import HTTPStatus

from ..exceptions import BusinessException
from ..schemas import ProcessActionListSchema, ProcessDefinitionSchema, ProcessListSchema
from .external import ExtendedBPMService as BPMService


BPM_API_BASE = os.getenv('BPM_API_BASE', '')
API_PROCESS = os.getenv('API_PROCESS', '')
BPM_API_PROCESS = BPM_API_BASE + API_PROCESS


class ProcessService():
    """This class manages process service."""

    @staticmethod
    def get_all_processes():
        try:
            process = BPMService.get_all_process()
            if process == []:
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
        process_details = BPMService.get_request(processKey)
        if not process_details:
            raise BusinessException('Invalid process', HTTPStatus.BAD_REQUEST)
        else:
            return ProcessDefinitionSchema.dump(process_details)

    @staticmethod
    def get_a_process_action(processKey):
        process_details = BPMService.get_process_actions(processKey)
        if not process_details:
            raise BusinessException('Invalid process', HTTPStatus.BAD_REQUEST)
        else:
            return ProcessActionListSchema.dump(process_details)
