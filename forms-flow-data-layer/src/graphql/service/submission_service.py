import asyncio
from typing import Any, Dict, List, Optional, Tuple

import strawberry
from sqlalchemy import and_, desc, func, or_
from sqlalchemy.sql import select

from src.db import bpmn_db, webapi_db
from src.graphql.schema import (
    PaginatedSubmissionResponse,
    QuerySubmissionsSchema,
    SubmissionSchema,
)
from src.graphql.service import FormService
from src.utils import get_logger

logger = get_logger(__name__)


class SubmissionService:

    @staticmethod
    async def get_submissions(task_name: str, limit: int = 5) -> List[SubmissionSchema]:
        """
        Retrieve applications and their corresponding submission data based on a specified task name.

        This method performs the following operations:
        1. Fetches `process_instance_id` values from the `act_ru_task` table in the BPM database
        where the `name_` column matches the provided `task_name`.
        2. Retrieves records from the `application` table in the WebAPI database that have
        `process_instance_id` values matching those obtained in step 1, limited to the specified number.
        3. For each application record, fetches the corresponding submission data from formio database `submissions` table based on the `submission_id`.

        Parameters:
        -----------
        task_name : str
            The name of the task to filter `process_instance_id` values in the BPM database.
        limit : int, optional
            The maximum number of application records to retrieve (default is 5).

        Returns:
        --------
        List[SubmissionSchema]
            A list of `SubmissionSchema` instances, each containing:
            - id: The unique identifier of the application.
            - application_status: The status of the application.
            - task_name: The name of the task associated with the application.
            - data: The submission data corresponding to the application's `submission_id`.
        """
        application_table = await webapi_db.get_table("application")
        task_table = await bpmn_db.get_table("act_ru_task")

        webapi_session = await webapi_db.get_session()
        bpm_session = await bpmn_db.get_session()

        async with webapi_session as api_session, bpm_session as bpm_conn:
            # Fetch only the process_instance_ids that match the user-input task_name
            task_result = await bpm_conn.execute(
                select(task_table.c.proc_inst_id_).where(
                    task_table.c.name_ == task_name
                )
            )
            process_instance_ids = [
                row["proc_inst_id_"] for row in task_result.mappings().all()
            ]

            if not process_instance_ids:
                return []  # No matching tasks, return empty list

            # Fetch applications that have a matching process_instance_id, limited by the specified number
            application_result = await api_session.execute(
                select(application_table)
                .where(
                    application_table.c.process_instance_id.in_(process_instance_ids)
                )
                .limit(limit)
            )
            applications = application_result.mappings().all()

        # Fetch submission data in parallel using asyncio.gather
        submission_tasks = [
            (
                FormService.get_submissions(row["submission_id"])
                if row["submission_id"]
                else None
            )
            for row in applications
        ]
        submissions = await asyncio.gather(*submission_tasks)

        # Construct response
        return [
            SubmissionSchema(
                id=row["id"],
                application_status=row["application_status"],
                task_name=task_name,
                data=submissions[i],
            )
            for i, row in enumerate(applications)
        ]

    @staticmethod
    async def auth_tenant(info: strawberry.Info, table):
        """Returns tenant auth condition"""
        user = info.context["user"]
        return table.c.tenant == user.tenant_key

    @staticmethod
    async def form_auth_query(username: str, roles: list[str], auth_type: str):
        """
        Builds SQLAlchemy authorization conditions for form resources.

        Constructs a composite SQL condition that checks if a user is authorized to access
        form resources based on either:
        - Direct username match
        - Role-based permissions
        - Open access (when no specific user or roles are specified)
        - The auth_type parameter ensures the conditions only match records
          of the specified authorization type
        """
        authorization_table = await webapi_db.get_table("authorization")
        auth_conditions = and_(
            authorization_table.c.auth_type == auth_type,
            or_(
                authorization_table.c.user_name == username,
                *[authorization_table.c.roles.contains([role]) for role in roles],
                and_(
                    authorization_table.c.user_name.is_(None),
                    or_(
                        authorization_table.c.roles == {},
                        authorization_table.c.roles.is_(None),
                    ),
                ),
            ),
        )
        return auth_conditions

    @staticmethod
    async def split_search_criteria(
        search: Optional[Dict[str, Any]], webapi_fields: List[str]
    ) -> Tuple[Dict[str, Any], Dict[str, Any]]:
        """Splits search criteria into webapi and mongo search dictionaries."""
        webapi_search = {}
        mongo_search = {}

        if search:
            for field, value in search.items():
                if field in webapi_fields:
                    webapi_search[field] = value
                else:
                    mongo_search[field] = value

        return webapi_search, mongo_search

    @staticmethod
    async def _apply_sorting(
        query, application_table, webapi_fields, sort_by, sort_order
    ):
        """Apply sorting to the query and determine sort parameters."""
        sort_params = {}
        mongo_sorted = False

        if sort_by and sort_by in webapi_fields:
            if sort_order.lower() == "desc":
                query = query.order_by(desc(getattr(application_table.c, sort_by)))
            else:
                query = query.order_by(getattr(application_table.c, sort_by))
        elif sort_by:
            sort_params = {"sort_by": sort_by, "sort_order": sort_order}
            mongo_sorted = True

        return query, sort_params, mongo_sorted

    @staticmethod
    async def _execute_with_pagination_strategy(
        query,
        api_session,
        mongo_search: Optional[dict],
        page_no: Optional[int],
        limit: Optional[int],
    ) -> tuple[list[dict], int, dict]:
        """
        Execute query with appropriate pagination strategy based on formio submission data filter.

        If there is  filter/search on form submission data, pagination done in mongo side, else in webapi

        Returns:
            tuple: (applications, total_count, pagination_params)
        """
        if not mongo_search:
            # SQL-side pagination
            items_per_page = limit or 5
            current_page = page_no or 1
            paginated_query = query.limit(items_per_page).offset(
                (current_page - 1) * items_per_page
            )

            paginated_results = await api_session.execute(paginated_query)
            applications = paginated_results.mappings().all()
            total_count = (
                await api_session.execute(
                    select(func.count()).select_from(query.subquery())
                )
            ).scalar_one()
            return applications, total_count, {}

        # MongoDB-side pagination
        result = await api_session.execute(query)
        applications = result.mappings().all()
        return applications, len(applications), {"page_no": page_no, "limit": limit}

    @staticmethod
    async def _process_results(applications, submission_data, mongo_sorted, limit):
        """Process results and merge with MongoDB data."""
        final_results = []
        # Build final results maintaining the correct order
        if mongo_sorted:
            # Create mapping from submission_id to SQL application data
            app_map = {
                app["submission_id"]: app
                for app in applications
                if app["submission_id"]
            }
            # When sorted in MongoDB, use that exact order
            for sub in submission_data:
                if sub["_id"] in app_map:
                    final_results.append(
                        {**app_map[sub["_id"]], "submission_data": sub}
                    )
        else:
            # When sorted in SQL, process in SQL order with limit
            submission_map = {sub["_id"]: sub for sub in submission_data}
            for app in applications:
                if len(final_results) >= limit:
                    break
                if app["submission_id"] in submission_map:
                    final_results.append(
                        {**app, "submission_data": submission_map[app["submission_id"]]}
                    )

        return final_results

    @staticmethod
    async def query_submissions(
        info,
        sort_by,
        sort_order,
        parent_form_id,
        search,
        project_fields,
        page_no,
        limit,
    ) -> List[QuerySubmissionsSchema]:
        """
        Retrieve filtered and paginated submissions with authorization checks.

        This service method performs a multi-database query to:
        1. Fetch authorized application records from SQL database
        2. Filter corresponding submission data from MongoDB
        3. Combine results with proper sorting and pagination

        Args:
            info (strawberry.Info): GraphQL resolver context containing:
                - context: Authentication/user information
            sort_by (str): Field to sort results by
            sort_order (str): Sort direction ('asc' or 'desc')
            limit (int): Maximum number of results to return
            parent_form_id (Optional[str]): Filter submissions by parent form ID
            search Optional[JSON]: Dictionary of field-value pairs to search across both SQL and MongoDB field
            project_fields Optional[List[str]]: List of specific fields to retrieve from MongoDB documents
            page_no (int): Pagination page number (default: 1)

        Returns:
            List[QuerySubmissionsSchema]: Combined results containing:
                - Application metadata from SQL
                - Submission details from MongoDB
        """
        application_table = await webapi_db.get_table("application")
        mapper_table = await webapi_db.get_table("form_process_mapper")
        authorization_table = await webapi_db.get_table("authorization")
        webapi_session = await webapi_db.get_session()

        # Get user context from token
        user = info.context["user"]
        username = user.token_info.get("preferred_username")
        user_roles = user.token_info.get("role", [])

        webapi_fields = ["created_by", "application_status", "id"]
        # Split search criteria
        webapi_search, mongo_search = await SubmissionService.split_search_criteria(
            search, webapi_fields
        )

        async with webapi_session as api_session:
            query = (
                select(
                    application_table,
                    mapper_table.c.tenant,
                    mapper_table.c.parent_form_id,
                )
                .join(
                    mapper_table,
                    application_table.c.form_process_mapper_id == mapper_table.c.id,
                )
                .join(
                    authorization_table,
                    and_(
                        mapper_table.c.parent_form_id
                        == authorization_table.c.resource_id,
                        await SubmissionService.form_auth_query(
                            username, user_roles, "FORM"
                        ),
                    ),
                )
                .where(
                    application_table.c.is_draft.is_(False),
                    await SubmissionService.auth_tenant(info, mapper_table),
                )
                .distinct()
            )

            if webapi_search:
                for field, value in webapi_search.items():
                    if hasattr(application_table.c, field):
                        col = getattr(application_table.c, field)
                        query = query.where(col.ilike(f"%{value}%"))
            if parent_form_id:
                query = query.where(mapper_table.c.parent_form_id == parent_form_id)

            # Apply sorting and get sort parameters
            query, sort_params, mongo_sorted = await SubmissionService._apply_sorting(
                query, application_table, webapi_fields, sort_by, sort_order
            )
            # Execute with appropriate pagination strategy
            submissions, total_count, pagination_params = (
                await SubmissionService._execute_with_pagination_strategy(
                    query, api_session, mongo_search, page_no, limit
                )
            )
            submission_data = {}
            if submissions and parent_form_id:
                logger.info("Fetching submission data from formio.")
                # Extract the submission IDs
                submission_ids = [
                    app["submission_id"] for app in submissions if app["submission_id"]
                ]
                # Get filtered submissions from MongoDB
                submission_data = await FormService.query_submissions(
                    submission_ids=submission_ids,
                    search=mongo_search,
                    project_fields=project_fields,
                    **pagination_params,
                    **sort_params,
                )

                # Process results and merge with MongoDB data
                submissions = await SubmissionService._process_results(
                    submissions,
                    submission_data.get("submissions", []),
                    mongo_sorted,
                    limit,
                )

            return PaginatedSubmissionResponse(
                submissions=[
                    QuerySubmissionsSchema(
                        id=row.get("id"),
                        created_by=row.get("created_by"),
                        application_status=row.get("application_status"),
                        data={
                            field: row.get("submission_data", {}).get(field)
                            for field in (project_fields or [])
                        },
                    )
                    for row in submissions
                ],
                total_count=(
                    submission_data.get("total_count")
                    if mongo_search and parent_form_id and submissions
                    else total_count
                ),
                page_no=page_no,
                limit=limit,
            )
