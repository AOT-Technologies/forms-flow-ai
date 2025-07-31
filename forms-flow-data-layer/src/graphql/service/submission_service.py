from typing import Any, Dict, List, Optional, Tuple

import strawberry

from src.graphql.schema import (
    PaginatedSubmissionResponse,
    SubmissionDetailsWithSubmissionData,
)
from src.models.formio.submission import SubmissionModel
from src.models.webapi.application import Application
from src.utils import get_logger

logger = get_logger(__name__)


class SubmissionService:
    """Service class for handling submission related operations on mongo and webapi side."""

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
    def _process_results(
        webapi_side_submissions, mongo_side_submissions, is_sort_on_webapi_side, limit
    ):
        """Process results and merge with MongoDB data."""

        # Pre-process MongoDB submissions once (convert _id to submission_id and create lookup dict)
        mongo_dict = {}
        lookup_key = "submission_id"
        for sub in mongo_side_submissions:
            submission_id = sub.pop(
                "_id"
            )  # Remove the _id field from the submission data
            mongo_dict[submission_id] = sub

        # Create a single processing path regardless of sort origin
        if is_sort_on_webapi_side:
            source_data = webapi_side_submissions
            lookup_dict = mongo_dict
        else:
            source_data = [
                {"submission_id": sid} for sid in mongo_dict.keys()
            ]  # instead of full data just mock the data by giving the value as submission_id
            lookup_dict = {
                app["submission_id"]: app
                for app in webapi_side_submissions
                if app["submission_id"]
            }

        # Single merging logic
        final_results = []
        for item in source_data:
            submission_id = item[lookup_key]
            if submission_id in lookup_dict:
                # the variable item and lookup_dict[submission_id] are same in the case of webapi side sort
                base_data = (
                    item if is_sort_on_webapi_side else lookup_dict[submission_id]
                )
                final_results.append(
                    {**base_data, "submission_data": mongo_dict[submission_id]}
                )
                # Apply limit if provided
                if limit and len(final_results) >= limit:
                    break

        return final_results

    @staticmethod
    async def get_submission(
        info: strawberry.Info,
        sort_by: str,
        sort_order: str,
        parent_form_id: str,
        filters: Dict,
        selected_form_fields: List[str],
        created_before: Optional[str],
        created_after: Optional[str],
        page_no: int,
        limit: int,
    ) -> Optional[PaginatedSubmissionResponse]:
        """
        Fetches submissions from both webapi and MongoDB, merges them, and returns a paginated response.
        Args:sort_by: Field to sort by (default: "created")
            sort_order: Order of sorting (default: "desc")
            parent_form_id: ID of the parent form
            filters: Filters to apply to the query
            selected_form_fields: Fields to select from MongoDB
            page_no: Page number for pagination
            limit: Number of records per page
        Returns:
            PaginatedSubmissionResponse: A paginated response containing submissions
            and total count.
        """
        # Get user context from token
        user = info.context["user"]
        tenant_key = user.tenant_key
        user_groups = user.token_info.get("groups", [])
        webapi_fields = [
            "created_by",
            "application_status",
            "id",
            "created",
            "form_name",
        ]
        # drived filter mongo serach and webapi search
        webapi_search, mongo_search = await SubmissionService.split_search_criteria(
            filters, webapi_fields
        )
        logger.info(
            f"extracted filter by mongo {mongo_search} and webapi {webapi_search}"
        )

        is_paginate_on_webapi_side = not mongo_search
        is_sort_on_webapi_side = sort_by in webapi_fields
        sort_params = {"sort_by": sort_by, "sort_order": sort_order}
        webapi_side_submissions, total_count = (
            await Application.get_authorized_applications(
                tenant_key=tenant_key,
                roles=user_groups,
                is_paginate=is_paginate_on_webapi_side,
                filter=webapi_search,
                created_before=created_before,
                created_after=created_after,
                page_no=page_no,
                limit=limit,
                parent_form_id=parent_form_id,
                **(sort_params if is_sort_on_webapi_side else {}),
            )
        )

        mongo_side_submissions = {}
        final_out_puts = None
        needs_mongo_submissions = (
            webapi_side_submissions and parent_form_id
        )  # if parent_form_id and webapi side submission is non empty then only go to mongo side
        if needs_mongo_submissions:
            logger.info("Fetching submission data from formio.")
            # Extract the submission IDs
            submission_ids = [
                app["submission_id"]
                for app in webapi_side_submissions
                if app["submission_id"]
            ]
            # Get filtered submissions from MongoDB
            mongo_side_submissions = await SubmissionModel.query_submission(
                submission_ids=submission_ids,
                filter=mongo_search,
                selected_form_fields=selected_form_fields,
                page_no=not is_paginate_on_webapi_side and page_no or None,
                limit=not is_paginate_on_webapi_side and limit or None,
                **(sort_params if not is_sort_on_webapi_side else {}),
            )
            final_out_puts = SubmissionService._process_results(
                webapi_side_submissions,
                mongo_side_submissions.get("submissions", []),
                is_sort_on_webapi_side,
                limit,
            )
        # sometimes webapi_side_submission will be no empty but mongo side submission will be empty
        data = final_out_puts if needs_mongo_submissions else webapi_side_submissions
        return PaginatedSubmissionResponse(
            submissions=[
                SubmissionDetailsWithSubmissionData(
                    id=row.get("id"),
                    form_name=row.get("form_name"),
                    submission_id=row.get("submission_id"),
                    created_by=row.get("created_by"),
                    application_status=row.get("application_status"),
                    created=row.get("created"),
                    data=row.get("submission_data", {}),
                )
                for row in data
            ],
            total_count=(
                mongo_side_submissions.get("total_count", 0)
                if mongo_search
                and needs_mongo_submissions
                else total_count
            ),
            page_no=page_no,
            limit=limit,
        )
