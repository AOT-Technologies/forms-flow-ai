from flask_restplus import Api
from flask import Blueprint,Flask,flash

from .main.service import _init__


blueprint = Blueprint('api', __name__)

api = Api(blueprint,
          title='FORMIO API',
          version='1.0',
          description='FormIO web service'
          )
          
_init__.init_endpoints(api)

