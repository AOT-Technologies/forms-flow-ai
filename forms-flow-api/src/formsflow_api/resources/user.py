"""Resource to call Keycloak Service API calls and filter responses."""
from http import HTTPStatus

import requests
from flask import current_app, g, request
from flask_restx import Namespace, Resource, fields
from formsflow_api_utils.utils import auth, cors_preflight, profiletime
from marshmallow import ValidationError

from formsflow_api.schemas import UserlocaleReqSchema
from formsflow_api.services import KeycloakAdminAPIService, UserService
from formsflow_api.services.factory import KeycloakFactory

API = Namespace("user", description="Keycloak user APIs")

user_list_model = API.model(
    "UserList",
    {
        "id": fields.String(),
        "email": fields.String(),
        "firstName": fields.String(),
        "lastName": fields.String(),
    },
)

locale_put_model = API.model("Locale", {"locale": fields.String()})


@cors_preflight("PUT, OPTIONS")
@API.route("/locale", methods=["OPTIONS", "PUT"])
class KeycloakUserService(Resource):
    """Provides api interface for interacting with Keycloak user attributes."""

    def __init__(self, *args, **kwargs):
        """Initializing client."""
        super().__init__(*args, **kwargs)
        self.client = KeycloakAdminAPIService()

    @auth.require
    @profiletime
    def __get_user_data(self) -> dict:
        """GET the keycloak users based on the username and email params."""
        user_name = g.token_info.get("preferred_username")
        email = g.token_info.get("email")
        if email is not None:
            url_path = f"users?username={user_name}&email={email}&exact={True}"
        else:
            url_path = f"users?username={user_name}"
        response = self.client.get_request(url_path=url_path)
        response = response[0]
        if response is None:
            return {"message": "User not found"}, HTTPStatus.NOT_FOUND
        return response

    @auth.require
    @profiletime
    @API.doc(body=locale_put_model)
    @API.response(200, "OK:- Successful request.")
    @API.response(
        400,
        "BAD_REQUEST:- Invalid request.",
    )
    def put(self) -> dict:
        """Update the user locale attribute."""
        try:
            user = self.__get_user_data()
            json_payload = request.get_json()
            dict_data = UserlocaleReqSchema().load(json_payload)
            if user.get("attributes") is None:
                user["attributes"] = {}
                user["attributes"]["locale"] = []
            user["attributes"]["locale"] = [dict_data["locale"]]
            response = self.client.update_request(
                url_path=f"users/{user['id']}", data=user
            )
            if response is None:
                return {"message": "User not found"}, HTTPStatus.NOT_FOUND
            return response, HTTPStatus.OK

        except KeyError as err:
            response, status = (
                {
                    "type": "Missing attributes",
                    "message": (
                        "User Object has missing attributes make"
                        "sure internationalization is enabled"
                    ),
                },
                HTTPStatus.BAD_REQUEST,
            )
            current_app.logger.warning(response)
            current_app.logger.warning(err)

            return response, status
        except ValidationError as err:
            response, status = (
                {
                    "type": "Invalid Request Object format",
                    "message": "Required fields are not passed",
                },
                HTTPStatus.BAD_REQUEST,
            )
            current_app.logger.warning(response)
            current_app.logger.warning(err)

            return response, status

        except Exception as err:  # pylint: disable=broad-except
            response, status = (
                {
                    "type": "Internal error",
                    "message": "Failed to update the user locale attribute",
                },
                HTTPStatus.BAD_REQUEST,
            )
            current_app.logger.critical(response)
            current_app.logger.critical(err)

            return response, status


@cors_preflight("GET, OPTIONS")
@API.route("", methods=["GET", "OPTIONS"])
class KeycloakUsersList(Resource):
    """Resource to fetch keycloak users."""

    @staticmethod
    @auth.require
    @profiletime
    @API.doc(
        params={
            "memberOfGroup": {
                "in": "query",
                "description": "Group name for fetching users.",
                "default": "formsflow/formsflow-reviewer",
            }
        }
    )
    @API.response(200, "OK:- Successful request.", model=[user_list_model])
    @API.response(
        401,
        "UNAUTHORIZED:- Authorization header not provided or an invalid token passed.",
    )
    @API.response(
        400,
        "BAD_REQUEST:- Invalid request.",
    )
    def get():
        """Get users in a group/role."""
        try:
            group_name = request.args.get("memberOfGroup")
            users_list = KeycloakFactory.get_instance().get_users(group_name=group_name)
            user_service = UserService()
            response = user_service.get_users(request.args, users_list)
            return response, HTTPStatus.OK
        except requests.exceptions.RequestException as err:
            current_app.logger.warning(err)
            return {
                "type": "Bad request error",
                "message": "Invalid request data",
            }, HTTPStatus.BAD_REQUEST
        except Exception as unexpected_error:
            current_app.logger.warning(unexpected_error)
            raise unexpected_error
