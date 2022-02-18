"""Common utils.

* CORS pre-flight decorator. A simple decorator to add the options method to a Request Class.
"""
import re
from .constants import ALLOW_ALL_ORIGINS
from .enums import ApplicationSortingParameters
from .translations.translations import translations


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


def camel_to_snake(name: str) -> str:
    """Convert camel case to snake case."""
    s1 = re.sub("(.)([A-Z][a-z]+)", r"\1_\2", name)
    return re.sub("([a-z0-9])([A-Z])", r"\1_\2", s1).lower()


def validate_sort_order_and_order_by(order_by: str, sort_order: str) -> bool:
    """Validate sort order and order by."""
    if order_by not in [
        ApplicationSortingParameters.Id,
        ApplicationSortingParameters.Name,
        ApplicationSortingParameters.Status,
        ApplicationSortingParameters.Modified,
    ]:
        order_by = None
    else:
        order_by = camel_to_snake(order_by)
    if sort_order not in ["asc", "desc"]:
        sort_order = None
    return order_by, sort_order


def translate(to: str, data: dict) -> dict:
    """Translate the response to provided language, will return the translated object if there is match
    else return the original object
    """
    try:
        translated_data = {}
        if to not in translations:
            raise KeyError
        for key, value in data.items():
            # if matching translation is present for either key / value, then translated string is used
            # original string otherwise
            translated_data[
                translations[to][key] if key in translations[to] else key
            ] = (translations[to][value] if value in translations[to] else value)
        return translated_data
    except KeyError as err:
        raise err
    except Exception as err:
        raise err
