"""Initialize forms flow DataAnalysis-API and associated dependencies."""

import os
import threading

from flask import Flask
from transformers import pipeline

from . import config, models
from .models import db, migrate
from .resources import data_analysis_api
from .utils.auth import jwt
from .utils.logging import log_info, setup_logging

setup_logging(
    os.path.join(os.path.abspath(os.path.dirname(__file__)), "logging.conf")
)  # important to do this first

API_CONFIG = config.get_named_config(os.getenv("FLASK_ENV", "production"))


class LoadModel:  # pylint: disable=too-few-public-methods
    """Manages the model."""

    classifier = None
    model_id = API_CONFIG.MODEL_ID

    @classmethod
    def preload_models(cls):
        """Function to load the fine-tuned transformer model."""
        cls.classifier = pipeline(
            "sentiment-analysis", model=cls.model_id, truncation=True
        )
        return 0


def create_app(run_mode=os.getenv("FLASK_ENV", "production")):
    """Return a configured Flask App using the Factory method."""
    app = Flask(__name__)
    app.config.from_object(config.CONFIGURATION[run_mode])

    db.init_app(app)
    migrate.init_app(app, db)

    data_analysis_api.init_app(app)
    setup_jwt_manager(app, jwt)

    @app.after_request
    def add_additional_headers(response):  # pylint: disable=unused-variable
        response.headers["X-Frame-Options"] = "DENY"
        return response

    register_shellcontext(app)
    preloading = threading.Thread(target=LoadModel.preload_models)
    preloading.start()
    log_info("Model is loading...")
    preloading.join()
    log_info("Model loading complete.")
    app.classifier = LoadModel.classifier
    return app


def setup_jwt_manager(app, jwt_manager):
    """Use flask app to configure the JWTManager to work for a particular Realm."""

    def get_roles(a_dict):
        return a_dict["resource_access"][app.config["JWT_OIDC_AUDIENCE"]]["roles"]

    app.config["JWT_ROLE_CALLBACK"] = get_roles
    jwt_manager.init_app(app)


def register_shellcontext(app):
    """Register shell context objects."""

    def shell_context():
        """Shell context objects."""
        return {"app": app, "jwt": jwt, "db": db, "models": models}  # pragma: no cover

    app.shell_context_processor(shell_context)
