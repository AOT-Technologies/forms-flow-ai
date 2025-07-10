"""Module to handle filter preference."""

from flask import current_app
from formsflow_api_utils.exceptions import BusinessException
from formsflow_api_utils.utils.user_context import UserContext, user_context

from formsflow_api.constants import (
    BusinessErrorCode,
)
from formsflow_api.models import Filter, FilterPreferences, FilterType, db
from formsflow_api.schemas import FilterPreferenceSchema


class FilterPreferenceService:
    """Filter Preference Service."""

    @classmethod
    def check_authorized_filter_ids(cls, data, user, filter_type):
        """Check the payload data filter ids authorized and still active."""
        filter_ids = [filter.get("filter_id") for filter in data]
        authorized_filter = Filter.find_active_filter_by_ids(
            filter_ids=filter_ids,
            roles=user.group_or_roles,
            user=user.user_name,
            tenant=user.tenant_key,
            filter_type=filter_type,
        )
        authorized_filter_ids = {item.id for item in authorized_filter}
        filtered_data = []
        for item in data:
            if item.get("filter_id") in authorized_filter_ids:
                item["user_id"] = user.user_name
                item["tenant"] = user.tenant_key
                filtered_data.append(item)

        return filtered_data

    @staticmethod
    @user_context
    def create_or_update_filter_preference(
        payload, filter_type, parent_filter_id, **kwargs
    ):
        """Create or Update filter preference."""
        try:

            current_app.logger.debug("Updating or create filter preference..")
            user: UserContext = kwargs["user"]
            user_name = user.user_name
            tenant_key = user.tenant_key
            filter_preference_schema = FilterPreferenceSchema()
            data = filter_preference_schema.load(payload, many=True)
            if (
                not filter_type
                or filter_type.strip() == ""
                or filter_type.upper() not in ["TASKS", "ATTRIBUTE"]
            ):
                filter_type = FilterType.TASK
            elif filter_type.upper() == "ATTRIBUTE":
                filter_type = FilterType.ATTRIBUTE
            # check the filter ids are authorized which are form payload and filter unauthorized filter ids
            data = FilterPreferenceService.check_authorized_filter_ids(
                data=data, user=user, filter_type=filter_type
            )
            # update or create filter preference
            FilterPreferences.bulk_upsert_preferences(
                preferences_list=data,
                tenant_key=tenant_key,
            )
            current_app.logger.debug("Data added into filter preference table..")
            # fetch latest data
            result = FilterPreferences.get_filters_by_user_id(
                user_id=user_name,
                tenant=tenant_key,
                filter_type=filter_type,
                roles=user.group_or_roles,
                parent_filter_id=parent_filter_id,
            )
            return filter_preference_schema.dump(result, many=True)
        except Exception as e:
            db.session.rollback()
            raise BusinessException(
                BusinessErrorCode.FILTER_PREFERENCE_BAD_REQUEST
            ) from e
