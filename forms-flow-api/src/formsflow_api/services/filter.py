"""This exposes filter service."""

from flask import current_app
from formsflow_api_utils.exceptions import BusinessException
from formsflow_api_utils.utils import MANAGE_ALL_FILTERS
from formsflow_api_utils.utils.user_context import UserContext, user_context

from formsflow_api.constants import (
    STATIC_TASK_FILTER_VARIABLES,
    BusinessErrorCode,
)
from formsflow_api.models import Filter, FilterPreferences, FilterType, User
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
    def get_filters_by_user_filter_preference(
        user_name, group_or_roles, tenant_key, filter_type, parent_filter_id=None
    ):
        """Get filters by user filter preference."""
        current_app.logger.debug("Fetching filters by filter preference table..")
        # fetch data from filter preference table
        filter_preference = FilterPreferences.get_filters_by_user_id(
            user_name, tenant_key, filter_type, group_or_roles, parent_filter_id
        )
        # Extract existing filter IDs to avoid redundant fetching from the filter table.
        # The `existing_filters` variable will store the result, containing filters
        existing_filter_ids = []
        existing_filters = []
        if filter_preference:
            for preference_data in filter_preference:
                existing_filter_ids.append(preference_data.filter_id)
                # adding filter_preference sort order to filter data
                preference_data.filter.sort_order = preference_data.sort_order
                preference_data.filter.hide = preference_data.hide
                existing_filters.append(preference_data.filter)
        current_app.logger.debug("Existing filter IDs: %s", existing_filter_ids)
        filters = Filter.find_user_filters(
            roles=group_or_roles,
            user=user_name,
            tenant=tenant_key,
            exclude_ids=existing_filter_ids,
            filter_type=filter_type,
            parent_filter_id=parent_filter_id,
        )
        # Merging existing filters with the remaining data.
        all_filters = [*existing_filters, *filters]
        filter_data = filter_schema.dump(all_filters, many=True)

        for filter_item in filter_data:
            filter_item["variables"] = filter_item["variables"] or []
            filter_item["sortOrder"] = filter_item.get("sortOrder", None)
            filter_item["hide"] = filter_item.get("hide", False)
        return filter_data

    @staticmethod
    @user_context
    def get_user_filters(**kwargs):  # pylint: disable=too-many-locals
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
                    variables=STATIC_TASK_FILTER_VARIABLES,
                    status="active",
                    created_by="system",
                    created="now()",
                    criteria={
                        "candidateGroupsExpression": "${currentUserGroups()}",
                        "includeAssignedTasks": True,
                    },
                    users={},
                    roles={},
                    tenant=tenant_key,
                )
                filter_obj.save()
        filter_data = FilterService.get_filters_by_user_filter_preference(
            user_name=user.user_name,
            group_or_roles=user.group_or_roles,
            tenant_key=tenant_key,
            filter_type=FilterType.TASK,
        )
        response = {"filters": filter_data}
        # get user default filter
        user_data = User.get_user_by_user_name(user_name=user.user_name)
        response["defaultFilter"] = user_data.default_filter if user_data else None
        return response

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
        )
        if filter_result:
            response = filter_schema.dump(filter_result)
            attribute_filters = FilterService.get_filters_by_user_filter_preference(
                user_name=user.user_name,
                group_or_roles=user.group_or_roles,
                tenant_key=tenant_key,
                filter_type=FilterType.ATTRIBUTE,
                parent_filter_id=response["id"],
            )
            response["attributeFilters"] = attribute_filters
            return response
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
            filter_admin=MANAGE_ALL_FILTERS in user.roles,
            roles=user.group_or_roles,
            tenant=tenant_key,
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
            filter_admin=MANAGE_ALL_FILTERS in user.roles,
            roles=user.group_or_roles,
            tenant=tenant_key,
        )

        if filter_result:
            if (
                tenant_key is not None
                and filter_result.tenant != tenant_key
                and filter_result.tenant is not None
            ):
                raise PermissionError("Tenant authentication failed.")
            filter_result.update(filter_data)
            return filter_result
        raise BusinessException(BusinessErrorCode.FILTER_NOT_FOUND)

    @staticmethod
    @user_context
    def update_filter_variables(task_variables, form_id, **kwargs):
        """Update filter variables for all active filters associated with a given form ID.

        It retrieves the task variables from the form mapper table,
        creates a mapping of task variable keys to their labels & updates the filter variables for each active filter.
        The function ensures that default filter variables are always included
        """
        current_app.logger.debug("Updating filter variables..")
        user: UserContext = kwargs["user"]
        current_app.logger.debug("Fetching active filters for the form..")
        filters = Filter.find_all_active_filters_formid(
            form_id=form_id, tenant=user.tenant_key
        )
        current_app.logger.debug(f"Updating filter variables for filters: {filters}")
        for filter_item in filters:
            # Create a dictionary mapping keys to labels from task_variables
            key_to_label = {task_var["key"]: task_var for task_var in task_variables}
            default_filter_variables = [
                "applicationId",
                "formName",
                "submitterName",
                "assignee",
                "roles",
                "name",
                "created",
            ]
            # For each filter variable:
            # - Include it in the result if its name is in task variables or default filter variables
            # - Use the task variable label if available, otherwise keep the existing label
            # - Retain the existing labels for default filter variables

            updated_variables = []
            for filter_var in filter_item.variables:
                # Skip if variable shouldn't be included
                if not (
                    filter_var["key"] in key_to_label
                    or filter_var["key"] in default_filter_variables
                ):
                    continue

                # Create updated variable (copy all existing properties)
                updated_var = filter_var.copy()

                # Only update label if it's not a default variable and exists in task_variables
                if updated_var["key"] not in default_filter_variables:
                    task_var = key_to_label.get(updated_var["key"])
                    if task_var:
                        updated_var["label"] = task_var["label"]

                updated_variables.append(updated_var)

            result = updated_variables
            # Update filter variables in database
            filter_obj = Filter.query.get(filter_item.id)
            filter_obj.variables = result
            filter_obj.save()
