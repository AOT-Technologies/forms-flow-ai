"""This manages Tasks Schema."""

from marshmallow import EXCLUDE, fields

from .base_schema import AuditDateTimeSchema


class TaskOutcomeConfigurationSchema(AuditDateTimeSchema):
    """This class manages task outcome configuration schema."""

    class Meta:  # pylint: disable=too-few-public-methods
        """Exclude unknown fields in the deserialized output."""

        unknown = EXCLUDE

    id = fields.Int(dump_only=True)
    tenant = fields.Str(dump_only=True)
    task_id = fields.Str(data_key="taskId", required=True)
    task_name = fields.Str(data_key="taskName", required=True, allow_none=True)
    task_transition_map = fields.Raw(data_key="taskTransitionMap", required=True)
    transition_map_type = fields.Str(data_key="transitionMapType", required=True)
    created_by = fields.Str(data_key="createdBy", dump_only=True)
