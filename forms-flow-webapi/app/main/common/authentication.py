from flask import Flask, request,jsonify
import jwt
import os
from ..common.responses import errorResponse
import datetime as datetime

    
def decode_auth_token(auth_token):
    """
    Decodes the auth token
    :param auth_token:
    :return: integer|string
    """
    public_key=b'''-----BEGIN PUBLIC KEY-----MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAoOzzAWKs/sbog8ypg+4S-----END PUBLIC KEY-----'''
    

    try:
        payload = jwt.decode(auth_token, public_key)
        return payload
    
    except jwt.ExpiredSignatureError:
        return errorResponse("Signature expired. Please log in again.")
        
    except jwt.InvalidTokenError:
        return errorResponse("Invalid token. Please log in again.")
        
    
def get_token_auth_header():
    
    #auth = request.headers.get("Authorization", None)
    auth = '''eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJJSXlONlpkOWs2M1ZGV1VZQjIzUU1lNkZwMkcwSk5SQV9HdERKRmJadVBJIn0.eyJqdGkiOiI3NmUyMWFkZS0wYjhiLTQwY2QtODI2OC1lN2FkMzU1NTRjZGYiLCJleHAiOjE1OTAxMjE5MjgsIm5iZiI6MCwiaWF0IjoxNTkwMTIxNjI4LCJpc3MiOiJodHRwczovL2lhbS5hb3QtdGVjaG5vbG9naWVzLmNvbS9hdXRoL3JlYWxtcy9mb3Jtcy1mbG93LWFpIiwiYXVkIjoiYWNjb3VudCIsInN1YiI6IjVmODQzOGVkLWNjYWEtNDg1Zi05ZGVmLWNiOWY3ZDYxMDJmMyIsInR5cCI6IkJlYXJlciIsImF6cCI6ImZvcm1zLWZsb3ctd2ViIiwibm9uY2UiOiI1MzU1ZTA0NS04N2I5LTQyNjctODJhNy03M2MzMTkzZTlhNmUiLCJhdXRoX3RpbWUiOjE1OTAxMjE2MTgsInNlc3Npb25fc3RhdGUiOiI3Y2YwN2EzZC0zZTE3LTQ0NzctYWU1My04MDc5MTlmNGZkOTUiLCJhY3IiOiIxIiwiYWxsb3dlZC1vcmlnaW5zIjpbIioiXSwicmVhbG1fYWNjZXNzIjp7InJvbGVzIjpbIm9mZmxpbmVfYWNjZXNzIiwidW1hX2F1dGhvcml6YXRpb24iXX0sInJlc291cmNlX2FjY2VzcyI6eyJmb3Jtcy1mbG93LXdlYiI6eyJyb2xlcyI6WyJycGFzLWRlc2lnbmVyIl19LCJhY2NvdW50Ijp7InJvbGVzIjpbIm1hbmFnZS1hY2NvdW50IiwibWFuYWdlLWFjY291bnQtbGlua3MiLCJ2aWV3LXByb2ZpbGUiXX19LCJzY29wZSI6Im9wZW5pZCBlbWFpbCBwcm9maWxlIiwiZW1haWxfdmVyaWZpZWQiOmZhbHNlLCJyb2xlIjpbInJwYXMtZGVzaWduZXIiXSwibmFtZSI6IlJpbnR1IE1lcmluIiwicHJlZmVycmVkX3VzZXJuYW1lIjoicnBhcy1kZXNpZ25lciIsImdpdmVuX25hbWUiOiJSaW50dSIsImZhbWlseV9uYW1lIjoiTWVyaW4iLCJlbWFpbCI6InJpbnR1Lm1lcmluQGFvdC10ZWNobm9sb2dpZXMuY29tIn0.O2u2hSDQl4MM140gKid8cR__BsXmbQNiNdkGPjfJiqhLqPoo0qEZQOM79y7Vkl9X7-L4Axg0UanC-zqbk5-Ito7pIK7SZjzuCmeeWgfmltaTCf3pC1wBYrNTlLot2TadZDQidjPFpJKJlDDp8iL38lLZhQBB-QSd3s7CWvQafx1rEsdnbm9O7vA-v0EfTIBgmJJQAaqJA-9YhBIm22jmAnkaNccrpc7_FLKKexLgrh3iMneKkALPhuaBA75yoFBLdW-fzGwPffmal2HLBCrOfESmAFXdke9me_XaKrYvRKUYVhr_Zvi04eZKxqb8sDWpA9uGYOjCeettX_jRf7QurQ'''
    if auth == None:
        return errorResponse("Authorization header is expected.")
        
    return decode_auth_token(auth)
    

     



        