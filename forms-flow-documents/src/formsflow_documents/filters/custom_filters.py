"""Custom filters module for jinja template."""
from flask import current_app


def is_b64image(value: str) -> bool:
    """Checks if the given string is base64 image."""
    try:
        if not isinstance(value, str):
            return False
        is_image = False

        if "data:image" not in value:
            if "iVBORw0KGg" in value or "/9j/4" in value:
                is_image = True
        else:
            is_image = True
        return is_image
    except Exception as err:  # pylint: disable=broad-except
        current_app.logger.warning(err)
        return False
