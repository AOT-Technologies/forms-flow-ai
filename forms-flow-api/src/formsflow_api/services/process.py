"""This exposes process service."""

# from flask import current_app
# from http import HTTPStatus
import re

# from formsflow_api.exceptions import BusinessException

from formsflow_api.schemas import (
    # ProcessActivityInstanceSchema,
    # ProcessDefinitionXMLSchema,
    ProcessListSchema,
)
from formsflow_api.services.external import BPMService


class ProcessService:  # pylint: disable=too-few-public-methods
    """This class manages process service."""

    @staticmethod
    def get_all_processes(token):
        """Get all processes."""
        process = BPMService.get_all_process(token=token)
        if process:
            result = ProcessListSchema().dump(process, many=True)
            new_result = []
            internal = re.compile(r"\((Internal+)\)")
            for data in result:
                if data["name"] is not None and internal.search(data["name"]) is None:
                    new_result.append(data)
            return new_result

        return process
