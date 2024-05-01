"""Test suite for pdf service module."""
import pytest  # noqa

from src.formsflow_documents.services import PDFService
from tests.utilities import get_test_template


class TestPDFService:
    """Tests suite for PDFService class."""

    template = get_test_template()

    def test_get_render_data_without_template_and_template_variable(self, app, mock_redis_client):
        """Test get_render_data method for the request without template and template variable."""
        with app.app_context():
            service = PDFService(form_id="1234", submission_id="1234567")
            render_data = service.get_render_data(
                use_template=False,
                template_variable_name=False,
                token="__dummy_token__",
            )
            assert "form" in render_data
            assert "base_url" in render_data["form"]
            assert "project_url" in render_data["form"]
            assert "form_url" in render_data["form"]
            assert "token" in render_data["form"]
            assert "submission_url" in render_data["form"]
            assert "form_adapter" in render_data["form"]
            assert "auth_token" in render_data["form"]

    def test_get_render_data_with_template_and_template_variable(self, app):
        """Test get_render_data method for the request with template and template variables."""
        with app.app_context():
            service = PDFService(form_id="1234", submission_id="1234567")
            template_vars = {"templateVars": {"invoiceNumber": 123456}}
            (template_name, template_var_name) = service.create_template(
                template=self.template, template_var=template_vars
            )
            render_data = service.get_render_data(
                use_template=True,
                template_variable_name=template_var_name,
                token="__dummy_token__",
            )
            assert render_data == template_vars
            service.delete_template(template_name)
            service.delete_template(template_var_name)

    def test_get_render_data_with_template_and_without_template_variable(self, app, mock_redis_client):
        """Test get_render_data method for the request with template and without template variable."""
        with app.app_context():
            service = PDFService(form_id="1234", submission_id="1234567")
            (template_name, template_var_name) = service.create_template(
                template=self.template, template_var=None
            )
            assert template_var_name is None
            render_data = service.get_render_data(
                use_template=True,
                template_variable_name=template_var_name,
                token="__dummy_token__",
            )
            assert "form" in render_data
            render_data = render_data["form"]
            assert "form" in render_data
            assert "data" in render_data
            service.delete_template(template_name)

    def test_delete_template_invalid_case(self, app):
        """Tests the delete_template method raise no exception."""
        with app.app_context():
            service = PDFService(form_id="1234", submission_id="1234567")
            try:
                service.delete_template("__invalid")
            except BaseException as err:
                assert False, f"raised Exception {err}"
