"""This exposes application service."""

import asyncio
import json
from datetime import datetime
from functools import lru_cache
from http import HTTPStatus
from typing import Dict, Set

import requests
from flask import current_app
from formsflow_api_utils.exceptions import BusinessException, ExternalError
from formsflow_api_utils.utils import (
    ANONYMOUS_USER,
    MANAGE_TASKS,
    NEW_APPLICATION_STATUS,
)
from formsflow_api_utils.utils.user_context import UserContext, user_context

from formsflow_api.constants import BusinessErrorCode
from formsflow_api.models import (
    Application,
    Authorization,
    AuthType,
    Draft,
    FormProcessMapper,
)
from formsflow_api.schemas import (
    AggregatedApplicationSchema,
    AggregatedApplicationsSchema,
    ApplicationSchema,
    DraftSchema,
    FormProcessMapperSchema,
)
from formsflow_api.services.external import BPMService

from .form_process_mapper import FormProcessMapperService

application_schema = ApplicationSchema()


class ApplicationService:  # pylint: disable=too-many-public-methods
    """This class manages application service."""

    @staticmethod
    def get_start_task_payload(
        application: Application,
        mapper: FormProcessMapper,
        form_url: str,
        web_form_url: str,
        variables: Dict,
    ) -> Dict:
        """Returns the payload for initiating the task."""
        return {
            "variables": {
                **variables,
                "applicationId": {"value": application.id},
                "formUrl": {"value": form_url},
                "webFormUrl": {"value": web_form_url},
                "formName": {"value": mapper.form_name},
                "submitterName": {"value": application.created_by},
                "submissionDate": {"value": str(application.created)},
                "tenantKey": {"value": mapper.tenant},
                "formId": {"value": mapper.form_id},
            }
        }

    @staticmethod
    async def start_task(
        mapper: FormProcessMapper, payload: Dict, token: str, application_id: int
    ) -> None:
        """Trigger bpmn workflow to create a task."""
        try:
            if mapper.process_tenant:
                camunda_start_task = BPMService.post_process_start_tenant(
                    process_key=mapper.process_key,
                    payload=payload,
                    token=token,
                    tenant_key=mapper.process_tenant,
                )
            else:
                camunda_start_task = BPMService.post_process_start(
                    process_key=mapper.process_key,
                    payload=payload,
                    token=token,
                    tenant_key=mapper.tenant,
                )
            # This is run as async, so the application model instance would be stale here, lookup and update
            application = Application.find_by_id(application_id)
            application.update({"process_instance_id": camunda_start_task.get("id")})
            application.commit()
        except TypeError as camunda_error:
            response = {
                "message": "Camunda workflow not able to create a task",
                "error": camunda_error,
            }
            current_app.logger.critical(response)
            raise BusinessException(
                BusinessErrorCode.PROCESS_START_ERROR
            ) from camunda_error

    @staticmethod
    @user_context
    def create_application(data, token, **kwargs):
        """Create new application."""
        user: UserContext = kwargs["user"]
        user_id: str = user.user_name
        tenant_key = user.tenant_key
        if user_id is not None:
            # for anonymous form submission
            data["created_by"] = user_id

        data["application_status"] = NEW_APPLICATION_STATUS
        mapper = FormProcessMapper.find_form_by_form_id(data["form_id"])
        if mapper is None:
            if tenant_key:
                raise BusinessException(BusinessErrorCode.PERMISSION_DENIED)
            raise BusinessException(BusinessErrorCode.FORM_ID_NOT_FOUND)
        if tenant_key is not None and mapper.tenant != tenant_key:
            raise BusinessException(BusinessErrorCode.PERMISSION_DENIED)
        data["form_process_mapper_id"] = mapper.id
        task_variables = (
            json.loads(mapper.task_variable) if mapper.task_variable is not None else []
        )
        variables = ApplicationService.fetch_task_variable_values(
            task_variables, data.get("data", {})
        )
        application = None
        try:
            # Function to create application in DB
            application = Application.create_from_dict(data)
            # process_instance_id in request object is usually used in Scripts
            if "process_instance_id" in data:
                application.update({"process_instance_id": data["process_instance_id"]})
                application.commit()  # Commit the record
            # In normal cases, it's through this else case task is being created
            else:
                form_url = data["form_url"]
                web_form_url = data.get("web_form_url", "")
                payload = ApplicationService.get_start_task_payload(
                    application, mapper, form_url, web_form_url, variables
                )
                application.commit()  # Commit the record
                # Creating the process instance asynchronously.
                asyncio.run(
                    ApplicationService.start_task(
                        mapper, payload, token, application.id
                    )
                )

        except Exception as e:
            current_app.logger.error("Error occurred during application creation %s", e)
            if (
                application
            ):  # If application instance is created, rollback the transaction.
                application.rollback()
            raise BusinessException(BusinessErrorCode.APPLICATION_CREATE_ERROR) from e

        return application, HTTPStatus.CREATED

    @staticmethod
    @lru_cache(maxsize=32)
    def get_authorised_form_list(token):
        """
        Function to get the authorized forms based on token passed.

        Used LRU cache to memoize results and parameter maxsize defines
        the no of function calls.
        """
        response = BPMService.get_auth_form_details(token=token)
        return response

    @staticmethod
    def _application_access(token: str) -> bool:
        """Checks if the user has access to all applications."""
        auth_form_details = ApplicationService.get_authorised_form_list(token=token)
        assert auth_form_details is not None
        current_app.logger.info(auth_form_details)
        auth_list = auth_form_details.get("authorizationList") or {}
        resource_list = [group["resourceId"] for group in auth_list]
        return (
            auth_form_details.get("adminGroupEnabled") is True or "*" in resource_list,
            resource_list,
        )

    @staticmethod
    def extract_common_filters(filters: dict) -> dict:
        """Extract common filter parameters from the filters dictionary."""
        return {
            "application_id": filters.get("application_id"),
            "application_name": filters.get("application_name"),
            "application_status": filters.get("application_status"),
            "created_by": filters.get("created_by"),
            "page_no": filters.get("page_no"),
            "limit": filters.get("limit"),
            "order_by": filters.get("order_by"),
            "sort_order": filters.get("sort_order"),
            "created_from": filters.get("created_from"),
            "created_to": filters.get("created_to"),
            "modified_from": filters.get("modified_from"),
            "modified_to": filters.get("modified_to"),
            "parent_form_id": filters.get("parent_form_id"),
        }

    @staticmethod
    @user_context
    def get_auth_applications_and_count(  # pylint: disable=too-many-arguments,too-many-locals,too-many-positional-arguments
        filters: dict,
        **kwargs,
    ):
        """Get applications only from authorized groups."""
        # access, resource_list = ApplicationService._application_access(token)
        user: UserContext = kwargs["user"]
        user_name: str = user.user_name
        form_ids: Set[str] = []
        forms = Authorization.find_all_resources_authorized(
            auth_type=AuthType.APPLICATION,
            roles=user.group_or_roles,
            user_name=user.user_name,
            tenant=user.tenant_key,
        )
        for form in forms:
            form_ids.append(form.resource_id)

        common_filters = ApplicationService.extract_common_filters(filters)
        (
            applications,
            get_all_applications_count,
        ) = Application.find_applications_by_auth_formids_user(
            **common_filters,
            form_ids=form_ids,
            user_name=user_name,
        )
        return (
            application_schema.dump(applications, many=True),
            get_all_applications_count,
        )

    @staticmethod
    @user_context
    def get_auth_by_application_id(application_id: int, **kwargs):
        """Get authorized Application by id."""
        user: UserContext = kwargs["user"]
        parent_form_ref = Application.find_form_parent_id_by_application_id(
            application_id=application_id
        )
        if parent_form_ref is None:
            raise BusinessException(BusinessErrorCode.APPLICATION_ID_NOT_FOUND)
        application_auth = Authorization.find_resource_authorization(
            auth_type=AuthType.APPLICATION,
            roles=user.group_or_roles,
            user_name=user.user_name,
            tenant=user.tenant_key,
            resource_id=parent_form_ref,
        )
        if application_auth:
            application = Application.find_auth_by_id(application_id, user.user_name)
        else:
            # Reviewer lack application permissions can still have form permissions,
            # submit and view their application.
            application = Application.find_id_by_user(application_id, user.user_name)
        if application is None and user.tenant_key is not None:
            raise BusinessException(BusinessErrorCode.PERMISSION_DENIED)
        return application_schema.dump(application), HTTPStatus.OK

    @staticmethod
    @user_context
    def get_all_applications_by_user(  # pylint: disable=too-many-arguments,too-many-locals,too-many-positional-arguments
        filters: dict,
        include_drafts: bool,
        only_drafts: bool,
        **kwargs,
    ):
        """Get all applications based on user."""
        user: UserContext = kwargs["user"]
        user_id: str = user.user_name
        common_filters = ApplicationService.extract_common_filters(filters)
        applications, get_all_applications_count = Application.find_all_by_user(
            user_id=user_id,
            **common_filters,
            include_drafts=include_drafts,
            only_drafts=only_drafts,
        )
        return (
            application_schema.dump(applications, many=True),
            get_all_applications_count,
        )

    @staticmethod
    def get_all_application_status():
        """Get all application status."""
        status_list = Application.find_all_application_status()
        status_list = [x.application_status for x in status_list]
        current_app.logger.debug(status_list)
        return {"applicationStatus": status_list}

    @staticmethod
    def get_all_applications_form_id(form_id, page_no: int, limit: int):
        """Get all applications."""
        if page_no:
            page_no = int(page_no)
        if limit:
            limit = int(limit)

        applications = Application.find_by_form_id(
            form_id=form_id, page_no=page_no, limit=limit
        )
        return application_schema.dump(applications, many=True)

    @staticmethod
    @user_context
    def get_all_applications_form_id_user(
        form_id: str, page_no: int, limit: int, **kwargs
    ):
        """Get all applications."""
        user: UserContext = kwargs["user"]
        user_id = user.user_name
        if page_no:
            page_no = int(page_no)
        if limit:
            limit = int(limit)

        applications = Application.find_by_form_id_user(
            form_id=form_id, user_id=user_id, page_no=page_no, limit=limit
        )
        return application_schema.dump(applications, many=True)

    @staticmethod
    def get_all_applications_form_id_count(form_id: str):
        """Get application count."""
        return Application.find_all_by_form_id_count(form_id=form_id)

    @staticmethod
    @user_context
    def get_all_applications_form_id_user_count(form_id: str, **kwargs):
        """Get application count."""
        user: UserContext = kwargs["user"]
        user_id = user.user_name
        return Application.find_all_by_form_id_user_count(
            form_id=form_id, user_id=user_id
        )

    @staticmethod
    @user_context
    def get_application_by_user(application_id: int, **kwargs):
        """Get application by user id."""
        user: UserContext = kwargs["user"]
        user_id: str = user.user_name
        application = Application.find_id_by_user(
            application_id=application_id, user_id=user_id
        )
        if application:
            return ApplicationSchema().dump(application), HTTPStatus.OK

        return ApplicationSchema().dump([]), HTTPStatus.FORBIDDEN

    @classmethod
    def update_draft(cls, application_id: int, data: Dict):
        """Update draft by application id."""
        draft = Draft.get_draft_by_application_id(application_id)
        if draft:
            draft.update_draft_data_and_commit(draft_info=data)
            return draft
        raise BusinessException(BusinessErrorCode.DRAFT_APPLICATION_NOT_FOUND)

    @staticmethod
    @user_context
    def update_application(application_id: int, data: Dict, **kwargs):
        """Update application."""
        user: UserContext = kwargs["user"]
        user_id: str = user.user_name or ANONYMOUS_USER
        application = Application.find_by_id(
            application_id=application_id, user_id=user_id
        )
        if application is None and user.tenant_key is not None:
            raise BusinessException(BusinessErrorCode.PERMISSION_DENIED)
        if application:
            if application.is_draft:
                draft = ApplicationService.update_draft(application_id, data)
                response = DraftSchema().dump(draft)
                return response
            # update_application is also used for updating drafts, including anonymous drafts.
            # To prevent public API updates to applications, ensure user_id is checked and not anonymous.
            if user_id == ANONYMOUS_USER:
                raise BusinessException(BusinessErrorCode.PERMISSION_DENIED)
            data["modified_by"] = user.user_name
            application.update(data)
            application.commit()
            response = ApplicationSchema().dump(application)
            return response
        raise BusinessException(BusinessErrorCode.APPLICATION_ID_NOT_FOUND)

    @staticmethod
    def get_aggregated_applications(  # pylint: disable=too-many-arguments,too-many-positional-arguments
        from_date: str,
        to_date: str,
        page_no: int,
        limit: int,
        form_name: str,
        sort_by: str,
        sort_order: str,
        order_by: str,
    ):
        """Get aggregated applications."""
        applications, get_all_metrics_count = Application.find_aggregated_applications(
            from_date=from_date,
            to_date=to_date,
            page_no=page_no,
            limit=limit,
            form_name=form_name,
            sort_by=sort_by,
            sort_order=sort_order,
            order_by=order_by,
        )

        schema = AggregatedApplicationsSchema()
        return (
            schema.dump(applications, many=True),
            get_all_metrics_count,
        )

    @staticmethod
    @user_context
    def get_applications_status_by_parent_form_id(
        parent_form_id: str,
        from_date: datetime,
        to_date: datetime,
        order_by: str,
        **kwargs,
    ):
        """Get aggregated application status by parent form id."""
        user: UserContext = kwargs["user"]
        application_status = (
            Application.find_aggregated_application_status_by_parent_form_id(
                form_id=parent_form_id,
                from_date=from_date,
                to_date=to_date,
                order_by=order_by,
            )
        )
        schema = AggregatedApplicationSchema()
        result = schema.dump(application_status, many=True)
        if user.tenant_key and len(result) == 0:
            raise BusinessException(BusinessErrorCode.PERMISSION_DENIED)
        return result

    @staticmethod
    def get_applications_status_by_form_id(
        form_id: int, from_date: str, to_date: str, order_by: str
    ):
        """Get aggregated application status by form id."""
        application_status = Application.find_aggregated_application_status_by_form_id(
            form_id=form_id, from_date=from_date, to_date=to_date, order_by=order_by
        )
        schema = AggregatedApplicationSchema()
        result = schema.dump(application_status, many=True)
        return result

    @staticmethod
    @user_context
    def get_application_form_mapper_by_id(application_id: int, **kwargs):
        """Get form process mapper."""
        user: UserContext = kwargs["user"]
        tenant_key = user.tenant_key
        mapper = Application.get_form_mapper_by_application_id(
            application_id=application_id
        )
        if mapper:
            if mapper.id and tenant_key:
                FormProcessMapperService.check_tenant_authorization(
                    mapper_id=mapper.id, tenant_key=tenant_key
                )
            mapper_schema = FormProcessMapperSchema()
            return mapper_schema.dump(mapper)

        raise BusinessException(BusinessErrorCode.APPLICATION_ID_NOT_FOUND)

    @staticmethod
    def get_total_application_corresponding_to_mapper_id(mapper_id: int):
        """Retrieves application count related to a mapper_id."""
        count = Application.get_total_application_corresponding_to_mapper_id(mapper_id)
        if count == 0:
            return ({"message": "No Applications found", "value": count}, HTTPStatus.OK)

        return (
            {"message": f"Total Applications found are: {count}", "value": count},
            HTTPStatus.OK,
        )

    @staticmethod
    @user_context
    def get_application_count(auth, **kwargs):
        """Retrieves the active application count."""
        user: UserContext = kwargs["user"]
        user_name = user.user_name
        form_ids: Set[str] = []
        application_count = None
        if auth.has_role([MANAGE_TASKS]):
            forms = Authorization.find_all_resources_authorized(
                auth_type=AuthType.APPLICATION,
                roles=user.group_or_roles,
                user_name=user.user_name,
                tenant=user.tenant_key,
            )
            for form in forms:
                form_ids.append(form.resource_id)
            application_count = Application.get_auth_application_count_by_form_id_user(
                form_ids, user_name
            )
        else:
            application_count = Application.get_user_based_application_count(
                user.user_name
            )
        assert application_count is not None
        return application_count

    @staticmethod
    def pick(data, key):
        """Pick nested data."""
        keys = key.split(".")
        for k in keys:
            if not isinstance(data, dict) or k not in data:
                return None
            data = data[k]
        return data

    @staticmethod
    def fetch_task_variable_values(task_variable, form_data):
        """Fetch task variable values from form data."""
        variables = {}

        if task_variable and form_data:
            task_keys = [val["key"] for val in task_variable]
            print("taskvariables")
            print(task_keys)
            variables = {
                key: (
                    {"value": json.dumps(value)}
                    if isinstance(value, (dict, list))
                    else {"value": value}
                )
                for key in task_keys
                if (value := ApplicationService.pick(form_data, key)) is not None
            }
        print(variables)
        return variables

    @staticmethod
    def resubmit_application(application_id: int, payload: Dict, token: str):
        """Resubmit application and update process variables."""
        mapper = ApplicationService.get_application_form_mapper_by_id(application_id)
        task_variable = json.loads(mapper.get("taskVariables"))
        form_data = payload.pop("data", None)
        payload["processVariables"] = ApplicationService.fetch_task_variable_values(
            task_variable, form_data
        )
        payload["processVariables"].update({"isResubmit": {"value": False}})
        ApplicationService.update_application(application_id, {"is_resubmit": False})
        try:
            response = BPMService.send_message(data=payload, token=token)
            if not response:
                raise BusinessException(BusinessErrorCode.PROCESS_DEF_NOT_FOUND)
        except requests.exceptions.ConnectionError as err:
            current_app.logger.warning(err)
            raise BusinessException(ExternalError.BPM_SERVICE_UNAVAILABLE) from err

    @classmethod
    def _delete_draft_by_application_id(cls, application_id):
        """Deletes draft by application id."""
        draft = Draft.get_draft_by_application_id(application_id)
        if draft:
            draft.delete()

    @classmethod
    def make_submission(cls, application_id, data, user_id):
        """Activates the application from the draft entry."""
        application = Application.find_draft_application_by_user(
            application_id, user_id
        )
        if application:
            application.application_status = data["application_status"]
            application.submission_id = data["submission_id"]
            cls._delete_draft_by_application_id(application_id)
            return application
        return None

    @classmethod
    @user_context
    def delete_draft_application(cls, application_id: int, **kwargs):
        """Delete draft application."""
        user: UserContext = kwargs["user"]
        application = Application.find_draft_application_by_user(
            application_id, user.user_name
        )
        if application:
            # deletes the draft and application entry related to the draft.
            cls._delete_draft_by_application_id(application_id)
            application.delete()
        else:
            raise BusinessException(BusinessErrorCode.DRAFT_APPLICATION_NOT_FOUND)

    @classmethod
    def fetch_latest_form_name_formid_by_parent_form_id(cls, parent_form_id):
        """Get latest form name and form id by parent_form_id."""
        current_app.logger.info("Fetching form name & formId by parent id..")
        if parent_form_id and (
            mapper := FormProcessMapper.get_latest_by_parent_form_id(parent_form_id)
        ):
            return mapper.form_name, mapper.form_id
        return None, None
