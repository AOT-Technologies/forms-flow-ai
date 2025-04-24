"""Utility functions to manage pdf generation using selenium chrome."""

import base64
import json
import os
import tempfile

from flask import current_app, make_response
from selenium.common.exceptions import TimeoutException
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.ui import WebDriverWait
from seleniumwire import webdriver
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

    # Set user details to local storage
    token_info = _get_token_info()
    user_details = {
        "sub": token_info.get("sub", None),
        "email_verified": token_info.get("email_verified", False),
        "role": token_info.get("roles", None) or token_info.get(
            "role", None
        ),
        "roles": token_info.get("roles", None) or token_info.get(
            "role", None
        ),
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



def get_pdf_from_html_string(html_content, chrome_driver_path=None, args=None):
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
        pdf = get_pdf_from_html(temp_url, chrome_driver_path, args)
        
        # Clean up temporary file
        try:
            os.unlink(temp_html_path)
        except Exception:
            pass  # Ignore cleanup errors
            
        return pdf
    except Exception as e:
        current_app.logger.error(f"Error generating PDF from HTML string: {str(e)}")
        return None