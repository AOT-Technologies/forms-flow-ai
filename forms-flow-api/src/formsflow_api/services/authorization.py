"""This exposes authorization service."""

import datetime
from typing import Dict, List

from flask import current_app
from formsflow_api_utils.exceptions import BusinessException
from formsflow_api_utils.utils.user_context import UserContext, user_context
from sqlalchemy.orm.attributes import flag_modified

from formsflow_api.constants import BusinessErrorCode
from formsflow_api.models import Application, Authorization, AuthType, db
from formsflow_api.schemas import ApplicationSchema
from formsflow_api.services.external.analytics_api import RedashAPIService

application_schema = ApplicationSchema()


class AuthorizationService:
    """This class manages authorization service."""

    def check_and_update_name_mismatch(  # pylint: disable=too-many-arguments, too-many-positional-arguments
        self,
        auth_name: str,
        dashboard_id: str,
        dashboard: Dict[str, str],
        auth_record: Authorization,
        updates_needed: List[Dict],
        result: List[Dict],
    ):
        """Check if the name in auth record matches the dashboard name and update if needed."""
        if auth_name != dashboard["name"]:
            current_app.logger.info(
                f"Name mismatch detected for {dashboard_id}: "
                f"Auth has '{auth_name}', Dashboard has '{dashboard['name']}'"
            )
            updates_needed.append(
                {
                    "resource_id": dashboard_id,
                    "new_name": dashboard["name"],
                    "auth_record": auth_record,
                }
            )
            auth_record.resource_details["name"] = dashboard["name"]
        # Always add to result (even if no update needed)
        result.append(self._as_dict(auth_record))
        return updates_needed, result

    def update_auth_records(self, auth_records):
        """Update dashboard authorization records."""
        try:
            current_app.logger.info("Updating auth records in the database")
            for auth_record in auth_records:
                current_app.logger.log(
                    f"Updating auth record: {auth_record['resource_id']} with new name: {auth_record['new_name']}"
                )
                auth_record = auth_record["auth_record"]
                auth_record.resource_details = {"name": auth_record["new_name"]}
                flag_modified(
                    auth_record, "resource_details"
                )  # Required for JSON field updates
                auth_record.save()
            db.session.commit()
            current_app.logger.info("Updates committed successfully")
        except Exception as e:  # pylint: disable=broad-exception-caught
            db.session.rollback()
            current_app.logger.error(f"Update failed: {str(e)}")

    def process_dashboard_data(  # pylint: disable-msg=too-many-locals
        self,
        analytics_response,
        dashboard_auth_details,
        user: UserContext,
    ):
        """
        Process and returns updated auth records.

        - Updates names in auth records when mismatches are found
        - Creates new auth records for dashboards without existing auth
        - Preserves all existing authorization data
        - Filters out archived dashboards
        - Returns a list of updated auth records.
        """
        # Initialize lists
        updates_needed = []
        creates_needed = []
        result = []

        # Create lookup for existing auths
        auth_lookup = {auth.resource_id: auth for auth in dashboard_auth_details}

        # Process and merge data
        for dashboard in analytics_response["results"]:
            current_app.logger.info(
                f"Processing dashboard: {dashboard['name']} with ID: {dashboard['id']}"
            )
            dashboard_id = str(dashboard["id"])
            auth_record = auth_lookup.get(dashboard_id)

            if auth_record:
                # Check for name mismatch
                auth_name = auth_record.resource_details.get("name")
                updates_needed, result = self.check_and_update_name_mismatch(
                    auth_name,
                    dashboard_id,
                    dashboard,
                    auth_record,
                    updates_needed,
                    result,
                )
            else:
                # Create new auth record
                new_auth = {
                    "resource_id": dashboard["id"],
                    "resource_details": {"name": dashboard["name"]},
                    "roles": [],
                    "user_name": None,
                    "auth_type": AuthType.DASHBOARD,
                    "tenant": user.tenant_key,
                    "created_by": user.user_name,
                }
                new_auth = Authorization(**new_auth)
                creates_needed.append(new_auth)
                result.append(self._as_dict(new_auth))

        # Save updates and creates dashboard authorization entry
        try:
            if updates_needed:
                current_app.logger.info(
                    "Updating existing auth records in the database"
                )
                self.update_auth_records(updates_needed)
            # Create new records
            if creates_needed:
                current_app.logger.info("Creating new auth records in the database")
                for data in creates_needed:
                    auth_record = Authorization(**data)
                    auth_record.save()

            db.session.commit()
        except Exception as e:  # pylint: disable=broad-exception-caught
            db.session.rollback()
            current_app.logger.error(f"Failed to update auth names: {str(e)}")
        return result

    def get_user_dashboards(
        self,
        analytics_response,
        user_auth_details,  # Already filtered to user-specific auths
    ):
        """Process only dashboards the current user has access to.

        Get filtered dashboards with authorization data (user-specific view)
        - Updates names in auth records when mismatches are found
        - Preserves all existing authorization data
        - Filters out archived dashboards
        - Returns a list of updated auth records
        """
        updates_needed = []
        result = []

        # Create lookup of dashboards
        dashboard_lookup = {str(d["id"]): d for d in analytics_response["results"]}

        for auth_record in user_auth_details:
            dashboard_id = auth_record.resource_id
            dashboard = dashboard_lookup.get(dashboard_id)

            if not dashboard:
                # Dashboard might have been deleted/archived, skip
                current_app.logger.debug(
                    f"Dashboard {dashboard_id} not found in analytics data, skipping"
                )
                continue

            # Check and update for name mismatch
            auth_name = auth_record.resource_details.get("name")
            updates_needed, result = self.check_and_update_name_mismatch(
                auth_name, dashboard_id, dashboard, auth_record, updates_needed, result
            )

        # Process updates if any
        if updates_needed:
            self.update_auth_records(updates_needed)
        return result

    @user_context
    def get_all_dashboards(
        self,
        analytics_dashboard_data,
        **kwargs,
    ):
        """Get all dashboards with authorization data."""
        user: UserContext = kwargs["user"]
        # Fetch all dashboard authorizations
        current_app.logger.info("Fetching all dashboard authorizations")
        dashboard_auth_details = Authorization.find_all_authorizations(
            auth_type=AuthType.DASHBOARD, tenant=user.tenant_key
        )
        # Filter out archived dashboards from the response
        # Update dashboard names if any mismatch.
        response = self.process_dashboard_data(
            analytics_dashboard_data,
            dashboard_auth_details,
            user,
        )

        return response

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
        if auth_type == AuthType.DASHBOARD:
            # Fetch all dashboards from analytics API and merge with authorization details
            # to get the latest dashboard names
            # and update the authorization records in the database if there are any changes.
            # Filter out archived dashboards from the response.
            # This is done to ensure that the dashboard names are up-to-date.
            analytics_service = RedashAPIService()
            analytics_response = analytics_service.get_request(url_path="dashboards")
            response = self.get_user_dashboards(analytics_response, authz)
            return response
        for auth in authz:
            response.append(self._as_dict(auth))
        return response

    def _as_dict(self, auth):
        return {
            "resourceId": auth.resource_id,
            "resourceDetails": auth.resource_details,
            "roles": auth.roles,
            "userName": auth.user_name,
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
        self,
        auth_type: str,
        resource: Dict[str, str],
        is_designer: bool,
        edit_import_designer=False,
        **kwargs,
    ) -> Dict[str, any]:
        """Create authorization record."""
        user: UserContext = kwargs["user"]
        auth_type_enum = AuthType(auth_type)
        auth = Authorization.find_resource_by_id(
            auth_type=auth_type_enum,
            resource_id=resource.get("resourceId"),
            is_designer=is_designer,
            user_name=user.user_name,
            roles=user.group_or_roles,
            tenant=user.tenant_key,
            include_created_by=is_designer,
        )
        roles = resource.get("roles")
        if auth:
            # Incase of edit import-desiger auth, user_name default to the username already present in auth.user_name
            user_name = (
                auth.user_name if edit_import_designer else resource.get("userName")
            )
            auth.roles = roles
            auth.resource_details = resource.get("resourceDetails")
            auth.user_name = user_name
            auth.modified = datetime.datetime.now()
            auth.modified_by = user.user_name
        else:
            auth: Authorization = Authorization(
                tenant=user.tenant_key,
                auth_type=AuthType(auth_type),
                resource_id=resource.get("resourceId"),
                resource_details=resource.get("resourceDetails"),
                roles=roles,
                user_name=resource.get("userName"),
                created_by=user.user_name,
            )
        auth = auth.save()
        return self._as_dict(auth)

    @user_context
    def get_application_resource_by_id(
        self, auth_type: str, resource_id: str, form_id: str = None, **kwargs
    ):
        """Get application authorization resource by ID."""
        user: UserContext = kwargs["user"]
        auth_type_enum = AuthType(auth_type)

        auth = Authorization.find_resource_by_id(
            auth_type=auth_type_enum,
            resource_id=resource_id,
            ignore_role_check=True,
            tenant=user.tenant_key,
        )

        if not auth:
            raise BusinessException(BusinessErrorCode.PERMISSION_DENIED)

        response = self._as_dict(auth)
        authorized_user = False

        # Check if the user has the required roles
        if set(user.group_or_roles).intersection(auth.roles):
            authorized_user = True

        # Check if the user created the application associated with the form
        if form_id and Application.get_application_by_formid_and_user_name(
            formid=form_id, user_name=user.user_name
        ):
            authorized_user = True

        if authorized_user:
            return response

        raise BusinessException(BusinessErrorCode.PERMISSION_DENIED)

    @user_context
    def get_resource_by_id(
        self, auth_type: str, resource_id: str, is_designer: bool, **kwargs
    ):
        """Get authorization resource by id."""
        user: UserContext = kwargs["user"]
        auth_type_enum = AuthType(auth_type)
        auth = Authorization.find_resource_by_id(
            auth_type=auth_type_enum,
            resource_id=resource_id,
            roles=user.group_or_roles,
            tenant=user.tenant_key,
            user_name=user.user_name,
            include_created_by=bool(
                is_designer and auth_type_enum == AuthType.DESIGNER
            ),
        )
        if auth:
            return self._as_dict(auth)
        return None

    @user_context
    def get_auth_list_by_id(self, resource_id, **kwargs):
        """Get authorization list for given resource id."""
        user: UserContext = kwargs["user"]
        auth_designer_details = Authorization.find_resource_by_id(
            auth_type=AuthType.DESIGNER.value,
            resource_id=resource_id,
            roles=user.group_or_roles,
            tenant=user.tenant_key,
            user_name=user.user_name,
            include_created_by=True,
        )
        if auth_designer_details:
            auth_details = Authorization.find_auth_list_by_id(
                resource_id, user.tenant_key
            )
            auth_detail = {}
            for auth in auth_details:
                auth_detail[auth.auth_type.value] = self._as_dict(auth)
            return auth_detail
        raise BusinessException(BusinessErrorCode.PERMISSION_DENIED)

    @staticmethod
    def create_or_update_resource_authorization(data, is_designer):
        """Create or update resource authorization."""
        for auth_type in AuthType:
            auth_data = data.get(auth_type.value.lower())
            if auth_data and auth_type.value != AuthType.DASHBOARD.value:
                AuthorizationService().create_authorization(
                    auth_type.value,
                    auth_data,
                    is_designer,
                )
