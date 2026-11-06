"""Unit tests for scoping the PDF auth token to trusted origins (no Chrome needed)."""

import json
import threading
from unittest.mock import MagicMock

import pytest
from flask import Flask
from websocket import WebSocketConnectionClosedException

from formsflow_api_utils.utils import pdf
from formsflow_api_utils.utils.pdf import _AuthHeaderInterceptor, _origin, _trusted_origins


@pytest.mark.parametrize(
    "url, expected",
    [
        ("https://Host.Example:443/path?q=1", "https://host.example"),
        ("HTTP://host.example:80/", "http://host.example"),
        ("http://host.example:8080/x", "http://host.example:8080"),
        ("http://[::1]:8080/x", "http://[::1]:8080"),
        ("https://host.example:99999/", None),  # invalid port
        ("file:///tmp/x.html", None),
        ("javascript:alert(1)", None),
        ("", None),
        (None, None),
    ],
)
def test_origin(url, expected):
    """Origins are normalized and non-http(s) URLs are rejected."""
    assert _origin(url) == expected


def test_trusted_origins_for_file_page_only_uses_auth_hosts():
    """A file:// page gets no own-origin trust; only explicit auth_hosts count."""
    origins = _trusted_origins("file:///tmp/x.html", ["https://api.example/v1", None, "bad"])
    assert origins == {"https://api.example"}


def test_trusted_origins_includes_page_origin():
    """The page's own http(s) origin is trusted by default."""
    assert _trusted_origins("https://docs.example:8443/render", None) == {
        "https://docs.example:8443"
    }


def _interceptor(origins=("https://api.example",)):
    """Build an interceptor without opening a DevTools connection."""
    interceptor = _AuthHeaderInterceptor.__new__(_AuthHeaderInterceptor)
    interceptor._token = "Bearer SECRET"
    interceptor._origins = set(origins)
    interceptor._msg_id = 0
    interceptor._lock = threading.Lock()
    interceptor._logger = MagicMock()
    interceptor._ws = MagicMock()
    return interceptor


def _sent(interceptor):
    return [json.loads(call.args[0]) for call in interceptor._ws.send.call_args_list]


def test_continue_adds_token_for_trusted_origin_and_replaces_existing():
    """Trusted requests get exactly one Authorization header with the user token."""
    interceptor = _interceptor()
    interceptor._continue(
        {
            "requestId": "r1",
            "request": {
                "url": "https://api.example/form",
                "headers": {"Accept": "*/*", "authorization": "Bearer OTHER"},
            },
        }
    )
    (msg,) = _sent(interceptor)
    assert msg["method"] == "Fetch.continueRequest"
    assert msg["params"]["requestId"] == "r1"
    assert msg["params"]["headers"] == [
        {"name": "Accept", "value": "*/*"},
        {"name": "Authorization", "value": "Bearer SECRET"},
    ]


@pytest.mark.parametrize(
    "url",
    [
        "https://cdn.example/lib.js",
        "https://api.example.evil.com/x",
        "http://api.example/x",  # scheme mismatch
        "https://api.example:8443/x",  # port mismatch
    ],
)
def test_continue_does_not_add_token_for_untrusted_origin(url):
    """Untrusted requests continue unchanged (no headers override, no token)."""
    interceptor = _interceptor()
    interceptor._continue({"requestId": "r2", "request": {"url": url, "headers": {}}})
    (msg,) = _sent(interceptor)
    assert msg["params"] == {"requestId": "r2"}


def test_listen_recovers_from_bad_events_and_stops_on_close():
    """A bad event must not stop the listener or leave requests paused."""
    interceptor = _interceptor()
    interceptor._ws.recv.side_effect = [
        "not json",
        json.dumps({"method": "Fetch.requestPaused", "params": {"requestId": "bad"}}),
        json.dumps({"method": "Network.somethingElse", "params": {}}),
        json.dumps(
            {
                "method": "Fetch.requestPaused",
                "params": {"requestId": "ok", "request": {"url": "https://api.example/a"}},
            }
        ),
        WebSocketConnectionClosedException(),
    ]
    original_continue = interceptor._continue

    def failing_continue(params):
        if params["requestId"] == "bad":
            raise KeyError("request")
        original_continue(params)

    interceptor._continue = failing_continue
    interceptor._listen()  # returns once the connection closes

    sent = _sent(interceptor)
    assert [m["params"]["requestId"] for m in sent] == ["bad", "ok"]
    assert "headers" not in sent[0]["params"]  # failed one continues without the token
    assert sent[1]["params"]["headers"][-1]["value"] == "Bearer SECRET"
    interceptor._logger.exception.assert_called_once()


def _driver(address):
    driver = MagicMock()
    driver.capabilities = {"goog:chromeOptions": {"debuggerAddress": address}}
    driver.execute_cdp_cmd.return_value = {"targetInfo": {"targetId": "ABC123"}}
    return driver


@pytest.mark.parametrize(
    "address, expected",
    [
        ("localhost:9222", "ws://127.0.0.1:9222/devtools/page/ABC123"),
        ("127.0.0.1:9222", "ws://127.0.0.1:9222/devtools/page/ABC123"),
        ("[::1]:9222", "ws://[::1]:9222/devtools/page/ABC123"),
    ],
)
def test_page_ws_url_uses_driver_target(address, expected):
    """The websocket URL targets the driver's own page on the loopback debugger."""
    driver = _driver(address)
    assert _AuthHeaderInterceptor._page_ws_url(driver) == expected
    driver.execute_cdp_cmd.assert_called_once_with("Target.getTargetInfo", {})


@pytest.mark.parametrize("address", ["10.0.0.5:9222", "evil.example:9222", "localhost:abc"])
def test_page_ws_url_rejects_non_loopback_debugger(address):
    """Never connect to a debugger that is not on the loopback interface."""
    with pytest.raises(RuntimeError):
        _AuthHeaderInterceptor._page_ws_url(_driver(address))


def test_get_pdf_from_html_quits_driver_when_interceptor_fails(monkeypatch):
    """The Chrome driver is always cleaned up, even if interception setup fails."""
    driver = MagicMock()
    monkeypatch.setattr(pdf.webdriver, "Chrome", MagicMock(return_value=driver))
    monkeypatch.setattr(pdf, "Service", MagicMock())
    monkeypatch.setattr(
        pdf, "_AuthHeaderInterceptor", MagicMock(side_effect=RuntimeError("boom"))
    )
    with Flask(__name__).app_context(), pytest.raises(RuntimeError):
        pdf.get_pdf_from_html("https://docs.example/render", args={"auth_token": "Bearer X"})
    driver.quit.assert_called_once()
