"""Bring in the common JWT Manager and helper functions."""

from functools import wraps
from http import HTTPStatus

from flask import g, request, current_app
from flask_jwt_oidc import JwtManager

from jose import jwt as json_web_token
from jose.exceptions import JWTError
from .permisions import build_permission_dict
from ..exceptions import BusinessException, ExternalError

jwt = JwtManager()  # pylint: disable=invalid-name


class Auth:
    """Extending JwtManager to include additional functionalities."""

    @classmethod
    def require(cls, f):
        """Validate the Bearer Token."""

        @jwt.requires_auth
        @wraps(f)
        def decorated(*args, **kwargs):
            g.authorization_header = request.headers.get("Authorization", None)
            g.token_info = g.jwt_oidc_token_info

            return f(*args, **kwargs)

        return decorated

    @classmethod
    def has_one_of_roles(cls, roles):
        """Check that at least one of the realm roles are in the token.

        Args:
            roles [str,]: Comma separated list of valid roles
        """

        def decorated(f):
            @Auth.require
            @wraps(f)
            def wrapper(*args, **kwargs):
                PERMISSIONS = build_permission_dict()
                # Set to store roles that do not have any dependencies
                non_dependencies_roles = set()
                
                # Set to store roles that have dependencies
                dependent_roles = set()

                for role in roles:
                    permission = PERMISSIONS.get(role)
                    if permission:
                        # Check if the role depends on any other roles
                        if permission["depends_on"]:
                            dependent_roles.add(role)
                            dependent_roles.update(permission["depends_on"])
                        else:
                            non_dependencies_roles.add(role)

                if non_dependencies_roles and jwt.contains_role(list(non_dependencies_roles)):
                    return f(*args, **kwargs)

                if dependent_roles and jwt.validate_roles(list(dependent_roles)):
                    return f(*args, **kwargs)
                raise BusinessException(ExternalError.UNAUTHORIZED)

            return wrapper

        return decorated

    @classmethod
    def has_role(cls, role):
        """Method to validate the role."""
        return jwt.validate_roles(role)

    @classmethod
    def require_custom(cls, f):
        """Validate custom form embed token."""
        @wraps(f)
        def decorated(*args, **kwargs):
            token = jwt.get_token_auth_header()
            try:
                data = json_web_token.decode(
                    token,
                    algorithms="HS256",
                    key=current_app.config.get('FORM_EMBED_JWT_SECRET'),
                    )
                g.authorization_header = token
                g.token_info = g.jwt_oidc_token_info = data
            except JWTError as err:
                raise BusinessException(ExternalError.UNAUTHORIZED)
            except Exception as err:
                raise err
            return f(*args, **kwargs)
        return decorated

auth = (
    Auth()
)  # pylint: disable=invalid-name; lower case name as used by convention in most Flask apps
