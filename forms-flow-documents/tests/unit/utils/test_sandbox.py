"""Tests that every Jinja template is rendered inside a sandbox."""

import base64
from unittest.mock import patch

import pytest
from flask import render_template_string
from jinja2 import DictLoader
from jinja2.sandbox import ImmutableSandboxedEnvironment, SecurityError

from src.formsflow_documents.services import PDFService
from formsflow_documents.utils.sandbox import (
    SandboxedFlaskEnvironment,
    create_sandboxed_environment,
)

SSTI_PAYLOADS = [
    "{{ ''.__class__.__mro__[1].__subclasses__() }}",
    "{{ cycler.__init__.__globals__.os.popen('id').read() }}",
    "{{ self._TemplateReference__context.cycler.__init__.__globals__ }}",
]


@pytest.mark.parametrize("payload", SSTI_PAYLOADS)
def test_sandboxed_environment_blocks_ssti(payload):
    """Assert that unsafe attribute access raises SecurityError."""
    env = create_sandboxed_environment(DictLoader({"t.html": payload}))
    with pytest.raises(SecurityError):
        env.get_template("t.html").render()


def test_sandboxed_environment_blocks_mutation():
    """Assert that render data passed to the template cannot be mutated."""
    env = create_sandboxed_environment(DictLoader({"t.html": "{{ items.append(1) }}"}))
    with pytest.raises(SecurityError):
        env.get_template("t.html").render(items=[])


def test_sandboxed_environment_renders_and_autoescapes():
    """Assert that normal templates still render and output is autoescaped."""
    env = create_sandboxed_environment(
        DictLoader({"t.html": "{% for k, v in data.items() %}{{ k }}={{ v }};{% endfor %}"})
    )
    assert isinstance(env, ImmutableSandboxedEnvironment)
    html = env.get_template("t.html").render(data={"a": "<b>"})
    assert html == "a=&lt;b&gt;;"


def test_flask_app_uses_sandboxed_environment(app):
    """Assert that flask.render_template (used by the /render endpoint) is sandboxed."""
    with app.app_context():
        assert isinstance(app.jinja_env, SandboxedFlaskEnvironment)
        assert render_template_string("{{ 1 + 1 }}") == "2"
        for payload in SSTI_PAYLOADS:
            with pytest.raises(SecurityError):
                render_template_string(payload)


@pytest.mark.parametrize("payload", SSTI_PAYLOADS)
def test_custom_template_pdf_blocks_ssti(app, payload):
    """Assert that a malicious custom template is never rendered into a PDF."""
    with app.app_context():
        service = PDFService(form_id="1234", submission_id="1234567")
        template = base64.b64encode(payload.encode()).decode()
        template_name, _ = service.create_template(template, {"a": 1})
        with patch.object(
            PDFService, "get_pdf_from_html_content", return_value=b"%PDF"
        ) as pdf_mock:
            result = service.create_pdf_from_custom_template(
                template_name, None, "__dummy_token__", None
            )
        assert result is None
        pdf_mock.assert_not_called()
        service.delete_template(template_name)
