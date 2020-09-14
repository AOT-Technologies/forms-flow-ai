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
}

const APPLICATION_ID_KEY = "applicationId";

export const addHiddenApplicationComponent = (form) => {
  const applicationComponent = form.components.find(component => component.key === APPLICATION_ID_KEY);
  if(!applicationComponent) {
  form.components.push(applicationIDHiddenComponent);
  }
  return form;
}
