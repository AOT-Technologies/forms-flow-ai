from beanie import Document


class SubmissionsModel(Document):
    data: dict

    class Settings:
        name = "submissions"
