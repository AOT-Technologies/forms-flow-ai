"""Model to handle all operations related to Trained model data."""

from sqlalchemy import Boolean

from .db import db


class TrainedModel(db.Model):
    """This class manages all of the base data about a Trained Model.

    Corp types are different types of corporation the payment system supports
    """

    __tablename__ = 'trained_model'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)

    model = db.Column(db.LargeBinary)
    active = db.Column('active', Boolean(), default=True)

    # def save(self):
    #     """Save corp type."""
    #     db.session.add(self)
    #     db.session.commit()

    @classmethod
    def get_active_model(cls):
        """Get active model.."""
        return cls.query.filter(active=True).one_or_none()
