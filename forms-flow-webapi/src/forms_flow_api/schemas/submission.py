"""This manages submission Response Schema."""

from marshmallow import EXCLUDE, Schema, fields

class SubmissionSchema(Schema):
    """This class manages submission request and response schema."""

    class Meta:  # pylint: disable=too-few-public-methods
        """Exclude unknown fields in the deserialized output."""

        unknown = EXCLUDE

    application_id = fields.Int(data_key='applicationId')
    application_name = fields.Str(data_key='applicationName')
    application_status = fields.Str(data_key='status')
    mapper_id = fields.Str(data_key='id')
    created_by = fields.Str(data_key='createdBy')
    created_on = fields.Str(data_key='createdOn')
    modified_by = fields.Str(data_key='modifiedBy')
    modified_on = fields.Str(data_key='modifiedOn')
    submission_id = fields.Str(data_key='submissionId')
    process_instance_id = fields.Str(data_key='processInstanceId')
    revision_no = fields.Str(data_key='revisionNo')
    # process_variables {} # TODO