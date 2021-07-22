import logging
from http import HTTPStatus
from flask import jsonify, request
from flask_restx import Resource, Namespace
from ..utils.util import cors_preflight
from ..services.sentiment_analysis import SentimentAnalyserService

API = Namespace("sentiment", description="API endpoint for sentiment analysis")

@cors_preflight("POST,OPTIONS")
@API.route("", methods=["POST", "OPTIONS"])
class SentimentAnalysisResource(Resource):
    """Resource for generating Sentiment Analysis"""
    @staticmethod
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

            return jsonify(response_json), HTTPStatus.OK
        except KeyError as err:
            response, status = (
                {
                    "type": "Invalid Request Object",
                    "message": "The required fields of Input request like - applicationId, form_url, data[]  are not passed",
                },
                HTTPStatus.BAD_REQUEST,
            )
            logging.info(response)
            logging.info(err)
            return response, status

        except BaseException as err:
            response, status = {
                "type": "Bad Request Error",
                "message": "Invalid request object passed passed",
            }, HTTPStatus.BAD_REQUEST
            logging.info(response)
            logging.info(err)

            return response, status