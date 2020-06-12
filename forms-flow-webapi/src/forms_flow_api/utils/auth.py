
"""Bring in the common JWT Manager and helper functions."""

from functools import wraps
from http import HTTPStatus

from flask_jwt_oidc import JwtManager

from ..exceptions import BusinessException


jwt = JwtManager()  # pylint: disable=invalid-name; lower case name as used by convention in most Flask apps


class Auth():
    """Extending JwtManager to include additional functionalities."""

    @classmethod
    def require(cls, f):
        """Validate the Bearer Token."""
        @jwt.requires_auth
        @wraps(f)
        def decorated(*args, **kwargs):
            return f(*args, **kwargs)

        return decorated

    @classmethod
    def has_one_of_roles(cls, roles):
        """Check that at least one of the realm roles are in the token.

        Args:
            roles [str,]: Comma separated list of valid roles
        """
        def decorated(f):
            @wraps(f)
            def wrapper(*args, **kwargs):
                if jwt.contains_role(roles):
                    return f(*args, **kwargs)
                raise BusinessException('Access Denied', HTTPStatus.UNAUTHORIZED)
            return wrapper
        return decorated


auth = Auth()  # pylint: disable=invalid-name; lower case name as used by convention in most Flask apps
