"""API endpoints for managing process resource."""

import logging

import sys, traceback

from http import HTTPStatus

from flask import jsonify, request
from flask_restx import Namespace, Resource, cors

from ..services import ProcessService
from api.utils.auth import auth
from api.utils.util import cors_preflight
from api.utils.constants import CORS_ORIGINS
from api.schemas.process import ProcessMessageSchema

API = Namespace("Process", description="Process")


@cors_preflight("GET,OPTIONS")
@API.route(
    "/<string:process_key>/task/<string:task_key>/state", methods=["GET", "OPTIONS"]
)
class ProcessStateResource(Resource):
    """Resource for managing state."""

    @staticmethod
    @cors.crossdomain(origin=CORS_ORIGINS, max_age=21600)
    @auth.require
    def get(process_key, task_key):
        """Get states by process and task key."""
        try:
            return (
                jsonify(
                    ProcessService.get_states(
                        process_key, task_key, request.headers["Authorization"]
                    )
                ),
                HTTPStatus.OK,
            )
        except BaseException as err:

            exc_traceback = sys.exc_info()

            response, status = {
                "type": "Bad request error",
                "message": "Invalid request data object",
            }, HTTPStatus.BAD_REQUEST

            logging.exception(response)
            logging.exception(err)
            # traceback.print_tb(exc_traceback)

            return response, status


@cors_preflight("GET,OPTIONS")
@API.route("", methods=["GET", "OPTIONS"])
class ProcessResource(Resource):
    """Resource for managing process."""

    @staticmethod
    @cors.crossdomain(origin=CORS_ORIGINS, max_age=21600)
    @auth.require
    def get():
        """Get all process."""
        try:
            return (
                jsonify(
                    {
                        "process": ProcessService.get_all_processes(
                            token=request.headers["Authorization"]
                        )
                    }
                ),
                HTTPStatus.OK,
            )
        except BaseException as err:

            exc_traceback = sys.exc_info()

            response, status = {
                "type": "Bad request error",
                "message": "Invalid request data object",
            }

            logging.exception(response)
            logging.exception(err)
            # traceback.print_tb(exc_traceback)

            return response, status


# API for getting process diagram xml -for displaying bpmn diagram in UI
@cors_preflight("GET,OPTIONS")
@API.route("/<string:process_key>/xml", methods=["GET", "OPTIONS"])
class ProcessDefinitionResource(Resource):
    """Resource for managing process details."""

    @staticmethod
    @cors.crossdomain(origin=CORS_ORIGINS, max_age=21600)
    def get(process_key):
        """Get process detailsXML."""
        try:
            return (
                ProcessService.get_process_definition_xml(
                    process_key, request.headers["Authorization"]
                ),
                HTTPStatus.OK,
            )
        except BaseException as err:

            exc_traceback = sys.exc_info()

            response, status = {
                "type": "Bad request error",
                "message": "Invalid request data object",
            }

            logging.exception(response)
            logging.exception(err)
            # traceback.print_tb(exc_traceback)

            return response, status


@cors_preflight("POST,OPTIONS")
@API.route("/event", methods=["POST", "OPTIONS"])
class ProcessEventResource(Resource):
    """Resource for managing state."""

    @staticmethod
    @cors.crossdomain(origin=CORS_ORIGINS, max_age=21600)
    @auth.require
    def post():
        message_json = request.get_json()
        message_schema = ProcessMessageSchema()
        dict_data = message_schema.load(message_json)
        """Get states by process and task key."""
        try:
            return (
                jsonify(
                    ProcessService.post_message(
                        dict_data, request.headers["Authorization"]
                    )
                ),
                HTTPStatus.OK,
            )
        except KeyError as err:
            exc_traceback = sys.exc_info()
            response, status = (
                {
                    "type": "Invalid Request Object",
                    "message": "Required fields are not passed",
                    "errors": err.messages,
                },
                HTTPStatus.BAD_REQUEST,
            )

            logging.exception(response)
            logging.exception(err)
            # traceback.print_tb(exc_traceback)
            return response, status
        except BaseException as err:
            exc_traceback = sys.exc_info()

            response, status = {
                "type": "Bad request error",
                "message": "Invalid request data object",
            }

            logging.exception(response)
            logging.exception(err)
            # traceback.print_tb(exc_traceback)
            return response, status


@cors_preflight("GET,OPTIONS")
@API.route(
    "/process-instance/<string:process_InstanceId>/activity-instances",
    methods=["GET", "OPTIONS"],
)
class ProcessInstanceResource(Resource):
    """Get Process Activity Instances."""

    @staticmethod
    @cors.crossdomain(origin=CORS_ORIGINS, max_age=21600)
    @auth.require
    def get(process_InstanceId):
        """Get states by process and task key."""
        try:
            return (
                ProcessService.get_process_activity_instances(
                    process_InstanceId, request.headers["Authorization"]
                ),
                HTTPStatus.OK,
            )
        except BaseException as err:

            exc_traceback = sys.exc_info()

            response, status = {
                "type": "Bad request error",
                "message": "Invalid request data object",
            }, HTTPStatus.BAD_REQUEST

            logging.exception(response)
            # traceback.print_tb(exc_traceback)

            return response, status


# @cors_preflight('GET,OPTIONS')
# @API.route('/<int:process_key>', methods=['GET', 'OPTIONS'])
# class ProcessDetailsResource(Resource):
#     """Resource for managing process details."""

#     @staticmethod
#     def get(process_key):
#         """Get process details."""
#         try:
#             return ProcessService.get_process(process_key), HTTPStatus.OK
#         except BusinessException as err:
#             return err.error, err.status_code


# @cors_preflight('GET,OPTIONS')
# @API.route('/<int:process_key>/action', methods=['GET', 'OPTIONS'])
# class ProcessActionsResource(Resource):
#     """Resource for managing process ations."""

#     @staticmethod
#     def get(process_key):
#         """Get process action details."""
#         try:
#             return ProcessService.get_process_action(process_key), HTTPStatus.OK
#         except BusinessException as err:
#             return err.error, err.status_code
