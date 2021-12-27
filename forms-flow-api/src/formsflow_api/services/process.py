"""This exposes process service."""

import json
from http import HTTPStatus

from formsflow_api.exceptions import BusinessException
from formsflow_api.schemas import (
    ProcessDefinitionXMLSchema,
    ProcessListSchema,
)
from formsflow_api.services.external import BPMService


class ProcessService:
    """This class manages process service."""

    @staticmethod
    def get_all_processes(token):
        """Get all processes."""
        process = BPMService.get_all_process(token=token)
        if process:
            result = ProcessListSchema().dump(process, many=True)
            seen = set()
            new_result = []
            for data in result:
                if data["key"] not in seen:
                    seen.add(data["key"])
                    new_result.append(data)
            return new_result

        return process

    @staticmethod
    def get_process_definition_xml(process_key, token):
        """Get process details."""
        process_definition_xml = BPMService.get_process_definition_xml(
            process_key=process_key, token=token
        )
        if process_definition_xml:
            return ProcessDefinitionXMLSchema().dump(process_definition_xml)

        raise BusinessException("Invalid process", HTTPStatus.BAD_REQUEST)
