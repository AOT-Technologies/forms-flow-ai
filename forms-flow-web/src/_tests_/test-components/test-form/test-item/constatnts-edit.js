export const mockstate = {
    form:{
        form:{
            title:"the form title",
            machineName: "the name parameter",
            display:"form",
            _id:"123",
            components: [
                {
                    "type": "button",
                    "label": "Submit",
                    "key": "submit",
                    "size": "md",
                    "block": false,
                    "action": "submit",
                    "disableOnInvalid": true,
                    "theme": "primary",
                    "input": true,
                    "placeholder": "",
                    "prefix": "",
                    "customClass": "",
                    "suffix": "",
                    "multiple": false,
                    "defaultValue": null,
                    "protected": false,
                    "unique": false,
                    "persistent": false,
                    "hidden": false,
                    "clearOnHide": true,
                    "refreshOn": "",
                    "redrawOn": "",
                    "tableView": false,
                    "modalEdit": false,
                    "dataGridLabel": true,
                    "labelPosition": "top",
                    "description": "",
                    "errorLabel": "",
                    "tooltip": "",
                    "hideLabel": false,
                    "tabindex": "",
                    "disabled": false,
                    "autofocus": false,
                    "dbIndex": false,
                    "customDefaultValue": "",
                    "calculateValue": "",
                    "calculateServer": false,
                    "widget": {
                        "type": "input"
                    },
                    "attributes": {},
                    "validateOn": "change",
                    "validate": {
                        "required": false,
                        "custom": "",
                        "customPrivate": false,
                        "strictDateValidation": false,
                        "multiple": false,
                        "unique": false
                    },
                    "conditional": {
                        "show": null,
                        "when": null,
                        "eq": ""
                    },
                    "overlay": {
                        "style": "",
                        "left": "",
                        "top": "",
                        "width": "",
                        "height": ""
                    },
                    "allowCalculateOverride": false,
                    "encrypted": false,
                    "showCharCount": false,
                    "showWordCount": false,
                    "properties": {},
                    "allowMultipleMasks": false,
                    "addons": [],
                    "leftIcon": "",
                    "rightIcon": "",
                    "id": "e9qg1o"
                },
                {
                    "label": "applicationId",
                    "customClass": "",
                    "modalEdit": false,
                    "persistent": true,
                    "protected": false,
                    "dbIndex": false,
                    "encrypted": false,
                    "redrawOn": "",
                    "customDefaultValue": "",
                    "calculateValue": "",
                    "calculateServer": false,
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
                    "input": true,
                    "placeholder": "",
                    "prefix": "",
                    "suffix": "",
                    "multiple": false,
                    "unique": false,
                    "hidden": false,
                    "clearOnHide": true,
                    "refreshOn": "",
                    "tableView": false,
                    "labelPosition": "top",
                    "description": "",
                    "errorLabel": "",
                    "tooltip": "",
                    "hideLabel": false,
                    "tabindex": "",
                    "disabled": false,
                    "autofocus": false,
                    "widget": {
                        "type": "input"
                    },
                    "validateOn": "change",
                    "validate": {
                        "required": false,
                        "custom": "",
                        "customPrivate": false,
                        "strictDateValidation": false,
                        "multiple": false,
                        "unique": false
                    },
                    "conditional": {
                        "show": null,
                        "when": null,
                        "eq": ""
                    },
                    "allowCalculateOverride": false,
                    "showCharCount": false,
                    "showWordCount": false,
                    "allowMultipleMasks": false,
                    "inputType": "hidden",
                    "id": "em1y8gd",
                    "defaultValue": "",
                    "dataGridLabel": false,
                    "addons": []
                },
                {
                    "label": "applicationStatus",
                    "customClass": "",
                    "modalEdit": false,
                    "defaultValue": null,
                    "persistent": true,
                    "protected": false,
                    "dbIndex": false,
                    "encrypted": false,
                    "redrawOn": "",
                    "customDefaultValue": "",
                    "calculateValue": "",
                    "calculateServer": false,
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
                    "input": true,
                    "tableView": false,
                    "placeholder": "",
                    "prefix": "",
                    "suffix": "",
                    "multiple": false,
                    "unique": false,
                    "hidden": false,
                    "clearOnHide": true,
                    "refreshOn": "",
                    "dataGridLabel": false,
                    "labelPosition": "top",
                    "description": "",
                    "errorLabel": "",
                    "tooltip": "",
                    "hideLabel": false,
                    "tabindex": "",
                    "disabled": false,
                    "autofocus": false,
                    "widget": {
                        "type": "input"
                    },
                    "validateOn": "change",
                    "validate": {
                        "required": false,
                        "custom": "",
                        "customPrivate": false,
                        "strictDateValidation": false,
                        "multiple": false,
                        "unique": false
                    },
                    "conditional": {
                        "show": null,
                        "when": null,
                        "eq": ""
                    },
                    "allowCalculateOverride": false,
                    "showCharCount": false,
                    "showWordCount": false,
                    "allowMultipleMasks": false,
                    "inputType": "hidden",
                    "id": "e6z1qd9",
                    "addons": []
                }
            ],
            path:"123",
            tags:["common"]
        }
    },
    user:{
        isAuthenticated:true
    },
    submission:{
        error:''
    },
    formDelete:{
        formSubMissionDelete: {
            "modalOpen": false,
            "submissionId": "",
            "formId": ""
        },
        formDelete: {
            "modalOpen": false,
            "formId": "",
            "formName": ""
        },
        formSubmissionError: {
            "modalOpen": false,
            "message": ""
        },
        isFormSubmissionLoading: false,
        isFormWorkflowSaved: false
    }
}
