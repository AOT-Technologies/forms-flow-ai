"""" API endpoints for sentiment analysis """
import logging

import sys, traceback

from http import HTTPStatus

from flask import g, jsonify, request
from flask_restx import Namespace, Resource, cors

from pymongo.errors import ConnectionFailure
from ..schemas import SentimentAnalysisSchema
from ..services import SentimentAnalyserService

from api.utils.util import cors_preflight
from api.utils.constants import CORS_ORIGINS


API = Namespace("sentiment", description="API endpoint for sentiment analysis")


@cors_preflight("POST,OPTIONS")
@API.route("", methods=["POST", "OPTIONS"])
class SentimentAnalysisResource(Resource):
    """Resource for generating Sentiment Analysis"""

    @staticmethod
    @cors.crossdomain(origin=CORS_ORIGINS, max_age=21600)
    # @auth.require
    def post():
        try:
            input_json = request.get_json()
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
                try:
                    db_instance = SentimentAnalysisSchema()
                    db_instance.insert_sentiment(sentiment_object=post_data)
                except ConnectionFailure:
                    response, status = {
                        "message": "Server selection time out",
                    }, HTTPStatus.BAD_REQUEST
                    logging.info(response)
                    return response, status

            return jsonify(response_json), HTTPStatus.OK
        except KeyError as err:
            exc_traceback = sys.exc_info()
            response, status = (
                {
                    "type": "Invalid Request Object",
                    "message": "The required fields of Input request like - applicationId, form_url, data[]  are not passed",
                },
                HTTPStatus.BAD_REQUEST,
            )
            logging.info(response)
            logging.info(err)
            # traceback.print_tb(exc_traceback)
            return response, status

        except BaseException as err:
            exc_traceback = sys.exc_info()
            response, status = {
                "type": "Bad Request Error",
                "message": "Invalid request object passed passed",
            }, HTTPStatus.BAD_REQUEST
            logging.info(response)
            logging.info(err)

            # traceback.print_tb(exc_traceback)
            return response, status
