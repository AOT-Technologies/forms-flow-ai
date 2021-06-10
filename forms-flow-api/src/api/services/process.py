"""This exposes process service."""

import json
import logging
import sys, traceback
from http import HTTPStatus

from ..exceptions import BusinessException
from ..schemas import (
    ProcessActionListSchema,
    ProcessActivityInstanceSchema,
    ProcessDefinitionSchema,
    ProcessDefinitionXMLSchema,
    ProcessListSchema,
)
from .external import BPMService


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
    def get_process(process_key, token):
        """Get process details."""
        process_details = BPMService.get_process_details(
            process_key=process_key, token=token
        )
        if process_details:
            return ProcessDefinitionSchema().dump(process_details)

        raise BusinessException("Invalid process", HTTPStatus.BAD_REQUEST)

    @staticmethod
    def get_process_definition_xml(process_key, token):
        """Get process details."""
        process_definition_xml = BPMService.get_process_definition_xml(
            process_key=process_key, token=token
        )
        if process_definition_xml:
            return ProcessDefinitionXMLSchema().dump(process_definition_xml)

        raise BusinessException("Invalid process", HTTPStatus.BAD_REQUEST)

    @staticmethod
    def get_process_action(process_key, token):
        """Get process actions."""
        process_details = BPMService.get_process_actions(
            process_key=process_key, token=token
        )
        if process_details:
            return ProcessActionListSchema().dump(process_details)

        raise BusinessException("Invalid process", HTTPStatus.BAD_REQUEST)

    @staticmethod
    def get_states(process_key, task_key, token):
        """Get states."""
        payload = {
            "variables": {
                "process": {"value": process_key},
                "task": {"value": task_key},
            }
        }
        data = BPMService.post_process_evaluate(payload=payload, token=token)
        if data:
            value = data[0].get("state", {}).get("value")
            # Since we are receiving a string instead of json and the string contain single quote
            # instead of double quote.
            value = value.replace("'", '"')
            return json.loads(value)

        raise BusinessException("error", HTTPStatus.BAD_REQUEST)

    @staticmethod
    def post_message(data, token):
        """Get process details."""
        return BPMService.send_message(data=data, token=token)

    @staticmethod
    def get_process_activity_instances(process_instace_id, token):
        """Get process actions."""
        logging.debug("get_process_activity_instances " + process_instace_id)
        activity_instances = BPMService.get_process_activity_instances(
            process_instace_id=process_instace_id, token=token
        )
        logging.debug(activity_instances)
        try:
            if activity_instances:
                return ProcessActivityInstanceSchema().dump(activity_instances)
        except TypeError as err:
            exc_traceback = sys.exc_info()
            response, status = {
                "type": "Invalid request",
                "message": "Invalid request object passed",
                "errors": err.messages,
            }, HTTPStatus.BAD_REQUEST
            logging.exception(response)
            logging.exception(err)
            traceback.print_tb(exc_traceback)
            return response, status

        # raise BusinessException(
        #    "No activity instances available for process", HTTPStatus.BAD_REQUEST
        # )
