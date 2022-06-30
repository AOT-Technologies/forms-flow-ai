"""This exposes submission service."""

from http import HTTPStatus
import json
from formsflow_api.exceptions import BusinessException
from formsflow_api.models import Draft
from formsflow_api.schemas import DraftSchema


class DraftService:
    """This class manages submission service."""
    @staticmethod
    def create_draft(data):
        """Create new mapper between form and process."""
        return Draft.create_from_dict(data)
