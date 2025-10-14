"""Helper module for PDF export."""

import json
import os
import tempfile
import shutil
import urllib.parse
import uuid
from typing import Any, Tuple, Union

import requests
from flask import current_app, make_response
from formsflow_api_utils.services import FormioService
from formsflow_api_utils.utils import HTTP_TIMEOUT
from formsflow_api_utils.utils.pdf import (
    get_pdf_from_html,
    get_pdf_from_html_string,
    pdf_response,
)
from jinja2 import Environment, FileSystemLoader
from nested_lookup import get_occurrences_and_values

from formsflow_documents.filters import is_b64image
from formsflow_documents.utils import DocUtils


class PDFService:
    """Helper class for pdf generation."""

    __slots__ = (
        "__is_form_adaptor",
        "__is_enable_compact_form_view",
        "__custom_submission_url",
        "__form_io_url",
        "__host_name",
        "__chrome_driver_path",
        "__chrome_driver_timeout",
        "form_id",
        "submission_id",
        "formio",
    )

    def __init__(self, form_id: str, submission_id: str) -> None:
        """
        Initializes PDFService.

        form_id: formid corresponding to the PDF
        submission_id: submissionid corresponding to the PDF.
        """
        self.__is_form_adaptor = current_app.config.get("CUSTOM_SUBMISSION_ENABLED")
        self.__is_enable_compact_form_view = current_app.config.get(
            "ENABLE_COMPACT_FORM_VIEW"
        )
        self.__custom_submission_url = current_app.config.get("CUSTOM_SUBMISSION_URL")
        self.__form_io_url = current_app.config.get("FORMIO_URL")
        self.__host_name = current_app.config.get("FORMSFLOW_DOC_API_URL")
        self.__chrome_driver_path = current_app.config.get("CHROME_DRIVER_PATH")
        self.__chrome_driver_timeout = current_app.config.get("CHROME_DRIVER_TIMEOUT")
        self.form_id = form_id
        self.submission_id = submission_id
        self.formio = FormioService()

    def __is_form_adapter(self) -> bool:
        """Returns whether th eapplication is using a form adaptor."""
        return self.__is_form_adaptor

    def __is_enabled_compact_form_view(self) -> bool:
        """Returns whether thE application is using a COMPACT_FORM_VIEW."""
        return self.__is_enable_compact_form_view

    def __get_custom_submission_url(self) -> str:
        """Returns the custom submission url based on config."""
        return self.__custom_submission_url

    def __get_formio_url(self) -> str:
        """Returns the formio url based on config."""
        return self.__form_io_url

    def __get_formio_access_token(self) -> Any:
        """Returns formio access token."""
        return self.formio.get_formio_access_token()

    def __get_submission_data(self) -> Any:
        """Returns the submission data from formio."""
        formio_get_payload = {"form_id": self.form_id, "sub_id": self.submission_id}
        return self.formio.get_submission(
            formio_get_payload, self.__get_formio_access_token()
        )

    def __get_form_data(self) -> Any:
        """Returns the form data from formio."""
        return self.formio.get_form_by_id(
            self.form_id, self.__get_formio_access_token()
        )

    def __get_chrome_driver_path(self) -> str:
        """Returns the configured chrome driver path."""
        return self.__chrome_driver_path

    def __get_chrome_driver_timeout(self) -> int:
        """Returns the configured chrome driver timeout."""
        return self.__chrome_driver_timeout

    def __get_headers(self, token):
        """Returns the headers."""
        return {"Authorization": token, "content-type": "application/json"}

    def __fetch_custom_submission_data(self, token: str) -> Any:
        """Returns the submission data from form adapter."""
        sub_url = self.__get_custom_submission_url()
        submission_url = (
            f"{sub_url}/form/" + self.form_id + "/submission/" + self.submission_id
        )
        current_app.logger.debug(f"Fetching custom submission data..{submission_url}")
        headers = self.__get_headers(token)
        response = requests.get(submission_url, headers=headers, timeout=HTTP_TIMEOUT)
        current_app.logger.debug(
            f"Custom submission response code: {response.status_code}"
        )
        data = {}
        if response.status_code == 200:
            data = response.json()
        return data

    def __get_form_and_submission_urls(self, token: str) -> Tuple[str, str, str]:
        """Returns the appropriate form url and submission data based on the config."""
        form_io_url = self.__get_formio_url()
        current_app.logger.debug("Fetching form and submission data..")
        if self.__is_form_adapter():
            form_url = form_io_url + "/form/" + self.form_id
            submission_data = self.__fetch_custom_submission_data(token)
        else:
            form_url = (
                form_io_url
                + "/form/"
                + self.form_id
                + "/submission/"
                + self.submission_id
            )
            submission_data = None
        return (form_url, submission_data)

    def __get_template_params(self, token: str) -> dict:
        """Returns the jinja template parameters for pdf export with formio renderer."""
        form_io_url = self.__get_formio_url()
        (form_url, submission_data) = self.__get_form_and_submission_urls(token)
        return {
            "form": {
                "base_url": form_io_url,
                "project_url": form_io_url,
                "form_url": form_url,
                "token": self.__get_formio_access_token(),
                "form_adapter": self.__is_form_adapter(),
                "submission_data": submission_data,
                "compact_form_view": self.__is_enabled_compact_form_view(),
            }
        }

    @staticmethod
    def __generate_template_name() -> str:
        """Generate unique template name."""
        return f"{str(uuid.uuid4())}.html"

    @staticmethod
    def __generate_template_variables_name() -> str:
        """Generate unique template variable name."""
        return f"{str(uuid.uuid4())}.json"

    @staticmethod
    def get_template_path(is_temp: bool = False) -> str:
        """Returns the path to template directory."""
        if is_temp:
            temp_dir = os.path.join(tempfile.gettempdir(), "templates")
            # Create the directory if it doesn't exist
            if not os.path.exists(temp_dir):
                os.makedirs(temp_dir)
        else:
            temp_dir = os.path.dirname(__file__)
            temp_dir = temp_dir.replace("services", "templates")

        return temp_dir

    def generate_pdf_file_name(self) -> str:
        """Generated the PDF file name."""
        return "Application_" + self.form_id + "_" + self.submission_id + "_export.pdf"

    def __get_render_url(
        self,
        template_name: Union[str, None] = None,
        template_variable_name: Union[str, None] = None,
    ) -> str:
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
        if template_variable_name:
            url += f"&template_variable={self.__url_encode(template_variable_name)}"
        return url

    @staticmethod
    def __get_render_args(
        timezone: str, token: str, use_template: bool = False
    ) -> dict:
        """Returns PDF render arguments."""
        args = {"wait": "completed", "timezone": timezone, "auth_token": token}
        if use_template:
            del args["wait"]
        return args

    @staticmethod
    def __url_encode(payload: str) -> str:
        """Escapes url unsafe characters."""
        return urllib.parse.quote(payload)

    def __read_json(self, file_name: str) -> Any:
        """Reads the json file contents to a variable."""
        path = self.get_template_path(is_temp=True)
        with open(f"{path}/{file_name}", encoding="utf-8") as file:
            data = json.load(file)
            file.close()
            return data

    def get_render_status(
        self,
        token: str,
        template_name: Union[str, None] = None,
        template_variable_name: Union[str, None] = None,
    ) -> int:
        """Returns the render status code."""
        res = requests.get(
            url=self.__get_render_url(template_name, template_variable_name),
            headers={"Authorization": token},
            timeout=HTTP_TIMEOUT,
        )
        return res.status_code

    def __get_formatted_data(self, form_data, submission_data):
        """Returns the presentable data from the submission data."""
        submission_data_formatted = {"form": {"form": form_data, "data": {}}}
        for key, value in submission_data["data"].items():
            key_formatted = get_occurrences_and_values([form_data], value=key)[key][
                "values"
            ][0].get("label")
            if key_formatted is None:
                continue
            value_formatted = value
            if value and DocUtils.is_camel_case(value):
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

    def get_render_data(
        self, use_template: bool, template_variable_name: Union[str, None], token: str
    ) -> Any:
        """
        Returns the render data for the pdf template.

        use_template: boolean, whether to use a template for generating pdf.
        template_variable_name: template variable file name for requests with
        template variable payload.
        token: token for the template parameters when using formio renderer.
        Raw data will be passed to the template if the export is using any
        form of template. Else default formio renderer will be used where
        only the formio render parameters will be passed to the template.
        """
        if not use_template:
            return self.__get_template_params(token=token)
        if template_variable_name:
            return self.__read_json(template_variable_name)

        submission_data = (
            self.__fetch_custom_submission_data(token)
            if self.__is_form_adapter()
            else self.__get_submission_data()
        )
        form_data = self.__get_form_data()

        return self.__get_formatted_data(form_data, submission_data)

    def __write_to_file(
        self, template_name: str, content: Union[str, dict], is_json: bool = False
    ) -> None:
        """Write data to file."""
        path = self.get_template_path(is_temp=True)
        current_app.logger.info(f" PATH ->> {path}")
        with open(f"{path}/{template_name}", "w", encoding="utf-8") as file:
            # disabling pylint warning since it is a function call
            if is_json:
                json.dump(content, file)
            else:
                file.write(content)
            file.close()

    def create_template(
        self, template: str, template_var: dict = None
    ) -> Tuple[str, Union[str, None]]:
        """
        Creates a temporary template in the template directory.

        template: base64 encoded template, supported template formats: jinja
        """
        template_name = self.__generate_template_name()
        template_var_name = (
            self.__generate_template_variables_name() if template_var else None
        )
        decoded_template = DocUtils.b64decode(template)
        self.__write_to_file(template_name, content=decoded_template)
        if template_var:
            self.__write_to_file(template_var_name, content=template_var, is_json=True)
        return (template_name, template_var_name)

    def search_template(self, file_name: str, is_temp: bool = False) -> bool:
        """
        Check if the given file exists in the template directory.

        file_name: name of the file to check with extension.
        """
        current_app.logger.info(f"Looking for {file_name}")
        path = self.get_template_path(is_temp=is_temp)
        current_app.logger.info(f"Searching for template... {path}")

        # Print all files in the directory to help debug
        current_app.logger.info("Files in template directory:")
        if os.path.exists(path):
            for root, dirs, files in os.walk(path):
                for file in files:
                    current_app.logger.info(f"- {os.path.join(root, file)}")
                for _dir in dirs:
                    current_app.logger.info(f"- [DIR] {os.path.join(root, _dir)}")
        else:
            current_app.logger.info(f"Template directory does not exist: {path}")

        # Check if the file exists
        file_path = os.path.join(path, file_name)
        exists = os.path.isfile(file_path)
        current_app.logger.info(f"Checking file: {file_path}, exists: {exists}")

        return exists

    def delete_template(self, file_name: str) -> None:
        """
        Delete the given file from template directory.

        file_name: name of the file with extension.
        """
        try:
            path = self.get_template_path(is_temp=True)
            os.remove(f"{path}/{file_name}")
        except BaseException as err:  # pylint: disable=broad-except
            current_app.logger.error(err)
            current_app.logger.error(
                f"Failed to delete template: {file_name} not found"
            )

    def generate_pdf(
        self,
        timezone: str,
        token: str,
        template_name: Union[str, None] = None,
        template_variable_name: str = None,
    ) -> Any:
        """Generates PDF from HTML."""
        pdf = get_pdf_from_html(
            self.__get_render_url(template_name, template_variable_name),
            self.__get_chrome_driver_path(),
            args=self.__get_render_args(timezone, token, bool(template_name)),
            chrome_driver_timeout=self.__get_chrome_driver_timeout(),
        )
        return pdf_response(pdf, self.generate_pdf_file_name()) if pdf else False

    def get_pdf_from_html_content(self, html_content, timezone, token):
        """Generate PDF directly from HTML content instead of URL.

        This method bypasses the need to call the render endpoint by
        directly converting HTML content to PDF.

        Args:
            html_content: The rendered HTML content as a string
            timezone: Timezone for PDF generation
            token: Authentication token

        Returns:
            The generated PDF as bytes
        """
        try:
            # Use the PDF utility to convert HTML string to PDF
            pdf = get_pdf_from_html_string(
                html_content,
                self.__get_chrome_driver_path(),
                args=self.__get_render_args(timezone, token, True),
                chrome_driver_timeout=self.__get_chrome_driver_timeout(),
            )
            return pdf
        except Exception as e:  # pylint:disable=broad-exception-caught
            current_app.logger.error(
                f"Error generating PDF from HTML content: {str(e)}"
            )
            return None

    def create_pdf_response(self, pdf, filename):
        """Create a PDF response with appropriate headers.

        This is a duplicate of the imported pdf_response function to make
        it directly accessible from the service class.

        Args:
            pdf: PDF content as bytes
            filename: Name for the download file

        Returns:
            Flask response object with PDF content
        """
        response = make_response(pdf)
        response.headers["Content-Type"] = "application/pdf"
        response.headers["Content-Disposition"] = (
            f"attachment; filename={filename}"  # noqa
        )
        return response

    def copy_templates_to_temp(self, temp_dir):
        """Copy template.html from the source directory to the temporary directory."""
        current_app.logger.debug("Copying template.html to temporary directory...")
        source_dir = os.path.dirname(__file__).replace("services", "templates")
        source_file = os.path.join(source_dir, "template.html")
        dest_file = os.path.join(temp_dir, "template.html")

        # Create destination directory if it doesn't exist
        os.makedirs(temp_dir, exist_ok=True)

        # Copy template.html if it doesn't already exist in the temp directory
        if os.path.isfile(source_file) and not os.path.exists(dest_file):
            shutil.copy2(source_file, dest_file)
            current_app.logger.debug(f"Copied template.html to {temp_dir}")

    def create_pdf_from_custom_template(
        self, template_name, template_variable_name, token, timezone
    ):
        """Directly render the template instead of calling the additional endpoint."""
        try:
            # Get the template path
            temp_dir = self.get_template_path(is_temp=True)
            current_app.logger.info(f"Template directory: {temp_dir}")

            # Get render data
            render_data = self.get_render_data(True, template_variable_name, token)
            current_app.logger.info(
                "Render data received for direct template rendering"
            )

            # Set up Jinja environment with the temp directory
            env = Environment(loader=FileSystemLoader(temp_dir), autoescape=True)
            template_obj = env.get_template(template_name)

            if not template_variable_name:
                # When generating PDF without template variables,
                # copy necessary templates to the temporary directory if not already present
                self.copy_templates_to_temp(temp_dir)
                # Update the Jinja environment to include the is_signature function
                env.globals.update(is_signature=is_b64image)

            # Render the template directly
            rendered_html = template_obj.render(**render_data)

            # Generate PDF from the rendered HTML
            pdf = self.get_pdf_from_html_content(rendered_html, timezone, token)

            if pdf:
                # Clean up temporary files
                current_app.logger.info("Cleaning up temporary template files...")
                self.delete_template(template_name)
                if template_variable_name:
                    self.delete_template(template_variable_name)

                # Return the PDF
                return self.create_pdf_response(pdf, self.generate_pdf_file_name())

        except Exception as e:  # pylint:disable=broad-exception-caught
            current_app.logger.error(f"Error in direct template rendering: {str(e)}")
        return None

    def generate_pdf_from_template(  # pylint: disable-msg=too-many-locals
        self,
        timezone: str,
        token: str,
    ) -> Any:
        """Generate PDF."""
        # Get render data
        render_data = self.get_render_data(False, None, token)
        current_app.logger.debug("Render data received for PDF generation")
        # Get the template folder path
        template_dir = self.get_template_path(is_temp=False)
        current_app.logger.info(f"Template directory: {template_dir}")

        # Setup environment
        env = Environment(loader=FileSystemLoader(template_dir), autoescape=True)

        # Override `url_for` to output relative paths like static/style.css
        # Avoids url_for undefined error outside Flask
        env.globals["url_for"] = (
            lambda endpoint, **values: f"static/{values['filename']}"
        )

        # Load default template and render
        template = env.get_template("index.html")
        html = template.render(**render_data)

        # Create a temporary file to store the HTML content
        fd, temp_html_path = tempfile.mkstemp(suffix=".html")
        with os.fdopen(fd, "w") as f:
            f.write(html)

        # Use file:// protocol to access the temporary file
        temp_url = f"file://{temp_html_path}"  # noqa: E231

        # Move the static files to a temporary directory
        temp_dir = os.path.join(tempfile.gettempdir())
        current_app.logger.debug(f"Template directory: {temp_dir}")
        # Copy static folder only if it doesn't already exist in temp directory
        temp_static_dir = os.path.join(temp_dir, "static")
        current_app.logger.debug("Copying static files to temporary directory...")
        if not os.path.exists(temp_static_dir):
            # get static files path
            static_dir = os.path.dirname(__file__)
            static_dir = static_dir.replace("services", "static")
            shutil.copytree(static_dir, temp_static_dir)
        else:
            current_app.logger.info(
                "Static folder already exists in temp directory, skipping copy."
            )

        # Use the existing function to generate PDF from URL
        pdf = get_pdf_from_html(
            temp_url,
            self.__get_chrome_driver_path(),
            args=self.__get_render_args(timezone, token, False),
            chrome_driver_timeout=self.__get_chrome_driver_timeout(),
        )
        # Clean up temporary file
        try:
            os.unlink(temp_html_path)
        except Exception:  # pylint:disable=broad-exception-caught
            pass  # Ignore cleanup errors

        return (
            self.create_pdf_response(pdf, self.generate_pdf_file_name())
            if pdf
            else False
        )
