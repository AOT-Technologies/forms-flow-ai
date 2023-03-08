"""This exposes create bundles services."""

from formsflow_api.models import FormBundling
from formsflow_api.services import FormProcessMapperService


class FormBundleService:  # pylint: disable=too-few-public-methods
    """This class manages form process mapper service."""

    @staticmethod
    def create_bundle(data):
        """Create new bundle according to forms inside the selected forms."""
        mapper_id = FormProcessMapperService.create_mapper(data)
        for form in data["selected_forms"]:
            form["formProcessMapperId"] = mapper_id.id
        FormBundling.create_from_dict(data)
        return mapper_id.id
