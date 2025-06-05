"""Base Test Class to be used by test suites. Used for getting JWT token purpose."""

import datetime

from flask import current_app
from jose import jwt as json_web_token

from formsflow_api.models import Authorization, AuthType


def get_form_request_payload():
    """Return a form request payload object."""
    return {
        "formId": "1234",
        "formName": "Sample form",
        "processKey": "onestepapproval",
        "processName": "One Step Approval",
        "status": "active",
        "comments": "test",
        "tenant": 12,
        "anonymous": False,
        "formType": "form",
        "parentFormId": "1234",
    }


def get_form_request_payload_private():
    """Return a form request payload object which is not anonymous."""
    return {
        "formId": "12",
        "formName": "Sample private form",
        "processKey": "onestepapproval",
        "processName": "OneStep Approval",
        "status": "active",
        "comments": "test",
        "tenant": 11,
        "anonymous": False,
        "formType": "form",
        "parentFormId": "12",
    }


def get_application_create_payload(form_id: str = "1234"):
    """Returns an application create payload."""
    return {
        "formId": form_id,
        "submissionId": "1233432",
        "formUrl": f"http://sample.com/form/{form_id}/submission/1233432",
        "webFormUrl": f"http://sample.com/form/{form_id}/submission/1233432",
    }


def get_draft_create_payload(form_id: str = "1234"):
    """Return a payload for creating draft details."""
    return {"formId": form_id, "data": {"name": "testing sample"}}


def get_form_payload():
    """Return a form request payload object."""
    return {
        "formId": "63736e889fe51130648f0fe4",
        "formName": "Sample form",
        "processKey": "onestepapproval",
        "processName": "One Step Approval",
        "status": "active",
        "comments": "test",
        "tenant": 12,
        "anonymous": False,
        "formType": "form",
        "parentFormId": "1234",
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
        "description": "",
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
        "form_type": "form",
        "parent_form_id": "1234",
    }


