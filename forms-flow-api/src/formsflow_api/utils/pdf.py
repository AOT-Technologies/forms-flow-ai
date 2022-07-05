from lib2to3.pgen2 import token
import json, base64
from seleniumwire import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.support.ui import WebDriverWait

from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.common.by import By
from selenium.common.exceptions import TimeoutException
from flask import make_response


def send_devtools(driver, cmd, params={}):
  """Chrome dev tools execution function."""
  resource = "/session/%s/chromium/send_command_and_get_result" % driver.session_id
  url = driver.command_executor._url + resource
  body = json.dumps({'cmd': cmd, 'params': params})
  response = driver.command_executor._request('POST', url, body)
  if response.get('status'):
    raise Exception(response.get('value'))
  return response.get('value')



def get_pdf_from_html(path, chromedriver='./chromedriver', print_options = {}, wait = None, auth_token = None):
  """Load url in chrome web driver and print as pdf."""
  def interceptor(request):
    request.headers['Authorization'] = auth_token
    
  webdriver_options = Options()
  webdriver_options.add_argument('--headless')
  webdriver_options.add_argument('--disable-gpu')
  webdriver_options.add_argument("--no-sandbox")
  webdriver_options.add_argument("--disable-dev-shm-usage")
  webdriver_options.add_argument('--run-all-compositor-stages-before-draw')

  driver = webdriver.Chrome(chromedriver, options=webdriver_options)
  
  if auth_token != None:
    driver.request_interceptor = interceptor
  driver.get(path)
 
  try:
      if wait != None:
          delay = 10 # seconds
          myElem = WebDriverWait(driver, delay).until(EC.presence_of_element_located((By.CLASS_NAME, wait)))
      calculated_print_options = {
      'landscape': False,
      'displayHeaderFooter': False,
      'printBackground': True,
      'preferCSSPageSize': True,
      }
      calculated_print_options.update(print_options)
      result = send_devtools(driver, "Page.printToPDF", calculated_print_options)
      driver.quit()
      return base64.b64decode(result['data'])

  except TimeoutException:
    print('Timeout error')

def pdf_response(result, fileName="Pdf.pdf"):
  """Render pdf response from html content."""
  response = make_response(result)
  response.headers['Content-Type'] = 'application/pdf'
  response.headers['Content-Disposition'] = 'inline; filename='+fileName
  return response

def save_pdf_local(result, fileName="Pdf.pdf"):
  """Save html content as pdf response."""
  with open(fileName, 'wb') as file:
    file.write(result)