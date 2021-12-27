"""This exposes process service."""

from flask import current_app
from http import HTTPStatus

from formsflow_api.exceptions import BusinessException
from formsflow_api.schemas import (
    ProcessActivityInstanceSchema,
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

    @staticmethod
    def get_process_activity_instances(process_instace_id, token):
        """Get process actions."""
        current_app.logger.debug("get_process_activity_instances " + process_instace_id)
        activity_instances = BPMService.get_process_activity_instances(
            process_instace_id=process_instace_id, token=token
        )
        current_app.logger.debug(activity_instances)
        try:
            if activity_instances:
                return ProcessActivityInstanceSchema().dump(activity_instances)
        except TypeError as err:
            current_app.logger.critical(err)
            raise BusinessException(
                "No activity instances available for process", HTTPStatus.BAD_REQUEST
            )

    @staticmethod
    def post_message(data, token):
        """Get process details."""
        return BPMService.send_message(data=data, token=token)
