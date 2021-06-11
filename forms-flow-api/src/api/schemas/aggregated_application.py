"""This manages aggregated application Request and Response Schema."""

from marshmallow import EXCLUDE, Schema, fields


class AggregatedApplicationReqSchema(Schema):
    """This class manages aggregated application request schema."""

    class Meta:  # pylint: disable=too-few-public-methods
        """Exclude unknown fields in the deserialized output."""

        unknown = EXCLUDE

    from_date = fields.Date(format="%Y-%m-%d", data_key="from", required=True)
    to_date = fields.Date(format="%Y-%m-%d", data_key="to", required=True)


class AggregatedApplicationSchema(Schema):
    """This class manages aggregated application response schema."""

    class Meta:  # pylint: disable=too-few-public-methods
        """Exclude unknown fields in the deserialized output."""

        unknown = EXCLUDE

    form_process_mapper_id = fields.Int(data_key="mapperId")
    form_name = fields.Str(data_key="formName")
    application_status = fields.Str(data_key="statusName")
    count = fields.Int()
