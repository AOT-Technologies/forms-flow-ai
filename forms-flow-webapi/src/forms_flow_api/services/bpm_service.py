import json

import requests

from .token_service import tokenRequest


def httpGETRequest(url):
    token = tokenRequest()
    auth_token = 'Bearer ' + token
    headers = {'Authorization': auth_token}
    r = requests.get(url, headers=headers)
    return json.loads(r.text)


def httpPOSTRequest(url):
    token = tokenRequest()
    auth_token = 'Bearer ' + token
    headers = {'Authorization': auth_token}
    r = requests.post(url, headers=headers)
    return json.loads(r.text)
