"""Module to handle form submission and application creation simultaneously."""

from http import HTTPStatus
from typing import Dict, List

from flask import current_app
from formsflow_api_utils.exceptions import BusinessException
from formsflow_api_utils.services.external import FormioService

from formsflow_api.schemas import ApplicationSchema

from .application import ApplicationService


class CombineFormAndApplicationCreate:  # pylint: disable=too-few-public-methods
    """Combines Form and Application Services."""

    @staticmethod
    def application_create_with_submission(data, formio_url, web_url, token):
        """Creates application after success submission."""
        try:
            application_schema = ApplicationSchema()
            data = (
                __class__.__populate_default_keys(  # pylint: disable=protected-access
                    data
                )
            )
            application_data = application_schema.load(data)
            formio_service = FormioService()
            form_io_token = formio_service.get_formio_access_token()
            formio_data = formio_service.post_submission(data, form_io_token)
            application_data["submission_id"] = formio_data["_id"]
            application_data[
                "form_url"
            ] = f"{formio_url}/form/{application_data['form_id']}/submission/{formio_data['_id']}"
            application_data[
                "web_form_url"
            ] = f"{web_url}/form/{application_data['form_id']}/submission/{formio_data['_id']}"
            application, status = ApplicationService.create_application(
                data=application_data, token=token
            )
            response = application_schema.dump(application)
            return response, status
        except PermissionError as err:
            current_app.logger.warning(err)
            response, status = (
                {
                    "type": "Permission Denied",
                    "message": f"Access to formId-{application_data['form_id']} is prohibited",
                },
                HTTPStatus.FORBIDDEN,
            )
            raise BusinessException(response, status) from err

        except KeyError as err:
            current_app.logger.warning(err)
            response, status = {
                "type": "Bad request error",
                "message": "Invalid application request passed",
            }, HTTPStatus.BAD_REQUEST
            raise BusinessException(response, status) from err

        except BaseException as application_err:  # pylint: disable=broad-except
            current_app.logger.warning(application_err)
            response, status = {
                "type": "Bad request error",
                "message": "Invalid application request passed",
            }, HTTPStatus.BAD_REQUEST
            raise BusinessException(response, status) from application_err

    @staticmethod
    def __populate_default_keys(  # pylint: disable=unused-private-member
        form_data: Dict,
    ) -> Dict:
        """Populate default keys to the form data if they are not present."""
        default_keys: List[str] = ["applicationStatus", "applicationId"]
        for key in default_keys:
            if key not in form_data.get("data"):
                form_data["data"][key] = ""
        return form_data
