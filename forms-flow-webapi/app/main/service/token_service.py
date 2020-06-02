import requests
import json

def tokenRequest():
    url ="https://iam.aot-technologies.com/auth/realms/forms-flow-ai/protocol/openid-connect/token"
    headers = {'Content-Type': 'application/x-www-form-urlencoded'}
    payload = {"client_id": "forms-flow-bpm","client_secret": "a3413dbd-caf2-41a8-ae54-e7aa448154d8","grant_type": "client_credentials"}
    r = requests.post(url, headers=headers,data = payload)
    data =  json.loads(r.text)
    return data["access_token"]