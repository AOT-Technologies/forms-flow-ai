"""App initialization.

Initialize app and the dependencies.
"""
import json
import logging
import os
from http import HTTPStatus

from flask import Flask, current_app, g, request
from flask.logging import default_handler
from werkzeug.middleware.proxy_fix import ProxyFix

from formsflow_api import config, models
from formsflow_api.models import db, ma
from formsflow_api.resources import API
from formsflow_api.utils import (
    ALLOW_ALL_ORIGINS,
    CORS_ORIGINS,
    FORMSFLOW_API_CORS_ORIGINS,
    CustomFormatter,
    jwt,
    setup_logging,
    translate,
)


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
    app.logger.info("Welcome to formsflow-API server...!")
    db.init_app(app)
    ma.init_app(app)

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

    return app


def setup_jwt_manager(app, jwt_manager):
    """Use flask app to configure the JWTManager to work for a particular Realm."""

    def get_roles(a_dict):
        resource = a_dict["resource_access"].get(app.config["JWT_OIDC_AUDIENCE"])
        return resource["roles"] if resource else a_dict["roles"]

    app.config["JWT_ROLE_CALLBACK"] = get_roles
    jwt_manager.init_app(app)


def register_shellcontext(app):
    """Register shell context objects."""

    def shell_context():
        """Shell context objects."""
        return {"app": app, "jwt": jwt, "db": db, "models": models}  # pragma: no cover

    app.shell_context_processor(shell_context)
