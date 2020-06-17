"""This exposes process service."""
from http import HTTPStatus

from ..exceptions import BusinessException
from ..schemas import ProcessActionListSchema, ProcessDefinitionSchema, ProcessListSchema
from .external import BPMService


class ProcessService():
    """This class manages process service."""

    @staticmethod
    def get_all_processes():
        """Get all processes."""
        process = BPMService.get_all_process()
        if process:
            result = ProcessListSchema().dump(process)
            seen = set()
            new_result = []
            for data in result:
                for d in data:
                    t = tuple(d.items())
                    if t not in seen:
                        seen.add(t)
                        new_result.append(d)
            return new_result

        return process

    @staticmethod
    def get_process(process_key):
        """Get process details."""
        process_details = BPMService.get_process_details(process_key)
        if process_details:
            return ProcessDefinitionSchema().dump(process_details)

        raise BusinessException('Invalid process', HTTPStatus.BAD_REQUEST)

    @staticmethod
    def get_process_action(process_key):
        """Get process actions."""
        process_details = BPMService.get_process_actions(process_key)
        if process_details:
            return ProcessActionListSchema().dump(process_details)

        raise BusinessException('Invalid process', HTTPStatus.BAD_REQUEST)

    @staticmethod
    def get_process_states(process_key):
        """Get process states."""
        return BPMService.post_process_evaluate(process_key)
