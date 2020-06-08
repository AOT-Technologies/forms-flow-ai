from flask_restplus import Resource

from ..common.responses import response
from ..services.formiotoken_service import get_formio_token
from ..utils.dto import FormIOTokenDto


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
        return get_formio_token()
