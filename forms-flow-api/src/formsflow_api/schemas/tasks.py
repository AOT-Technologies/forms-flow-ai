"""This manages Tasks Schema."""

from marshmallow import EXCLUDE, fields

from .base_schema import AuditDateTimeSchema


class TaskOutcomeSchema(AuditDateTimeSchema):
    """This class manages task outcome configuration schema."""

    class Meta:  # pylint: disable=too-few-public-methods
        """Exclude unknown fields in the deserialized output."""

        unknown = EXCLUDE

    id = fields.Int()
    tenant = fields.Str(dump_only=True)
    task_id = fields.Str(data_key="taskId", required=True)
    task_outcome = fields.List(fields.Dict(), data_key="taskOutcome", required=True)
    created_by = fields.Str(data_key="createdBy", dump_only=True)
