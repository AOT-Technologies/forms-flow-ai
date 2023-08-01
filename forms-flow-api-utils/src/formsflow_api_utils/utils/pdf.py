"""Utility functions to manage pdf generation using selenium chrome."""

import base64
import json

from flask import current_app, make_response
from selenium.common.exceptions import TimeoutException
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.ui import WebDriverWait
from seleniumwire import webdriver


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


# pylint: disable=R1710


def get_pdf_from_html(path, chromedriver=None, p_options=None, args=None):
    """Load url in chrome web driver and print as pdf."""

    def interceptor(request):
        request.headers["Authorization"] = args["auth_token"]

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
    sel_options = {"request_storage_base_dir": "/tmp"}

    service = Service(executable_path=chromedriver)
    # pylint: disable=E1123
    driver = webdriver.Chrome(
        service=service, options=options, seleniumwire_options=sel_options
    )
    driver.set_window_size(1920, 1080)

    if "auth_token" in args:
        driver.request_interceptor = interceptor

    if "timezone" in args and args["timezone"] is not None:
        tz_params = {"timezoneId": args["timezone"]}
        driver.execute_cdp_cmd("Emulation.setTimezoneOverride", tz_params)

    driver.get(path)

    try:
        if "wait" in args:
            delay = 30  # seconds
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
        driver.quit()
        return base64.b64decode(result["data"])

    except TimeoutException as err:
        driver.quit()
        current_app.logger.warning(err)
        return False


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
