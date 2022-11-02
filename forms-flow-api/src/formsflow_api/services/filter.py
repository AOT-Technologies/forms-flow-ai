"""This exposes filter service."""

from http import HTTPStatus

from formsflow_api_utils.exceptions import BusinessException
from formsflow_api_utils.utils.user_context import UserContext, user_context

from formsflow_api.models import Filter
from formsflow_api.schemas import FilterSchema

filter_schema = FilterSchema()


class FilterService:
    """This class manages filter service."""

    @staticmethod
    @user_context
    def get_all_filters(**kwargs):
        """Return filters."""
        user: UserContext = kwargs["user"]
        filters = Filter.find_all_active_filters(tenant=user.tenant_key)
        return filter_schema.dump(filters, many=True)

    @staticmethod
    @user_context
    def create_filter(filter_payload, **kwargs):
        """Create Filter."""
        user: UserContext = kwargs["user"]
        filter_payload["tenant"] = user.tenant_key
        filter_payload["created_by"] = user.user_name
        filter_data = Filter.create_filter_from_dict(filter_payload)
        return filter_schema.dump(filter_data)

    @staticmethod
    @user_context
    def get_user_filters(**kwargs):
        """Get filters for the user."""
        user: UserContext = kwargs["user"]
        filters = Filter.find_user_filters(
            roles=user.group_or_roles, user=user.user_name, tenant=user.tenant_key
        )
        return filter_schema.dump(filters, many=True)

    @staticmethod
    @user_context
    def get_filter_by_id(filter_id, **kwargs):
        """Get filter by filter id."""
        user: UserContext = kwargs["user"]
        tenant_key = user.tenant_key
        filter_result = Filter.find_active_filter_by_id(filter_id=filter_id)
        if filter_result:
            if tenant_key is not None and filter_result.tenant != tenant_key:
                raise PermissionError("Tenant authentication failed.")
            return filter_result
        raise BusinessException(
            {
                "type": "Invalid response data",
                "message": ("Unable to get FilterId -" f"{filter_id}."),
            },
            HTTPStatus.BAD_REQUEST,
        )

    @staticmethod
    @user_context
    def mark_inactive(filter_id, **kwargs):
        """Mark filter as inactive."""
        user: UserContext = kwargs["user"]
        tenant_key = user.tenant_key
        filter_result = Filter.find_active_filter_by_id(filter_id=filter_id)
        if filter_result:
            if tenant_key is not None and filter_result.tenant != tenant_key:
                raise PermissionError("Tenant authentication failed.")
            filter_result.mark_inactive()
        else:
            raise BusinessException(
                {
                    "type": "Invalid response data",
                    "message": ("Unable to set FilterId -" f"{filter_id} inactive"),
                },
                HTTPStatus.BAD_REQUEST,
            )

    @staticmethod
    @user_context
    def update_filter(filter_id, filter_data, **kwargs):
        """Update Filter."""
        user: UserContext = kwargs["user"]
        tenant_key = user.tenant_key
        filter_data["modified_by"] = user.user_name
        filter_result = Filter.find_active_filter_by_id(filter_id=filter_id)

        if filter_result:
            if tenant_key is not None and filter_result.tenant != tenant_key:
                raise PermissionError("Tenant authentication failed.")
            filter_result.update(filter_data)
            return filter_result
        raise BusinessException(
            {
                "type": "Invalid response data",
                "message": ("Unable to update FilterId -" f"{filter_id}"),
            },
            HTTPStatus.BAD_REQUEST,
        )
