"""API endpoints for managing task resource."""
import logging

import sys, traceback

from http import HTTPStatus

from flask import request
from flask_restx import Namespace, Resource

from api.services import TaskService
from api.utils.auth import auth
from api.utils.util import cors_preflight


API = Namespace("Task", description="Task")


@cors_preflight("GET,OPTIONS")
@API.route("", methods=["GET", "OPTIONS"])
class TaskList(Resource):
    """Resource for managing tasks."""

    @staticmethod
    @auth.require
    def get():
        """List all tasks."""
        return (
            (
                {
                    "tasks": TaskService.get_all_tasks(
                        token=request.headers["Authorization"]
                    )
                }
            ),
            HTTPStatus.OK,
        )


@cors_preflight("GET,OPTIONS")
@API.route("/<string:task_id>", methods=["GET", "OPTIONS"])
class Task(Resource):
    """Resource for managing tasks."""

    @staticmethod
    @auth.require
    def get(task_id):
        """List specific tasks."""
        return (
            (
                {
                    "task": TaskService.get_task(
                        task_id=task_id, token=request.headers["Authorization"]
                    )
                }
            ),
            HTTPStatus.OK,
        )


@cors_preflight("POST,OPTIONS")
@API.route("/<string:task_id>/claim", methods=["POST", "OPTIONS"])
class TaskClaim(Resource):
    """Resource for claim task."""

    @staticmethod
    @auth.require
    def post(task_id):
        """Claim a task."""
        request_json = request.get_json()
        try:
            return (
                (
                    {
                        "tasks": TaskService.claim_task(
                            task_id=task_id,
                            data=request_json,
                            token=request.headers["Authorization"],
                        )
                    }
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
            }, HTTPStatus.BAD_REQUEST

            logging.exception(response)
            logging.exception(err)
            # traceback.print_tb(exc_traceback)

            return response, status


@cors_preflight("POST,OPTIONS")
@API.route("/<string:task_id>/unclaim", methods=["POST", "OPTIONS"])
class TaskUnClaim(Resource):
    """Resource for claim task."""

    @staticmethod
    @auth.require
    def post(task_id):
        """Unclaim a task."""
        request_json = request.get_json()
        try:
            return (
                (
                    {
                        "tasks": TaskService.unclaim_task(
                            task_id=task_id,
                            data=request_json,
                            token=request.headers["Authorization"],
                        )
                    }
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


@cors_preflight("POST,OPTIONS")
@API.route("/<string:task_id>/complete", methods=["POST", "OPTIONS"])
class TaskComplete(Resource):
    """Resource for claim task."""

    @staticmethod
    @auth.require
    def post(task_id):
        """Complete a task."""
        request_json = request.get_json()
        try:
            return (
                (
                    {
                        "tasks": TaskService.complete_task(
                            task_id=task_id,
                            data=request_json,
                            token=request.headers["Authorization"],
                        )
                    }
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
            }, HTTPStatus.BAD_REQUEST

            logging.exception(response)
            logging.exception(err)
            # traceback.print_tb(exc_traceback)
            return response, status
