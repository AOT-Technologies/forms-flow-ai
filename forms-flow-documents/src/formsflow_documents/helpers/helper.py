"""Helper module for PDF export options."""
import base64
import os
import urllib.parse
from http import HTTPStatus

from flask import current_app
from formsflow_api_utils.exceptions import BusinessException
from formsflow_api_utils.services import FormioService
from nested_lookup import get_occurrences_and_values


class PdfHelpers:
    """Helper methods for pdf generation."""

    def __init__(self, form_id, submission_id) -> None:
        self.__is_form_adaptor = current_app.config.get("CUSTOM_SUBMISSION_ENABLED")
        self.__custom_submission_url = current_app.config.get("CUSTOM_SUBMISSION_URL")
        self.__form_io_url = current_app.config.get("FORMIO_URL")
        self.form_id = form_id
        self.submission_id = submission_id
        self.formio = FormioService()

    def __is_form_adapter(self):
        """Returns whether th eapplication is using a form adaptor."""
        return self.__is_form_adaptor

    def __get_custom_submission_url(self):
        """Returns the custom submission url based on config."""
        return self.__custom_submission_url

    def __get_formio_url(self):
        """Returns the formio url based on config."""
        return self.__form_io_url

    def __get_formio_access_token(self):
        """Returns formio access token."""
        return self.formio.get_formio_access_token()

    def __get_submission_data(self):
        """Returns the submission data from formio."""
        formio_get_payload = {"form_id": self.form_id, "sub_id": self.submission_id}
        return self.formio.get_submission(
            formio_get_payload, self.__get_formio_access_token()
        )

    def __get_form_data(self):
        """Returns the form data from formio."""
        return self.formio.get_form(
            {"form_id": self.form_id}, self.__get_formio_access_token()
        )

    def __get_form_and_submission_urls(self, token):
        """Returns the appropriate form and submission url based on the config."""
        form_io_url = self.__get_formio_url()
        if self.__is_form_adapter():
            sub_url = self.__get_custom_submission_url()
            form_url = form_io_url + "/form/" + self.form_id
            submission_url = (
                sub_url + "/form/" + self.form_id + "/submission/" + self.submission_id
            )
            auth_token = token
        else:
            form_url = (
                form_io_url
                + "/form/"
                + self.form_id
                + "/submission/"
                + self.submission_id
            )
            submission_url = None
            auth_token = None
        return (form_url, submission_url, auth_token)

    def __get_template_params(self, token):
        """Returns the jinja template parameters for pdf export with formio renderer."""
        form_io_url = self.__get_formio_url()
        (form_url, submission_url, auth_token) = self.__get_form_and_submission_urls(
            token
        )
        return {
            "form": {
                "base_url": form_io_url,
                "project_url": form_io_url,
                "form_url": form_url,
                "token": self.__get_formio_access_token(),
                "submission_url": submission_url,
                "form_apater": self.__is_form_adapter(),
                "auth_token": auth_token,
            }
        }

    # TODO: Refactor
    def get_render_data(self, use_template: bool, token):
        """
        Returns the render data for the pdf template.

        use_template: boolean, whether to use a template for generating pdf.
        token: token for the template parameters when using formio renderer.
        Raw data will be passed to the templat if the export is using any
        form of template. Else default formio renderer will be used where
        only the formio render parameters will be passed to the template.
        """
        if not use_template:
            return self.__get_template_params(token=token)
        submission_data = self.__get_submission_data()
        form_data = self.__get_form_data()
        submission_data_formatted = {"form": {"form": form_data, "data": {}}}

        for key, value in submission_data["data"].items():
            key_formatted = get_occurrences_and_values([form_data], value=key)[key][
                "values"
            ][0].get("label")
            value_formatted = value
            if value and isinstance(value, str):
                value_formatted = get_occurrences_and_values([form_data], value=value)[
                    value
                ]["values"]
                value_formatted = (
                    value_formatted[0].get("label", "")
                    if len(value_formatted) > 0
                    else value
                )
            submission_data_formatted["form"]["data"][key] = {
                "label": key_formatted,
                "value": value_formatted,
            }
        return submission_data_formatted

    @staticmethod
    def url_encode(payload: str):
        """Escapes url unsafe characters."""
        return urllib.parse.quote(payload)

    @staticmethod
    def url_decode(template: str) -> str:
        """Decodes the url encoded payload with utf-8 charset."""
        try:
            return urllib.parse.unquote(template)
        except Exception as err:
            current_app.logger.error(err)
            raise BusinessException(
                {"message": "URL decode failed!"}, HTTPStatus.BAD_REQUEST
            )

    @staticmethod
    def b64decode(template: str):
        """
        Decodes the base64 encoded payload with utf-8 charset.

        template: base64 encoded data, the data should be properly
        url decoded if payload is sent through url.
        """
        try:
            return base64.b64decode(template).decode("utf-8")
        except Exception as err:
            current_app.logger.error(err)
            raise BusinessException(
                {"message": "Failed to decode template!"}, HTTPStatus.BAD_REQUEST
            )

    def create_template(self, template: str, template_name: str = None):
        """
        Creates a temporary template in the template directory.

        template: base64 encoded template, supported template formats: jinja
        template_name: unique name for the template with extension, supported .html
        """
        decoded_template = self.b64decode(self.url_decode(template))
        path = os.path.dirname(__file__)
        path = path.replace("helpers", "templates")
        with open(f"{path}/{template_name}", "w", encoding="utf-8") as file:
            file.write(decoded_template)
            file.close()
        return template_name

    @staticmethod
    def search_template(file_name: str):
        """
        Check if the given file exists in the template directory.

        file_name: name of the file to check with extension.
        """
        path = os.path.dirname(__file__)
        path = path.replace("helpers", "templates")
        return os.path.isfile(f"{path}/{file_name}")

    @staticmethod
    def delete_template(file_name: str):
        """
        Delete the given file from template directory.

        file_name: name of the file with extension.
        """
        try:
            path = os.path.dirname(__file__)
            path = path.replace("helpers", "templates")
            os.remove(f"{path}/{file_name}")
        except:
            current_app.logger.error(
                f"Failed to delete template:- {file_name} not found"
            )
