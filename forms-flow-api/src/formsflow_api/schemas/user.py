"""This manages user request Schema."""

from marshmallow import EXCLUDE, Schema, fields


class UserlocaleReqSchema(Schema):
    """This is a general class for user locale request schema."""

    class Meta:  # pylint: disable=too-few-public-methods
        """Exclude unknown fields in the deserialized output."""

        unknown = EXCLUDE

    locale = fields.Str(data_key="locale", required=True)
