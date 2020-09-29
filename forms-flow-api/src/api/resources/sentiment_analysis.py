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
        for inputs in inputjson["data"]:
            text = inputs["text"]
            topics = inputs["topics"]
            inputs["applicationId"] = inputjson["applicationId"]
            inputs["formUrl"] = inputjson["formUrl"]
            # processing topics in ML model format
            new_topics = [t[:3].upper() for t in topics]

            response = SentimentAnalyserService.sentiment_pipeline(text=text)
            if response["sentiment"]=={}:
                response_data = {"sentiment": "null", "overall_sentiment":response["overall_sentiment"]}
                response_data["applicationId"] = inputjson["applicationId"]
                response_data["formUrl"] = inputjson["formUrl"]
                response_data["elementId"] = inputs["elementId"]
                post_data = {"input_text": inputs, "output_response": response_data}
                db_instance = SentimentAnalysisSchema()
                result = db_instance.insert_sentiment(post_data)

            else:
                response["applicationId"] = inputjson["applicationId"]
                response["formUrl"] = inputjson["formUrl"]
                response["elementId"] = inputs["elementId"]
                output_response = jsonify(response)

                post_data = {"input_text": inputs, "output_response": response}
                db_instance = SentimentAnalysisSchema()
                result = db_instance.insert_sentiment(post_data)

                entity_response = entity_category(text, new_topics)
                if entity_response==[]:
                    pass
                else:
                    db_entity_instance = SentimentAnalysisSchema()
                    db_entity_instance.insert_entity(entity_response)
                    return output_response, HTTPStatus.OK
