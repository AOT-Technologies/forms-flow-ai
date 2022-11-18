"""Custom filters module for jinja template."""


def is_b64image(value: str):
    """Checks if the given string is base64 image"""
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
    except Exception as _:  # pylint: disable=broad-except
        return False
