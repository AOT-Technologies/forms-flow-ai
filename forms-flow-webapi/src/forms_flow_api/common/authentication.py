import json
import os

from flask import request

import jwt

from ..common.responses import errorResponse


public_key = os.getenv('public_key')
audience = os.getenv('audience')


def verify_auth_token():
    try:
        auth_token = request.headers.get('Authorization', None)
        #auth_token = 'eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJJSXlONlpkOWs2M1ZGV1VZQjIzUU1lNkZwMkcwSk5SQV9HdERKRmJadVBJIn0.eyJqdGkiOiIwMTc0NGFkYS1hZjM1LTQxOTAtOWNjMi00YTkyMTgxN2RhOWEiLCJleHAiOjE1OTA2NjY3MDQsIm5iZiI6MCwiaWF0IjoxNTkwNjY2NDA0LCJpc3MiOiJodHRwczovL2lhbS5hb3QtdGVjaG5vbG9naWVzLmNvbS9hdXRoL3JlYWxtcy9mb3Jtcy1mbG93LWFpIiwiYXVkIjoiZm9ybXMtZmxvdy13ZWIiLCJzdWIiOiI1Zjg0MzhlZC1jY2FhLTQ4NWYtOWRlZi1jYjlmN2Q2MTAyZjMiLCJ0eXAiOiJJRCIsImF6cCI6ImZvcm1zLWZsb3ctd2ViIiwibm9uY2UiOiI0MDBmZjE3OC0zZjRiLTRjMWUtODk5MC0zYjY2MDA3YWE5MjIiLCJhdXRoX3RpbWUiOjE1OTA2NjY0MDEsInNlc3Npb25fc3RhdGUiOiJiMTI1N2RhNS1hOWM1LTQ4YjktYjAzOS02NTBiYTM1MGE4OTAiLCJhY3IiOiIxIiwiZW1haWxfdmVyaWZpZWQiOmZhbHNlLCJyb2xlIjpbInJwYXMtZGVzaWduZXIiXSwibmFtZSI6IlJpbnR1IE1lcmluIiwicHJlZmVycmVkX3VzZXJuYW1lIjoicnBhcy1kZXNpZ25lciIsImdpdmVuX25hbWUiOiJSaW50dSIsImZhbWlseV9uYW1lIjoiTWVyaW4iLCJlbWFpbCI6InJpbnR1Lm1lcmluQGFvdC10ZWNobm9sb2dpZXMuY29tIn0.PiOdFs1O7t9u3yVwNodzQZvsaOdmFYTtGQSukDnM_X2gfQ1hcq3MEdpnga7Qx33WigLX79ydy9UxwzTNzKggE5fKKZaOlrsOEGDGXZNYPbxkFnNkQHET68CwKQe25e17Bb8WmyKFl2gmDYwr1PsjDiT539xO7zZAjxF8L5kgL4Bpl7d3cnFBYtmdKtK_nEoLUJva7TBMfJNWFwukWyhvKV9eUxoj5YoG3sUaFLhMBFx88Cpw7IVm0SD5i84QWt_yFD_GkYyr4qAcjEjGN0NKjgdIAqIWWzv4MVzaYn2OA7ZxICG4bh-Rnm9utXBiQQXbTlXoqtjMGNmx8cL1IVlU9A'
        if auth_token == None:
            # return errorResponse('Authorization header is expected.')
            return True
        else:
            payload = json.dumps(jwt.decode(auth_token, public_key, audience=audience))
            if "rpas-designer" in payload['roles']  :
                return True
            else:
                return False
            return True

    except jwt.ExpiredSignatureError:
        return errorResponse('Signature expired. Please log in again.')

    except jwt.InvalidTokenError:
        return errorResponse('Invalid token. Please log in again.')


