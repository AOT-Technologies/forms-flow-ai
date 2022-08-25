"""API endpoints for managing process resource."""

from http import HTTPStatus

from flask import current_app, request
from flask_restx import Namespace, Resource
from formsflow_api_utils.utils import auth, cors_preflight, profiletime

# from formsflow_api.schemas import ProcessMessageSchema
from formsflow_api.services import ProcessService

API = Namespace("Process", description="Process")


@cors_preflight("GET,OPTIONS")
@API.route("", methods=["GET", "OPTIONS"])
class ProcessResource(Resource):
    """Resource for managing process."""

    @staticmethod
    @auth.require
    @profiletime
    def get():
        """Get all process."""
        try:
            return (
                (
                    {
                        "process": ProcessService.get_all_processes(
                            token=request.headers["Authorization"]
                        )
                    }
                ),
                HTTPStatus.OK,
            )
        except BaseException as err:  # pylint: disable=broad-except
            response, status = {
                "type": "Bad request error",
                "message": "Invalid request data object",
            }, HTTPStatus.BAD_REQUEST

            current_app.logger.warning(response)
            current_app.logger.warning(err)
            return response, status


# # API for getting process diagram xml -for displaying bpmn diagram in UI
# @cors_preflight("GET,OPTIONS")
# @API.route("/<string:process_key>/xml", methods=["GET", "OPTIONS"])
# class ProcessDefinitionResource(Resource):
#     """Resource for managing process details."""

#     @staticmethod
#     @auth.require
#     @profiletime
#     def get(process_key):
#         """Get process detailsXML."""
#         try:
#             return (
#                 ProcessService.get_process_definition_xml(
#                     process_key, request.headers["Authorization"]
#                 ),
#                 HTTPStatus.OK,
#             )
#         except BaseException as err:
#             response, status = {
#                 "type": "Bad request error",
#                 "message": "Invalid request data object",
#             }, HTTPStatus.BAD_REQUEST

#             current_app.logger.warning(response)
#             current_app.logger.warning(err)
#             return response, status


# @cors_preflight("POST,OPTIONS")
# @API.route("/event", methods=["POST", "OPTIONS"])
# class ProcessEventResource(Resource):
#     """Resource for managing state."""

#     @staticmethod
#     @auth.require
#     @profiletime
#     def post():
#         message_json = request.get_json()
#         message_schema = ProcessMessageSchema()
#         dict_data = message_schema.load(message_json)
#         """Get states by process and task key."""
#         try:
#             return (
#                 (
#                     ProcessService.post_message(
#                         dict_data, request.headers["Authorization"]
#                     )
#                 ),
#                 HTTPStatus.OK,
#             )
#         except KeyError as err:
#             response, status = (
#                 {
#                     "type": "Invalid Request Object",
#                     "message": "Required fields are not passed",
#                     "errors": err.messages,
#                 },
#                 HTTPStatus.BAD_REQUEST,
#             )

#             current_app.logger.critical(response)
#             current_app.logger.critical(err)
#             return response, status
#         except BaseException as err:
#             response, status = {
#                 "type": "Bad request error",
#                 "message": "Invalid request data object",
#             }

#             current_app.logger.warning(response)
#             current_app.logger.warning(err)
#             return response, status


# @cors_preflight("GET,OPTIONS")
# @API.route(
#     "/process-instance/<string:process_InstanceId>/activity-instances",
#     methods=["GET", "OPTIONS"],
# )
# class ProcessInstanceResource(Resource):
#     """Get Process Activity Instances."""

#     @staticmethod
#     @auth.require
#     @profiletime
#     def get(process_InstanceId):
#         """Get states by process and task key."""
#         try:
#             return (
#                 ProcessService.get_process_activity_instances(
#                     process_InstanceId, request.headers["Authorization"]
#                 ),
#                 HTTPStatus.OK,
#             )
#         except BaseException:
#             response, status = {
#                 "type": "Bad request error",
#                 "message": "Invalid request data object",
#             }, HTTPStatus.BAD_REQUEST

#             current_app.logger.warning(response)
#             return response, status
