"""Utility functions to manage pdf generation using selenium chrome."""

import base64
import json
import os
import tempfile
import threading
from urllib.parse import urlsplit

from flask import current_app, make_response
from selenium import webdriver
from selenium.common.exceptions import TimeoutException
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.ui import WebDriverWait
from websocket import WebSocketConnectionClosedException, create_connection

from .user_context import _get_token_info


def send_devtools(driver, cmd, params=None):
    """Chrome dev tools execution function."""
    resource = "/session/" + driver.session_id + "/chromium/send_command_and_get_result"
    # pylint: disable=protected-access
    url = driver.command_executor._url + resource
    body = json.dumps({"cmd": cmd, "params": params})
    # pylint: disable=protected-access
    response = driver.command_executor._request("POST", url, body)
    if response.get("status"):
        raise Exception(response.get("value"))
    return response.get("value")


def _origin(url):
    """Return the normalized ``scheme://host[:port]`` origin of an http(s) URL, else None."""
    if not url:
        return None
    try:
        parts = urlsplit(str(url).strip())
        port = parts.port
    except ValueError:
        return None
    scheme = (parts.scheme or "").lower()
    if scheme not in ("http", "https") or not parts.hostname:
        return None
    host = parts.hostname.lower()
    if ":" in host:  # IPv6 literal
        host = f"[{host}]"
    default_port = 443 if scheme == "https" else 80
    if port and port != default_port:
        return f"{scheme}://{host}:{port}"  # noqa: E231
    return f"{scheme}://{host}"  # noqa: E231


def _trusted_origins(path, auth_hosts):
    """Origins allowed to receive the user token: the page's own origin plus auth_hosts."""
    origins = {_origin(path)}
    for host in auth_hosts or []:
        origins.add(_origin(host))
    origins.discard(None)
    return origins


_LOOPBACK_HOSTS = ("127.0.0.1", "localhost", "::1")


class _AuthHeaderInterceptor:
    """Attach the Authorization header only to requests sent to trusted origins.

    ``Network.setExtraHTTPHeaders`` sends the header to every host the page
    contacts (CDNs, images, any external URL in a form), leaking the user's
    token. Instead, we open our own DevTools connection to the page, enable
    ``Fetch`` interception only for the trusted origins, and add the header to
    each paused request after re-checking its origin. Requests to any other
    host are never paused and never see the token.
    """

    def __init__(self, driver, token, origins, timeout=10):
        self._token = token
        self._origins = origins
        self._msg_id = 0
        self._lock = threading.Lock()
        # current_app is not available on the listener thread
        self._logger = current_app.logger
        self._ws = create_connection(
            self._page_ws_url(driver), timeout=timeout, suppress_origin=True
        )
        patterns = [
            {"urlPattern": f"{origin}/*", "requestStage": "Request"}
            for origin in sorted(origins)
        ]
        self._call("Fetch.enable", {"patterns": patterns})
        self._wait_for(self._msg_id)
        self._ws.settimeout(None)
        self._thread = threading.Thread(target=self._listen, daemon=True)
        self._thread.start()

    @staticmethod
    def _page_ws_url(driver):
        """Return the DevTools websocket URL of the page controlled by the driver.

        The target id comes from chromedriver itself (no HTTP discovery call),
        so we always attach to the exact page the driver is controlling.
        Only a loopback debugger address is accepted.
        """
        address = driver.capabilities["goog:chromeOptions"]["debuggerAddress"]
        host, _, port = address.rpartition(":")
        host = host.strip("[]").lower()
        if host not in _LOOPBACK_HOSTS or not port.isdigit():
            raise RuntimeError(f"Unexpected Chrome debugger address: {address}")
        target_id = driver.execute_cdp_cmd("Target.getTargetInfo", {})["targetInfo"]["targetId"]
        if host == "::1":
            return f"ws://[::1]:{port}/devtools/page/{target_id}"  # noqa: E231
        return f"ws://127.0.0.1:{port}/devtools/page/{target_id}"  # noqa: E231

    def _call(self, method, params):
        with self._lock:
            self._msg_id += 1
            self._ws.send(json.dumps({"id": self._msg_id, "method": method, "params": params}))
            return self._msg_id

    def _wait_for(self, msg_id):
        while True:
            message = json.loads(self._ws.recv())
            if message.get("id") == msg_id:
                if "error" in message:
                    raise RuntimeError(message["error"])
                return

    def _listen(self):
        while True:
            try:
                message = json.loads(self._ws.recv())
            except (WebSocketConnectionClosedException, OSError):
                return  # driver quit / close()
            except ValueError:
                self._logger.warning("Ignoring malformed DevTools message")
                continue
            if message.get("method") != "Fetch.requestPaused":
                continue
            params = message.get("params", {})
            try:
                self._continue(params)
            except Exception:  # pylint: disable=broad-except
                # Never leave a request paused: let it continue without the token
                self._logger.exception("PDF auth interceptor failed; continuing request unmodified")
                self._continue_unmodified(params)

    def _continue_unmodified(self, params):
        if "requestId" not in params:
            return
        try:
            self._call("Fetch.continueRequest", {"requestId": params["requestId"]})
        except Exception:  # pylint: disable=broad-except
            self._logger.exception("PDF auth interceptor could not continue request")

    def _continue(self, params):
        request = params.get("request", {})
        payload = {"requestId": params["requestId"]}
        if _origin(request.get("url")) in self._origins:
            headers = [
                {"name": name, "value": value}
                for name, value in request.get("headers", {}).items()
                if name.lower() != "authorization"
            ]
            headers.append({"name": "Authorization", "value": self._token})
            payload["headers"] = headers
        self._call("Fetch.continueRequest", payload)

    def close(self):
        """Close the DevTools connection and stop the listener thread."""
        try:
            self._ws.close()
        except Exception:  # pylint: disable=broad-except
            pass
        self._thread.join(timeout=1)


