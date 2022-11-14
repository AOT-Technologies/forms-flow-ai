"""Custom filters module for jinja template."""


class TemplateFilters:
    """Custom filter methods for templates."""

    @staticmethod
    def is_signature(value):
        """Checks if the given string is base64 image"""
        try:
            # TODO: better approach for checking base64 image
            value_list = value.split("/")
            value_starts_with = value_list[0] if len(value_list) > 0 else ""
            if isinstance(value, str) and value_starts_with == "data:image":
                return True
            return False
        except Exception as _:  # pylint: disable=broad-except
            return False
