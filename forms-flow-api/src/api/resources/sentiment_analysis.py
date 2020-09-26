"""" API endpoints for sentiment analysis """
from app import app
from http import HTTPStatus

from flask import jsonify, request
from flask_pymongo import PyMongo
from flask_restx import Namespace

from ..schemas import SentimentAnalysisSchema
from ..services import sentiment_pipeline, entity_category



@app.routes("sentiment/", methods=["POST", "GET"])
def sentiment_analysis_mongodb_insert():
    """ Api for storing sentiment analysis response to mongodb """
    parsejson = request.get_json()
    text = parsejson["text"]
    response = sentiment_pipeline(text=text)
    output_response = jsonify(response)

    post_data = {'input_text': text, 'output_response': output_response}
    db_instance = SentimentAnalysisSchema()
    db_instance.insert_sentiment(post_data)

    d = entity_category(text)
    entity_response = sorted(d.items())

    for _, t in enumerate(entity_response):
        k, value = t
        for _, t in enumerate(value):
            db_instance.insert_entity(k, t)

    return "Data was entered into mongo db database", HTTPStatus.OK

@app.routes("sentiment/", methods=["POST", "GET"])
def sentiment_analysis_api():
    """ Api for fetching sentiment analysis response"""
    parsejson = request.get_json()
    text = parsejson["text"]
    response = sentiment_pipeline(text=text)
    return jsonify(response), HTTPStatus.OK
