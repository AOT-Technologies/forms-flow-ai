"""This exposes form bundling service."""

from typing import List, Set

from formsflow_api_utils.utils import DESIGNER_GROUP
from formsflow_api_utils.utils.user_context import UserContext, user_context

from formsflow_api.models import FormBundling, FormProcessMapper
from formsflow_api.schemas import FormProcessMapperSchema


class FormBundleService:  # pylint:disable=too-few-public-methods
    """This class manages form bundling service."""

    @staticmethod
    def create_bundle(data):
        """Create new bundle according to forms inside the selected forms."""
        return FormBundling.create_from_dict(data)

    @staticmethod
    @user_context
    def get_forms_bundle(bundle_id: int, **kwargs):
        """Get forms inside a bundle."""
        bundle_forms: List = []
        parent_form_ids: Set[str] = []
        user: UserContext = kwargs["user"]
        form = FormProcessMapper.find_form_by_id(bundle_id)
        if (
            DESIGNER_GROUP in user.roles and form.deleted is False
        ) or form.status == "active":
            form_bundles = FormBundling.find_by_form_process_mapper_id(bundle_id)
            for form_bundle in form_bundles:
                parent_form_ids.append(form_bundle.parent_form_id)
            if DESIGNER_GROUP in user.roles:
                forms = FormProcessMapper.find_forms_by_parent_from_ids(parent_form_ids)
            else:
                forms = FormProcessMapper.find_forms_by_active_parent_from_ids(
                    parent_form_ids
                )
            mapper_schema = FormProcessMapperSchema()
            bundle_forms = mapper_schema.dump(forms, many=True)
        return bundle_forms
