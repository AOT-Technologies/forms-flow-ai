"""Common utils.

* CORS pre-flight decorator. A simple decorator to add the options method to a Request Class.
"""
from .constants import ALLOW_ALL_ORIGINS


def cors_preflight(methods: str = "GET"):
    """Render an option method on the class."""

    def wrapper(f):  # pylint: disable=invalid-name
        def options(self, *args, **kwargs):  # pylint: disable=unused-argument
            return (
                {"Allow": "GET"},
                200,
                {
                    "Access-Control-Allow-Origin": ALLOW_ALL_ORIGINS,
                    "Access-Control-Allow-Methods": methods,
                    "Access-Control-Allow-Headers": "Authorization, Content-Type",
                },
            )

        setattr(f, "options", options)
        return f

    return wrapper
