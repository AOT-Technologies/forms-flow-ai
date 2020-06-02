import datetime
import jwt
import json
from marshmallow import Schema
import os

from app.main import db
from ..model.formiotoken import FormIOToken
from ..common.responses import response, successResponse, errorResponse, nodataResponse
from .dboperations import save_changes
from ..common.authentication import get_token_details

def get_formio_token():
    try:
        #userDetails = get_token_details()
        formioToken = generate_formio_token()
        new_formiotoken = FormIOToken(
            keycloak_role = "userDetails['given_name']",
            formio_token = formioToken,
            formio_role = '',
            created_on = datetime.datetime.utcnow(),
        )
        print (new_formiotoken)
        save_changes(new_formiotoken)
        return FormIOToken.query.last()
    except Exception as e:
        return errorResponse()

def generate_formio_token():
    """
    Generates the Auth Token
    :return: string
    """
    try:
        sec_key = os.getenv('SECRET_KEY')
        payload = {
            'form': {'_id':'5e8eb76190b24438847463c8'},
            'user': {'_id':'anonymous','roles':['5e8eb76190b24438847463c7']}
        }
       
        auth_key =  jwt.encode(
            payload,
            sec_key,
            algorithm='HS256'
        )
        return auth_key
    
    except Exception as e:
        return e
