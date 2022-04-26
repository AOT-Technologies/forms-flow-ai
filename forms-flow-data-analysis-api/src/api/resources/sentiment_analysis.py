"""API definition for sentiment analysis module."""
import logging
import os
from http import HTTPStatus

from flask import jsonify, request
from flask_restx import Namespace, Resource, cors

from api import config
from api.services.store_sentiment_result import save_sentiment_result
from api.services.transformers import sentiment_analysis_pipeline_transformers
from api.utils import Service, auth, cors_preflight

API = Namespace("sentiment", description="API endpoint for sentiment analysis")

APP_CONFIG = config.get_named_config(os.getenv("DEPLOYMENT_ENV", "production"))


@cors_preflight("POST,OPTIONS")
@API.route("", methods=["POST", "OPTIONS"])
class SentimentAnalysisTransformerResource(Resource):
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
                text = data["text"]
                response = sentiment_analysis_pipeline_transformers(text)
                response["elementId"] = data["elementId"]
                response["applicationId"] = input_json["applicationId"]
                response["formUrl"] = input_json["formUrl"]
                response_json["data"].append(dict(response))
                # function used to store entries to database
                if APP_CONFIG.DATABASE_SUPPORT == Service.ENABLED.value:
                    save_sentiment_result(
                        input_text=text,
                        overall_sentiment=response["overall_sentiment"],
                        output_response=response,
                    )
                    return jsonify(response_json), HTTPStatus.CREATED
                return jsonify(response_json), HTTPStatus.OK

        except BaseException as err:  # pylint: disable=broad-except # noqa: B902
            response, status = {
                "type": "Bad Request Error",
                "message": "Invalid request object passed passed",
            }, HTTPStatus.BAD_REQUEST
            logging.info(response)
            logging.info(err)

            return response, status
