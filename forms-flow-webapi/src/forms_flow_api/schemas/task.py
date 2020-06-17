"""This manages task Response Schema."""

from marshmallow import EXCLUDE, Schema, fields


class TaskVariableSchema(Schema):
    """This class manages task varaibles response schema."""

    class Meta:  # pylint: disable=too-few-public-methods
        """Exclude unknown fields in the deserialized output."""

        unknown = EXCLUDE

    name = fields.Str()
    value = fields.Str()

class TaskSchema(Schema):
    """This class manages task response schema."""

    class Meta:  # pylint: disable=too-few-public-methods
        """Exclude unknown fields in the deserialized output."""

        unknown = EXCLUDE

    id = fields.Str()
    name = fields.Str()
    assignee = fields.Str()
    processInstanceId = fields.Str()
    processDefinitionKey = fields.Str()
    taskDefinitionKey = fields.Str()
    variables = fields.List(fields.Nested(TaskVariableSchema))