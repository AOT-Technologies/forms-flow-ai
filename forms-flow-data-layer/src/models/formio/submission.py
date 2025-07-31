from typing import Any, Dict, List, Optional

from beanie import Document, PydanticObjectId
from bson import ObjectId

from .constants import FormioTables


class SubmissionModel(Document):
    data: dict
    _id: PydanticObjectId
    form: PydanticObjectId

    class Settings:
        name = FormioTables.SUBMISSIONS.value

    @classmethod
    async def count(cls, filters):
        """Count number of entries that match the passed filters."""
        query = cls.find_all()
        for filter, value in filters.items():
            if hasattr(cls, filter):
                query = query.find(getattr(cls, filter) == value)
        return (await query.count())

    @staticmethod
    def _build_match_stage(submission_ids: List[str], filter: Optional[dict]) -> dict:
        """Build the MongoDB match stage."""
        match_stage = {}
        if submission_ids:
            match_stage["_id"] = {"$in": [ObjectId(id) for id in submission_ids]}
        if filter:
            for field, value in filter.items():
                if isinstance(value, str):
                    # Only use regex for string values
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
        match_stage = SubmissionModel._build_match_stage(
            submission_ids=submission_ids, filter=filter
        )
        pipeline = [{"$match": match_stage}]

        # Add sorting if sort_by is specified
        if sort_stage := SubmissionModel._build_sort_stage(sort_by, sort_order):
            pipeline.append(sort_stage)

        # Projection stage
        pipeline.append(SubmissionModel._build_projection_stage(selected_form_fields))
        # Only add pagination if page_no and limit specified
        if page_no is not None and limit is not None:
            # Get only the count (no document data)
            count_pipeline = pipeline + [{"$count": "total"}]
            count_result = await SubmissionModel.aggregate(count_pipeline).to_list(length=1)
            total = count_result[0]["total"] if count_result else 0
            # Add skip and limit stages for pagination
            pipeline.append({"$skip": (page_no - 1) * limit})
            pipeline.append({"$limit": limit})
            items = await SubmissionModel.aggregate(pipeline).to_list()
        else:
            items = await SubmissionModel.aggregate(pipeline).to_list()
            total = len(items)
        return {
            "submissions": items,
            "total_count": total,
        }
