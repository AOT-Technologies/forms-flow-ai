import requests
import json
from os import environ as env

BPM_TOKEN_API = env.get('BPM_TOKEN_API')
BPM_CLIENT_ID = env.get('BPM_CLIENT_ID')
BPM_CLIENT_SECRET = env.get('BPM_CLIENT_SECRET')
BPM_GRANT_TYPE = env.get('BPM_GRANT_TYPE')

def tokenRequest():
    url = BPM_TOKEN_API
    headers = {'Content-Type': 'application/x-www-form-urlencoded'}
    payload = {"client_id": BPM_CLIENT_ID,"client_secret": BPM_CLIENT_SECRET,"grant_type": BPM_GRANT_TYPE}
    r = requests.post(url, headers=headers,data = payload)
    data =  json.loads(r.text)
    return data["access_token"]