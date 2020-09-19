"""" API endpoints for sentiment analysis """
from http import HTTPStatus

from flask import jsonify
from flask_pymongo import PyMongo

from ..schemas import SentimentAnalysisSchema
from ..services.sentiment_analysis import sentiment_pipeline


API = Namespace("sentiment", description="API endpoint for sentiment analysis")


@API.route("/insert", methods=["POST", "GET"])
def sentiment_analysis_mongodb_insert():
    """ Api for adding sentiment analysis response to mongodb """
    parsejson = request.get_json()
    text = parsejson["text"]
    response = pipeline(text=text)
    output_response = jsonify(response)
    post_data = {input: text, output: output_response}
    schema = Database.create(post_data)
    return "Data was entered into mongo db database", HTTPStatus.OK


@API.route("/api", methods=["POST", "GET"])
def sentiment_analysis_api():
    """ Api for fetching sentiment analysis response"""
    parsejson = request.get_json()
    text = parsejson["text"]
    response = pipeline(text=text)
    return jsonify(response), HTTPStatus.OK
