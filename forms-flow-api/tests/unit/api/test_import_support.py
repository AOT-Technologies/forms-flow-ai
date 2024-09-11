"""Test suite for Import API endpoint."""

import io
import json
from unittest.mock import patch

from formsflow_api_utils.utils import CREATE_DESIGNS
from werkzeug.datastructures import FileStorage

from formsflow_api.services import ImportService
from tests.utilities.base_test import get_formio_form_request_payload, get_token


def form_workflow_json_data(name="testform"):
    """Form workflow json."""
    return {
        "forms": [
            {
                "formTitle": name,
                "formDescription": "",
                "anonymous": False,
                "type": "main",
                "content": {
                    "title": name,
                    "name": name,
                    "path": name,
                    "type": "form",
                    "display": "form",
                    "tags": ["common"],
                    "isBundle": "false",
                    "access": [
                        {
                            "type": "read_all",
                            "roles": [
                                "66d93e5986f02eb25448d611",
                                "66d93e5986f02eb25448d5f1",
                                "66d93e5986f02eb25448d608",
                            ],
                        },
                    ],
                    "submissionAccess": [
                        {"roles": ["628f0edf19cebb9cea4f1226"], "type": "create_all"},
                        {"roles": ["628f0edf19cebb9cea4f1232"], "type": "read_all"},
                        {"roles": ["628f0edf19cebb9cea4f1232"], "type": "update_all"},
                        {
                            "roles": [
                                "628f0edf19cebb9cea4f1226",
                                "628f0edf19cebb9cea4f1232",
                            ],
                            "type": "delete_all",
                        },
                        {"roles": ["628f0ee019cebb9cea4f1236"], "type": "create_own"},
                        {"roles": ["628f0ee019cebb9cea4f1236"], "type": "read_own"},
                        {"roles": ["628f0ee019cebb9cea4f1236"], "type": "update_own"},
                        {"roles": ["628f0edf19cebb9cea4f1232"], "type": "delete_own"},
                    ],
                    "owner": "66d93e5986f02eb25448d68f",
                    "components": [
                        {
                            "label": "Text Field",
                            "labelPosition": "top",
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
                                "pattern": "",
                                "customMessage": "",
                                "custom": "",
                                "customPrivate": "false",
                                "json": "",
                                "minLength": "",
                                "maxLength": "",
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
                            "conditional": {
                                "show": "null",
                                "when": "null",
                                "eq": "",
                                "json": "",
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
                                "height": "",
                            },
                            "type": "textfield",
                            "input": "true",
                            "refreshOn": "",
                            "dataGridLabel": "false",
                            "addons": [],
                            "inputType": "text",
                            "id": "eabmhto",
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
                            "id": "ehluayb",
                        },
                        {
                            "label": "applicationId",
                            "customClass": "",
                            "addons": [],
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
                        },
                        {
                            "label": "applicationStatus",
                            "addons": [],
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
                        },
                    ],
                    "created": "2024-09-05T06:33:02.367Z",
                    "modified": "2024-09-05T06:33:02.385Z",
                },
            }
        ],
        "workflows": [
            {
                "processKey": "Defaultflow",
                "processName": "Default Flow",
                "type": "main",
                "content": '<?xml version="1.0" encoding="UTF-8"?>\n<bpmn:definitions xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL" xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI" xmlns:dc="http://www.omg.org/spec/DD/20100524/DC" xmlns:camunda="http://camunda.org/schema/1.0/bpmn" xmlns:di="http://www.omg.org/spec/DD/20100524/DI" xmlns:modeler="http://camunda.org/schema/modeler/1.0" id="Definitions_1gblxi8" targetNamespace="http://bpmn.io/schema/bpmn" exporter="Camunda Modeler" exporterVersion="4.12.0" modeler:executionPlatform="Camunda Platform" modeler:executionPlatformVersion="7.15.0">\n<bpmn:process id="Defaultflow" name="Default Flow" isExecutable="true">\n<bpmn:startEvent id="StartEvent_1" name="Default Flow Started">\n<bpmn:outgoing>Flow_09rbji4</bpmn:outgoing>\n</bpmn:startEvent>\n<bpmn:task id="Audit_Task_Executed" name="Execute Audit Task">\n<bpmn:extensionElements>\n<camunda:executionListener event="start">\n<camunda:script scriptFormat="javascript">execution.setVariable(\'applicationStatus\', \'Completed\');</camunda:script>\n</camunda:executionListener>\n<camunda:executionListener class="org.camunda.bpm.extension.hooks.listeners.BPMFormDataPipelineListener" event="start">\n<camunda:field name="fields">\n<camunda:expression>["applicationId","applicationStatus"]</camunda:expression>\n</camunda:field>\n</camunda:executionListener>\n<camunda:executionListener class="org.camunda.bpm.extension.hooks.listeners.ApplicationStateListener" event="end" />\n</bpmn:extensionElements>\n<bpmn:incoming>Flow_09rbji4</bpmn:incoming>\n<bpmn:outgoing>Flow_0klorcg</bpmn:outgoing>\n</bpmn:task>\n<bpmn:sequenceFlow id="Flow_09rbji4" sourceRef="StartEvent_1" targetRef="Audit_Task_Executed">\n<bpmn:extensionElements>\n<camunda:executionListener event="take">\n<camunda:script scriptFormat="javascript">execution.setVariable(\'applicationStatus\', \'New\');</camunda:script>\n</camunda:executionListener>\n<camunda:executionListener class="org.camunda.bpm.extension.hooks.listeners.ApplicationStateListener" event="take" />\n</bpmn:extensionElements>\n</bpmn:sequenceFlow>\n<bpmn:endEvent id="Event_1ws2h5w" name="Default Flow Ended">\n<bpmn:incoming>Flow_0klorcg</bpmn:incoming>\n</bpmn:endEvent>\n<bpmn:sequenceFlow id="Flow_0klorcg" sourceRef="Audit_Task_Executed" targetRef="Event_1ws2h5w" />\n</bpmn:process>\n<bpmndi:BPMNDiagram id="BPMNDiagram_1">\n<bpmndi:BPMNPlane id="BPMNPlane_1" bpmnElement="Defaultflow">\n<bpmndi:BPMNEdge id="Flow_0klorcg_di" bpmnElement="Flow_0klorcg">\n<di:waypoint x="370" y="117" />\n<di:waypoint x="432" y="117" />\n</bpmndi:BPMNEdge>\n<bpmndi:BPMNEdge id="Flow_09rbji4_di" bpmnElement="Flow_09rbji4">\n<di:waypoint x="215" y="117" />\n<di:waypoint x="270" y="117" />\n</bpmndi:BPMNEdge>\n<bpmndi:BPMNShape id="_BPMNShape_StartEvent_2" bpmnElement="StartEvent_1">\n<dc:Bounds x="179" y="99" width="36" height="36" />\n<bpmndi:BPMNLabel>\n<dc:Bounds x="166" y="142" width="62" height="27" />\n</bpmndi:BPMNLabel>\n</bpmndi:BPMNShape>\n<bpmndi:BPMNShape id="Activity_1qmqqen_di" bpmnElement="Audit_Task_Executed">\n<dc:Bounds x="270" y="77" width="100" height="80" />\n</bpmndi:BPMNShape>\n<bpmndi:BPMNShape id="Event_1ws2h5w_di" bpmnElement="Event_1ws2h5w">\n<dc:Bounds x="432" y="99" width="36" height="36" />\n<bpmndi:BPMNLabel>\n<dc:Bounds x="419" y="142" width="62" height="27" />\n</bpmndi:BPMNLabel>\n</bpmndi:BPMNShape>\n</bpmndi:BPMNPlane>\n</bpmndi:BPMNDiagram>\n</bpmn:definitions>\n',
            }
        ],
        "rules": [],
        "authorizations": [
            {
                "APPLICATION": {
                    "resourceId": "66d9509e86f02eb25448d75b",
                    "resourceDetails": {},
                    "roles": [],
                    "userName": None,
                },
                "DESIGNER": {
                    "resourceId": "66d9509e86f02eb25448d75b",
                    "resourceDetails": {},
                    "roles": [],
                    "userName": None,
                },
                "FORM": {
                    "resourceId": "66d9509e86f02eb25448d75b",
                    "resourceDetails": {},
                    "roles": [],
                    "userName": None,
                },
            }
        ],
    }


