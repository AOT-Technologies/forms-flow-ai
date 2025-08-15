from typing import Optional

from beanie import PydanticObjectId

from src.graphql.schema import FormSchema, PaginationWindow
from src.middlewares.pagination import verify_pagination_params
from src.models.formio import FormModel, SubmissionModel
from src.models.webapi import FormProcessMapper
from src.utils import UserContext, get_logger

logger = get_logger(__name__)


class FormService():
    """Service class for handling form related operations."""

    @classmethod
    @verify_pagination_params
    async def get_forms(
        cls,
        user_context: UserContext,
        limit: int = 100,
        offset: int = 0,
        filters: dict[str, str] = {},
    ) -> PaginationWindow[FormSchema]:
        """
        Fetches forms from the WebAPI and adds additional details from FormIO.

        Args:
            user_context (UserContext): User context information
            limit (int): Number of items to return (default: 100)
            offset (int): Pagination offset (default: 0)
            filters (dict): Search filters to apply to the query
        Returns:
            Paginated list of Form objects containing combined PostgreSQL and MongoDB data
        """
        # Query webapi database
        webapi_query, webapi_total_count = await FormProcessMapper.find_all(user_context=user_context, **filters)

        # Apply pagination filters
        webapi_query = webapi_query.offset(offset).limit(limit)

        # Combine results with data from formio
        results = []
        webapi_results = (await FormProcessMapper.execute(webapi_query)).all()
        for wr in webapi_results:
            submissions_count = await SubmissionModel.count(filters={"form": PydanticObjectId(wr.form_id)})
            results.append({
                "webapi": wr,
                "formio": await FormModel.get(PydanticObjectId(wr.form_id)),
                "calculated": {"total_submissions": submissions_count}
            })

        # Convert to GraphQL Schema
        forms = [FormSchema.from_result(result=r) for r in results]
        return PaginationWindow(items=forms, total_count=webapi_total_count)


    @classmethod
    async def get_form(
        cls,
        user_context: UserContext,
        form_id: str
    ) -> Optional[FormSchema]:
        """
        Fetches a form based on it's form_id from the WebAPI and adds additional details from FormIO.

        Args:
            user_context (UserContext): User context information
            form_id (str): ID of the form
        Returns:
            Form object containing combined PostgreSQL and MongoDB data
        """
        # Query the databases
        webapi_result = await FormProcessMapper.first(form_id=form_id)
        formio_result = await FormModel.get(PydanticObjectId(form_id))
        submissions_count = await SubmissionModel.count(filters={"form": PydanticObjectId(webapi_result.form_id)})

        # Combine results
        result = {
            "webapi": webapi_result,
            "formio": formio_result,
            "calculated": {"total_submissions": submissions_count}
        }

        # Convert to GraphQL Schema
        form = FormSchema.from_result(result=result) 
        return form

