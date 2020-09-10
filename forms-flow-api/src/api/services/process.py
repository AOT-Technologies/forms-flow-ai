"""This exposes process service."""

import json
import logging
from http import HTTPStatus

from ..exceptions import BusinessException
from ..schemas import ProcessActionListSchema, ProcessDefinitionSchema, ProcessListSchema,ProcessDefinitionXMLSchema
from .external import BPMService


class ProcessService():
    """This class manages process service."""

    @staticmethod
    def get_all_processes(token):
        """Get all processes."""
        process = BPMService.get_all_process(token)
        if process:
            result = ProcessListSchema().dump(process, many=True)
            logging.info(result)
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
    def get_process(process_key, token):
        """Get process details."""
        process_details = BPMService.get_process_details(process_key, token)
        if process_details:
            return ProcessDefinitionSchema().dump(process_details)

        raise BusinessException('Invalid process', HTTPStatus.BAD_REQUEST)

    @staticmethod 
    def get_process_definition_xml(process_key, token):
        """Get process details."""
        logging.log(logging.INFO, process_key)
        process_definition_xml = BPMService.get_process_definition_xml(process_key, token)
        if process_definition_xml:
            return ProcessDefinitionXMLSchema().dump(process_definition_xml)

        raise BusinessException('Invalid process', HTTPStatus.BAD_REQUEST)

    @staticmethod
    def get_process_action(process_key, token):
        """Get process actions."""
        process_details = BPMService.get_process_actions(process_key, token)
        if process_details:
            return ProcessActionListSchema().dump(process_details)

        raise BusinessException('Invalid process', HTTPStatus.BAD_REQUEST)

    @staticmethod
    def get_states(process_key, task_key, token):
        """Get states."""
        payload = {
            'variables': {
                'process': {'value': process_key},
                'task': {'value': task_key}
            }
        }
        data = BPMService.post_process_evaluate(payload, token)
        if data:
            value = data[0].get('state', {}).get('value')
            # Since we are receiving a string instead of json and the string contain single quote
            # instead of double quote.
            value = value.replace("'", '"')
            return json.loads(value)

        raise BusinessException('error', HTTPStatus.BAD_REQUEST)
