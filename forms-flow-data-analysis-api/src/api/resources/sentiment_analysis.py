"""API definition for sentiment analysis module."""
import logging
from http import HTTPStatus

from flask import jsonify, request
from flask_restx import Namespace, Resource, cors

from api.services.sentiment_analysis import sentiment_analysis_pipeline
from api.services.store_sentiment_result import save_sentiment_result
from api.utils import auth, cors_preflight

API = Namespace("sentiment", description="API endpoint for sentiment analysis")


@cors_preflight("POST,OPTIONS")
@API.route("", methods=["POST", "OPTIONS"])
class SentimentAnalysisResource(Resource):
    """Resource for generating Sentiment Analysis."""

    @staticmethod
    @cors.crossdomain(origin="*", headers=["Content-Type", "Authorization"])
    @auth.require
    def post():
        """POST API definition for sentiment analysis API."""
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
                new_topics = [t.lower() for t in topics]
                response = sentiment_analysis_pipeline(text=text, topics=new_topics)
                response["elementId"] = data["elementId"]
                response["applicationId"] = input_json["applicationId"]
                response["formUrl"] = input_json["formUrl"]
                response_json["data"].append(dict(response))
                # function used to store entries to database
                save_sentiment_result(
                    input_text=text,
                    overall_sentiment=response["overall_sentiment"],
                    output_response=response,
                )
            return jsonify(response_json), HTTPStatus.CREATED

        except BaseException as err:  # pylint: disable=broad-except
            response, status = {
                "type": "Bad Request Error",
                "message": "Invalid request object passed passed",
            }, HTTPStatus.BAD_REQUEST
            logging.info(response)
            logging.info(err)

            return response, status
