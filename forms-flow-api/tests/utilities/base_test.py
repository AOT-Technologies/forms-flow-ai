"""Base Test Class to be used by test suites. Used for getting JWT token purpose."""
import ast
import os
import requests
from dotenv import find_dotenv, load_dotenv

load_dotenv(find_dotenv())

# token_header = {"alg": "RS256", "typ": "JWT", "kid": "forms-flow-web"}


# def get_token_header():
#     """Get the token header json."""
#     return {
#         "alg": "RS256",
#         "typ": "JWT",
#         "kid": "ka1JjPzW-DhsEHOowcYTtIuolGqjOCa7SXWDEp25tfA",
#     }


# def get_token_body():
#     """Get the token body json."""
#     return {
#         "jti": "1d8c24bd-a1a7-4251-b769-b7bd6ecd51213215",
#         "exp": 1636263332,
#         "nbf": 0,
#         "iat": 1635399332,
#         "iss": "http://localhost:8081/auth/realms/demo",
#         "aud": ["camunda-rest-api", "forms-flow-web", "account"],
#         "sub": "47b46f22-45ec-4cfb-825b-ed10ba8bed01",
#         "typ": "Bearer",
#         "azp": "forms-flow-web",
#         "auth_time": 0,
#         "session_state": "6f50e760-cd96-4934-86dc-e0e667f1a407",
#         "acr": "1",
#         "allowed-origins": ["*"],
#         "realm_access": {"roles": ["offline_access", "uma_authorization"]},
#         "resource_access": {
#             "forms-flow-web": {"roles": ["formsflow-client"]},
#             "account": {
#                 "roles": ["manage-account", "manage-account-links", "view-profile"]
#             },
#         },
#         "scope": "camunda-rest-api email profile",
#         "role": ["formsflow-client"],
#         "name": "John Smith",
#         "groups": ["/camunda-admin", "/formsflow/formsflow-client"],
#         "preferred_username": "john-smith",
#         "given_name": "John",
#         "family_name": "Smith",
#         "email": "john.smith@aot.com",
#     }


# def get_claims(
#     app_request=None,
#     role: str = "edit",
#     username: str = "CP0001234",
#     login_source: str = None,
#     roles: list = [],
# ):
#     """Return the claim with the role param."""
#     claim = {
#         "jti": "a50fafa4-c4d6-4a9b-9e51-1e5e0d102878",
#         "exp": 31531718745,
#         "iat": 1531718745,
#         "iss": "http://localhost:8081/auth/realms/demo",
#         "aud": "sbc-auth-web",
#         "sub": "15099883-3c3f-4b4c-a124-a1824d6cba84",
#         "typ": "Bearer",
#         "realm_access": {"roles": ["{}".format(role), *roles]},
#         "preferred_username": username,
#         "name": username,
#         "username": username,
#         "loginSource": login_source,
#         "roles": ["{}".format(role), *roles],
#     }
#     return claim


TEST_USER_PAYLOAD = {
    "client_id": "forms-flow-web",
    "grant_type": "password",
    "username": os.getenv("TEST_REVIEWER_USERID"),
    "password": os.getenv("TEST_REVIEWER_PASSWORD"),
}


def factory_auth_header():
    url = f"{os.getenv('KEYCLOAK_URL')}/auth/realms/{os.getenv('KEYCLOAK_URL_REALM')}/protocol/openid-connect/token"
    x = requests.post(url, TEST_USER_PAYLOAD, verify=True).content.decode("utf-8")
    return str(ast.literal_eval(x)["access_token"])


def get_form_request_payload():
    """Return a form request payload object"""
    return {
        "formId": "1234",
        "formName": "Sample form",
        "processKey": "oneStepApproval",
        "processName": "One Step Approval",
        "status": "active",
        "comments": "test",
        "tenant": 12,
        "anonymous": False,
    }


def get_form_request_payload_private():
    """Return a form request payload object which is not anonymous"""
    return {
        "formId": "12",
        "formName": "Sample private form",
        "processKey": "oneStepApproval",
        "processName": "OneStep Approval",
        "status": "active",
        "comments": "test",
        "tenant": 11,
        "anonymous": False,
    }


def get_form_request_payload_public_inactive():
    """Return a form request payload object which is not active"""
    return {
        "formId": "12",
        "formName": "Sample private form",
        "processKey": "oneStepApproval",
        "processName": "OneStep Approval",
        "status": "Inactive",
        "comments": "test",
        "tenant": 11,
        "anonymous": True,
    }


def get_form_request_anonymous_payload():
    """Return a form request payload object with anonymous true"""
    return {
        "formId": "1234",
        "formName": "Sample form",
        "anonymous": True,
        "status": "active",
    }


def get_application_create_payload(form_id: str = "1234"):
    return {
        "formId": form_id,
        "submissionId": "1233432",
        "formUrl": f"http://sample.com/formid/{form_id}/submissionid/1233432",
    }


def get_form_service_payload():
    """Return a form Service payload object"""
    return {
        "form_id": "1234",
        "form_name": "Sample form",
        "form_revision_number": "v1",
        "process_key": "121312",
        "process_name": "OneStep Approval",
        "status": "active",
        "comments": "test",
        "tenant": 12,
        "created_by": "test-user",
    }


def update_dashboard_payload():
    """Return a payload for updating dashboard details"""
    return {
        "dashboards": [
            {"8": "Sentiment Analysis"},
            {"1": "SAMPLE"},
            {"14": "Sample3"},
            {"13": "sample2"},
            {"15": "Sample 4"},
        ]
    }


def get_locale_update_valid_payload():
    return {"locale": "en"}
