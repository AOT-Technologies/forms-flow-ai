import datetime

import jwt
import os

from ..common.responses import errorResponse
from ..models.formio_token import FormIOToken
from .dboperations import save_changes

class FormIOTokenService():
    """This class manages application service."""

    @staticmethod
    def get_formio_token():
        try:
            # userDetails = get_token_details()
            formioToken = generate_formio_token()
            new_formiotoken = FormIOToken(
                keycloak_role="userDetails['given_name']",
                formio_token=formioToken,
                formio_role='',
                created_on=datetime.datetime.utcnow(),
            )
            print(new_formiotoken)
            save_changes(new_formiotoken)
            return FormIOToken.query.last()
        except Exception as e:
            return errorResponse()


    def generate_formio_token():
        """Generate Auth Token.

        :return: string
        """
        try:
            sec_key = os.getenv('SECRET_KEY')
            payload = {
                'form': {'_id': '5e8eb76190b24438847463c8'},
                'user': {'_id': 'anonymous', 'roles': ['5e8eb76190b24438847463c7']}
            }

            auth_key = jwt.encode(
                payload,
                sec_key,
                algorithm='HS256'
            )
            return auth_key

        except Exception as e:
            return e
