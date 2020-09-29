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
        inputJson = request.get_json()
        responseJson = {"applicationId": inputJson["applicationId"], "formUrl" : inputJson["formUrl"], "data":[]}
        for data in inputJson["data"]:
            text = data["text"]
            topics = data["topics"]
            dataInput = {"applicationId": inputJson["applicationId"], "formUrl" : inputJson["formUrl"], "elementId" : data["elementId"], "topics": topics, "text":text}

            # processing topics in ML model format
            new_topics = [t[:3].upper() for t in topics]

            response = SentimentAnalyserService.sentiment_pipeline(text=text)
            response["elementId"] = data["elementId"]
            if response["sentiment"]=={}:
                response["sentiment"] = None

            responseJson["data"].append(dict(response))
            response["applicationId"] = inputJson["applicationId"]
            response["formUrl"] = inputJson["formUrl"]
            post_data = {"input_text": dataInput, "output_response": response}
            db_instance = SentimentAnalysisSchema()
            db_instance.insert_sentiment(post_data)

        return jsonify(responseJson), HTTPStatus.OK
