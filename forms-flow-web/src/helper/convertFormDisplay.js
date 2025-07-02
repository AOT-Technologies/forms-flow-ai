import { cloneDeep } from "lodash";

/**
 * Converts flat form components into a wizard-style structure with a single panel.
 * Filters out the submit button and appends it separately.
 *
 * @param {Array} components - Flat form components.
 * @returns {Array} - Wizard-style components with one panel and optional submit button.
 */
export const convertToWizardForm = (components) => {
  if (!Array.isArray(components)) return [];

  const formFields = [];
  let submitButton = null;

  for (const comp of components) {
    if (comp?.type === "button" && comp?.key === "submit") {
      submitButton = cloneDeep(comp);
    } else {
      formFields.push(cloneDeep(comp));
    }
  }

  const wizardComponents = [
    {
      type: "panel",
      key: "page1",
      title: "Page 1",
      components: formFields,
    },
  ];

  if (submitButton) {
    wizardComponents.push(submitButton);
  }

  return wizardComponents;
};

/**
 * Flattens wizard-style components back into a normal flat form.
 *
 * @param {Array} components - Wizard components array.
 * @returns {Array} - Flattened form components.
 */
export const convertToNormalForm = (components) => {
  if (!Array.isArray(components)) return [];

  const flattened = [];

  for (const comp of components) {
    if (comp?.type === "panel" && Array.isArray(comp.components)) {
      flattened.push(...cloneDeep(comp.components));
    } else {
      flattened.push(cloneDeep(comp));
    }
  }

  return flattened;
};
