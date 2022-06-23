"""Base Test Class to be used by test suites. Used for getting JWT token purpose."""
import time

from dotenv import find_dotenv, load_dotenv
from flask import current_app

load_dotenv(find_dotenv())

token_header = {"alg": "RS256", "typ": "JWT", "kid": "forms-flow-web"}


def get_token(
    jwt,
    role: str = "formsflow-client",
    username: str = "client",
    roles: list = [],
    tenant_key: str = None,
):
    """Return token json representation."""
    return jwt.create_jwt(
        {
            "jti": "1d8c24bd-a1a7-4251-b769-b7bd6ecd51213215",
            "exp": round(time.time() * 1000),
            "nbf": 0,
            "iat": 1635399332,
            "iss": current_app.config["JWT_OIDC_TEST_ISSUER"],
            "aud": ["camunda-rest-api", "forms-flow-web"],
            "sub": "47b46f22-45ec-4cfb-825b-ed10ba8bed01",
            "typ": "Bearer",
            "azp": "forms-flow-web",
            "auth_time": 0,
            "session_state": "6f50e760-cd96-4934-86dc-e0e667f1a407",
            "acr": "1",
            "allowed-origins": ["*"],
            "realm_access": {"roles": ["offline_access", "uma_authorization"]},
            "resource_access": {
                "forms-flow-web": {"roles": [role, *roles]},
                "account": {
                    "roles": ["manage-account", "manage-account-links", "view-profile"]
                },
            },
            "scope": "camunda-rest-api email profile",
            "roles": [role, *roles],
            "name": "John Smith",
            "preferred_username": username,
            "given_name": "John",
            "family_name": "Smith",
            "email": "formsflow-reviewer@example.com",
            "tenantKey": tenant_key,
        },
        token_header,
    )


def get_form_request_payload():
    """Return a form request payload object."""
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
    """Return a form request payload object which is not anonymous."""
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
    """Return a form request payload object which is not active."""
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
    """Return a form request payload object with anonymous true."""
    return {
        "formId": "1234",
        "formName": "Sample form",
        "anonymous": True,
        "status": "active",
    }


def get_application_create_payload(form_id: str = "1234"):
    """Returns an application create payload."""
    return {
        "formId": form_id,
        "submissionId": "1233432",
        "formUrl": f"http://sample.com/form/{form_id}/submission/1233432",
    }


def get_form_service_payload():
    """Return a form Service payload object."""
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
    """Return a payload for updating dashboard details."""
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
    """Returns a payload for updating the locale attribute."""
    return {"locale": "en"}


