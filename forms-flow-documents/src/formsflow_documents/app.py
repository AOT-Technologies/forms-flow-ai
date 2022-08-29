"""App initialization.

Initialize app and the dependencies.
"""

import json
import logging
import os
from http import HTTPStatus

from flask import Flask, current_app, g, request
from flask.logging import default_handler
from formsflow_api_utils.utils import (ALLOW_ALL_ORIGINS, CORS_ORIGINS,
                                       FORMSFLOW_API_CORS_ORIGINS,
                                       CustomFormatter, cache, jwt,
                                       setup_logging, translate)
from formsflow_api_utils.utils.startup import (collect_role_ids,
                                               collect_user_resource_ids,
                                               setup_jwt_manager)
from werkzeug.middleware.proxy_fix import ProxyFix

from formsflow_documents import config
from formsflow_documents.resources import API


def create_app(run_mode=os.getenv("FLASK_ENV", "production")):
    """Return a configured Flask App using the Factory method."""
    app = Flask(__name__)
    app.wsgi_app = ProxyFix(app.wsgi_app)
    app.config.from_object(config.CONFIGURATION[run_mode])
    app.logger.removeHandler(default_handler)

    flask_logger = setup_logging(
        os.path.join(os.path.abspath(os.path.dirname(__file__)), "logging.conf")
    )  # important to do this first
    logging.config.fileConfig(
        os.path.join(os.path.abspath(os.path.dirname(__file__)), "logging.conf")
    )
    app.logger = flask_logger
    app.logger = logging.getLogger("app")
    logs = logging.StreamHandler()

    logs.setFormatter(CustomFormatter())
    app.logger.handlers = [logs]
    app.logger.propagate = False
    logging.log.propagate = False
    with open("logo.txt") as file:  # pylint: disable=unspecified-encoding
        contents = file.read()
        print(contents)
    app.logger.info("Welcome to formsflow-export-API server...!")
    cache.init_app(app)

    API.init_app(app)
    setup_jwt_manager(app, jwt)

    @app.after_request
    def cors_origin(response):  # pylint: disable=unused-variable
        if FORMSFLOW_API_CORS_ORIGINS == ALLOW_ALL_ORIGINS:
            response.headers["Access-Control-Allow-Origin"] = ALLOW_ALL_ORIGINS
        else:
            for url in CORS_ORIGINS:
                assert request.headers["Host"]
                if request.headers.get("Origin"):
                    response.headers["Access-Control-Allow-Origin"] = request.headers[
                        "Origin"
                    ]
                elif url.find(request.headers["Host"]) != -1:
                    response.headers["Access-Control-Allow-Origin"] = url
        return response

    @app.after_request
    def add_additional_headers(response):  # pylint: disable=unused-variable
        response.headers["X-Frame-Options"] = "DENY"
        return response

    @app.after_request
    def translate_response(response):  # pylint: disable=unused-variable
        """Select the client specific language from the token locale attribute."""
        try:
            if response.status_code in [
                HTTPStatus.BAD_REQUEST,
                HTTPStatus.UNAUTHORIZED,
                HTTPStatus.FORBIDDEN,
                HTTPStatus.NOT_FOUND,
            ]:
                lang = g.token_info["locale"]
                if lang == "en":
                    return response
                json_response = response.get_json()
                translated_response = translate(lang, json_response)
                str_response = json.dumps(translated_response)
                response.set_data(str_response)
            return response
        except KeyError as err:
            current_app.logger.warning(err)
            return response
        except Exception as err:  # pylint: disable=broad-except
            current_app.logger.critical(err)
            return response

    register_shellcontext(app)
    if not app.config["MULTI_TENANCY_ENABLED"]:
        with app.app_context():
            collect_role_ids(app)
            collect_user_resource_ids(app)
    return app


def register_shellcontext(app):
    """Register shell context objects."""

    def shell_context():
        """Shell context objects."""
        return {"app": app, "jwt": jwt}  # pragma: no cover

    app.shell_context_processor(shell_context)
