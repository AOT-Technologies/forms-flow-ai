"""This exposes form bundling service."""

from http import HTTPStatus
from typing import Dict, List, Set

from formsflow_api_utils.exceptions import BusinessException
from formsflow_api_utils.utils import DESIGNER_GROUP
from formsflow_api_utils.utils.user_context import UserContext, user_context

from formsflow_api.models import FormBundling, FormProcessMapper
from formsflow_api.schemas import FormBundleDetailSchema
from formsflow_api.schemas.form_bundling import SelectedFormSchema

bundle_schema = SelectedFormSchema()
form_detail_schema = FormBundleDetailSchema()


class FormBundleService:  # pylint:disable=too-few-public-methods
    """This class manages form bundling service."""

    @staticmethod
    def create_bundle(data):
        """Create new bundle according to forms inside the selected forms."""
        return FormBundling.create_from_dict(data)

    @staticmethod
    def update_bundle(mapper_id: int, data: Dict[str, any]):
        """Update bundle details."""
        return FormBundling.update_bundle_from_dict(mapper_id, data)

    @staticmethod
    @user_context
    def get_bundle_by_id(mapper_id: int, **kwargs):
        """Get bundle details by mapper_id."""
        parent_form_ids: Set[str] = []
        bundle_forms: List = []
        user: UserContext = kwargs["user"]
        bundle = FormProcessMapper.find_form_by_id(mapper_id)
        try:
            if (
                DESIGNER_GROUP in user.roles and bundle.deleted is False
            ) or bundle.status == "active":
                bundle_forms = FormBundling.find_by_form_process_mapper_id(mapper_id)
                for form_bundle in bundle_forms:
                    parent_form_ids.append(form_bundle.parent_form_id)
                bundle_form_detail = FormProcessMapper.find_forms_by_parent_from_ids(
                    parent_form_ids
                )
                bundle_forms_list = bundle_schema.dump(bundle_forms, many=True)
                bundle_form_details = form_detail_schema.dump(
                    bundle_form_detail, many=True
                )
                selected_forms = {}
                for form in bundle_form_details + bundle_forms_list:
                    if form["parentFormId"] in selected_forms:
                        selected_forms[form["parentFormId"]].update(form)
                    else:
                        selected_forms[form["parentFormId"]] = form
                bundle_forms = sorted(
                    list(selected_forms.values()), key=lambda d: d["formOrder"]
                )
                for index, value in enumerate(bundle_forms, start=1):
                    value["formOrder"] = index
            return bundle_forms
        except AttributeError as err:
            raise BusinessException(
                "Bundle does not exist.", HTTPStatus.NOT_FOUND
            ) from err
