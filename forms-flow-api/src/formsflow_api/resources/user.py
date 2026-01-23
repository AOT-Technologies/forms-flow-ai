"""Resource to call Keycloak Service API calls and filter responses."""

from http import HTTPStatus

from flask import current_app, g, request
from flask_restx import Namespace, Resource, fields
from formsflow_api_utils.utils import (
    ANALYZE_SUBMISSIONS_VIEW,
    CREATE_DESIGNS,
    CREATE_FILTERS,
    MANAGE_ALL_FILTERS,
    MANAGE_ROLES,
    MANAGE_USERS,
    VIEW_DESIGNS,
    VIEW_FILTERS,
    VIEW_TASKS,
    auth,
    cors_preflight,
    profiletime,
)

from formsflow_api_utils.exceptions import BusinessException

from formsflow_api.constants import BusinessErrorCode
from formsflow_api.schemas import (
    TenantUserAddSchema,
    UserlocaleReqSchema,
    UserPermissionUpdateSchema,
    UserProfileUpdateSchema,
    UserSchema,
    UsersListSchema,
)
from formsflow_api.services import KeycloakAdminAPIService, UserService
from formsflow_api.services.factory import KeycloakFactory

API = Namespace(
    "User",
    description="Handles APIs for Keycloak user management and maintains the user database.",
)

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

tenant_add_user_model = API.model(
    "AddUserToTenant",
    {
        "user": fields.String(),
        "roles": fields.List(
            fields.Nested(
                API.model(
                    "rolesData",
                    {
                        "name": fields.String(),
                        "roleId": fields.String(),
                    },
                )
            )
        ),
    },
)

