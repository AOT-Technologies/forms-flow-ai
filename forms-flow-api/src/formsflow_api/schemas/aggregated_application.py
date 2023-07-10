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
    page_no = fields.Int(data_key="pageNo", required=False, allow_none=True)
    limit = fields.Int(data_key="limit", required=False, allow_none=True)
    form_name = fields.Str(data_key="formName", required=False)
    sort_by = fields.Str(data_key="sortBy", required=False)
    sort_order = fields.Str(data_key="sortOrder", required=False)
    form_type = fields.Str(data_key="formType", required=False)


class AggregatedApplicationSchema(Schema):
    """This class manages aggregated application response schema."""

    class Meta:  # pylint: disable=too-few-public-methods
        """Exclude unknown fields in the deserialized output."""

        unknown = EXCLUDE

    application_status = fields.Str(data_key="statusName")
    count = fields.Int()


class AggregatedApplicationsSchema(Schema):
    """This class manages aggregated application response schema."""

    class Meta:  # pylint: disable=too-few-public-methods
        """Exclude unknown fields in the deserialized output."""

        unknown = EXCLUDE

    parent_form_id = fields.Str(data_key="parentFormId")
    form_versions = fields.List(fields.Dict, data_key="formVersions")
    submission_count = fields.Str(data_key="applicationCount")
    form_name = fields.Str(data_key="formName")
