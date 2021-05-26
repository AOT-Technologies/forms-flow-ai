"""This manages Audit Mixin for models."""

import datetime

from .db import db


class AuditDateTimeMixin:  # pylint: disable=too-few-public-methods
    """Inherit this class to extend the model with created and modified column."""

    created = db.Column(db.DateTime, nullable=False, default=datetime.datetime.now)
    modified = db.Column(db.DateTime, onupdate=datetime.datetime.now)


class ApplicationAuditDateTimeMixin:  # pylint: disable=too-few-public-methods
    """Inherit this class to extend the model with created and modified column."""

    created = db.Column(db.DateTime, nullable=False, default=datetime.datetime.now)


class AuditUserMixin:  # pylint: disable=too-few-public-methods
    """Inherit this class to extend the model with created_by and modified_by column."""

    created_by = db.Column(db.String(), nullable=False)
    modified_by = db.Column(db.String(), nullable=True)
