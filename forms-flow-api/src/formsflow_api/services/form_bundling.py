"""This exposes create bundles services."""

from formsflow_api.models import FormBundling


class FormBundleService:  # pylint: disable=too-few-public-methods
    """This class manages form process mapper service."""

    @staticmethod
    def create_bundle(data):
        """Create new bundle according to forms inside the selected forms."""
        return FormBundling.create_from_dict(data)
