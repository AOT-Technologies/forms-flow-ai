"""The forms flow API service."""

import os

from flask import Flask
from flask_cors import CORS

from . import config, models
from .models import db, ma
from .resources import API
from .utils.auth import jwt
from .utils.logging import setup_logging


setup_logging(os.path.join(os.path.abspath(
    os.path.dirname(__file__)), 'logging.conf'))  # important to do this first


def create_app(run_mode=os.getenv('FLASK_ENV', 'production')):
    """Return a configured Flask App using the Factory method."""
    app = Flask(__name__)
    CORS(app)
    app.config.from_object(config.CONFIGURATION[run_mode])

    db.init_app(app)
    ma.init_app(app)

    API.init_app(app)
    setup_jwt_manager(app, jwt)

    @app.after_request
    def add_additional_headers(response):  # pylint: disable=unused-variable
        response.headers['X-Frame-Options'] = 'DENY'
        if 'Access-Control-Allow-Origin' not in response.headers:
            response.headers['Access-Control-Allow-Origin'] = '*'
        return response

    register_shellcontext(app)

    return app


def setup_jwt_manager(app, jwt_manager):
    """Use flask app to configure the JWTManager to work for a particular Realm."""
    def get_roles(a_dict):
        return a_dict['role']  # pragma: no cover
    app.config['JWT_ROLE_CALLBACK'] = get_roles
    jwt_manager.init_app(app)


def register_shellcontext(app):
    """Register shell context objects."""
    def shell_context():
        """Shell context objects."""
        return {
            'app': app,
            'jwt': jwt,
            'db': db,
            'models': models}  # pragma: no cover

    app.shell_context_processor(shell_context)
