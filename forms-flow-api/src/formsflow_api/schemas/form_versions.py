"""Form version schema."""
from marshmallow import EXCLUDE, Schema, fields


class FormVersionVariableSchema(Schema):
    """This class manages form version response schema."""

    class Meta:  # pylint: disable=too-few-public-methods
        """Exclude unknown fields in the deserialized output."""

        unknown = EXCLUDE

    version_id = fields.Str(data_key="versionId")
    created_by = fields.Str(data_key="createdBy")
    created = fields.Str(data_key="created")

class FormVersionResponseSchema(Schema):
    """This class manages form version response schema."""

    class Meta:  # pylint: disable=too-few-public-methods
        """Exclude unknown fields in the deserialized output."""

        unknown = EXCLUDE

    id = fields.Str(data_key="id")
    form_id = fields.Str(data_key="formId")
    restored = fields.Str(data_key="restored")
    restored_id = fields.Str(data_key="restoredId")
    versions = fields.List(FormVersionVariableSchema)
    
    