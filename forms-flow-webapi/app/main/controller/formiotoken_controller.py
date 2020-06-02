from flask import request
from flask_restplus import Resource

from ..utils.dto import FormIOTokenDto
from ..common.responses import response
from ..service.formiotoken_service import get_formio_token
from ..common.authentication import verify_auth_token

api = FormIOTokenDto.api
_token = FormIOTokenDto.token



@api.route('/')
class ApplicationList(Resource):
    @api.response(response().error_code, response().error_message)
    @api.response(response().notfound_code, response().notfound_message)
    @api.doc('formio token data')
    @api.marshal_with(_token)
    def get(self):
        """Get formio token"""
        if verify_auth_token() == True:
            return get_formio_token()
        else:
            return verify_auth_token()

