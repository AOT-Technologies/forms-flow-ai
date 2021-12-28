# """This exposes tenant service."""

# from http import HTTPStatus

# from ..exceptions import BusinessException
# from ..models import Tenant
# from ..schemas import TenantSchema


# class TenantService:
#     """This class manages tenant service."""

#     @staticmethod
#     def get_all():
#         """Get tenants."""
#         tenants = Tenant.find_all()
#         tenant_schema = TenantSchema(only=("id", "tenant_name"))
#         return tenant_schema.dump(tenants, many=True)

#     @staticmethod
#     def get_by_id(tenant_id):
#         """Get tenant by id."""
#         tenant = Tenant.find_by_id(tenant_id)
#         if tenant:
#             tenant_schema = TenantSchema()
#             return tenant_schema.dump(tenant)

#         raise BusinessException("Invalid tenant", HTTPStatus.BAD_REQUEST)
