"""API definition for sentiment analysis module."""
import os
from http import HTTPStatus

from flask import current_app, jsonify, request
from flask_restx import Namespace, Resource, cors, fields

from api import config
from api.services.store_sentiment_result import save_sentiment_result
from api.services.transformers import sentiment_analysis_pipeline_transformers
from api.utils import Service, auth, cors_preflight

API = Namespace("SentimentAnalysis", description="API endpoint for sentiment analysis.")

APP_CONFIG = config.get_named_config(os.getenv("DEPLOYMENT_ENV", "production"))


sentiment_data_model = API.model(
    "SentimentData",
    {
        "text": fields.String(description="Input Text for sentiment analysis."),
        "elementId": fields.String(),
    },
)

request_model = API.model(
    "RequestModel",
    {
        "applicationId": fields.String(),
        "formUrl": fields.String(),
        "data": fields.List(fields.Nested(sentiment_data_model)),
    },
)

response_sentiment_data_model = API.inherit(
    "ResponseSentimentData",
    sentiment_data_model,
    {
        "formUrl": fields.String(),
        "overallSentiment": fields.String(description="Overall sentiment of the input text."),
    },
)

response_model = API.model(
    "ResponseModel",
    {
        "applicationId": fields.String(),
        "formUrl": fields.String(),
        "data": fields.List(fields.Nested(response_sentiment_data_model)),
    },
)

@cors_preflight("POST,OPTIONS")
@API.route("", methods=["POST", "OPTIONS"])
class SentimentAnalysisTransformerResource(Resource):
    """Resource for generating Sentiment Analysis."""

    @staticmethod
    @cors.crossdomain(origin="*", headers=["Content-Type", "Authorization"])
    @auth.require
    @API.doc(
        responses={
            200: "OK:- Successful request.",
            400: "BAD_REQUEST:- Invalid request.",
            401: "UNAUTHORIZED:- Authorization header not provided or an invalid token passed.",
        },
        model=response_model
    )
    @API.expect(request_model)
    def post():
        """Returns the sentiment (positive, negative, or neutral) for the given text in the request body."""
        try:
            input_json = request.get_json()
            response_json = {
                "applicationId": input_json["applicationId"],
                "formUrl": input_json["formUrl"],
                "data": [],
            }
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
                        overall_sentiment=response["overallSentiment"],
                        output_response=response,
                    )
                    return jsonify(response_json), HTTPStatus.CREATED
                return jsonify(response_json), HTTPStatus.OK

        except BaseException as err:  # pylint: disable=broad-except # noqa: B902
            response, status = {
                "type": "Bad Request Error",
                "message": "Invalid request object passed passed",
            }, HTTPStatus.BAD_REQUEST
            current_app.logger.warning(response)
            current_app.logger.warning(err)

            return response, status
