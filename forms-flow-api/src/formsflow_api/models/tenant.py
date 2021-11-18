"""This manages Tenant Data."""

# from __future__ import annotations

# from .base_model import BaseModel
# from .db import db


# class Tenant(BaseModel, db.Model):  # pylint: disable=too-few-public-methods
#     """This class manages tenant."""

#     id = db.Column(db.Integer, primary_key=True)
#     tenant_name = db.Column("tenant_name", db.String(), nullable=False)
#     relam = db.Column("relam", db.String(), nullable=False)
#     audience = db.Column("audience", db.String(), nullable=False)

#     @classmethod
#     def find_all(cls):
#         """Fetch all tenant."""
#         return cls.query.all()

#     @classmethod
#     def find_by_id(cls, tenant_id) -> Tenant:
#         """Find tenant that matches the provided id."""
#         return cls.query.filter(Tenant.id == tenant_id).first()
