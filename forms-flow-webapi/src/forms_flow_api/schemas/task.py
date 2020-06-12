"""This manages task Response Schema."""

from marshmallow import EXCLUDE, Schema, fields


class TaskListSchema(Schema):
    """This class manages tasklist response schema."""

    class Meta:  # pylint: disable=too-few-public-methods
        """Exclude unknown fields in the deserialized output."""

        unknown = EXCLUDE

    id = fields.Str()
    name = fields.Str()
    submission_date = fields.Str(data_key='submissionDate')
    submitted_by = fields.Str(data_key='submittedBy')
    assignee = fields.Str()
    status = fields.Str()
    action = fields.Str()
    submission_id = fields.Str(data_key='submissionId')
    application_name = fields.Str(data_key='applicationName')
    created_on = fields.Str(data_key='createdOn')
    created_by = fields.Str(data_key='createdBy')
    modified_by = fields.Str(data_key='modifiedBy')
    modified_on = fields.Str(data_key='modifiedOn')
    due = fields.Str()
