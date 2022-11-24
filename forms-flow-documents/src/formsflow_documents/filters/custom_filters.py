"""Custom filters module for jinja template."""


def is_b64image(value: str) -> bool:
    """Checks if the given string is base64 image."""
    if not isinstance(value, str):
        return False
    is_image = False

    if "data:image" not in value:
        if any(substr in value for substr in ("iVBORw0KGg", "/9j/4")):
            is_image = True
    else:
        is_image = True
    return is_image
