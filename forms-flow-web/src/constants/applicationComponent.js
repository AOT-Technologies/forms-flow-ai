import utils from "@aot-technologies/formiojs/lib/utils";

// Factory function to create a hidden component with dynamic properties
const createHiddenComponent = ({label, key, persistent, customDefaultValue = null}) => ({
  label,
  addons: [],
  customClass: "",
  modalEdit: false,
  defaultValue: "",
  persistent: persistent,
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

const addHiddenComponent = (components, componentConfig, form) => {
  const flatComponents = utils.flattenComponents(components, true);
  const { key } = componentConfig;
  if (!flatComponents[key]) {
    if (form.display === "wizard") {
      let panel = components.find((component) => component.type === "panel");

      if (!panel) {
        // Create a default panel if none exists
        panel = {
          type: "panel",
          title: "Page 1",
          key: "defaultPanel",
          components: [componentConfig],
        };
        components.push(panel);
      }else{
        panel.components.push(componentConfig);
      }

    } else {
      // For non-wizard forms, push the component directly
      components.push(componentConfig);
    }
  } else {
    // If the component already exists, remove and re-add it for wizard forms
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

  // Define configuration for all additional components
  const hiddenComponents = [
    { label: "Submission Id", key: "applicationId", persistent: true},
    { label: "Submission Status", key: "applicationStatus", persistent:true },
    { 
      label: "Current User", 
      persistent: true,
      key: "currentUser", 
      customDefaultValue: "const localdata = JSON.parse(localStorage.getItem('UserDetails')); const preferredUsername = localdata.preferred_username; value = preferredUsername;" 
    },
    { 
      label: "Submitter Email", 
      persistent: true,
      key: "submitterEmail", 
      customDefaultValue: "const localdata = JSON.parse(localStorage.getItem('UserDetails')); value= localdata?.email;" 
    },
    { 
      label: "Submitter First Name", 
      persistent: true,
      key: "submitterFirstName", 
      customDefaultValue: "const localdata = JSON.parse(localStorage.getItem('UserDetails')); value= localdata?.given_name;" 
    },
    { 
      label: "Submitter Last Name", 
      persistent: true,
      key: "submitterLastName", 
      customDefaultValue: "const localdata = JSON.parse(localStorage.getItem('UserDetails')); value= localdata?.family_name;" 
    },
    { 
      label: "Current User Role", 
      persistent: true,
      key: "currentUserRole", 
      customDefaultValue: "const localdata = JSON.parse(localStorage.getItem('UserDetails')); const preferredUserRole = localdata.role; value = preferredUserRole;" 
    },
    // { 
    //   label: "All Available Roles", 
    //   persistent: false,
    //   key: "allAvailableRoles", 
    //   customDefaultValue: "const localdata = JSON.parse(localStorage.getItem('allAvailableRoles')); value = localdata;" 
    // },
  ];


  const additionalComponents = [];
  // Add a submit button only if the form is not a wizard
  if (form.display !== "wizard") {
    additionalComponents.push({
      type: "button",
      label: "Submit",
      key: "submit",
      disableOnInvalid: true,
      input: true,
      tableView: false
    });
  }
  additionalComponents.push(...hiddenComponents);


  // Loop through and add each additional component
  additionalComponents.forEach(({ label, key, customDefaultValue, ...rest }) => {
    const componentConfig = key === "submit" 
      ? { key, label, ...rest } 
      : createHiddenComponent({label, key, customDefaultValue, persistent:rest.persistent });
    addHiddenComponent(components, componentConfig, form);
  });

  return form;
};