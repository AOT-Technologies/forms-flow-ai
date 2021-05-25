"""This exposes application audit service."""
from ..models import ApplicationAudit
from ..schemas import ApplicationAuditSchema


class ApplicationAuditService:
    """This class manages application service."""

    @staticmethod
    def create_application_history(data):
        """Create new application history."""

        application = ApplicationAudit.create_from_dict(data)

        return application

    @staticmethod
    def get_application_history(application_id):
        """Get application by id."""
        application_audits = ApplicationAudit.get_application_history(application_id)
        schema = ApplicationAuditSchema()
        return schema.dump(application_audits, many=True)
