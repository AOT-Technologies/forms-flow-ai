"""This manages NRS demo Database Models."""

from __future__ import annotations

import datetime

from sqlalchemy.dialects.postgresql import JSON

from .base_model import BaseModel
from .db import db


class NRSSelectDataMapper(BaseModel, db.Model):
    """This class manages NRS type of inspection data for the select drop down."""

    id = db.Column(db.Integer, primary_key=True)
    label = db.Column(db.String(100), unique=True)

    @classmethod
    def create_from_dict(cls, mapper_info: dict = None) -> NRSSelectDataMapper:
        """Create new mapper."""
        if mapper_info:
            mapper = NRSSelectDataMapper()
            mapper.label = mapper_info["label"]
            mapper.save()
        return mapper

    def update(self, mapper_info: dict):
        """Update data mapper."""
        self.update_from_dict(
            [
                "label",
            ],
            mapper_info,
        )
        self.commit()

    def delete(self):
        """Delete data."""
        db.session.delete(self)
        db.session.commit()

    @classmethod
    def find_all(cls):
        """Fetch all NRS data."""
        return cls.query.order_by(NRSSelectDataMapper.label.asc()).all()

    @classmethod
    def find_all_count(cls):
        """Fetch the count of NRS data."""
        return cls.query.filter().count()

    @classmethod
    def find_by_id(cls, data_id: int) -> NRSSelectDataMapper:
        """Find application that matches the provided id."""
        return cls.query.filter_by(id=data_id).first()


class NRSFormDataMapper(BaseModel, db.Model):
    """This class manages NRS form data."""

    id = db.Column(db.Integer, primary_key=True)
    co_ordinates = db.Column(JSON, nullable=True)
    location = db.Column(db.String(500), nullable=True)
    data = db.Column(db.String(100), nullable=False)
    inspection_time = db.Column(
        db.DateTime, nullable=False, default=datetime.datetime.utcnow
    )
    approval_date = db.Column(
        db.DateTime, nullable=True, default=datetime.datetime.utcnow
    )
    user_name = db.Column(db.String(100), nullable=False)

    @classmethod
    def create_from_dict(cls, mapper_info: dict = None) -> NRSFormDataMapper:
        """Create new mapper."""
        if mapper_info:
            mapper = NRSFormDataMapper()
            mapper.co_ordinates = mapper_info["co_ordinates"]
            mapper.location = mapper_info["location"]
            mapper.data = mapper_info["data"]
            mapper.inspection_time = mapper_info.get("inspection_time")
            mapper.approval_date = mapper_info.get("approval_date")
            mapper.user_name = mapper_info.get("user_name")
            mapper.save()
        return mapper
