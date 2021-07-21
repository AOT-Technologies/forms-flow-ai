"""This exposes application audit service."""
from ..models import ApplicationHistory
from ..schemas import ApplicationHistorySchema


class ApplicationHistoryService:
    """This class manages application service."""

    @staticmethod
    def create_application_history(data):
        """Create new application history."""

        application = ApplicationHistory.create_from_dict(data)

        return application

    @staticmethod
    def get_application_history(application_id):
        """Get application by id."""
        application_history = ApplicationHistory.get_application_history(application_id)
        schema = ApplicationHistorySchema()
        return schema.dump(application_history, many=True)