# pylint: disable=R1710


def get_pdf_from_html(path, chromedriver=None, p_options=None, args=None, chrome_driver_timeout=60):
    """Load url in chrome web driver and print as pdf."""
    if args is None:
        args = {}

    options = Options()
    options.add_argument("--headless")
    options.add_argument("--disable-gpu")
    options.add_argument("--no-sandbox")
    options.add_argument("--disable-dev-shm-usage")
    options.add_argument("--run-all-compositor-stages-before-draw")
    options.add_argument("--disable-logging")
    options.add_argument("--log-level=3")

    service = Service(executable_path=chromedriver)
    driver = webdriver.Chrome(service=service, options=options)
    driver.set_window_size(1920, 1080)

    interceptor = None
    try:
        if args.get("auth_token"):
            # Attach the token only to formsflow hosts, never to third-party hosts.
            origins = _trusted_origins(path, args.get("auth_hosts"))
            if origins:
                interceptor = _AuthHeaderInterceptor(driver, args["auth_token"], origins)

        if "timezone" in args and args["timezone"] is not None:
            tz_params = {"timezoneId": args["timezone"]}
            driver.execute_cdp_cmd("Emulation.setTimezoneOverride", tz_params)

        driver.get(path)

        # Set user details to local storage
        token_info = _get_token_info()
        user_details = {
            "sub": token_info.get("sub", None),
            "email_verified": token_info.get("email_verified", False),
            "role": token_info.get("roles", None) or token_info.get("role", None),
            "roles": token_info.get("roles", None) or token_info.get("role", None),
            "name": token_info.get("name", None),
            "groups": token_info.get("groups", None),
            "preferred_username": token_info.get("preferred_username", None),
            "given_name": token_info.get("given_name", None),
            "family_name": token_info.get("family_name", None),
            "email": token_info.get("email", None),
            "tenantKey": token_info.get("tenantKey", None),
        }

        user_details_json = json.dumps(user_details)
        driver.execute_script(f"window.localStorage.setItem('UserDetails', '{user_details_json}')")

        if "wait" in args:
            delay = chrome_driver_timeout  # seconds
            elem_loc = EC.presence_of_element_located((By.CLASS_NAME, args["wait"]))
            WebDriverWait(driver, delay).until(elem_loc)
        calculated_print_options = {
            "landscape": False,
            "displayHeaderFooter": False,
            "printBackground": True,
            "preferCSSPageSize": True,
        }
        if p_options is not None:
            calculated_print_options.update(p_options)
        result = send_devtools(driver, "Page.printToPDF", calculated_print_options)
        return base64.b64decode(result["data"])

    except TimeoutException as err:
        current_app.logger.warning(err)
        return False
    finally:
        if interceptor:
            interceptor.close()
        driver.quit()


def pdf_response(result, file_name="Pdf.pdf"):
    """Render pdf response from html content."""
    response = make_response(result)
    response.headers["Content-Type"] = "application/pdf"
    response.headers["Content-Disposition"] = "inline; filename=" + file_name
    return response


def save_pdf_local(result, file_name="Pdf.pdf"):
    """Save html content as pdf response."""
    with open(file_name, "wb") as file:
        file.write(result)


def get_pdf_from_html_string(html_content, chrome_driver_path=None, args=None, chrome_driver_timeout=60):
    """
    Generate PDF from HTML content string using Chrome/Chromium.
    
    Args:
        html_content (str): HTML content to convert to PDF
        chrome_driver_path (str): Path to chrome driver
        args (dict): Dictionary of arguments to pass to Chrome
        
    Returns:
        bytes: PDF content as bytes
    """
    try:
        # Create a temporary file to store the HTML content
        fd, temp_html_path = tempfile.mkstemp(suffix='.html')
        with os.fdopen(fd, 'w') as f:
            f.write(html_content)
        
        # Use file:// protocol to access the temporary file
        temp_url = f"file://{temp_html_path}"
        
        # Use the existing function to generate PDF from URL
        pdf = get_pdf_from_html(temp_url, chrome_driver_path, args=args, chrome_driver_timeout=chrome_driver_timeout)
        
        # Clean up temporary file
        try:
            os.unlink(temp_html_path)
        except Exception:
            pass  # Ignore cleanup errors
            
        return pdf
    except Exception as e:
        current_app.logger.error(f"Error generating PDF from HTML string: {str(e)}")
        return None
