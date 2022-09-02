"""Base Test Class to be used by test suites. Used for getting JWT token purpose."""
import datetime
import time

from dotenv import find_dotenv, load_dotenv
from flask import current_app

from formsflow_api.models import Authorization, AuthType

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
            "groups": [role, *roles],
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
        "webFormUrl": f"http://sample.com/form/{form_id}/submission/1233432"
    }


def get_draft_create_payload(form_id: str = "1234"):
    """Return a payload for creating draft details."""
    return {"formId": form_id, "data": {"name": "testing sample"}}


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
                "widget": {"type": "input"},
                "inputMask": "",
                "displayMask": "",
                "allowMultipleMasks": "false",
                "customClass": "",
                "tabindex": "",
                "autocomplete": "",
                "hidden": "false",
                "hideLabel": "false",
                "showWordCount": "false",
                "showCharCount": "false",
                "mask": "false",
                "autofocus": "false",
                "spellcheck": "true",
                "disabled": "false",
                "tableView": "true",
                "modalEdit": "false",
                "multiple": "false",
                "persistent": "true",
                "inputFormat": "plain",
                "protected": "false",
                "dbIndex": "false",
                "case": "",
                "truncateMultipleSpaces": "false",
                "encrypted": "false",
                "redrawOn": "",
                "clearOnHide": "true",
                "customDefaultValue": "",
                "calculateValue": "",
                "calculateServer": "false",
                "allowCalculateOverride": "false",
                "validateOn": "change",
                "validate": {
                    "required": "false",
                    "minLength": "",
                    "maxLength": "",
                    "minWords": "",
                    "maxWords": "",
                    "pattern": "",
                    "customMessage": "",
                    "custom": "",
                    "customPrivate": "false",
                    "json": "",
                    "strictDateValidation": "false",
                    "multiple": "false",
                    "unique": "false",
                },
                "unique": "false",
                "errorLabel": "",
                "errors": "",
                "key": "textField",
                "tags": [],
                "properties": {},
                "conditional": {"show": "null", "when": "null", "eq": "", "json": ""},
                "customConditional": "",
                "logic": [],
                "attributes": {},
                "overlay": {
                    "style": "",
                    "page": "",
                    "left": "",
                    "top": "",
                    "width": "",
                    "height": "",
                },
                "type": "textfield",
                "input": "true",
                "refreshOn": "",
                "dataGridLabel": "false",
                "addons": [],
                "inputType": "text",
                "id": "e2dprro",
                "defaultValue": "null",
            },
            {
                "type": "button",
                "label": "Submit",
                "key": "submit",
                "size": "md",
                "block": "false",
                "action": "submit",
                "disableOnInvalid": "true",
                "theme": "primary",
                "input": "true",
                "placeholder": "",
                "prefix": "",
                "customClass": "",
                "suffix": "",
                "multiple": "false",
                "defaultValue": "null",
                "protected": "false",
                "unique": "false",
                "persistent": "false",
                "hidden": "false",
                "clearOnHide": "true",
                "refreshOn": "",
                "redrawOn": "",
                "tableView": "false",
                "modalEdit": "false",
                "dataGridLabel": "true",
                "labelPosition": "top",
                "description": "",
                "errorLabel": "",
                "tooltip": "",
                "hideLabel": "false",
                "tabindex": "",
                "disabled": "false",
                "autofocus": "false",
                "dbIndex": "false",
                "customDefaultValue": "",
                "calculateValue": "",
                "calculateServer": "false",
                "widget": {"type": "input"},
                "attributes": {},
                "validateOn": "change",
                "validate": {
                    "required": "false",
                    "custom": "",
                    "customPrivate": "false",
                    "strictDateValidation": "false",
                    "multiple": "false",
                    "unique": "false",
                },
                "conditional": {"show": "null", "when": "null", "eq": ""},
                "overlay": {
                    "style": "",
                    "left": "",
                    "top": "",
                    "width": "",
                    "height": "",
                },
                "allowCalculateOverride": "false",
                "encrypted": "false",
                "showCharCount": "false",
                "showWordCount": "false",
                "properties": {},
                "allowMultipleMasks": "false",
                "addons": [],
                "leftIcon": "",
                "rightIcon": "",
                "id": "eyhab3d",
            },
            {
                "label": "applicationId",
                "customClass": "",
                "modalEdit": "false",
                "persistent": "true",
                "protected": "false",
                "dbIndex": "false",
                "encrypted": "false",
                "redrawOn": "",
                "customDefaultValue": "",
                "calculateValue": "",
                "calculateServer": "false",
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
                    "height": "",
                },
                "type": "hidden",
                "input": "true",
                "placeholder": "",
                "prefix": "",
                "suffix": "",
                "multiple": "false",
                "unique": "false",
                "hidden": "false",
                "clearOnHide": "true",
                "refreshOn": "",
                "tableView": "false",
                "labelPosition": "top",
                "Description": "",
                "errorLabel": "",
                "tooltip": "",
                "hideLabel": "false",
                "tabindex": "",
                "disabled": "false",
                "autofocus": "false",
                "widget": {"type": "input"},
                "validateOn": "change",
                "validate": {
                    "required": "false",
                    "custom": "",
                    "customPrivate": "false",
                    "strictDateValidation": "false",
                    "multiple": "false",
                    "unique": "false",
                },
                "conditional": {"show": "null", "when": "null", "eq": ""},
                "allowCalculateOverride": "false",
                "showCharCount": "false",
                "showWordCount": "false",
                "allowMultipleMasks": "false",
                "inputType": "hidden",
                "id": "em1y8gd",
                "defaultValue": "",
                "dataGridLabel": "false",
                "description": "",
                "addons": [],
            },
            {
                "label": "applicationStatus",
                "customClass": "",
                "modalEdit": "false",
                "defaultValue": "null",
                "persistent": "true",
                "protected": "false",
                "dbIndex": "false",
                "encrypted": "false",
                "redrawOn": "",
                "customDefaultValue": "",
                "calculateValue": "",
                "calculateServer": "false",
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
                    "height": "",
                },
                "type": "hidden",
                "input": "true",
                "tableView": "false",
                "placeholder": "",
                "prefix": "",
                "suffix": "",
                "multiple": "false",
                "unique": "false",
                "hidden": "false",
                "clearOnHide": "true",
                "refreshOn": "",
                "dataGridLabel": "false",
                "labelPosition": "top",
                "Description": "",
                "errorLabel": "",
                "tooltip": "",
                "hideLabel": "false",
                "tabindex": "",
                "disabled": "false",
                "autofocus": "false",
                "widget": {"type": "input"},
                "validateOn": "change",
                "validate": {
                    "required": "false",
                    "custom": "",
                    "customPrivate": "false",
                    "strictDateValidation": "false",
                    "multiple": "false",
                    "unique": "false",
                },
                "conditional": {"show": "null", "when": "null", "eq": ""},
                "allowCalculateOverride": "false",
                "showCharCount": "false",
                "showWordCount": "false",
                "allowMultipleMasks": "false",
                "inputType": "hidden",
                "id": "e6z1qd9",
                "description": "",
                "addons": [],
            },
        ],
        "name": "testcreateform",
        "path": "testcreateform",
        "title": "testcreateform",
        "tags": ["common"],
        "submissionAccess": [
            {"roles": ["628f0edf19cebb9cea4f1226"], "type": "create_all"},
            {"roles": ["628f0edf19cebb9cea4f1232"], "type": "read_all"},
            {"roles": ["628f0edf19cebb9cea4f1232"], "type": "update_all"},
            {
                "roles": ["628f0edf19cebb9cea4f1226", "628f0edf19cebb9cea4f1232"],
                "type": "delete_all",
            },
            {"roles": ["628f0ee019cebb9cea4f1236"], "type": "create_own"},
            {"roles": ["628f0ee019cebb9cea4f1236"], "type": "read_own"},
            {"roles": ["628f0ee019cebb9cea4f1236"], "type": "update_own"},
            {"roles": ["628f0edf19cebb9cea4f1232"], "type": "delete_own"},
        ],
        "access": [
            {
                "type": "read_all",
                "roles": [
                    "628f0ee019cebb9cea4f1236",
                    "628f0edf19cebb9cea4f1232",
                    "628f0edf19cebb9cea4f1226",
                ],
            }
        ],
    }


def get_formio_roles():
    """Return formio role id representation."""
    return [
        {"roleId": 1, "type": "CLIENT"},
        {"roleId": 2, "type": "REVIEWER"},
        {"roleId": 3, "type": "DESIGNER"},
    ]


def get_anonymous_form_model_object():
    """Return sample anonymous form process mapper model instance data."""
    return {
        "is_anonymous": True,
        "form_id": "1234",
        "form_name": "sample",
        "status": "active",
        "created_by": "test",
    }


def get_form_model_object():
    """Return sample form process mapper model instance data."""
    return {
        "is_anonymous": False,
        "form_id": "12345",
        "form_name": "sample non anonymous",
        "status": "active",
        "created_by": "test",
    }


def factory_auth(
    resource_id, resource_details, auth_type, roles, tenant=None
) -> Authorization:
    """Return an auth model instance."""
    return Authorization(
        auth_type=AuthType(auth_type.upper()),
        resource_id=resource_id,
        resource_details=resource_details,
        roles=roles,
        created=datetime.datetime.now(),
        created_by="test",
        tenant=tenant,
    ).save()
