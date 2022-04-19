"""This manages aggregated application Request and Response Schema."""

from marshmallow import EXCLUDE, Schema, fields


class ApplicationMetricsRequestSchema(Schema):
    """This class manages application metrics endpoints request schema."""

    class Meta:  # pylint: disable=too-few-public-methods
        """Exclude unknown fields in the deserialized output."""

        unknown = EXCLUDE

    from_date = fields.DateTime(
        format="%Y-%m-%dT%H:%M:%S+00:00", data_key="from", required=True
    )
    to_date = fields.DateTime(
        format="%Y-%m-%dT%H:%M:%S+00:00", data_key="to", required=True
    )
    order_by = fields.Str(data_key="orderBy", required=False)


class AggregatedApplicationSchema(Schema):
    """This class manages aggregated application response schema."""

    class Meta:  # pylint: disable=too-few-public-methods
        """Exclude unknown fields in the deserialized output."""

        unknown = EXCLUDE

    form_process_mapper_id = fields.Int(data_key="mapperId")
    form_name = fields.Str(data_key="formName")
    version = fields.Str(data_key="version")
    application_name = fields.Str(data_key="applicationName")
    application_status = fields.Str(data_key="statusName")
    count = fields.Int()
