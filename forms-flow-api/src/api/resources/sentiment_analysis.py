"""" API endpoints for sentiment analysis """
from http import HTTPStatus

from flask import g, jsonify, request
from flask_pymongo import PyMongo
from flask_restx import Namespace, Resource, cors

from ..models import mongo
from ..schemas import SentimentAnalysisSchema
from ..services import SentimentAnalyserService, entity_category
from ..utils.auth import auth
from ..utils.util import cors_preflight
import json



API = Namespace("sentiment", description="API endpoint for sentiment analysis")


@cors_preflight('POST,OPTIONS')
@API.route('', methods=['POST', 'OPTIONS'])
class SentimentAnalysisResource(Resource):

    @staticmethod
    @cors.crossdomain(origin='*')
    @auth.require
    def post():
        inputjson = request.get_json()
        text = inputjson["text"]
        topics = inputjson["topics"]

        response = SentimentAnalyserService.sentiment_pipeline(text=text)
        output_response = jsonify(response)



        post_data = {"input_text": inputjson, "output_response": response}
        db_instance = SentimentAnalysisSchema()
        result = db_instance.insert_sentiment(post_data)


        db_entity_instance = SentimentAnalysisSchema()
        entity_response = entity_category(text, topics)

        db_entity_instance.insert_entity(entity_response)
        return output_response, HTTPStatus.OK

