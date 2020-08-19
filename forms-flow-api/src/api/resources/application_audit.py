"""API endpoints for managing process resource."""

from http import HTTPStatus

from flask import jsonify, request
from flask_restx import Namespace, Resource, cors

from ..schemas import ApplicationAuditReqSchema
from ..services import ApplicationAuditService
from ..utils.auth import auth
from ..utils.util import cors_preflight


API = Namespace('ApplicationAudit', description='ApplicationAudit')


@cors_preflight('GET,OPTIONS')
@API.route('', methods=['GET', 'POST', 'OPTIONS'])
class ApplicationAuditResource(Resource):
    """Resource for managing state."""

    @staticmethod
    @cors.crossdomain(origin='*')
    @auth.require
    def get():
        """Get application histry."""
        dict_data = ApplicationAuditReqSchema().load(request.args)
        application_id = dict_data['application_id']
        return jsonify({
            'applications': ApplicationAuditService.get_application_history(application_id)
        }), HTTPStatus.OK
