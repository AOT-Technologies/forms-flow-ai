"""" API endpoints for sentiment analysis """
from http import HTTPStatus

from flask import jsonify, request
from flask_pymongo import PyMongo
from flask_restx import Namespace

from ..schemas import SentimentAnalysisSchema
from ..services import sentiment_pipeline


API = Namespace("sentiment", description="API endpoint for sentiment analysis")


@API.route("/insert", methods=["POST", "GET"])
def sentiment_analysis_mongodb_insert():
    """ Api for storing sentiment analysis response to mongodb """
    parsejson = request.get_json()
    text = parsejson["text"]
    response = sentiment_pipeline(text=text)
    output_response = jsonify(response)
    post_data = {'input': text, 'output': output_response}
    db_instance = SentimentAnalysisSchema()
    db_instance.insert(post_data)
    return "Data was entered into mongo db database", HTTPStatus.OK


@API.route("/api", methods=["POST", "GET"])
def sentiment_analysis_api():
    """ Api for fetching sentiment analysis response"""
    parsejson = request.get_json()
    text = parsejson["text"]
    response = sentiment_pipeline(text=text)
    return jsonify(response), HTTPStatus.OK
