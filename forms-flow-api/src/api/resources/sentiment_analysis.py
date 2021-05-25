"""" API endpoints for sentiment analysis """
from http import HTTPStatus

from flask import g, jsonify, request
from flask_pymongo import PyMongo
from flask_restx import Namespace, Resource, cors

from ..exceptions import BusinessException
from ..models import mongo
from ..schemas import SentimentAnalysisSchema
from ..services import SentimentAnalyserService, entity_category

# from ..utils.auth import auth
from ..utils.util import cors_preflight
import json


API = Namespace("sentiment", description="API endpoint for sentiment analysis")


@cors_preflight("POST,OPTIONS")
@API.route("", methods=["POST", "OPTIONS"])
class SentimentAnalysisResource(Resource):
    """Resource for generating Sentiment Analysis"""

    @staticmethod
    @cors.crossdomain(origin="*")
    # @auth.require
    def post():
        input_json = request.get_json()
        try:
            response_json = dict(
                application_id=input_json["applicationId"],
                form_url=input_json["formUrl"],
                data=[],
            )

            for data in input_json["data"]:
                text = data["text"].lower()
                topics = data["topics"]
                data_input = dict(elementId=data["elementId"], topics=topics, text=text)

                # processing topics in ML model format
                new_topics = [t.lower() for t in topics]

                response = SentimentAnalyserService.sentiment_pipeline(
                    text=text, topics=new_topics
                )
                response["elementId"] = data["elementId"]

                response_json["data"].append(dict(response))
                response["applicationId"] = input_json["applicationId"]
                response["formUrl"] = input_json["formUrl"]
                post_data = {"input_text": data_input, "output_response": response}
                db_instance = SentimentAnalysisSchema()
                db_instance.insert_sentiment(sentiment_object=post_data)

            return jsonify(response_json), HTTPStatus.OK

        except KeyError as err:
            return (
                "The required fields of Input request are not passed",
                HTTPStatus.BAD_REQUEST,
            )

        except BusinessException as err:
            return err.error, err.status_code
