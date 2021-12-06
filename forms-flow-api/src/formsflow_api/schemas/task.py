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
    process_instance_id = fields.Str(
        data_key="processInstanceId", attribute="processInstanceId"
    )
    process_definition_key = fields.Str(
        data_key="processDefinitionKey", attribute="processDefinitionKey"
    )
    task_definition_key = fields.Str(
        data_key="taskDefinitionKey", attribute="taskDefinitionKey"
    )
    groupName = fields.Str(data_key="groupName", attribute="groupName")
    status = fields.Str(data_key="status", attribute="status")
    variables = fields.List(fields.Nested(TaskVariableSchema))