def form_json_data():
    """Form json data."""
    """Form json data format
     {"forms":[{"title":"test form1","display":"form", <rest form components..>}]
    """
    form_data = get_formio_form_request_payload()
    return {"forms": [form_data]}


def bpmn_data():
    """Bpmn data."""
    bpmn_data = """<?xml version="1.0" encoding="UTF-8"?>\n<bpmn:definitions xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL" xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI" xmlns:dc="http://www.omg.org/spec/DD/20100524/DC"
           xmlns:camunda="http://camunda.org/schema/1.0/bpmn" xmlns:di="http://www.omg.org/spec/DD/20100524/DI" xmlns:modeler="http://camunda.org/schema/modeler/1.0" id="Definitions_1gblxi8" targetNamespace="http://bpmn.io/schema/bpmn"
           exporter="Camunda Modeler" exporterVersion="4.12.0" modeler:executionPlatform="Camunda Platform" modeler:executionPlatformVersion="7.15.0">\n<bpmn:process id="Defaultflow" name="Default Flow" isExecutable="true">\n
           <bpmn:startEvent id="StartEvent_1" name="Default Flow Started">\n<bpmn:outgoing>Flow_09rbji4</bpmn:outgoing>\n</bpmn:startEvent>\n<bpmn:task id="Audit_Task_Executed" name="Execute Audit Task">\n<bpmn:extensionElements>\n
           <camunda:executionListener event="start">\n<camunda:script scriptFormat="javascript">execution.setVariable(\'applicationStatus\', \'Completed\');</camunda:script>\n</camunda:executionListener>\n
           <camunda:executionListener class="org.camunda.bpm.extension.hooks.listeners.BPMFormDataPipelineListener" event="start">\n<camunda:field name="fields">\n<camunda:expression>["applicationId","applicationStatus"]</camunda:expression>\n
           </camunda:field>\n</camunda:executionListener>\n<camunda:executionListener class="org.camunda.bpm.extension.hooks.listeners.ApplicationStateListener" event="end" />\n</bpmn:extensionElements>\n<bpmn:incoming>Flow_09rbji4</bpmn:incoming>\n
           <bpmn:outgoing>Flow_0klorcg</bpmn:outgoing>\n</bpmn:task>\n<bpmn:sequenceFlow id="Flow_09rbji4" sourceRef="StartEvent_1" targetRef="Audit_Task_Executed">\n<bpmn:extensionElements>\n<camunda:executionListener event="take">\n
           <camunda:script scriptFormat="javascript">execution.setVariable(\'applicationStatus\', \'New\');</camunda:script>\n</camunda:executionListener>\n<camunda:executionListener class="org.camunda.bpm.extension.hooks.listeners.ApplicationStateListener" event="take" />\n
            </bpmn:extensionElements>\n</bpmn:sequenceFlow>\n<bpmn:endEvent id="Event_1ws2h5w" name="Default Flow Ended">\n<bpmn:incoming>Flow_0klorcg</bpmn:incoming>\n</bpmn:endEvent>\n<bpmn:sequenceFlow id="Flow_0klorcg" sourceRef="Audit_Task_Executed" targetRef="Event_1ws2h5w" />\n
          </bpmn:process>\n<bpmndi:BPMNDiagram id="BPMNDiagram_1">\n<bpmndi:BPMNPlane id="BPMNPlane_1" bpmnElement="Defaultflow">\n<bpmndi:BPMNEdge id="Flow_0klorcg_di" bpmnElement="Flow_0klorcg">\n<di:waypoint x="370" y="117" />\n<di:waypoint x="432" y="117" />\n</bpmndi:BPMNEdge>\n
           <bpmndi:BPMNEdge id="Flow_09rbji4_di" bpmnElement="Flow_09rbji4">\n<di:waypoint x="215" y="117" />\n<di:waypoint x="270" y="117" />\n</bpmndi:BPMNEdge>\n<bpmndi:BPMNShape id="_BPMNShape_StartEvent_2" bpmnElement="StartEvent_1">\n<dc:Bounds x="179" y="99" width="36" height="36" />\n
            <bpmndi:BPMNLabel>\n<dc:Bounds x="166" y="142" width="62" height="27" />\n</bpmndi:BPMNLabel>\n</bpmndi:BPMNShape>\n<bpmndi:BPMNShape id="Activity_1qmqqen_di" bpmnElement="Audit_Task_Executed">\n<dc:Bounds x="270" y="77" width="100" height="80" />\n</bpmndi:BPMNShape>\n
            <bpmndi:BPMNShape id="Event_1ws2h5w_di" bpmnElement="Event_1ws2h5w">\n<dc:Bounds x="432" y="99" width="36" height="36" />\n<bpmndi:BPMNLabel>\n<dc:Bounds x="419" y="142" width="62" height="27" />\n</bpmndi:BPMNLabel>\n</bpmndi:BPMNShape>\n</bpmndi:BPMNPlane>\n</bpmndi:BPMNDiagram>\n</bpmn:definitions>\n',
            """
    return bpmn_data


