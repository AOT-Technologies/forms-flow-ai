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

export const addHiddenApplicationComponent = (form) => {
  const components = form.components || [];
  const flatternComponent = utils.flattenComponents(components, true);

  if (flatternComponent[APPLICATION_ID_KEY]) {
    if (form.display === "wizard") {
      // if application id is exist : remove the component form if it is wizard display
      removeComponent(components, APPLICATION_ID_KEY);
      let findPanel = components.find((component) => component.type == "panel");
      if (findPanel) {
        const applicationExist = findPanel.components.some(
          (item) => item.key === APPLICATION_ID_KEY
        );
        !applicationExist &&
          findPanel.components.push(applicationIDHiddenComponent);
      }
    }
  } else {
    if (form.display === "wizard") {
      let findPanel = components.find((component) => component.type == "panel");
      if (findPanel) {
        findPanel.components.push(applicationIDHiddenComponent);
      }
    } else {
      components.push(applicationIDHiddenComponent);
    }
  }

  if (flatternComponent[APPLICATION_STATUS_KEY]) {
    if (form.display === "wizard") {
      // if application status is exist : remove the component form if it is wizard display
      removeComponent(components, APPLICATION_STATUS_KEY);
      let findPanel = components.find((component) => component.type == "panel");
      if (findPanel) {
        const applicationExist = findPanel.components.some(
          (item) => item.key === APPLICATION_STATUS_KEY
        );
        !applicationExist &&
          findPanel.components.push(applicationStatusHiddenComponent);
      }
    }
  } else {
    if (form.display === "wizard") {
      let findPanel = components.find((component) => component.type == "panel");
      if (findPanel) {
        findPanel.components.push(applicationStatusHiddenComponent);
      }
    } else {
      components.push(applicationStatusHiddenComponent);
    }
  }
  // Handle currentUser component
  if (flatternComponent[CURRENT_USER_KEY]) {
    if (form.display === "wizard") {
      removeComponent(components, CURRENT_USER_KEY);
      let findPanel = components.find(
        (component) => component.type === "panel"
      );
      if (findPanel) {
        const userExist = findPanel.components.some(
          (item) => item.key === CURRENT_USER_KEY
        );
        !userExist && findPanel.components.push(currentUserNameHiddenComponent);
      }
    }
  } else {
    if (form.display === "wizard") {
      let findPanel = components.find(
        (component) => component.type === "panel"
      );
      if (findPanel) {
        findPanel.components.push(currentUserNameHiddenComponent);
      }
    } else {
      components.push(currentUserNameHiddenComponent);
    }
  }
  // Handle currentUserRole component
  if (flatternComponent[CURRENT_USER_ROLE]) {
    if (form.display === "wizard") {
      removeComponent(components, CURRENT_USER_ROLE);
      let findPanel = components.find(
        (component) => component.type === "panel"
      );
      if (findPanel) {
        const roleExist = findPanel.components.some(
          (item) => item.key === CURRENT_USER_ROLE
        );
        !roleExist && findPanel.components.push(currentUserRoleHiddenComponent);
      }
    }
  } else {
    if (form.display === "wizard") {
      let findPanel = components.find(
        (component) => component.type === "panel"
      );
      if (findPanel) {
        findPanel.components.push(currentUserRoleHiddenComponent);
      }
    } else {
      components.push(currentUserRoleHiddenComponent);
    }
  }
  // Handle allUserRoles component
  if (flatternComponent[ALL_USER_ROLES]) {
    if (form.display === "wizard") {
      removeComponent(components, ALL_USER_ROLES);
      let findPanel = components.find(
        (component) => component.type === "panel"
      );
      if (findPanel) {
        const rolesExist = findPanel.components.some(
          (item) => item.key === ALL_USER_ROLES
        );
        !rolesExist && findPanel.components.push(allUserRolesHiddenComponent);
      }
    }
  } else {
    if (form.display === "wizard") {
      let findPanel = components.find(
        (component) => component.type === "panel"
      );
      if (findPanel) {
        findPanel.components.push(allUserRolesHiddenComponent);
      }
    } else {
      components.push(allUserRolesHiddenComponent);
    }
  }

  return form;
};
