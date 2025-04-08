from typing import Any, Dict, List, Optional

from beanie import PydanticObjectId
from bson import ObjectId

from src.graphql.schema import FormSchema
from src.models.formio import FormModel, SubmissionsModel
from src.utils import get_logger

logger = get_logger(__name__)


# Service Layer for Form-related Operations
class FormService:
    @staticmethod
    def convert_to_graphql_type(form_model: FormModel) -> FormSchema:
        """
        Convert a Beanie FormModel to a GraphQL FormSchema

        Args:
            form_model (FormModel): Database model to convert

        Returns:
            FormSchema: GraphQL type representation
        """
        return FormSchema(
            id=str(form_model.id),  # Convert ObjectId to string
            name=form_model.name,
            path=form_model.path,
            type=form_model.type,
            title=form_model.title,
            display=str(form_model.display) if form_model.display else None,
            created_at=(
                form_model.created_at.isoformat() if form_model.created_at else None
            ),
            updated_at=(
                form_model.updated_at.isoformat() if form_model.updated_at else None
            ),
        )

    @staticmethod
    async def get_forms(
        skip: int = 0, limit: int = 100, type_filter: Optional[str] = None
    ) -> List[FormSchema]:
        """
        Fetch and convert forms to GraphQL types

        Args:
            skip (int): Pagination - number of items to skip
            limit (int): Maximum number of items to return
            type_filter (Optional[str]): Optional filter by form type

        Returns:
            List[FormSchema]: List of converted GraphQL form types
        """
        query = FormModel.find_all()

        if type_filter:
            query = query.find(FormModel.type == type_filter)

        # Execute query and convert results
        forms = await query.skip(skip).limit(limit).to_list()

        # Convert each form to GraphQL type
        return [FormService.convert_to_graphql_type(form) for form in forms]

    @staticmethod
    async def get_form(form_id: str) -> Optional[FormSchema]:
        """
        service to fetch a single form by ID

        Args:
            form_id (str): ID of the form to fetch

        Returns:
            Optional[FormSchema]: Matching form or None
        """
        try:
            # Convert string ID back to PydanticObjectId
            object_id = PydanticObjectId(form_id)

            # Fetch the form
            form_model = await FormModel.find_one(id=object_id)

            # If found, convert to GraphQL type
            return (
                await FormService.convert_to_graphql_type(form_model)
                if form_model
                else None
            )

        except Exception:
            # Handle invalid ID format or not found scenarios
            return None

    @staticmethod
    async def get_submissions(submission_id: str):
        """
        Service to fetch a single submission by ID

        Args:
            submission_id (str): ID of the submission to fetch

        Returns:
            Optional[FormSchema]: Matching submission or None
        """
        # Convert string ID back to PydanticObjectId
        object_id = PydanticObjectId(submission_id)
        submission = await SubmissionsModel.find_one({"_id": object_id})
        return (
            submission.data if submission else None
        )  # Return data if found, otherwise None

    @staticmethod
    async def _build_match_stage(submission_ids: List[str], search: Optional[dict]) -> dict:
        """Build the MongoDB match stage."""
        match_stage = {"_id": {"$in": [ObjectId(id) for id in submission_ids]}}
        if search:
            for field, value in search.items():
                match_stage[f"data.{field}"] = value
        return match_stage

    @staticmethod
    def _build_sort_stage(sort_by: str, sort_order: str) -> Optional[dict]:
        """Build the MongoDB sort stage if needed."""
        if not sort_by:
            return None
        sort_field = f"data.{sort_by}"
        sort_value = 1 if sort_order.lower() == "asc" else -1
        logger.info(f"Sorting by: {sort_field} in {sort_order} order")
        return {"$sort": {sort_field: sort_value}}

    @staticmethod
    def _build_projection_stage(project_fields: Optional[List[str]]) -> dict:
        """Build the MongoDB projection stage."""
        project_stage = {"$project": {"_id": {"$toString": "$_id"}}}
        if project_fields:
            for field in project_fields:
                project_stage["$project"][field] = f"$data.{field}"
        return project_stage

    @staticmethod
    async def query_submissions(
        submission_ids: List[str],
        search: Optional[dict] = None,
        project_fields: Optional[List[str]] = None,
        page_no: Optional[int] = None,
        limit: Optional[int] = None,
        sort_by: Optional[str] = None,
        sort_order: str = "asc",
    ) -> Dict[str, Any]:
        """
        Query submissions from MongoDB with optional pagination and sorting.
        """
        # Build match stage
        match_stage = await FormService._build_match_stage(submission_ids, search)
        pipeline = [{"$match": match_stage}]

        # Add sorting if sort_by is specified
        if sort_stage := FormService._build_sort_stage(sort_by, sort_order):
            pipeline.append(sort_stage)

        # Projection stage
        pipeline.append(FormService._build_projection_stage(project_fields))

        # Only add pagination if page_no and limit specified
        if page_no is not None and limit is not None:
            facet_stage = {
                "$facet": {
                    "items": [
                        {"$skip": (page_no - 1) * limit},
                        {"$limit": limit},
                    ],
                    "total": [{"$count": "count"}],
                }
            }
            pipeline.append(facet_stage)

            results = await SubmissionsModel.aggregate(pipeline).to_list()
            items = results[0]["items"] if results else []
            total = (
                results[0]["total"][0]["count"]
                if results and results[0]["total"]
                else 0
            )
        else:
            items = await SubmissionsModel.aggregate(pipeline).to_list()
            total = len(items)

        return {
            "submissions": items,
            "total_count": total,
        }
