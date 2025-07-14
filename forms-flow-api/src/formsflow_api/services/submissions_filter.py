"""This class manages user-specific preferences for filters in analyze submissions."""

from flask import current_app
from formsflow_api_utils.utils.user_context import UserContext, user_context

from formsflow_api.models import SubmissionsFilter
from formsflow_api.schemas import SubmissionsFilterSchema

schema = SubmissionsFilterSchema()


class SubmissionsFilterService:
    """This class manages user filter preferences for analyze submissions."""

    @staticmethod
    @user_context
    def create_or_update_filter_preferences(input_data, **kwargs):
        """Create or update user filter preferences."""
        current_app.logger.info(
            "Creating or updating filter preferences for analyze submissions."
        )
        user: UserContext = kwargs["user"]
        user_id = user.user_name
        tenant = user.tenant_key
        data = schema.load(input_data)
        filter_data = (
            SubmissionsFilter.get_filter_preferences_by_user_and_parent_for_id(
                user=user_id,
                parent_form_id=data["parent_form_id"],
                tenant=tenant,
            )
        )
        if filter_data:
            current_app.logger.info("Filter preferences already exist, updating.")
            filter_data.variables = data["variables"]
        else:
            current_app.logger.info("Creating new filter preferences.")
            filter_data = SubmissionsFilter(
                tenant=tenant,
                user=user_id,
                parent_form_id=data["parent_form_id"],
                variables=data["variables"],
                is_active=True,
            )
        filter_data.save()
        current_app.logger.info("Filter preferences created or updated successfully.")
        response = schema.dump(filter_data)
        return response

    @staticmethod
    @user_context
    def get_user_filter_preferences(**kwargs):
        """Get user filter preferences."""
        current_app.logger.info(
            "Fetching user filter preferences for analyze submissions."
        )
        user: UserContext = kwargs["user"]
        user_id = user.user_name
        tenant = user.tenant_key
        filter_preferences = SubmissionsFilter.fetch_all_filter_preferences_by_user(
            user=user_id, tenant=tenant
        )
        current_app.logger.info("Filter preferences retrieved successfully.")
        response = schema.dump(filter_preferences, many=True)
        return response

    @staticmethod
    @user_context
    def get_filter_preferences_by_id(filter_id, **kwargs):
        """Get user filter preferences by ID."""
        current_app.logger.info(f"Fetching filter preferences by ID: {filter_id}.")
        user: UserContext = kwargs["user"]
        tenant = user.tenant_key
        filter_data = SubmissionsFilter.get_filter_preferences_by_id(
            filter_id=filter_id, tenant=tenant
        )
        if not filter_data:
            current_app.logger.info(f"No filter preferences found for ID: {filter_id}.")
            return {"message": "Filter preferences not found"}, 404
        current_app.logger.info(
            f"Filter preferences for ID: {filter_id} retrieved successfully."
        )
        response = schema.dump(filter_data)
        return response, 200

    @staticmethod
    @user_context
    def delete_filter_preferences_by_id(filter_id, **kwargs):
        """Delete user filter preferences by ID."""
        current_app.logger.info(f"Deleting filter preferences by ID: {filter_id}.")
        user: UserContext = kwargs["user"]
        tenant = user.tenant_key
        filter_data = SubmissionsFilter.get_filter_preferences_by_id(
            filter_id=filter_id, tenant=tenant
        )
        if not filter_data:
            current_app.logger.info(f"No filter preferences found for ID: {filter_id}.")
            return {"message": "Filter preferences not found"}, 404
        filter_data.is_active = False
        filter_data.save()
        current_app.logger.info(
            f"Filter preferences for ID: {filter_id} deleted successfully."
        )
        return {"message": "Filter preferences deleted successfully"}, 200
