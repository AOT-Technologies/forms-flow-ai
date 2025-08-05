"""This manages schema for User filter preference for Analyze submissions."""

from marshmallow import EXCLUDE, Schema, ValidationError, fields


def not_empty_string(value):
    """Checks if string is empty or only whitespace."""
    if not value.strip():
        raise ValidationError("Field cannot be empty or whitespace-only.")


def validate_non_empty_list(value):
    """Checks if list is empty."""
    if not value:
        raise ValidationError("List cannot be empty.")


class VariableSchema(Schema):
    """Schema for variables list."""

    key = fields.Str(required=True, validate=not_empty_string)
    name = fields.Str(required=True, validate=not_empty_string)
    label = fields.Str(required=True, validate=not_empty_string)
    isChecked = fields.Bool(required=True)
    sortOrder = fields.Int(required=True)
    isFormVariable = fields.Bool(required=True)
    type = fields.Str(required=True, validate=not_empty_string)


class SubmissionsFilterSchema(Schema):
    """This class manages user-specific preferences for filters in analyze submissions."""

    class Meta:  # pylint: disable=too-few-public-methods
        """Exclude unknown fields in the deserialized output."""

        unknown = EXCLUDE

    id = fields.Int(dump_only=True)
    tenant = fields.Str(allow_none=True, dump_only=True)
    user = fields.Str(allow_none=True, dump_only=True)
    parent_form_id = fields.Str(
        required=True, data_key="parentFormId", validate=not_empty_string
    )
    variables = fields.List(
        fields.Nested(VariableSchema), required=True, validate=validate_non_empty_list
    )
