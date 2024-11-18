"""This manages Audit Mixin for models."""

import datetime

from formsflow_api.models.db import db


def iso_utcnow():
    """Return the current UTC datetime in ISO format with timezone awareness."""
    return datetime.datetime.now(datetime.timezone.utc).isoformat()


class AuditDateTimeMixin:  # pylint: disable=too-few-public-methods
    """Inherit this class to extend the model with created and modified column."""

    created = db.Column(db.DateTime(timezone=True), nullable=False, default=iso_utcnow)
    modified = db.Column(
        db.DateTime,
        default=iso_utcnow,
        onupdate=iso_utcnow,
    )


class ApplicationAuditDateTimeMixin:  # pylint: disable=too-few-public-methods
    """Inherit this class to extend the model with created and modified column."""

    created = db.Column(db.DateTime, nullable=False, default=iso_utcnow)


class AuditUserMixin:  # pylint: disable=too-few-public-methods
    """Inherit this class to extend the model with created_by and modified_by column."""

    created_by = db.Column(db.String(), nullable=False)
    modified_by = db.Column(db.String(), nullable=True)
