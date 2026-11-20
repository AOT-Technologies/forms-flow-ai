"""Tests that every Jinja template is rendered inside a sandbox."""

import base64
import os
from unittest.mock import patch

import pytest
from flask import render_template_string
from formsflow_api_utils.exceptions import BusinessException
from jinja2 import DictLoader
from jinja2.exceptions import UndefinedError
from jinja2.sandbox import ImmutableSandboxedEnvironment, SecurityError

from formsflow_documents.services import PDFService
from formsflow_documents.utils.constants import BusinessErrorCode
from formsflow_documents.utils.sandbox import (
    SandboxedFlaskEnvironment,
    create_sandboxed_environment,
)

SSTI_PAYLOADS = [
    "{{ ''.__class__.__mro__[1].__subclasses__() }}",
    "{{ cycler.__init__.__globals__.os.popen('id').read() }}",
    "{{ self._TemplateReference__context.cycler.__init__.__globals__ }}",
]

CONFIG_PAYLOADS = [
    "{{ config.SECRET_KEY }}",
    "{{ config['SECRET_KEY'] }}",
    "{{ config.items() | list }}",
    "{{ config.from_mapping(JWT_OIDC_JWKS_URI='https://attacker.example') }}",
]


def _b64(text):
    return base64.b64encode(text.encode()).decode()


@pytest.mark.parametrize("payload", SSTI_PAYLOADS)
def test_sandboxed_environment_blocks_ssti(payload):
    """Assert that unsafe attribute access raises SecurityError."""
    template = create_sandboxed_environment(DictLoader({"t.html": payload})).get_template(
        "t.html"
    )
    with pytest.raises(SecurityError):
        template.render()


def test_sandboxed_environment_blocks_mutation():
    """Assert that render data passed to the template cannot be mutated."""
    template = create_sandboxed_environment(
        DictLoader({"t.html": "{{ items.append(1) }}"})
    ).get_template("t.html")
    with pytest.raises(SecurityError):
        template.render(items=[])


@pytest.mark.parametrize("payload", CONFIG_PAYLOADS)
def test_sandboxed_environment_blocks_flask_config(app, payload):
    """Assert that a Flask Config passed into a template can't be read or changed."""
    before = dict(app.config)
    template = create_sandboxed_environment(DictLoader({"t.html": payload})).get_template(
        "t.html"
    )
    with pytest.raises(SecurityError):
        template.render(config=app.config)
    assert dict(app.config) == before


def test_sandboxed_environment_renders_and_autoescapes():
    """Assert that normal templates still render and output is autoescaped."""
    env = create_sandboxed_environment(
        DictLoader({"t.html": "{% for k, v in data.items() %}{{ k }}={{ v }};{% endfor %}"})
    )
    assert isinstance(env, ImmutableSandboxedEnvironment)
    html = env.get_template("t.html").render(data={"a": "<b>"})
    assert html == "a=&lt;b&gt;;"


def test_flask_app_uses_sandboxed_environment(app):
    """Assert that flask.render_template is sandboxed and normal rendering works."""
    with app.test_request_context("/"):
        assert isinstance(app.jinja_env, SandboxedFlaskEnvironment)
        assert render_template_string("{{ 1 + 1 }}") == "2"


@pytest.mark.parametrize("payload", SSTI_PAYLOADS)
def test_flask_render_blocks_ssti(app, payload):
    """Assert that render_template_string blocks SSTI payloads."""
    with app.test_request_context("/"), pytest.raises(SecurityError):
        render_template_string(payload)


@pytest.mark.parametrize(
    "payload",
    CONFIG_PAYLOADS + ["{{ request.environ }}", "{{ g.token_info }}", "{{ session.keys() }}"],
)
def test_flask_render_has_no_app_internals(app, payload):
    """Assert that config, request, session and g are not available to templates."""
    before = dict(app.config)
    with app.test_request_context("/?a=1"), pytest.raises(UndefinedError):
        render_template_string(payload)
    assert dict(app.config) == before
    for name in ("config", "request", "session", "g"):
        assert name not in app.jinja_env.globals


def _create_custom_template(service, template, template_vars):
    template_name, var_name = service.create_template(_b64(template), template_vars)
    assert var_name is not None
    return template_name, var_name


def _template_files_exist(service, *names):
    path = service.get_template_path(is_temp=True)
    return [os.path.exists(os.path.join(path, name)) for name in names]


def test_custom_template_pdf_renders_benign_template(app):
    """Positive control: the same flow with a safe template produces a PDF."""
    with app.app_context():
        service = PDFService(form_id="1234", submission_id="1234567")
        template_name, var_name = _create_custom_template(
            service, "<p>Invoice {{ invoiceNumber }}</p>", {"invoiceNumber": 42}
        )
        with patch.object(
            PDFService, "get_pdf_from_html_content", return_value=b"%PDF"
        ) as pdf_mock:
            result = service.create_pdf_from_custom_template(
                template_name, var_name, "__dummy_token__", None
            )
        pdf_mock.assert_called_once()
        assert "<p>Invoice 42</p>" in pdf_mock.call_args.args[0]
        assert result is not None and result.status_code == 200
        assert _template_files_exist(service, template_name, var_name) == [False, False]


@pytest.mark.parametrize("payload", SSTI_PAYLOADS)
def test_custom_template_pdf_blocks_ssti(app, payload):
    """Assert that a malicious custom template is rejected and never turned into a PDF."""
    with app.app_context():
        service = PDFService(form_id="1234", submission_id="1234567")
        template_name, var_name = _create_custom_template(
            service, payload, {"invoiceNumber": 42}
        )
        with patch.object(
            PDFService, "get_pdf_from_html_content", return_value=b"%PDF"
        ) as pdf_mock, pytest.raises(BusinessException) as err:
            service.create_pdf_from_custom_template(
                template_name, var_name, "__dummy_token__", None
            )
        assert err.value.code == BusinessErrorCode.TEMPLATE_UNSAFE.name
        assert err.value.status_code == 400
        pdf_mock.assert_not_called()
        # Caller-supplied files are removed even when rendering fails
        assert _template_files_exist(service, template_name, var_name) == [False, False]


@pytest.mark.parametrize("payload", CONFIG_PAYLOADS)
def test_custom_template_has_no_flask_config(app, payload):
    """Assert that custom templates have no Flask config and produce no PDF."""
    before = dict(app.config)
    with app.app_context():
        service = PDFService(form_id="1234", submission_id="1234567")
        template_name, var_name = _create_custom_template(
            service, payload, {"invoiceNumber": 42}
        )
        with patch.object(
            PDFService, "get_pdf_from_html_content", return_value=b"%PDF"
        ) as pdf_mock:
            result = service.create_pdf_from_custom_template(
                template_name, var_name, "__dummy_token__", None
            )
        assert result is None
        pdf_mock.assert_not_called()
        assert dict(app.config) == before
        assert _template_files_exist(service, template_name, var_name) == [False, False]


def test_render_custom_template_extends_builtin_template(app):
    """Assert that custom templates can still extend the built-in template.html."""
    render_data = {"title": "Hello", "form": {"id": "1"}}
    with app.app_context():
        service = PDFService(form_id="1234", submission_id="1234567")
        template_name, var_name = _create_custom_template(
            service,
            '{% extends "template.html" %}{% block content %}<h1>{{ title }}</h1>{% endblock %}',
            render_data,
        )
        html = service.render_custom_template(template_name, render_data)
        assert "<h1>Hello</h1>" in html
        service.delete_template(template_name)
        service.delete_template(var_name)
