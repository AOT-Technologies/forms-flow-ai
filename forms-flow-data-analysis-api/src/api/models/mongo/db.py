"""Create SQLAlchenmy and Schema managers.

These will get initialized by the application using the models
"""
from flask_pymongo import PyMongo

mongo = PyMongo()
