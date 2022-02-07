"""Resource to call Keycloak Service API calls and filter responses"""
from http import HTTPStatus
from flask import request, g, current_app
from flask_restx import Namespace, Resource
from marshmallow import ValidationError
from formsflow_api.services import KeycloakAdminAPIService
from formsflow_api.schemas import UserlocaleReqSchema
from formsflow_api.utils import (
    auth,
    cors_preflight,
    profiletime,
)

API = Namespace("user", description="Keycloak user APIs")


@cors_preflight("PUT, OPTIONS")
@API.route("/locale", methods=["OPTIONS", "PUT"])
class KeycloakUserService(Resource):
    """Provides api interface for interacting with Keycloak user attributes"""

    def __init__(self, api=None, *args, **kwargs):
        super().__init__(api, *args, **kwargs)
        self.client = KeycloakAdminAPIService()

    @auth.require
    @profiletime
    def __get_user_data(self) -> dict:
        """GET the keycloak users based on the username and email params"""

        user_name = g.token_info.get("preferred_username")
        email = g.token_info.get("email")
        if email is not None:
            url_path = f"users?username={user_name}&email={email}&exact={True}"
        else:
            url_path = f"users?username={user_name}"
        response = self.client.get_request(url_path=url_path)
        response = response[0]
        if response is None:
            return {"message": f"User not found"}, HTTPStatus.NOT_FOUND
        return response

    @auth.require
    @profiletime
    def put(self) -> dict:
        """Update the user locale attribute.
        : locale :- string representing the language value to update
        """
        try:
            user = self.__get_user_data()
            json_payload = request.get_json()
            dict_data = UserlocaleReqSchema().load(json_payload)
            user["attributes"]["locale"] = [dict_data["locale"]]
            response = self.client.update_request(
                url_path=f"users/{user['id']}", data=user
            )
            if response is None:
                return {"message": f"User not found"}, HTTPStatus.NOT_FOUND
            return response, HTTPStatus.OK

        except KeyError as err:
            response, status = (
                {
                    "type": "Missing attributes",
                    "message": "User Object has missing attributes make sure internationalization is enabled",
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

        except Exception as err:
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
