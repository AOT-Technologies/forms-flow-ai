"""This manages submission Response Schema."""

from marshmallow import EXCLUDE, Schema, fields


class SubmissionReqSchema(Schema):
    """This class manages submission Request schema."""

    class Meta:  # pylint: disable=too-few-public-methods
        """Exclude unknown fields in the deserialized output."""

        unknown = EXCLUDE

    application_id = fields.Int()
    mapper_id = fields.Str(data_key='form_id')
    created_by = fields.Str()
    submission_id = fields.Str()
    #process_variables {} # TODO

class SubmissionSchema(Schema):
    """This class manages submission response schema."""

    class Meta:  # pylint: disable=too-few-public-methods
        """Exclude unknown fields in the deserialized output."""

        unknown = EXCLUDE

    application_id = fields.Int()
    application_name = fields.Str()
    application_status = fields.Str(data_key='status')
    mapper_id = fields.Str(data_key='id')
    created_by = fields.Str()
    created_on = fields.Str()
    modified_by = fields.Str()
    modified_on = fields.Str()
    submission_id = fields.Str()
    process_instance_id = fields.Str()
    revision_no = fields.Str()