locale_put_model = API.model("Locale", {"locale": fields.String()})
default_filter_model = API.model(
    "DefaulFilter",
    {
        "defaultFilter": fields.Integer(),
        "defaultSubmissionsFilter": fields.Integer(),
    },
)
default_filter_response_model = API.inherit(
    "DefaulFilterResponse",
    default_filter_model,
    {"userName": fields.String(), "locale": fields.String()},
)


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
    @API.response(
        401,
        "UNAUTHORIZED:- Authorization header not provided or an invalid token passed.",
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
        # Capture "locale" changes in user table
        UserService.update_user_data({"locale": dict_data["locale"]})
        return response, HTTPStatus.OK


@cors_preflight("POST, OPTIONS")
@API.route("/default-filter", methods=["OPTIONS", "POST"])
class UserDefaultFilter(Resource):
    """Resource to create or update user's default filter."""

    @staticmethod
    @auth.has_one_of_roles(
        [VIEW_FILTERS, CREATE_FILTERS, MANAGE_ALL_FILTERS, ANALYZE_SUBMISSIONS_VIEW]
    )
    @profiletime
    @API.doc(body=default_filter_model)
    @API.response(200, "OK:- Successful request.", model=default_filter_response_model)
    @API.response(
        400,
        "BAD_REQUEST:- Invalid request.",
    )
    @API.response(
        401,
        "UNAUTHORIZED:- Authorization header not provided or an invalid token passed.",
    )
    def post():
        """Update the user's default task filter or analyze submissions filter."""
        data = UserSchema().load(request.get_json())
        response = UserService().update_user_data(data=data)
        return response, HTTPStatus.OK


@cors_preflight("GET, OPTIONS")
@API.route("", methods=["GET", "OPTIONS"])
class KeycloakUsersList(Resource):
    """Resource to fetch keycloak users."""

    @staticmethod
    @auth.has_one_of_roles(
        [
            CREATE_DESIGNS,
            VIEW_DESIGNS,
            VIEW_FILTERS,
            CREATE_FILTERS,
            MANAGE_ALL_FILTERS,
            VIEW_TASKS,
            MANAGE_ROLES,
            MANAGE_USERS,
        ]
    )
    @profiletime
    @API.doc(
        params={
            "memberOfGroup": {
                "in": "query",
                "description": "Group name for fetching users.",
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
            "permission": {
                "in": "query",
                "description": "Filter user by permission.",
                "default": "",
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
        permission = request.args.get("permission")
        search = request.args.get("search")
        page_no = int(request.args.get("pageNo", 0))
        limit = int(request.args.get("limit", 0))
        role = request.args.get("role") == "true"
        count = request.args.get("count") == "true"
        kc_admin = KeycloakFactory.get_instance()
        if group_name:

            (users_list, users_count) = kc_admin.get_users(
                page_no, limit, role, group_name, count, search
            )
            user_service = UserService()
            response = {
                "data": user_service.get_users(request.args, users_list),
                "count": users_count,
            }
        else:
            (user_list, user_count) = kc_admin.search_realm_users(
                search, page_no, limit, role, count, permission
            )
            user_list_response = UsersListSchema().dump(user_list, many=True)
            response = {"data": user_list_response, "count": user_count}
        return response, HTTPStatus.OK


@cors_preflight("PUT, DELETE, OPTIONS")
@API.route(
    "/<string:user_id>/permission/groups/<string:group_id>",
    methods=["PUT", "DELETE", "OPTIONS"],
)
class UserPermission(Resource):
    """Resource to manage keycloak user."""

    @staticmethod
    @auth.has_one_of_roles([MANAGE_USERS])
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
        """Add users to group."""
        json_payload = request.get_json()
        user_and_group = UserPermissionUpdateSchema().load(json_payload)
        current_app.logger.debug("Initializing admin API service...")
        service = KeycloakFactory.get_instance()
        current_app.logger.debug("Successfully initialized admin API service !")
        response = service.add_user_to_group(user_id, group_id, user_and_group)
        if not response:
            current_app.logger.error(f"Failed to add {user_id} to group {group_id}")
            return {
                "type": "Bad request error",
                "message": "Invalid request data",
            }, HTTPStatus.BAD_REQUEST
        return None, HTTPStatus.NO_CONTENT

    @staticmethod
    @auth.has_one_of_roles([MANAGE_USERS])
    @profiletime
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
        """Remove users from group."""
        current_app.logger.debug("Initializing admin API service...")
        service = KeycloakFactory.get_instance()
        current_app.logger.debug("Successfully initialized admin API service !")
        response = service.remove_user_from_group(user_id, group_id)
        if not response:
            current_app.logger.error(
                f"Failed to remove {user_id} from group {group_id}"
            )
            return {
                "type": "Bad request error",
                "message": "Invalid request data",
            }, HTTPStatus.BAD_REQUEST
        return None, HTTPStatus.NO_CONTENT


@cors_preflight("POST, OPTIONS")
@API.route(
    "/add-user",
    methods=["POST", "OPTIONS"],
)
class TenantAddUser(Resource):
    """Resource to manage add user to a tenant."""

    @staticmethod
    @auth.has_one_of_roles([MANAGE_USERS])
    @profiletime
    @API.doc(body=tenant_add_user_model)
    @API.response(200, "OK:- Successful request.")
    @API.response(
        400,
        "BAD_REQUEST:- Invalid request.",
    )
    @API.response(
        401,
        "UNAUTHORIZED:- Authorization header not provided or an invalid token passed.",
    )
    def post():
        """Add user to tenant."""
        json_payload = request.get_json()
        data = TenantUserAddSchema().load(json_payload)
        response = KeycloakFactory.get_instance().add_user_to_tenant(data)
        return response


@cors_preflight("PUT, OPTIONS")
@API.route(
    "/<string:user_id>/reset-password",
    methods=["PUT", "OPTIONS"],
)
class ResetPassword(Resource):
    """Resource to trigger reset password email using Keycloak."""

    @staticmethod
    @auth.require
    # @auth.has_one_of_roles([MANAGE_USERS])  # Uncomment if role-based access is needed
    @profiletime
    @API.doc(
        params={
            "redirect_uri": {
                "in": "query",
                "description": "The redirect URI for the password reset link",
                "required": True,
                "type": "string",
            }
        }
    )
    @API.response(200, "OK:- Password reset email sent successfully.")
    @API.response(400, "BAD_REQUEST:- Invalid request.")
    @API.response(401, "UNAUTHORIZED:- Authorization header missing or invalid.")
    @API.response(500, "INTERNAL_SERVER_ERROR:- Keycloak error.")
    def put(user_id):
        """Trigger reset password email for a user."""
        try:
            # Get client_id from token (azp)
            client_id = g.token_info.get("azp")
            if not client_id:
                raise BusinessException(BusinessErrorCode.CLIENT_ID_NOT_FOUND)

            # Get redirect_uri from query parameters
            redirect_uri = request.args.get("redirect_uri")
            if not redirect_uri:
                raise BusinessException(BusinessErrorCode.REDIRECT_URI_NOT_FOUND)

            # Call Keycloak service
            KeycloakFactory.get_instance().reset_password_email(
                user_id=user_id,
                client_id=client_id,
                redirect_uri=redirect_uri
            )

            return {
                "message": "Password reset email sent successfully"
            }, HTTPStatus.OK

        except BusinessException as e:
            return {
                "message": str(e)
            }, HTTPStatus.BAD_REQUEST

        except Exception:  # pylint: disable=broad-exception-caught
            current_app.logger.error("Reset password failed", exc_info=True)
            return {
                "message": "Failed to send reset password email"
            }, HTTPStatus.INTERNAL_SERVER_ERROR


# Response model for login details
login_details_response_model = API.model(
    "LoginDetails",
    {
        "loginType": fields.String(
            description="Type of login: 'internal' for local IDP, 'external' for federated IDP"
        ),
        "identityProvider": fields.String(
            required=False,
            description="Identity provider name (e.g., google, microsoft). Only present for external users."
        ),
    },
)

# Model for profile attributes
profile_attributes_model = API.model(
    "ProfileAttributes",
    {
        "locale": fields.List(
            fields.String(),
            description="User locale preferences",
            required=False,
        ),
    },
)

# Request/Response model for user profile update
user_profile_model = API.model(
    "UserProfile",
    {
        "firstName": fields.String(
            required=False, description="User's first name"
        ),
        "lastName": fields.String(
            required=False, description="User's last name"
        ),
        "username": fields.String(
            required=False, description="User's username"
        ),
        "email": fields.String(
            required=False, description="User's email address"
        ),
        "attributes": fields.Nested(
            profile_attributes_model,
            required=False,
            description="User attributes like locale",
        ),
    },
)


@cors_preflight("GET, OPTIONS")
@API.route(
    "/<string:user_id>/login-details",
    methods=["GET", "OPTIONS"],
)
class UserLoginDetails(Resource):
    """Resource to fetch user login method details from Keycloak."""

    @staticmethod
    @auth.require
    @profiletime
    @API.doc(
        params={
            "user_id": {
                "in": "path",
                "description": "The Keycloak user ID.",
                "required": True,
            }
        }
    )
    @API.response(200, "OK:- Successful request.", model=login_details_response_model)
    @API.response(
        401,
        "UNAUTHORIZED:- Authorization header not provided or an invalid token passed.",
    )
    @API.response(
        404,
        "NOT_FOUND:- User not found.",
    )
    def get(user_id):
        """Get user login details.

        Fetches federated identity information for a user to determine
        if they log in via internal IDP (local) or external IDP (Google, Microsoft, etc.).

        Sample Response for external user:
        {"loginType": "external", "identityProvider": "google"}

        Sample Response for internal user:
        {"loginType": "internal"}
        """
        kc_admin = KeycloakFactory.get_instance()
        response = kc_admin.get_user_federated_identity(user_id)
        return response, HTTPStatus.OK


@cors_preflight("PUT, OPTIONS")
@API.route(
    "/<string:user_id>/profile",
    methods=["PUT", "OPTIONS"],
)
class UserProfile(Resource):
    """Resource to update user profile in Keycloak."""

    @staticmethod
    @auth.require
    @profiletime
    @API.doc(
        params={
            "user_id": {
                "in": "path",
                "description": "The Keycloak user ID.",
                "required": True,
            }
        },
        body=user_profile_model,
    )
    @API.response(200, "OK:- Profile updated successfully.", model=user_profile_model)
    @API.response(
        400,
        "BAD_REQUEST:- Invalid request data.",
    )
    @API.response(
        401,
        "UNAUTHORIZED:- Authorization header not provided or an invalid token passed.",
    )
    @API.response(
        403,
        "FORBIDDEN:- You can only update your own profile.",
    )
    @API.response(
        409,
        "CONFLICT:- Username or email already exists.",
    )
    def put(user_id):
        """Update user profile details.

        Updates user profile information in Keycloak. All fields are optional -
        only fields with changed values need to be sent.

        Validations:
        - User can only update their own profile (user_id must match logged-in user)
        - If username is included, realm must allow username editing and username must be unique
        - If email is included, format is validated and email must be unique
        - firstName, lastName cannot be empty strings if provided

        Sample Request:
        {
            "firstName": "John",
            "lastName": "Doe",
            "username": "johndoe",
            "email": "john.doe@example.com",
            "attributes": {
                "locale": ["en"]
            }
        }
        """
        try:
            # Get logged-in user's Keycloak ID from token (sub claim)
            logged_in_user_id = g.token_info.get("sub")
            if not logged_in_user_id:
                current_app.logger.error("User ID (sub) not found in token")
                return {
                    "message": "User ID not found in token"
                }, HTTPStatus.BAD_REQUEST

            # Parse and validate request data
            json_payload = request.get_json()
            if json_payload is None:
                return {
                    "message": "Request body is required"
                }, HTTPStatus.BAD_REQUEST

            # Validate using schema
            data = UserProfileUpdateSchema().load(json_payload)

            # Convert schema field names to Keycloak field names
            keycloak_data = {}
            if "first_name" in data and data["first_name"] is not None:
                keycloak_data["firstName"] = data["first_name"]
            if "last_name" in data and data["last_name"] is not None:
                keycloak_data["lastName"] = data["last_name"]
            if "username" in data and data["username"] is not None:
                keycloak_data["username"] = data["username"]
            if "email" in data and data["email"] is not None:
                keycloak_data["email"] = data["email"]
            if "attributes" in data and data["attributes"] is not None:
                keycloak_data["attributes"] = data["attributes"]

            # Call Keycloak service to update profile
            kc_admin = KeycloakFactory.get_instance()
            response = kc_admin.update_user_profile(
                user_id=user_id,
                logged_in_user_id=logged_in_user_id,
                data=keycloak_data,
            )

            # Update locale in local user table if attributes contain locale
            if keycloak_data.get("attributes", {}).get("locale"):
                locale_value = keycloak_data["attributes"]["locale"]
                if isinstance(locale_value, list) and locale_value:
                    UserService.update_user_data({"locale": locale_value[0]})

            return response, HTTPStatus.OK

        except BusinessException as err:
            current_app.logger.error(f"Business exception: {err}")
            return {
                "message": err.message,
                "code": err.error_code,
            }, err.status_code

        except Exception as err:  # pylint: disable=broad-exception-caught
            current_app.logger.error(
                f"Failed to update user profile: {err}", exc_info=True
            )
            return {
                "message": "Failed to update user profile"
            }, HTTPStatus.INTERNAL_SERVER_ERROR
