from typing import Any, Dict, List, Optional

from beanie import Document, PydanticObjectId
from bson import ObjectId
from datetime import timezone, timedelta, datetime
from pymongo import ASCENDING
from .constants import FormioTables


async def ensure_collation_index(field: str):
    """Ensures a case-insensitive collation index exists for the specified field in the submissions collection.

    This function checks if a collation index exists for the given field and creates one if it doesn't.
    The index is created with English locale and strength 2 for case-insensitive comparisons.

    Args:
        field (str): The field name within the submission data to create an index for.
                    The index will be created on the path 'data.<field>'.

    Returns:
        None

    Note:
        - Index name format is 'ci_data_<field>'
        - Uses MongoDB collation with {"locale": "en", "strength": 2} for case-insensitive sorting
        - The index is created asynchronously using Motor
    """
    collection = SubmissionsModel.get_motor_collection()
    index_name = f"ci_data_{field}"

    # Check if index already exists
    indexes = await collection.index_information()
    if index_name not in indexes:
        await collection.create_index(
            [(f"data.{field}", ASCENDING)],
            name=index_name,
            collation={"locale": "en", "strength": 2}
        )


class SubmissionsModel(Document):
    data: dict
    _id: PydanticObjectId

    class Settings:
        name = FormioTables.SUBMISSIONS.value

    @staticmethod
    def _build_match_stage(submission_ids: List[str], filter: Optional[dict]) -> dict:
        """Build the MongoDB match stage."""
        match_stage = {}
        if submission_ids:
            match_stage["_id"] = {"$in": [ObjectId(id) for id in submission_ids]}
        if filter:
            for field, value in filter.items():
                if isinstance(value, str):
                    try:
                        # Always attempt to parse as DD-MM-YYYY
                        parsed_date = datetime.strptime(value, "%d-%m-%Y")
                        parsed_date = parsed_date.replace(tzinfo=timezone.utc)
                        # Build day range (covers whole date)
                        start = parsed_date.replace(hour=0, minute=0, second=0, microsecond=0)
                        end = start + timedelta(days=1)
                        match_stage[f"data.{field}"] = {"$gte": start, "$lt": end}
                    except ValueError:
                        # Regex for string values
                        match_stage[f"data.{field}"] = {"$regex": value, "$options": "i"}
                else:
                    # For non-string values (numbers, booleans, etc.), use exact match
                    match_stage[f"data.{field}"] = value
        return match_stage

    @staticmethod
    def _build_sort_stage(sort_by: str, sort_order: str) -> Optional[dict]:
        """Build the MongoDB sort stage if needed."""
        if not sort_by:
            return None
        sort_field = f"data.{sort_by}"
        sort_value = 1 if sort_order.lower() == "asc" else -1
        return {"$sort": {sort_field: sort_value}}

    @staticmethod
    def _build_projection_stage(project_fields: Optional[List[str]]) -> dict:
        """Build the MongoDB projection stage."""
        project_stage = {"$project": {
            "_id": {"$toString": "$_id"},
        }}
        if project_fields:
            for field in project_fields:
                project_stage["$project"][field] = f"$data.{field}"
        return project_stage

    @staticmethod
    async def query_submission(
        submission_ids: List[str],
        filter: Optional[dict] = None,
        selected_form_fields: Optional[List[str]] = None,
        page_no: Optional[int] = None,
        limit: Optional[int] = None,
        sort_by: Optional[str] = None,
        sort_order: str = "asc",
    ) -> Dict[str, Any]:
        """
        Query submissions from MongoDB with optional pagination and sorting.
        """
        # Build match stage
        match_stage = SubmissionsModel._build_match_stage(
            submission_ids=submission_ids, filter=filter
        )
        pipeline = [{"$match": match_stage}]

        # Add sorting if sort_by is specified
        if sort_stage := SubmissionsModel._build_sort_stage(sort_by, sort_order):
            pipeline.append(sort_stage)

        # Projection stage
        pipeline.append(SubmissionsModel._build_projection_stage(selected_form_fields))

        # Prepare aggregation options for case-insensitive sorting
        aggregate_options = {}
        if sort_by:
            await ensure_collation_index(sort_by)  # Create index if needed
            aggregate_options = {
                "collation": {"locale": "en", "strength": 2}  # Case-insensitive
            }

        # Only add pagination if page_no and limit specified
        if page_no is not None and limit is not None:
            # Get only the count (no document data)
            count_pipeline = pipeline + [{"$count": "total"}]
            count_result = await SubmissionsModel.aggregate(count_pipeline).to_list(length=1)
            total = count_result[0]["total"] if count_result else 0
            # Add skip and limit stages for pagination
            pipeline.append({"$skip": (page_no - 1) * limit})
            pipeline.append({"$limit": limit})
            items = await SubmissionsModel.aggregate(pipeline, **aggregate_options).to_list()
        else:
            items = await SubmissionsModel.aggregate(pipeline, **aggregate_options).to_list()
            total = len(items)
        return {
            "submissions": items,
            "total_count": total,
        }
