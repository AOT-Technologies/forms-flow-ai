from typing import List, Optional

from beanie import PydanticObjectId
from bson import ObjectId

from src.graphql.schema import FormSchema
from src.models.formio import FormModel, SubmissionsModel


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
    async def query_submissions(
        submission_ids, location, limit, sort_by=None, sort_order=None
    ):
        """
        Query submissions from MongoDB with flexible sorting options.

        Args:
            submission_ids: List of submission IDs to filter by
            location: Location value to match in data.location
            limit: Maximum number of documents to return
            sort_by: Field to sort by (None for no sorting, can be nested like 'data.location')
            sort_order: Sort direction ('asc' or 'desc'), default 'asc'

        Returns:
            List of submission documents with projected fields
        """
        match_stage = {"_id": {"$in": [ObjectId(id) for id in submission_ids]}}

        # Only add location filter if location parameter is provided
        if location is not None:
            match_stage["data.location"] = location

        pipeline = [{"$match": match_stage}]

        # Add sorting if sort_by is specified
        if sort_by:
            # Handle nested fields (like data.location)
            sort_field = f"{sort_by}" if "." in sort_by else sort_by
            sort_value = 1 if sort_order.lower() == "asc" else -1
            pipeline.append({"$sort": {sort_field: sort_value}})

        # Always include location in projection, even if not filtered by it
        pipeline.extend(
            [
                {"$limit": limit},
                {
                    "$project": {
                        "_id": {"$toString": "$_id"},
                        "location": "$data.location",
                    }
                },
            ]
        )

        return await SubmissionsModel.aggregate(pipeline).to_list()
