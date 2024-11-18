"""This manages common schemas."""

import datetime

from marshmallow import EXCLUDE, Schema, fields


class AuditDateTimeSchema(Schema):
    """This class manages AuditDateTime fields created & modified."""

    class Meta:  # pylint: disable=too-few-public-methods
        """Exclude unknown fields in the deserialized output."""

        unknown = EXCLUDE

    created = fields.DateTime(
        format="iso", data_key="created", required=False, dump_only=True
    )
    modified = fields.DateTime(
        format="iso", data_key="modified", required=False, dump_only=True
    )

    def dump(self, obj, many=False, **kwargs):
        """Override the dump method to format datetime fields."""
        data = super().dump(obj, many=many, **kwargs)

        def format_datetime_fields(record):
            """Helper to format datetime fields for a single record."""
            for field in ["created", "modified"]:
                field_value = record.get(field)
                if field_value is not None and isinstance(field_value, str):
                    # Convert the string to datetime
                    dt = datetime.datetime.fromisoformat(record[field])
                    # Ensure it's UTC and return the ISO format with 'Z'
                    record[field] = (
                        dt.replace(tzinfo=datetime.timezone.utc)
                        .isoformat()
                        .replace("+00:00", "Z")
                    )
            return record

        # If many=True, apply formatting to each item in the list
        if many:
            data = [format_datetime_fields(record) for record in data]
        else:
            data = format_datetime_fields(data)

        return data
