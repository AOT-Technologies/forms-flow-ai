import utils from "@aot-technologies/formiojs/lib/utils";

// Factory function to create a hidden component with dynamic properties
const createHiddenComponent = (label, key, customDefaultValue = null) => ({
  label,
  addons: [],
  customClass: "",
  modalEdit: false,
  defaultValue: "",
  persistent: true,
  protected: false,
  dbIndex: false,
  encrypted: false,
  redrawOn: "",
  customDefaultValue,
  calculateValue: "",
  calculateServer: false,
  key,
  tags: [],
  properties: {},
  logic: [],
  attributes: {},
  overlay: { style: "", page: "", left: "", top: "", width: "", height: "" },
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
  widget: { type: "input" },
  validateOn: "change",
  validate: {
    required: false,
    custom: "",
    customPrivate: false,
    strictDateValidation: false,
    multiple: false,
    unique: false,
  },
  conditional: { show: null, when: null, eq: "" },
  allowCalculateOverride: false,
  showCharCount: false,
  showWordCount: false,
  allowMultipleMasks: false,
  inputType: "hidden",
  description: "",
});

// Function to add a hidden component if not already present
const addHiddenComponent = (components, componentConfig, form) => {
  const flatternComponent = utils.flattenComponents(components, true);
  const { key } = componentConfig;

  if (!flatternComponent[key]) {
    // Add component to the correct location in the form
    if (form.display === "wizard") {
      const panel = components.find((component) => component.type === "panel");
      if (panel) {
        panel.components.push(componentConfig);
      }
    } else {
      components.push(componentConfig);
    }
  } else {
    // If it already exists, remove and re-add for wizard forms
    if (form.display === "wizard") {
      const panel = components.find((component) => component.type === "panel");
      if (panel && !panel.components.some((item) => item.key === key)) {
        panel.components.push(componentConfig);
      }
    }
  }
};

// Main function to add all hidden components to the form
export const addHiddenApplicationComponent = (form) => {
  const components = form.components || [];

  // Define configuration for all hidden components
  const hiddenComponents = [
    { label: "Submission Id", key: "applicationId" },
    { label: "Submission Status", key: "applicationStatus" },
    { 
      label: "Current User", 
      key: "currentUser", 
      customDefaultValue: "const localdata = JSON.parse(localStorage.getItem('UserDetails')); const preferredUsername = localdata.preferred_username; value = preferredUsername;" 
    },
    { 
      label: "Current User Role", 
      key: "currentUserRole", 
      customDefaultValue: "const localdata = JSON.parse(localStorage.getItem('UserDetails')); const preferredUserRole = localdata.role; value = preferredUserRole;" 
    },
    { 
      label: "All User Role", 
      key: "allUserRoles", 
      customDefaultValue: "const localdata = JSON.parse(localStorage.getItem('AlluserRoles')); value = localdata;" 
    },
  ];

  // Loop through and add each hidden component
  hiddenComponents.forEach(({ label, key, customDefaultValue }) => {
    const componentConfig = createHiddenComponent(label, key, customDefaultValue);
    addHiddenComponent(components, componentConfig, form);
  });

  return form;
};
