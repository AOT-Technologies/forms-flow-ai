import utils from "@aot-technologies/formiojs/lib/utils";

// Factory function to create hidden components with dynamic configuration
const createHiddenComponent = (label, key, customDefaultValue = null) => ({
  label: label,
  addons: [],
  customClass: "",
  modalEdit: false,
  defaultValue: "",
  persistent: true,
  protected: false,
  dbIndex: false,
  encrypted: false,
  redrawOn: "",
  customDefaultValue: customDefaultValue,
  calculateValue: "",
  calculateServer: false,
  key: key,
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
});

const APPLICATION_ID_KEY = "applicationId";
const APPLICATION_STATUS_KEY = "applicationStatus";
const CURRENT_USER_KEY = "currentUser";
const CURRENT_USER_ROLE = "currentUserRole";
const ALL_USER_ROLES = "allUserRoles";

// Function to remove a component based on its key
const removeComponent = (components, target) => {
  const targetIndex = components.findIndex((item) => item.key === target);
  if (targetIndex !== -1) {
    components.splice(targetIndex, 1);
  }
};

// Function to add a hidden component to the form
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

// Function to add all the required hidden components to the form
export const addHiddenApplicationComponent = (form) => {
  const components = form.components || [];

  // Data structure for each component configuration
  const hiddenComponents = [
    { label: "Submission Id", key: APPLICATION_ID_KEY },
    { label: "Submission Status", key: APPLICATION_STATUS_KEY },
    { label: "Current User", key: CURRENT_USER_KEY, customDefaultValue: "const localdata = JSON.parse(localStorage.getItem('UserDetails'));const preferredUsername = localdata.preferred_username;value = preferredUsername;" },
    { label: "Current User Role", key: CURRENT_USER_ROLE, customDefaultValue: "const localdata = JSON.parse(localStorage.getItem('UserDetails'));const preferredUserRole = localdata.role;value = preferredUserRole;" },
    { label: "All User Role", key: ALL_USER_ROLES, customDefaultValue: "const localdata = JSON.parse(localStorage.getItem('AlluserRoles')); value = localdata;" },
  ];

  // Loop through the hidden components and add each one
  hiddenComponents.forEach(({ label, key, customDefaultValue }) => {
    const componentConfig = createHiddenComponent(label, key, customDefaultValue);
    addHiddenComponent(components, key, componentConfig, form);
  });

  return form;
};
