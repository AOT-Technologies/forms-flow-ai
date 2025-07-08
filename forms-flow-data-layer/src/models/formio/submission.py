from typing import Any, Dict, List, Optional

from beanie import Document, PydanticObjectId
from bson import ObjectId

from .constants import FormioTables


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
                match_stage[f"data.{field}"] = {"$regex": value, "$options": "i"}
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
        # Only add pagination if page_no and limit specified
        if page_no is not None and limit is not None:
            total_items = await SubmissionsModel.aggregate(pipeline).to_list()
            total = len(total_items)
            pipeline.append({"$skip": (page_no - 1) * limit})
            pipeline.append({"$limit": limit})
            items = await SubmissionsModel.aggregate(pipeline).to_list()
        else:
            items = await SubmissionsModel.aggregate(pipeline).to_list()
            total = len(items)
        return {
            "submissions": items,
            "total_count": total,
        }
