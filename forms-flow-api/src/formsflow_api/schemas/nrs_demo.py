"""This manages NRS Schema."""

from marshmallow import EXCLUDE, Schema, fields


class NRSSelectDataMapperSchema(Schema):
    """This class manages NRS inspection type data mapper request and response schema."""

    class Meta:  # pylint: disable=too-few-public-methods
        """Exclude unknown fields in the deserialized output."""

        unknown = EXCLUDE

    id = fields.Str(data_key="id")
    label = fields.Str(data_key="label", required=True)


class NRSFormDataMapperSchema(Schema):
    """This class manages NRS form data mapper request and response schema."""

    class Meta:  # pylint: disable=too-few-public-methods
        """Exclude unknown fields in the deserialized output."""

        unknown = EXCLUDE

    id = fields.Str(data_key="id")
    co_ordinates = fields.Dict(data_key="co_ordinates")
    location = fields.Str(data_key="location")
    data = fields.Str(data_key="select")
    inspection_time = fields.Str(data_key="datePicker")
    approval_date = fields.Str(data_key="dateSigned")
    user_name = fields.Str(data_key="name")