def create_file(
    form_content, filename="response_export.json", content_type="application/json"
):
    """Create a file-like object."""
    return FileStorage(
        stream=io.BytesIO(form_content.encode("utf-8")),
        filename=filename,
        content_type=content_type,
    )


def test_import_new(app, client, session, jwt, mock_redis_client):
    """Testing import new form+workflow."""
    token = get_token(jwt, role=CREATE_DESIGNS, username="designer")
    headers = {
        "Authorization": f"Bearer {token}",
        "content-type": "multipart/form-data",
    }

    # Test case 1: Import new form+workflow - validate form
    with patch.object(ImportService, "import_form_workflow") as mock_import_service:
        mock_response = {
            "form": {"majorVersion": 1, "minorVersion": 0},
            "workflow": {"majorVersion": 1, "minorVersion": 0},
        }
        mock_import_service.return_value = mock_response

        # Prepare the file content
        form_content = json.dumps(form_workflow_json_data())
        file = create_file(form_content)

        form_data = {
            "file": file,
            "data": json.dumps(
                {
                    "importType": "new",
                    "action": "validate",
                }
            ),
        }

        # Send the POST request with form-data
        response = client.post("/import", data=form_data, headers=headers)
        # Assertions to validate the response
        assert response.status_code == 200
        assert response.json is not None
        assert response.json == {
            "form": {"majorVersion": 1, "minorVersion": 0},
            "workflow": {"majorVersion": 1, "minorVersion": 0},
        }

    # Test case 2: Import new form+workflow - import
    with patch.object(ImportService, "import_form_workflow") as mock_import_service:
        mock_response = {"message": "Imported successfully."}
        mock_import_service.return_value = mock_response

        # Prepare the file content
        form_content = json.dumps(form_workflow_json_data())
        file = create_file(form_content)

        form_data = {
            "file": file,
            "data": json.dumps(
                {
                    "importType": "new",
                    "action": "import",
                }
            ),
        }
        response = client.post("/import", data=form_data, headers=headers)
        assert response.status_code == 200
        assert response.json is not None
        assert response.json == {"message": "Imported successfully."}

    # Test case 3: Import with invalid json.
    form_content = json.dumps(form_json_data())
    file = create_file(form_content)

    form_data = {
        "file": file,
        "data": json.dumps(
            {
                "importType": "new",
                "action": "import",
            }
        ),
    }
    response = client.post("/import", data=form_data, headers=headers)
    assert response.status_code == 400
    assert response.json == {
        "message": "File format not supported",
        "code": "INVALID_FILE_TYPE",
        "details": [],
    }