def get_form_model_object():
    """Return sample form process mapper model instance data."""
    return {
        "is_anonymous": False,
        "form_id": "12345",
        "form_name": "sample non anonymous",
        "status": "active",
        "created_by": "test",
        "form_type": "form",
        "parent_form_id": "12345",
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


def get_filter_payload(
    name: str = "Test Task",
    roles: list = [],
    users: list = [],
    filter_type: str = "TASK",
    parent_filter_id: int = None,
):
    """Return filter create payload."""
    return {
        "name": name,
        "variables": [{"name": "name", "label": "userName"}],
        "criteria": {"candidateGroupsExpression": "${currentUserGroups()}", "includeAssignedTasks": True},
        "properties": {"priority": 10},
        "users": users,
        "roles": roles,
        "parentFilterId": parent_filter_id,
        "filterType": filter_type,
    }


def get_embed_token(
    user_name="test_user", email="test@email.com", tenant_key=None, invalid=False
):
    """Return token for embed APIs."""
    return json_web_token.encode(
        {"preferred_username": user_name, "email": email, "tenant_key": tenant_key},
        (
            current_app.config.get(
                "TEST_FORM_EMBED_JWT_SECRET", "f6a69a42-7f8a-11ed-a1eb-0242ac120002"
            )
            if not invalid
            else "invalid-secret"
        ),
        algorithm="HS256",
    )


def get_embed_application_create_payload(formId):
    """Returns the payload for embed submission."""
    return {
        "formId": formId,
        "data": {
            "firstName": "John",
            "lastName": "Doe",
            "contact": {"addressLine1": "1234 Street", "email": "john.doe@example.com"},
        },
    }


def get_process_request_payload(
    name="Testworkflow",
    is_subflow=False,
    parent_process_key="Testworkflow",
    major_version=1,
    minor_version=0,
):
    """Return process request payload.""" ""
    return {
        "status": "Draft",
        "processType": "BPMN",
        "name": name,
        "processData": """<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n
        <bpmn:definitions xmlns:bpmn=\"http://www.omg.org/spec/BPMN/20100524/MODEL\"
        xmlns:bpmndi=\"http://www.omg.org/spec/BPMN/20100524/DI\" xmlns:dc=\"http://www.omg.org/spec/DD/20100524/DC\"
        xmlns:di=\"http://www.omg.org/spec/DD/20100524/DI\" xmlns:modeler=\"http://camunda.org/schema/modeler/1.0\"
        id=\"Definitions_a5sqptc\" targetNamespace=\"http://bpmn.io/schema/bpmn\" exporter=\"Camunda Modeler\" exporterVersion=\"5.0.0\" modeler:executionPlatform=\"Camunda Platform\" modeler:executionPlatformVersion=\"7.17.0\">
        <bpmn:process id=\"Testworkflow\" name=\"Test workflow\" isExecutable=\"true\"><bpmn:startEvent id=\"StartEvent_1\"><bpmn:outgoing>Flow_01r7ulv</bpmn:outgoing></bpmn:startEvent>
        <bpmn:task id=\"Activity_0s9h67c\"><bpmn:incoming>Flow_01r7ulv</bpmn:incoming><bpmn:outgoing>Flow_0worf4d</bpmn:outgoing></bpmn:task>
        <bpmn:sequenceFlow id=\"Flow_01r7ulv\" sourceRef=\"StartEvent_1\" targetRef=\"Activity_0s9h67c\" /><bpmn:endEvent id=\"Event_1lz219j\"><bpmn:incoming>Flow_0worf4d</bpmn:incoming></bpmn:endEvent>
        <bpmn:sequenceFlow id=\"Flow_0worf4d\" sourceRef=\"Activity_0s9h67c\" targetRef=\"Event_1lz219j\" /></bpmn:process><bpmndi:BPMNDiagram id=\"BPMNDiagram_1\"><bpmndi:BPMNPlane id=\"BPMNPlane_1\" bpmnElement=\"Testworkflow\">
        <bpmndi:BPMNEdge id=\"Flow_01r7ulv_di\" bpmnElement=\"Flow_01r7ulv\"><di:waypoint x=\"215\" y=\"177\" /><di:waypoint x=\"270\" y=\"177\" /></bpmndi:BPMNEdge><bpmndi:BPMNEdge id=\"Flow_0worf4d_di\" bpmnElement=\"Flow_0worf4d\">
        <di:waypoint x=\"370\" y=\"177\" /><di:waypoint x=\"432\" y=\"177\" /></bpmndi:BPMNEdge><bpmndi:BPMNShape id=\"_BPMNShape_StartEvent_2\" bpmnElement=\"StartEvent_1\"><dc:Bounds x=\"179\" y=\"159\" width=\"36\" height=\"36\" />
        </bpmndi:BPMNShape><bpmndi:BPMNShape id=\"Activity_0s9h67c_di\" bpmnElement=\"Activity_0s9h67c\"><dc:Bounds x=\"270\" y=\"137\" width=\"100\" height=\"80\" /></bpmndi:BPMNShape><bpmndi:BPMNShape id=\"Event_1lz219j_di\" bpmnElement=\"Event_1lz219j\">
        <dc:Bounds x=\"432\" y=\"159\" width=\"36\" height=\"36\" /></bpmndi:BPMNShape></bpmndi:BPMNPlane></bpmndi:BPMNDiagram></bpmn:definitions>""",
        "majorVersion": major_version,
        "minorVersion": minor_version,
        "isSubflow": is_subflow,
        "processKey": name,
        "parentProcessKey": parent_process_key,
    }


def get_process_request_payload_for_dmn():
    """Return process request payload.""" ""
    return {
        "processType": "dmn",
        "processData": """<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<definitions xmlns=\"https://www.omg.org/spec/DMN/20191111/MODEL/\" xmlns:dmndi=\"https://www.omg.org/spec/DMN/20191111/DMNDI/\" xmlns:dc=\"http://www.omg.org/spec/DMN/20180521/DC/\" xmlns:camunda=\"http://camunda.org/schema/1.0/dmn\" id=\"Definitions_1h338s2\" name=\"DRD\" namespace=\"http://camunda.org/schema/1.0/dmn\" exporter=\"Camunda Modeler\" exporterVersion=\"4.8.1\"><decision id=\"email-template-example\" name=\"email-template-example\" camunda:versionTag=\"1\"><decisionTable id=\"decisionTable_1\"><input id=\"input_1\" label=\"category\"><inputExpression id=\"inputExpression_1\" typeRef=\"string\"><text>category</text></inputExpression></input><output id=\"OutputClause_1aekr4b\" label=\"to\" name=\"to\" typeRef=\"string\" /><output id=\"OutputClause_03zviem\" label=\"cc\" name=\"cc\" typeRef=\"string\" /><output id=\"OutputClause_0f8t1qe\" label=\"subject\" name=\"subject\" typeRef=\"string\" /><output id=\"OutputClause_1o2aisg\" label=\"body\" name=\"body\" typeRef=\"string\" /><rule id=\"DecisionRule_0ycnss6\"><inputEntry id=\"UnaryTests_1g3piq1\"><text>\"assignment_notification\"</text></inputEntry><outputEntry id=\"LiteralExpression_1w28m1k\"><text></text></outputEntry><outputEntry id=\"LiteralExpression_08f869r\"><text></text></outputEntry><outputEntry id=\"LiteralExpression_1czkz3j\"><text>\"Task Assignment\"</text></outputEntry><outputEntry id=\"LiteralExpression_1qfdlgl\" expressionLanguage=\"juel\"><text>\"Hello @name,\r\n      \r\nYou have a new task for the process. Please click the following link to access your new task.\r\n\r\n@formUrl\r\n\r\n  \r\nBest Regards\"</text></outputEntry></rule><rule id=\"DecisionRule_1ntdgwj\"><inputEntry id=\"UnaryTests_05ov6ol\"><text>\"activity_reminder\"</text></inputEntry><outputEntry id=\"LiteralExpression_0lljnoh\"><text></text></outputEntry><outputEntry id=\"LiteralExpression_18fvdhg\"><text></text></outputEntry><outputEntry id=\"LiteralExpression_1fjwonv\"><text>\"Task Reminder\"</text></outputEntry><outputEntry id=\"LiteralExpression_1s9943x\"><text>\"Dear @name,\r\n\r\nThis is a reminder that your outstanding task is due in one day.\r\n\r\nApplication Number : @applicationId\r\n\r\n            \r\nPlease click the following link to access your new task.\r\n\r\nTo access the task through formsflow.ai please follow this link:  http://localhost:3000/task/@pid\r\n\r\n   \r\n Regards,   \r\n \"</text></outputEntry></rule><rule id=\"DecisionRule_0tnom8n\"><inputEntry id=\"UnaryTests_03h5bd8\"><text>\"activity_escalation\"</text></inputEntry><outputEntry id=\"LiteralExpression_0tzhose\"><text></text></outputEntry><outputEntry id=\"LiteralExpression_023tlbr\"><text></text></outputEntry><outputEntry id=\"LiteralExpression_0grdcc8\"><text>\"Task Escalation\"</text></outputEntry><outputEntry id=\"LiteralExpression_1bf9ywb\"><text>\"Dear @name,\r\n     \r\nYou have exceeded the deadline for the task.  \r\n\r\nApplication Number : @applicationId\r\n\r\n            \r\nPlease click the following link to access your new task.\r\n\r\nTo access the task through formsflow.ai please follow this link:  http://localhost:3000/task/@pid\r\n   \r\n Regards, \r\n \"</text></outputEntry></rule></decisionTable></decision><dmndi:DMNDI><dmndi:DMNDiagram id=\"DMNDiagram_1o977l7\"><dmndi:DMNShape id=\"DMNShape_0v83ejq\" dmnElementRef=\"email-template-example\"><dc:Bounds height=\"80\" width=\"180\" x=\"150\" y=\"80\" /></dmndi:DMNShape></dmndi:DMNDiagram></dmndi:DMNDI></definitions>""",
    }


def get_process_request_payload_low_code(name="Lowcode workflow", status="Draft"):
    """Return process request payload for lowcode.""" ""
    return {
        "status": status,
        "processType": "LOWCODE",
        "name": name,
        "majorVersion": 1,
        "minorVersion": 0,
        "processData": [
            {
                "id": "dndID5ade74badb758",
                "type": "START",
                "position": {"x": 305.4333267211914, "y": 97.29998779296875},
                "data": {
                    "label": "START",
                    "type": "START",
                    "color": "#FC4F00",
                    "optionTitle": "Start",
                    "title": "Start Task",
                    "description": "Start Here",
                    "attributes": {},
                },
                "width": 89,
                "height": 42,
            },
            {
                "id": "dndID48754650019b8",
                "type": "END",
                "position": {"x": 388.1499900817871, "y": 192.19998168945312},
                "data": {
                    "label": "END",
                    "type": "END",
                    "color": "#9bebd0",
                    "title": "End Task",
                    "optionTitle": "End",
                    "description": "Process ends",
                    "attributes": {},
                },
                "width": 91,
                "height": 42,
            },
            {
                "id": "dndID1f941f8b8dfbb",
                "source": "dndID5ade74badb758",
                "sourceHandle": "a",
                "target": "dndID48754650019b8",
                "targetHandle": "a",
                "type": "smoothstep",
                "data": {"label": ""},
                "style": {"stroke": "#FC4F00"},
                "animated": True,
            },
        ],
    }


def task_outcome_config_payload():
    """Return task outcome configuration payload."""
    return {
        "taskId": "19c06cb9-fb49-11ef-af3f-66318ba5bc56",
        "taskName": "Test Task",
        "taskTransitionMap": [
                {"key": "approve", "label": "Approve"},
                {"key": "reject", "label": "Reject"},],
        "transitionMapType": "select",
    }
