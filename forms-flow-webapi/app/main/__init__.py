from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_marshmallow import Marshmallow
from flask_bcrypt import Bcrypt
from flask import Blueprint
from flask_restful import request,Api

from config import config_by_name
from .common import authentication

db = SQLAlchemy()
ma = Marshmallow()
flask_bcrypt = Bcrypt()

api_bp = Blueprint('api', __name__)
api = Api(api_bp)

def create_app(config_name):
    app = Flask(__name__)
    app.config.from_object(config_by_name[config_name])
    db.init_app(app)
    flask_bcrypt.init_app(app)

    def before_my_blueprint():
        ret = authentication.verify_auth_token()
        return ret

    app.before_request_funcs = {
        # blueprint name: [list_of_functions]
        #'api': [before_my_blueprint]
}
    return app