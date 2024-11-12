import utils from "@aot-technologies/formiojs/lib/utils";
const applicationIDHiddenComponent = {
  label: "Submission Id",
  customClass: "",
  addons: [],
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
  dataGridLabel: false,
  description: "",
};
const applicationStatusHiddenComponent = {
  label: "Submission Status",
  addons: [],
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
  description: "",
};
const currentUserNameHiddenComponent = {
  label: "Current User",
  addons: [],
  customClass: "",
  modalEdit: false,
  defaultValue: null,
  persistent: true,
  protected: false,
  dbIndex: false,
  encrypted: false,
  redrawOn: "",
  customDefaultValue:
    "const localdata = JSON.parse(localStorage.getItem('UserDetails'));const preferredUsername = localdata.preferred_username;value = preferredUsername;",
  calculateValue: "",
  calculateServer: false,
  key: "currentUser",
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
  description: "",
};
const currentUserRoleHiddenComponent = {
  label: "Current User Role",
  addons: [],
  customClass: "",
  modalEdit: false,
  defaultValue: null,
  persistent: true,
  protected: false,
  dbIndex: false,
  encrypted: false,
  redrawOn: "",
  customDefaultValue:
    "const localdata = JSON.parse(localStorage.getItem('UserDetails'));const preferredUserRole = localdata.role;value = preferredUserRole;",
  calculateValue: "",
  calculateServer: false,
  key: "currentUserRole",
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
  description: "",
};
const allUserRolesHiddenComponent = {
  label: "All User Role",
  addons: [],
  customClass: "",
  modalEdit: false,
  defaultValue: null,
  persistent: true,
  protected: false,
  dbIndex: false,
  encrypted: false,
  redrawOn: "",
  customDefaultValue:
    "const localdata = JSON.parse(localStorage.getItem('AlluserRoles')); value = localdata;",
  calculateValue: "",
  calculateServer: false,
  key: "allUserRoles",
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
  description: "",
};

const APPLICATION_ID_KEY = "applicationId";
const APPLICATION_STATUS_KEY = "applicationStatus";
const CURRENT_USER_KEY = "currentUser";
const CURRENT_USER_ROLE = "currentUserRole";
const ALL_USER_ROLES = "allUserRoles";

const removeComponent = (components, target) => {
  const targetIndex = components.findIndex((item) => item.key === target);
  if (targetIndex !== -1) {
    components.splice(targetIndex, 1);
  }
};

const addHiddenComponent = (components, componentKey, componentConfig, form) => {
  const flatternComponent = utils.flattenComponents(components, true);
  
  // Check if the component exists and remove it if necessary
  if (flatternComponent[componentKey]) {
    if (form.display === "wizard") {
      removeComponent(components, componentKey);
      let findPanel = components.find((component) => component.type == "panel");
      if (findPanel) {
        const componentExist = findPanel.components.some(
          (item) => item.key === componentKey
        );
        if (!componentExist) {
          findPanel.components.push(componentConfig);
        }
      }
    }
  } else {
    // If the component doesn't exist, add it
    if (form.display === "wizard") {
      let findPanel = components.find((component) => component.type == "panel");
      if (findPanel) {
        findPanel.components.push(componentConfig);
      }
    } else {
      components.push(componentConfig);
    }
  }
};

export const addHiddenApplicationComponent = (form) => {
  const components = form.components || [];

  // Refactor the repeated logic for each component
  addHiddenComponent(components, APPLICATION_ID_KEY, applicationIDHiddenComponent, form);
  addHiddenComponent(components, APPLICATION_STATUS_KEY, applicationStatusHiddenComponent, form);
  addHiddenComponent(components, CURRENT_USER_KEY, currentUserNameHiddenComponent, form);
  addHiddenComponent(components, CURRENT_USER_ROLE, currentUserRoleHiddenComponent, form);
  addHiddenComponent(components, ALL_USER_ROLES, allUserRolesHiddenComponent, form);

  return form;
};

