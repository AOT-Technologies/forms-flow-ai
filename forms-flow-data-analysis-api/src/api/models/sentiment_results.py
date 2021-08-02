"""Model to handle Sentiment analysis results."""
from .db import db

class SentimentResults(db.Model):
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    input_request = db.Column(db.JSON)
    output_response = db.Column(db.JSON)
