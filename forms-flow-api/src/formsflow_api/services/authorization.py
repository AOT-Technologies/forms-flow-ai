"""This exposes authorization service."""
import datetime
from typing import Dict, List

from formsflow_api.models import Authorization, AuthType
from formsflow_api.schemas import ApplicationSchema
from formsflow_api.utils.user_context import UserContext, user_context

application_schema = ApplicationSchema()


class AuthorizationService:
    """This class manages authorization service."""

    @user_context
    def get_authorizations(self, auth_type: str, **kwargs) -> List[Dict]:
        """Return authorizations."""
        response: List[Dict] = []
        user: UserContext = kwargs["user"]
        auth_type = AuthType(auth_type)

        authz = Authorization.find_all_authorizations(
            auth_type=auth_type, tenant=user.tenant_key
        )
        for auth in authz:
            response.append(self._as_dict(auth))
        return response

    @user_context
    def get_user_authorizations(self, auth_type: str, **kwargs) -> List[Dict]:
        """Return authorizations for the user."""
        response: List[Dict] = []
        user: UserContext = kwargs["user"]
        auth_type = AuthType(auth_type)

        authz = Authorization.find_user_authorizations(
            auth_type=auth_type,
            roles=user.group_or_roles,
            user_name=user.user_name,
            tenant=user.tenant_key,
        )
        for auth in authz:
            response.append(self._as_dict(auth))
        return response

    def _as_dict(self, auth):
        return {
            "resourceId": auth.resource_id,
            "resourceDetails": auth.resource_details,
            "roles": auth.roles,
        }

    @user_context
    def is_dashboard_authorized(self, resource_id: str, **kwargs) -> bool:
        """Return if user is authorized to access the resource."""
        user: UserContext = kwargs["user"]
        auth: Authorization = Authorization.find_resource_authorization(
            auth_type=AuthType.DASHBOARD,
            roles=user.group_or_roles,
            user_name=user.user_name,
            tenant=user.tenant_key,
            resource_id=resource_id,
        )
        return auth is not None and len(auth) > 0

    @user_context
    def create_authorization(
        self, auth_type: str, resource: Dict[str, str], **kwargs
    ) -> Dict[str, any]:
        """Create authorization record."""
        user: UserContext = kwargs["user"]
        auth_type_enum = AuthType(auth_type)
        auth = Authorization.find_resource_by_id(
            auth_type=auth_type_enum,
            resource_id=resource.get("resourceId"),
            user_name=user.user_name,
            tenant=user.tenant_key,
        )
        roles = resource.get("roles")
        if auth:
            auth.roles = roles
            auth.resource_details = resource.get("resourceDetails")
            auth.modified = datetime.datetime.now()
            auth.modified_by = user.user_name
        else:
            auth: Authorization = Authorization(
                tenant=user.tenant_key,
                auth_type=AuthType(auth_type),
                resource_id=resource.get("resourceId"),
                resource_details=resource.get("resourceDetails"),
                roles=resource.get("roles"),
                user_name=resource.get("userName"),
                created=datetime.datetime.now(),
                created_by=user.user_name,
            )
        auth = auth.save()
        return self._as_dict(auth)