def test_import_edit(app, client, session, jwt, mock_redis_client):
    """Testing import edit form+workflow."""
    # Initial mock tests have been added, integration tests will be incorporated in future iterations.
    token = get_token(jwt, role=CREATE_DESIGNS, username="designer")
    headers = {
        "Authorization": f"Bearer {token}",
        "content-type": "multipart/form-data",
    }
    # Test case 1: Import edit form+workflow - validate form
    with patch.object(ImportService, "import_form_workflow") as mock_import_service:
        mock_response = {
            "form": {"majorVersion": 2, "minorVersion": 1},
            "workflow": {"majorVersion": 2, "minorVersion": 1},
        }
        mock_import_service.return_value = mock_response

        # Prepare the file content
        form_content = json.dumps(form_workflow_json_data())
        file = create_file(form_content)

        form_data = {
            "file": file,
            "data": json.dumps(
                {
                    "importType": "edit",
                    "action": "validate",
                    "mapperId": "1",
                    "form": {"skip": "false", "selectedVersion": "major"},
                    "workflow": {"skip": "false", "selectedVersion": "major"},
                }
            ),
        }

        response = client.post("/import", data=form_data, headers=headers)
        assert response.status_code == 200
        assert response.json is not None
        assert response.json == {
            "form": {"majorVersion": 2, "minorVersion": 1},
            "workflow": {"majorVersion": 2, "minorVersion": 1},
        }

    # Test case 2: Import edit form+workflow
    with patch.object(ImportService, "import_form_workflow") as mock_import_service:
        mock_response = {"message": "Imported successfully."}
        mock_import_service.return_value = mock_response

        # Prepare the file content
        form_content = json.dumps(form_workflow_json_data())
        file = create_file(form_content)

        form_data = {
            "file": file,
            "data": json.dumps(
                {
                    "importType": "edit",
                    "action": "import",
                    "mapperId": "1",
                    "form": {"skip": "false", "selectedVersion": "major"},
                    "workflow": {"skip": "false", "selectedVersion": "major"},
                }
            ),
        }
        response = client.post("/import", data=form_data, headers=headers)
        assert response.status_code == 200
        assert response.json is not None
        assert response.json == {"message": "Imported successfully."}

    # Test case 3: Import edit - only form
    with patch.object(ImportService, "import_form_workflow") as mock_import_service:
        mock_response = {"message": "Imported successfully."}
        mock_import_service.return_value = mock_response

        # Prepare the file content
        form_content = json.dumps(form_json_data())
        file = create_file(form_content)

        form_data = {
            "file": file,
            "data": json.dumps(
                {
                    "importType": "edit",
                    "action": "import",
                    "mapperId": "1",
                    "form": {"skip": "false", "selectedVersion": "major"},
                    "workflow": {"skip": "true", "selectedVersion": "major"},
                }
            ),
        }
        response = client.post("/import", data=form_data, headers=headers)
        assert response.status_code == 200
        assert response.json is not None
        assert response.json == {"message": "Imported successfully."}

    # Test case 4: Import edit - only workflow
    with patch.object(ImportService, "import_form_workflow") as mock_import_service:
        mock_response = {"message": "Imported successfully."}
        mock_import_service.return_value = mock_response

        # Prepare the file content
        form_content = bpmn_data()
        file = create_file(
            form_content,
            filename="workflow.bpmn",
            content_type="application/bpmn20-xml",
        )

        form_data = {
            "file": file,
            "data": json.dumps(
                {
                    "importType": "edit",
                    "action": "import",
                    "mapperId": "1",
                    "form": {"skip": "true", "selectedVersion": "major"},
                    "workflow": {"skip": "false", "selectedVersion": "major"},
                }
            ),
        }
        response = client.post("/import", data=form_data, headers=headers)
        assert response.status_code == 200
        assert response.json is not None
        assert response.json == {"message": "Imported successfully."}
