"""This exposes filter service."""

from flask import current_app
from formsflow_api_utils.exceptions import BusinessException
from formsflow_api_utils.utils import ADMIN_GROUP
from formsflow_api_utils.utils.user_context import UserContext, user_context

from formsflow_api.constants import BusinessErrorCode
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
    def update_payload(filter_payload):
        """Update filter payload."""
        if filter_payload.get("isMyTasksEnabled", False):
            filter_payload["criteria"]["assigneeExpression"] = "${ currentUser() }"
        if filter_payload.get("isTasksForCurrentUserGroupsEnabled", False):
            filter_payload["criteria"][
                "candidateGroupsExpression"
            ] = "${currentUserGroups()}"
        return filter_payload

    @staticmethod
    @user_context
    def create_filter(filter_payload, **kwargs):
        """Create Filter."""
        user: UserContext = kwargs["user"]
        filter_payload["tenant"] = user.tenant_key
        filter_payload["created_by"] = user.user_name
        filter_payload = FilterService.update_payload(filter_payload)
        filter_data = Filter.create_filter_from_dict(filter_payload)
        return filter_schema.dump(filter_data)

    @staticmethod
    @user_context
    def get_user_filters(**kwargs):
        """Get filters for the user."""
        user: UserContext = kwargs["user"]
        tenant_key = user.tenant_key
        # The migration script creates a default 'All Tasks' filter that is not specific to any tenant.
        # In a multi-tenant environment, verify the existence of the 'All Tasks' filter.

        # If the 'All Tasks' filter does not exist for the specific tenant, create it,
        # ensuring that the tenant-specific 'All Tasks' filter is not deleted by the tenant admin.
        if current_app.config.get("MULTI_TENANCY_ENABLED"):
            all_filters = Filter.find_all_filters()
            all_tasks_filter = any(
                (
                    item.name.lower() == "all tasks"
                    and item.status == "active"
                    and item.tenant is None
                    and (not item.roles or item.roles is None)
                    and (not item.users or item.users is None)
                )
                or (item.name.lower() == "all tasks" and item.tenant == tenant_key)
                for item in all_filters
            )

            if not all_tasks_filter:
                filter_obj = Filter(
                    name="All Tasks",
                    variables=[
                        {"name": "applicationId", "label": "Submission ID"},
                        {"name": "formName", "label": "Form Name"},
                    ],
                    status="active",
                    created_by="system",
                    created="now()",
                    criteria={},
                    users={},
                    roles={},
                    tenant=tenant_key,
                    task_visible_attributes={
                        "applicationId": True,
                        "dueDate": True,
                        "priority": True,
                        "assignee": True,
                        "taskTitle": True,
                        "createdDate": True,
                        "groups": True,
                        "followUp": True,
                    },
                )
                filter_obj.save()

        filters = Filter.find_user_filters(
            roles=user.group_or_roles,
            user=user.user_name,
            tenant=tenant_key,
            admin=ADMIN_GROUP in user.roles,
        )
        filter_data = filter_schema.dump(filters, many=True)
        default_variables = [
            {"name": "applicationId", "label": "Submission ID"},
            {"name": "formName", "label": "Form Name"},
        ]
        # User who created the filter or admin have edit permission.
        for filter_item in filter_data:
            filter_item["editPermission"] = (
                filter_item["createdBy"] == user.user_name or ADMIN_GROUP in user.roles
            )
            # Check and add default variables if not present
            filter_item["variables"] = filter_item["variables"] or []
            filter_item["variables"] += [
                var for var in default_variables if var not in filter_item["variables"]
            ]
        return filter_data

    @staticmethod
    @user_context
    def get_filter_by_id(filter_id, **kwargs):
        """Get filter by filter id."""
        user: UserContext = kwargs["user"]
        tenant_key = user.tenant_key
        filter_result = Filter.find_active_filter_by_id(
            filter_id=filter_id,
            roles=user.group_or_roles,
            user=user.user_name,
            tenant=tenant_key,
            admin=ADMIN_GROUP in user.roles,
        )
        if filter_result:
            return filter_result
        raise BusinessException(BusinessErrorCode.FILTER_NOT_FOUND)

    @staticmethod
    @user_context
    def mark_inactive(filter_id, **kwargs):
        """Mark filter as inactive."""
        user: UserContext = kwargs["user"]
        tenant_key = user.tenant_key
        filter_result = Filter.find_active_auth_filter_by_id(
            filter_id=filter_id,
            user=user.user_name,
            admin=ADMIN_GROUP in user.roles,
        )
        if filter_result:
            if (
                tenant_key is not None
                and filter_result.tenant != tenant_key
                and filter_result.tenant is not None
            ):
                raise PermissionError("Tenant authentication failed.")
            filter_result.mark_inactive()
        else:
            raise BusinessException(BusinessErrorCode.FILTER_NOT_FOUND)

    @staticmethod
    @user_context
    def update_filter(filter_id, filter_data, **kwargs):
        """Update Filter."""
        user: UserContext = kwargs["user"]
        tenant_key = user.tenant_key
        filter_data["modified_by"] = user.user_name
        filter_result = Filter.find_active_auth_filter_by_id(
            filter_id=filter_id,
            user=user.user_name,
            admin=ADMIN_GROUP in user.roles,
        )

        if filter_result:
            if (
                tenant_key is not None
                and filter_result.tenant != tenant_key
                and filter_result.tenant is not None
            ):
                raise PermissionError("Tenant authentication failed.")
            filter_data = FilterService.update_payload(filter_data)
            filter_result.update(filter_data)
            return filter_result
        raise BusinessException(BusinessErrorCode.FILTER_NOT_FOUND)
