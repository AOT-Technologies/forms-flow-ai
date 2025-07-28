from typing import List, Optional

from beanie import PydanticObjectId

from src.graphql.schema import FormSchema, PaginationWindow
from src.models.formio import Form, Submission
from src.models.webapi import FormProcessMapper
from src.utils import get_logger

logger = get_logger(__name__)


class FormService():
    """Service class for handling form related operations."""

    @classmethod
    async def get_forms(
        cls,
        limit: int = 100,
        offset: int = 0,
        filters: dict[str, str] = {},
    ) -> PaginationWindow[FormSchema]:
        """
        Fetches forms from the WebAPI and adds additional details from FormIO.

        Args:
            limit (int): Number of items to return (default: 100)
            offset (int): Pagination offset (default: 0)
            filters (dict): Search filters to apply to the query
        Returns:
            Paginated list of Form objects containing combined PostgreSQL and MongoDB data
        """
        # Query webapi database
        webapi_query, webapi_total_count = await FormProcessMapper.find_all(**filters)

        # Apply pagination filters
        webapi_query = webapi_query.offset(offset).limit(limit)

        # Combine results with data from formio
        results = []
        webapi_results = (await FormProcessMapper.execute(webapi_query)).all()
        for wr in webapi_results:
            submissions_count = await Submission.count(filters={"form": PydanticObjectId(wr.form_id)})
            results.append({
                "webapi": wr,
                "formio": await Form.get(PydanticObjectId(wr.form_id)),
                "calculated": {"total_submissions": submissions_count}
            })

        # Convert to GraphQL Schema
        forms = [FormSchema.from_result(result=r) for r in results]
        return PaginationWindow(items=forms, total_count=webapi_total_count)


    @classmethod
    async def get_form(cls, form_id: str) -> Optional[FormSchema]:
        """
        Fetches a form based on it's form_id from the WebAPI and adds additional details from FormIO.

        Args:
            form_id (str): ID of the form
        Returns:
            Form object containing combined PostgreSQL and MongoDB data
        """
        # Query the databases
        webapi_result = await FormProcessMapper.first(form_id=form_id)
        formio_result = await Form.get(PydanticObjectId(form_id))
        submissions_count = await Submission.count(filters={"form": PydanticObjectId(webapi_result.form_id)})

        # Combine results
        result = {
            "webapi": webapi_result,
            "formio": formio_result,
            "calculated": {"total_submissions": submissions_count}
        }

        # Convert to GraphQL Schema
        form = FormSchema.from_result(result=result) 
        return form

