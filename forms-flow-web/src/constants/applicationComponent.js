const applicationIDHiddenComponent = {
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
  "defaultValue": ""
};
const applicationStatusHiddenComponent = {
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
  "id": "e6z1qd9"
}


const APPLICATION_ID_KEY = "applicationId";
const APPLICATION_STATUS_KEY = "applicationStatus";

export const addHiddenApplicationComponent = (form) => {
  const applicationIdComponent = form.components.find(component => component.key === APPLICATION_ID_KEY);
  const applicationStatusComponent = form.components.find(component => component.key === APPLICATION_STATUS_KEY);
  if(!applicationIdComponent) {
  form.components.push(applicationIDHiddenComponent);
  }
  if(!applicationStatusComponent){
    form.components.push(applicationStatusHiddenComponent);
  }
  return form;
}


