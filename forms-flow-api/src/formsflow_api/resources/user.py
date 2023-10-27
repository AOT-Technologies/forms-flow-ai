"""Resource to call Keycloak Service API calls and filter responses."""
from http import HTTPStatus

from flask import current_app, g, request
from flask_restx import Namespace, Resource, fields
from formsflow_api_utils.utils import (
    ADMIN_GROUP,
    auth,
    cors_preflight,
    profiletime,
)

from formsflow_api.schemas import (
    UserlocaleReqSchema,
    UserPermissionUpdateSchema,
    UsersListSchema,
)
from formsflow_api.services import KeycloakAdminAPIService, UserService
from formsflow_api.services.factory import KeycloakFactory

API = Namespace("user", description="Keycloak user APIs")

user_list_count_model = API.model(
    "List",
    {
        "data": fields.List(
            fields.Nested(
                API.model(
                    "UserList",
                    {
                        "id": fields.String(),
                        "email": fields.String(),
                        "firstName": fields.String(),
                        "lastName": fields.String(),
                        "username": fields.String(),
                    },
                )
            )
        ),
        "count": fields.Integer(),
    },
)

user_permission_update_model = API.model(
    "UserPermission",
    {"userId": fields.String(), "groupId": fields.String(), "name": fields.String()},
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
        user = self.__get_user_data()
        json_payload = request.get_json()
        dict_data = UserlocaleReqSchema().load(json_payload)
        if user.get("attributes") is None:
            user["attributes"] = {}
            user["attributes"]["locale"] = []
        user["attributes"]["locale"] = [dict_data["locale"]]
        response = self.client.update_request(url_path=f"users/{user['id']}", data=user)
        if response is None:
            return {"message": "User not found"}, HTTPStatus.NOT_FOUND
        return response, HTTPStatus.OK


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
                "description": "Group/Role  name for fetching users.",
                "default": "",
            },
            "search": {
                "in": "query",
                "description": "A String contained in username, first or last name, or email.",
                "default": "",
            },
            "pageNo": {
                "in": "query",
                "description": "Page number.",
                "default": 1,
            },
            "limit": {
                "in": "query",
                "description": "Max result size.",
                "default": 5,
            },
            "role": {
                "in": "query",
                "description": "Boolean which defines whether roles are returned.",
                "default": "false",
            },
            "count": {
                "in": "query",
                "description": "Boolean which defines whether count is returned.",
                "default": "false",
            },
        }
    )
    @API.response(200, "OK:- Successful request.", model=user_list_count_model)
    @API.response(
        401,
        "UNAUTHORIZED:- Authorization header not provided or an invalid token passed.",
    )
    @API.response(
        400,
        "BAD_REQUEST:- Invalid request.",
    )
    def get():  # pylint: disable=too-many-locals
        """Get users list."""
        group_name = request.args.get("memberOfGroup")
        search = request.args.get("search")
        page_no = int(request.args.get("pageNo", 0))
        limit = int(request.args.get("limit", 0))
        role = request.args.get("role") == "true"
        count = request.args.get("count") == "true"
        kc_admin = KeycloakFactory.get_instance()
        if group_name:
            (users_list, users_count) = kc_admin.get_users(
                page_no, limit, role, group_name, count
            )
            user_service = UserService()
            response = {
                "data": user_service.get_users(request.args, users_list),
                "count": users_count,
            }
        else:
            (user_list, user_count) = kc_admin.search_realm_users(
                search, page_no, limit, role, count
            )
            user_list_response = []
            for user in user_list:
                user = UsersListSchema().dump(user)
                user_list_response.append(user)
            response = {"data": user_list_response, "count": user_count}
        return response, HTTPStatus.OK


@cors_preflight("PUT, DELETE, OPTIONS")
@API.route(
    "/<string:user_id>/permission/groups/<string:group_id>",
    methods=["PUT", "DELETE", "OPTIONS"],
)
class UserPermission(Resource):
    """Resource to manage keycloak user permissions."""

    @staticmethod
    @auth.has_one_of_roles([ADMIN_GROUP])
    @profiletime
    @API.doc(body=user_permission_update_model)
    @API.response(204, "NO CONTENT:- Successful request.")
    @API.response(
        400,
        "BAD_REQUEST:- Invalid request.",
    )
    @API.response(
        401,
        "UNAUTHORIZED:- Authorization header not provided or an invalid token passed.",
    )
    def put(user_id, group_id):
        """Add users to role / group."""
        json_payload = request.get_json()
        user_and_group = UserPermissionUpdateSchema().load(json_payload)
        current_app.logger.debug("Initializing admin API service...")
        service = KeycloakFactory.get_instance()
        current_app.logger.debug("Successfully initialized admin API service !")
        response = service.add_user_to_group_role(user_id, group_id, user_and_group)
        if not response:
            current_app.logger.error(f"Failed to add {user_id} to group {group_id}")
            return {
                "type": "Bad request error",
                "message": "Invalid request data",
            }, HTTPStatus.BAD_REQUEST
        return None, HTTPStatus.NO_CONTENT

    @staticmethod
    @auth.has_one_of_roles([ADMIN_GROUP])
    @profiletime
    @API.doc(body=user_permission_update_model)
    @API.response(204, "NO CONTENT:- Successful request.")
    @API.response(
        400,
        "BAD_REQUEST:- Invalid request.",
    )
    @API.response(
        401,
        "UNAUTHORIZED:- Authorization header not provided or an invalid token passed.",
    )
    def delete(user_id, group_id):
        """Remove users from role / group."""
        json_payload = request.get_json()
        user_and_group = UserPermissionUpdateSchema().load(json_payload)
        current_app.logger.debug("Initializing admin API service...")
        service = KeycloakFactory.get_instance()
        current_app.logger.debug("Successfully initialized admin API service !")
        response = service.remove_user_from_group_role(
            user_id, group_id, user_and_group
        )
        if not response:
            current_app.logger.error(
                f"Failed to remove {user_id} from group {group_id}"
            )
            return {
                "type": "Bad request error",
                "message": "Invalid request data",
            }, HTTPStatus.BAD_REQUEST
        return None, HTTPStatus.NO_CONTENT
