"""Model to handle Sentiment analysis results."""
from .base_model import BaseModel
from .db import db


class SentimentResults(BaseModel, db.Model):
    __tablename__ = "sentiment_analysis_results"
    """This class manages all of base data about Sentiment Results."""
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    input_request = db.Column(db.JSON)
    output_response = db.Column(db.JSON)

    @classmethod
    def create_result_dict(cls, input_request, output_response):
        sentiment_result = SentimentResults()
        sentiment_result.input_request = input_request
        sentiment_result.output_response = output_response
        sentiment_result.save()
        return sentiment_result
    