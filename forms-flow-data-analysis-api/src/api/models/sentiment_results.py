"""Model to handle Sentiment analysis results."""
from .base_model import BaseModel
from sqlalchemy.dialects.postgresql import JSON
from .db import db


class SentimentResults(BaseModel, db.Model):
    __tablename__ = "sentiment_results"
    """This class manages all of base data about Sentiment Results."""
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    input_text = db.Column(db.String(1000))
    overall_sentiment = db.Column(db.String(100))
    output_response = db.Column(JSON)
