"""This manages Tasks Schema."""

from marshmallow import EXCLUDE, Schema, fields

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
    task_transition_map = fields.Raw(
        data_key="taskTransitionMap", required=True
    )  # Accepts list, dict, string
    transition_map_type = fields.Str(
        data_key="transitionMapType",
        validate=lambda x: x in ["select", "radio", "checkbox", "text", "number"],
        required=True,
    )
    created_by = fields.Str(data_key="createdBy", dump_only=True)


class FormDataSchema(Schema):
    """Schema for formData section."""

    class Meta:  # pylint: disable=too-few-public-methods
        """Exclude unknown fields in the deserialized output."""

        unknown = EXCLUDE

    form_id = fields.String(
        data_key="formId",
        required=True,
        allow_none=False,
    )
    submission_id = fields.String(
        data_key="submissionId",
        required=True,
        allow_none=False,
    )
    data = fields.Dict(required=True, allow_none=False)


class VariableValueSchema(Schema):
    """Schema for variable value objects."""

    class Meta:  # pylint: disable=too-few-public-methods
        """Exclude unknown fields in the deserialized output."""

        unknown = EXCLUDE

    value = fields.Raw(required=True, allow_none=False)


class BpmnVariablesSchema(Schema):
    """Schema for bpmnData variables."""

    class Meta:  # pylint: disable=too-few-public-methods
        """Exclude unknown fields in the deserialized output."""

        unknown = EXCLUDE

    form_url = fields.Nested(
        VariableValueSchema(),
        data_key="formUrl",
        required=True,
        allow_none=False,
    )
    application_id = fields.Nested(
        VariableValueSchema(),
        data_key="applicationId",
        required=True,
        allow_none=False,
    )
    web_form_url = fields.Nested(
        VariableValueSchema(),
        data_key="webFormUrl",
        required=True,
        allow_none=False,
    )
    action = fields.Nested(VariableValueSchema(), required=True, allow_none=False)


class BpmnDataSchema(Schema):
    """Schema for bpmnData section."""

    class Meta:  # pylint: disable=too-few-public-methods
        """Exclude unknown fields in the deserialized output."""

        unknown = EXCLUDE

    variables = fields.Nested(BpmnVariablesSchema(), required=True, allow_none=False)


class ApplicationDataSchema(Schema):
    """Schema for applicationData section."""

    class Meta:  # pylint: disable=too-few-public-methods
        """Exclude unknown fields in the deserialized output."""

        unknown = EXCLUDE

    application_id = fields.Integer(
        data_key="applicationId", required=True, allow_none=False
    )
    application_status = fields.String(
        data_key="applicationStatus",
        required=True,
        allow_none=False,
    )
    form_url = fields.String(
        data_key="formUrl",
        required=True,
        allow_none=False,
    )
    submitted_by = fields.String(
        data_key="submittedBy",
        required=True,
        allow_none=False,
    )
    private_notes = fields.String(
        data_key="privateNotes",
        required=False,
        allow_none=True,
    )


class TaskCompletionSchema(Schema):
    """This class manages task completion schema."""

    class Meta:  # pylint: disable=too-few-public-methods
        """Exclude unknown fields in the deserialized output."""

        unknown = EXCLUDE

    form_data = fields.Nested(FormDataSchema(), data_key="formData", required=True)
    bpmn_data = fields.Nested(BpmnDataSchema(), data_key="bpmnData", required=True)
    application_data = fields.Nested(
        ApplicationDataSchema(), data_key="applicationData", required=True
    )
