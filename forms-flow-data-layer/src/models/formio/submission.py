from beanie import Document, PydanticObjectId


class SubmissionsModel(Document):
    data: dict
    _id: PydanticObjectId

    class Settings:
        name = "submissions"
