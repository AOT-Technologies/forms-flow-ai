"""The forms flow API service."""

import os

from flask import Flask
from flask_migrate import Migrate

from . import config, models
from .models import db, ma
from .resources import data_analysis_api
from .utils.auth import jwt
from .utils.logging import setup_logging

setup_logging(os.path.join(os.path.abspath(
    os.path.dirname(__file__)), 'logging.conf'))  # important to do this first


def create_app(run_mode=os.getenv('FLASK_ENV', 'production')):
    """Return a configured Flask App using the Factory method."""
    app = Flask(__name__)
    app.config.from_object(config.CONFIGURATION[run_mode])

    db.init_app(app)
    ma.init_app(app)
    migrate = Migrate(app, db)

    data_analysis_api.init_app(app)
    setup_jwt_manager(app, jwt)

    @app.after_request
    def add_additional_headers(response):  # pylint: disable=unused-variable
        response.headers['X-Frame-Options'] = 'DENY'
        return response

    register_shellcontext(app)
    # init_trained_model(app)

    return app


def setup_jwt_manager(app, jwt_manager):
    """Use flask app to configure the JWTManager to work for a particular Realm."""

    def get_roles(a_dict):
        return a_dict['resource_access'][app.config['JWT_OIDC_AUDIENCE']]['roles']

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


# def init_trained_model(app):
#     from api.models.pg import preset

#     preset.create()
#     preset.load_model()
