"""This manages form bundling Schema."""

from marshmallow import EXCLUDE, Schema, fields


class SelectedFormSchema(Schema):
    """This class manages form bundling table schema."""

    id = fields.Integer(data_key="id", required=False)
    rules = fields.List(fields.String(), required=False)
    form_order = fields.Integer(data_key="formOrder", required=False)
    parent_form_id = fields.Str(data_key="parentFormId")

    class Meta:  # pylint: disable=too-few-public-methods
        """Exclude unknown fields in the deserialized output."""

        unknown = EXCLUDE


class FormBundleDetailSchema(Schema):
    """This class manages bundle form detail response schema."""

    class Meta:  # pylint: disable=too-few-public-methods
        """Exclude unknown fields in the deserialized output."""

        unknown = EXCLUDE

    id = fields.Integer(data_key="formMapperId")
    form_name = fields.Str(data_key="formName")
    form_id = fields.Str(data_key="formId")
    form_type = fields.Str(data_key="formType")
    parent_form_id = fields.Str(data_key="parentFormId")
