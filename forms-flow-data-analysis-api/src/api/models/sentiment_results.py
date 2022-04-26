"""Model to handle Sentiment analysis results."""
from sqlalchemy.dialects.postgresql import JSON

from .base_model import BaseModel
from .db import db


class SentimentResults(BaseModel, db.Model):  # pylint: disable=too-few-public-methods
    """This class manages all of base data about Sentiment Results."""

    __tablename__ = "sentiment_results"
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    input_text = db.Column(db.String(1000))
    overall_sentiment = db.Column(db.String(100))
    output_response = db.Column(JSON)
