"""This manages task Response Schema."""

from marshmallow import EXCLUDE, Schema, fields



class TaskListSchema(Schema):
    """This class manages tasklist response schema."""

    class Meta:  # pylint: disable=too-few-public-methods
        """Exclude unknown fields in the deserialized output."""

        unknown = EXCLUDE

    id = fields.Str()
    name = fields.Str()
    submission_date =  fields.Str()
    submitted_by = fields.Str()
    assignee = fields.Str()
    status = fields.Str()
    action = fields.Str()
    submission_id = fields.Str()
    application_name = fields.Str()
    created_on =fields.Str()
    created_by = fields.Str()
    modified_by = fields.Str()
    modified_on = fields.Str()
    due = fields.Str()

