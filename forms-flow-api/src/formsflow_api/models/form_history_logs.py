"""This manages Form history information."""

from typing import List

from sqlalchemy import JSON, and_, desc

from formsflow_api.models.base_model import BaseModel
from formsflow_api.models.db import db

from .audit_mixin import ApplicationAuditDateTimeMixin


class FormHistory(ApplicationAuditDateTimeMixin, BaseModel, db.Model):
    """This class manages filter information."""

    id = db.Column(db.Integer, primary_key=True)
    form_id = db.Column(db.String, index=True, nullable=False)
    parent_form_id = db.Column(db.String, index=True, nullable=False)
    created_by = db.Column(db.String, nullable=False)
    change_log = db.Column(JSON, nullable=False)
    workflow = db.Column(db.Boolean, nullable=True)
    title = db.Column(db.Boolean, nullable=True)
    component_change = db.Column(db.Boolean, nullable=True)
    anonymous = db.Column(db.Boolean, nullable=True)
    status = db.Column(db.Boolean, nullable=True)
    form_type = db.Column(db.Boolean, nullable=True)
    major_version = db.Column(db.Integer, index=True)
    minor_version = db.Column(db.Integer, index=True)

    @classmethod
    def create_history(cls, data) -> "FormHistory":
        """Creating form history."""
        if data:
            history = FormHistory()
            history.form_id = data.get("form_id")
            history.created_by = data.get("created_by")
            history.parent_form_id = data.get("parent_form_id")
            history.change_log = data.get("change_log")
            history.workflow = data.get("workflow")
            history.title = data.get("title")
            history.status = data.get("status")
            history.form_type = data.get("form_type")
            history.component_change = data.get("component_change")
            history.anonymous = data.get("anonymous")
            history.status = data.get("status")
            history.major_version = data.get("major_version")
            history.minor_version = data.get("minor_version")
            history.save()
            return history
        return None

    @classmethod
    def fetch_histories_by_parent_id(cls, parent_id) -> List["FormHistory"]:
        """Fetch all histories against a form id."""
        assert parent_id is not None
        return (
            cls.query.filter(
                and_(cls.parent_form_id == parent_id, cls.component_change.is_(True))
            )
            .order_by(desc(FormHistory.created))
            .all()
        )

    @classmethod
    def get_latest_version(cls, parent_form_id):
        """Get latest version number."""
        return (
            cls.query.filter(cls.parent_form_id == parent_form_id)
            .order_by(cls.major_version.desc(), cls.minor_version.desc())
            .first()
        )