def get_formio_form_request_payload():
    """Return a formio form create request payload object."""
    return {
            "display": "form",
            "components": [
                {
                    "label": "Text Field",
                    "labelPosition": "top",
                    "labelWidth": "",
                    "labelMargin": "",
                    "placeholder": "",
                    "description": "",
                    "tooltip": "",
                    "prefix": "",
                    "suffix": "",
                    "widget": {
                        "type": "input"
                    },
                    "inputMask": "",
                    "displayMask": "",
                    "allowMultipleMasks": False,
                    "customClass": "",
                    "tabindex": "",
                    "autocomplete": "",
                    "hidden": False,
                    "hideLabel": False,
                    "showWordCount": False,
                    "showCharCount": False,
                    "mask": False,
                    "autofocus": False,
                    "spellcheck": True,
                    "disabled": False,
                    "tableView": True,
                    "modalEdit": False,
                    "multiple": False,
                    "persistent": True,
                    "inputFormat": "plain",
                    "protected": False,
                    "dbIndex": False,
                    "case": "",
                    "truncateMultipleSpaces": False,
                    "encrypted": False,
                    "redrawOn": "",
                    "clearOnHide": True,
                    "customDefaultValue": "",
                    "calculateValue": "",
                    "calculateServer": False,
                    "allowCalculateOverride": False,
                    "validateOn": "change",
                    "validate": {
                        "required": False,
                        "minLength": "",
                        "maxLength": "",
                        "minWords": "",
                        "maxWords": "",
                        "pattern": "",
                        "customMessage": "",
                        "custom": "",
                        "customPrivate": False,
                        "json": "",
                        "strictDateValidation": False,
                        "multiple": False,
                        "unique": False
                    },
                    "unique": False,
                    "errorLabel": "",
                    "errors": "",
                    "key": "textField",
                    "tags": [],
                    "properties": {},
                    "conditional": {
                        "show": None,
                        "when": None,
                        "eq": "",
                        "json": ""
                    },
                    "customConditional": "",
                    "logic": [],
                    "attributes": {},
                    "overlay": {
                        "style": "",
                        "page": "",
                        "left": "",
                        "top": "",
                        "width": "",
                        "height": ""
                    },
                    "type": "textfield",
                    "input": True,
                    "refreshOn": "",
                    "dataGridLabel": False,
                    "addons": [],
                    "inputType": "text",
                    "id": "e2dprro",
                    "defaultValue": None
                },
                {
                    "type": "button",
                    "label": "Submit",
                    "key": "submit",
                    "size": "md",
                    "block": False,
                    "action": "submit",
                    "disableOnInvalid": True,
                    "theme": "primary",
                    "input": True,
                    "placeholder": "",
                    "prefix": "",
                    "customClass": "",
                    "suffix": "",
                    "multiple": False,
                    "defaultValue": None,
                    "protected": False,
                    "unique": False,
                    "persistent": False,
                    "hidden": False,
                    "clearOnHide": True,
                    "refreshOn": "",
                    "redrawOn": "",
                    "tableView": False,
                    "modalEdit": False,
                    "dataGridLabel": True,
                    "labelPosition": "top",
                    "description": "",
                    "errorLabel": "",
                    "tooltip": "",
                    "hideLabel": False,
                    "tabindex": "",
                    "disabled": False,
                    "autofocus": False,
                    "dbIndex": False,
                    "customDefaultValue": "",
                    "calculateValue": "",
                    "calculateServer": False,
                    "widget": {
                        "type": "input"
                    },
                    "attributes": {},
                    "validateOn": "change",
                    "validate": {
                        "required": False,
                        "custom": "",
                        "customPrivate": False,
                        "strictDateValidation": False,
                        "multiple": False,
                        "unique": False
                    },
                    "conditional": {
                        "show": None,
                        "when": None,
                        "eq": ""
                    },
                    "overlay": {
                        "style": "",
                        "left": "",
                        "top": "",
                        "width": "",
                        "height": ""
                    },
                    "allowCalculateOverride": False,
                    "encrypted": False,
                    "showCharCount": False,
                    "showWordCount": False,
                    "properties": {},
                    "allowMultipleMasks": False,
                    "addons": [],
                    "leftIcon": "",
                    "rightIcon": "",
                    "id": "eyhab3d"
                },
                {
                    "label": "applicationId",
                    "customClass": "",
                    "modalEdit": False,
                    "persistent": True,
                    "protected": False,
                    "dbIndex": False,
                    "encrypted": False,
                    "redrawOn": "",
                    "customDefaultValue": "",
                    "calculateValue": "",
                    "calculateServer": False,
                    "key": "applicationId",
                    "tags": [],
                    "properties": {},
                    "logic": [],
                    "attributes": {},
                    "overlay": {
                        "style": "",
                        "page": "",
                        "left": "",
                        "top": "",
                        "width": "",
                        "height": ""
                    },
                    "type": "hidden",
                    "input": True,
                    "placeholder": "",
                    "prefix": "",
                    "suffix": "",
                    "multiple": False,
                    "unique": False,
                    "hidden": False,
                    "clearOnHide": True,
                    "refreshOn": "",
                    "tableView": False,
                    "labelPosition": "top",
                    "Description": "",
                    "errorLabel": "",
                    "tooltip": "",
                    "hideLabel": False,
                    "tabindex": "",
                    "disabled": False,
                    "autofocus": False,
                    "widget": {
                        "type": "input"
                    },
                    "validateOn": "change",
                    "validate": {
                        "required": False,
                        "custom": "",
                        "customPrivate": False,
                        "strictDateValidation": False,
                        "multiple": False,
                        "unique": False
                    },
                    "conditional": {
                        "show": None,
                        "when": None,
                        "eq": ""
                    },
                    "allowCalculateOverride": False,
                    "showCharCount": False,
                    "showWordCount": False,
                    "allowMultipleMasks": False,
                    "inputType": "hidden",
                    "id": "em1y8gd",
                    "defaultValue": "",
                    "dataGridLabel": False,
                    "description": "",
                    "addons": []
                },
                {
                    "label": "applicationStatus",
                    "customClass": "",
                    "modalEdit": False,
                    "defaultValue": None,
                    "persistent": True,
                    "protected": False,
                    "dbIndex": False,
                    "encrypted": False,
                    "redrawOn": "",
                    "customDefaultValue": "",
                    "calculateValue": "",
                    "calculateServer": False,
                    "key": "applicationStatus",
                    "tags": [],
                    "properties": {},
                    "logic": [],
                    "attributes": {},
                    "overlay": {
                        "style": "",
                        "page": "",
                        "left": "",
                        "top": "",
                        "width": "",
                        "height": ""
                    },
                    "type": "hidden",
                    "input": True,
                    "tableView": False,
                    "placeholder": "",
                    "prefix": "",
                    "suffix": "",
                    "multiple": False,
                    "unique": False,
                    "hidden": False,
                    "clearOnHide": True,
                    "refreshOn": "",
                    "dataGridLabel": False,
                    "labelPosition": "top",
                    "Description": "",
                    "errorLabel": "",
                    "tooltip": "",
                    "hideLabel": False,
                    "tabindex": "",
                    "disabled": False,
                    "autofocus": False,
                    "widget": {
                        "type": "input"
                    },
                    "validateOn": "change",
                    "validate": {
                        "required": False,
                        "custom": "",
                        "customPrivate": False,
                        "strictDateValidation": False,
                        "multiple": False,
                        "unique": False
                    },
                    "conditional": {
                        "show": None,
                        "when": None,
                        "eq": ""
                    },
                    "allowCalculateOverride": False,
                    "showCharCount": False,
                    "showWordCount": False,
                    "allowMultipleMasks": False,
                    "inputType": "hidden",
                    "id": "e6z1qd9",
                    "description": "",
                    "addons": []
                }
            ],
            "name": "test121",
            "path": "test121",
            "title": "test121",
            "tags": [
                "common"
            ],
            "submissionAccess": [
                {
                    "roles": [
                        "628f0edf19cebb9cea4f1226"
                    ],
                    "type": "create_all"
                },
                {
                    "roles": [
                        "628f0edf19cebb9cea4f1232"
                    ],
                    "type": "read_all"
                },
                {
                    "roles": [
                        "628f0edf19cebb9cea4f1232"
                    ],
                    "type": "update_all"
                },
                {
                    "roles": [
                        "628f0edf19cebb9cea4f1226",
                        "628f0edf19cebb9cea4f1232"
                    ],
                    "type": "delete_all"
                },
                {
                    "roles": [
                        "628f0ee019cebb9cea4f1236"
                    ],
                    "type": "create_own"
                },
                {
                    "roles": [
                        "628f0ee019cebb9cea4f1236"
                    ],
                    "type": "read_own"
                },
                {
                    "roles": [
                        "628f0ee019cebb9cea4f1236"
                    ],
                    "type": "update_own"
                },
                {
                    "roles": [
                        "628f0edf19cebb9cea4f1232"
                    ],
                    "type": "delete_own"
                }
            ],
            "access": [
                {
                    "type": "read_all",
                    "roles": [
                        "628f0ee019cebb9cea4f1236",
                        "628f0edf19cebb9cea4f1232",
                        "628f0edf19cebb9cea4f1226"
                    ]
                }
            ]
    }
