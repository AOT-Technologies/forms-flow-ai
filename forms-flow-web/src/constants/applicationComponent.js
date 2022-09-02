import utils from "formiojs/utils";
const applicationIDHiddenComponent = {
  label: "applicationId",
  customClass: "",
  modalEdit: false,
  persistent: true,
  protected: false,
  dbIndex: false,
  encrypted: false,
  redrawOn: "",
  customDefaultValue: "",
  calculateValue: "",
  calculateServer: false,
  key: "applicationId",
  tags: [],
  properties: {},
  logic: [],
  attributes: {},
  overlay: {
    style: "",
    page: "",
    left: "",
    top: "",
    width: "",
    height: "",
  },
  type: "hidden",
  input: true,
  placeholder: "",
  prefix: "",
  suffix: "",
  multiple: false,
  unique: false,
  hidden: false,
  clearOnHide: true,
  refreshOn: "",
  tableView: false,
  labelPosition: "top",
  Description: "",
  errorLabel: "",
  tooltip: "",
  hideLabel: false,
  tabindex: "",
  disabled: false,
  autofocus: false,
  widget: {
    type: "input",
  },
  validateOn: "change",
  validate: {
    required: false,
    custom: "",
    customPrivate: false,
    strictDateValidation: false,
    multiple: false,
    unique: false,
  },
  conditional: {
    show: null,
    when: null,
    eq: "",
  },
  allowCalculateOverride: false,
  showCharCount: false,
  showWordCount: false,
  allowMultipleMasks: false,
  inputType: "hidden",
  id: "em1y8gd",
  defaultValue: "",
};
const applicationStatusHiddenComponent = {
  label: "applicationStatus",
  customClass: "",
  modalEdit: false,
  defaultValue: null,
  persistent: true,
  protected: false,
  dbIndex: false,
  encrypted: false,
  redrawOn: "",
  customDefaultValue: "",
  calculateValue: "",
  calculateServer: false,
  key: "applicationStatus",
  tags: [],
  properties: {},
  logic: [],
  attributes: {},
  overlay: {
    style: "",
    page: "",
    left: "",
    top: "",
    width: "",
    height: "",
  },
  type: "hidden",
  input: true,
  tableView: false,
  placeholder: "",
  prefix: "",
  suffix: "",
  multiple: false,
  unique: false,
  hidden: false,
  clearOnHide: true,
  refreshOn: "",
  dataGridLabel: false,
  labelPosition: "top",
  Description: "",
  errorLabel: "",
  tooltip: "",
  hideLabel: false,
  tabindex: "",
  disabled: false,
  autofocus: false,
  widget: {
    type: "input",
  },
  validateOn: "change",
  validate: {
    required: false,
    custom: "",
    customPrivate: false,
    strictDateValidation: false,
    multiple: false,
    unique: false,
  },
  conditional: {
    show: null,
    when: null,
    eq: "",
  },
  allowCalculateOverride: false,
  showCharCount: false,
  showWordCount: false,
  allowMultipleMasks: false,
  inputType: "hidden",
  id: "e6z1qd9",
};

const APPLICATION_ID_KEY = "applicationId";
const APPLICATION_STATUS_KEY = "applicationStatus";

export const addHiddenApplicationComponent = (form) => {
  const flatternComponent = utils.flattenComponents(form.components, true);
  if (!flatternComponent[APPLICATION_ID_KEY]) {
    if (form.display === "wizard") {
      form.components[0].components.push(applicationIDHiddenComponent);
    } else {
      form.components.push(applicationIDHiddenComponent);
    }
  }
  if (!flatternComponent[APPLICATION_STATUS_KEY]) {
    if (form.display === "wizard") {
      form.components[0].components.push(applicationStatusHiddenComponent);
    } else {
      form.components.push(applicationStatusHiddenComponent);
    }
  }
  return form;
};
