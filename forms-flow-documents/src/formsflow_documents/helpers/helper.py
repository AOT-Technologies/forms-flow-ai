"""Helper module for PDF export options."""
import base64
import os
import urllib.parse
import uuid
from http import HTTPStatus

import requests
from flask import current_app
from formsflow_api_utils.exceptions import BusinessException
from formsflow_api_utils.services import FormioService
from formsflow_api_utils.utils import HTTP_TIMEOUT
from formsflow_api_utils.utils.pdf import get_pdf_from_html, pdf_response
from nested_lookup import get_occurrences_and_values


class PdfHelpers:
    """Helper methods for pdf generation."""

    def __init__(self, form_id, submission_id) -> None:
        self.__is_form_adaptor = current_app.config.get("CUSTOM_SUBMISSION_ENABLED")
        self.__custom_submission_url = current_app.config.get("CUSTOM_SUBMISSION_URL")
        self.__form_io_url = current_app.config.get("FORMIO_URL")
        self.__host_name = current_app.config.get("FORMSFLOW_DOC_API_URL")
        self.__chrome_driver_path = current_app.config.get("CHROME_DRIVER_PATH")
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

    def get_chrome_driver_path(self):
        """Returns the configured chrome driver path."""
        return self.__chrome_driver_path

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

    @staticmethod
    def __generate_template_name():
        """Generate unique template name."""
        return f"{str(uuid.uuid4())}.html"

    def __generate_pdf_file_name(self):
        """Generated the PDF file name."""
        return "Application_" + self.form_id + "_" + self.submission_id + "_export.pdf"

    def __get_render_url(self, template_name=None):
        """Returns the render URL."""
        url = (
            self.__host_name
            + "/form/"
            + self.form_id
            + "/submission/"
            + self.submission_id
            + "/render"
        )
        if template_name:
            url += f"?template_name={self.__url_encode(template_name)}"
        return url

    @staticmethod
    def __get_render_args(timezone, token, use_template=False):
        """Returns PDF render arguments."""
        args = {"wait": "completed", "timezone": timezone, "auth_token": token}
        if use_template:
            del args["wait"]
        return args

    @staticmethod
    def __url_encode(payload: str):
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
            ) from err

    def get_render_status(self, token, template_name=None):
        """Returns the render status code."""
        res = requests.get(
            url=self.__get_render_url(template_name),
            headers={"Authorization": token},
            timeout=HTTP_TIMEOUT,
        )
        return res.status_code

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
            ) from err

    def create_template(self, template: str):
        """
        Creates a temporary template in the template directory.

        template: base64 encoded template, supported template formats: jinja
        """
        template_name = self.__generate_template_name()
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
        except BaseException as _:  # pylint: disable=broad-except
            current_app.logger.error(
                f"Failed to delete template:- {file_name} not found"
            )

    def generate_pdf(self, timezone, token, template_name=None):
        """Generates PDF from HTML."""
        pdf = get_pdf_from_html(
            self.__get_render_url(template_name),
            self.get_chrome_driver_path(),
            args=self.__get_render_args(timezone, token, bool(template_name)),
        )
        return pdf_response(pdf, self.__generate_pdf_file_name()) if pdf else False
