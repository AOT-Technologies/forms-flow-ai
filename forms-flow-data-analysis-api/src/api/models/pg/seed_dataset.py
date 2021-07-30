""""Model to handle Seed Dataset."""
from .db import db

class SeedDataset(db.Model):
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    text = db.Column(db.String(555), nullable=False)
    entities = db.Column(db.JSON)
    overall_sentiment = db.Column(db.String(100), nullable=False)
