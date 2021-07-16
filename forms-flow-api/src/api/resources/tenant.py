# """API endpoints for managing tenant resource."""

# from http import HTTPStatus

# from flask import jsonify
# from flask_restx import Namespace, Resource

# from ..exceptions import BusinessException
# from ..services import TenantService
# from ..utils.util import cors_preflight


# API = Namespace("Tenant", description="Tenant")


# @cors_preflight("GET,OPTIONS")
# @API.route("", methods=["GET", "OPTIONS"])
# class TenantsResource(Resource):
#     """Resource for managing tenants."""

#     @staticmethod
#     def get():
#         """Get tenants."""
#         return jsonify({"tenants": TenantService.get_all()}), HTTPStatus.OK


# @cors_preflight("GET,OPTIONS")
# @API.route("/<int:tenant_id>", methods=["GET", "OPTIONS"])
# class TenantResource(Resource):
#     """Resource for managing tenant."""

#     @staticmethod
#     def get(tenant_id):
#         """Get tenant by id."""
#         try:
#             return TenantService.get_by_id(tenant_id), HTTPStatus.OK
#         except BusinessException as err:
#             return err.error, err.status_code
