"""This manages Theme Schema."""

from marshmallow import EXCLUDE, Schema, fields


class ThemeCustomizationSchema(Schema):
    """This class provides the schema for theme."""

    class Meta:  # pylint: disable=too-few-public-methods
        """Exclude unknown fields."""

        unknown = EXCLUDE

    id = fields.Int()
    tenant = fields.Str(allow_none=True)
    logo_name = fields.Str(data_key="logoName")
    logo_type = fields.Str(data_key="type")
    logo_data = fields.Str(data_key="logoData")
    application_title = fields.Str(data_key="applicationTitle")
    theme = fields.Dict(data_key="themeJson")
    created_by = fields.Str()
