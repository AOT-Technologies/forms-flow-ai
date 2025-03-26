import { Translation } from "react-i18next";
import "./helper.scss";
import _ from "lodash";
import utils from "@aot-technologies/formiojs/lib/utils";

const replaceUrl = (URL, key, value) => {
  return URL.replace(key, value);
};

const addTenantkey = (value, tenantkey) => {
  const tenantKeyCheck = value.match(`${tenantkey}-`);
  if (
    tenantKeyCheck && tenantKeyCheck[0].toLowerCase() === `${tenantkey.toLowerCase()}-`
  ) {
    return value.toLowerCase();
  } else {
    return `${tenantkey.toLowerCase()}-${value.toLowerCase()}`;
  }
};

const removeTenantKey = (value, tenantkey) => {
  const tenantKeyCheck = value.match(`${tenantkey}-`);
  if (
    tenantKeyCheck &&  tenantKeyCheck.length &&
    tenantKeyCheck[0].toLowerCase() === `${tenantkey.toLowerCase()}-`
  ) {
    return value.replace(`${tenantkey.toLowerCase()}-`, "");
  } else {
    return false;
  }
};

const textTruncate = (wordLength, targetLength, text) => {
  return text?.length > wordLength
    ? text.substring(0, targetLength) + "..."
    : text;
};

const renderPage = (formStatus, processLoadError) => {
  if (!processLoadError && (formStatus === "inactive")) {
    return (
      <span>
        <div
          className="container-md d-flex flex-column align-items-center justify-content-center"
        >
          <h3>{<Translation>{(t) => t("Form not published")}</Translation>}</h3>
          <p>{<Translation>{(t) => t("You can't submit this form until it is published")}</Translation>}</p>
        </div>
      </span>
    );
  } 
};

const filterSelectOptionByLabel = (option, searchText) => {
  return option.data.label.toLowerCase().includes(searchText.toLowerCase());
};

const generateUniqueId = (prefix) => {
  const array = new Uint32Array(1);
  window.crypto.getRandomValues(array);
  return  prefix + array[0].toString(16);
};

const isFormComponentsChanged = ({restoredFormData, restoredFormId, formData, form}) => {
  // If restored form data exists, always consider it changed
  if (restoredFormData && restoredFormId) {
    return true;
  }

  // Flatten original and current form data
  const flatFormData = utils.flattenComponents(formData.components);
  const flatForm = utils.flattenComponents(form.components);

  // Enhanced comparison for datetime and day components
  const compareDateTimeComponent = (component1, component2) => {
    // Special handling for datetime and day components
    if (component1.type !== component2.type) {
      return false;
    }

    // Create a clean comparison object specifically for datetime/day components
    const cleanComponent = (comp) => {
      const { 
        type, 
        key, 
        label, 
        format, 
        placeholder, 
        validateOn, 
        widget 
      } = comp;

      return { 
        type, 
        key, 
        label, 
        format, 
        placeholder, 
        validateOn, 
        widget 
      };
    };

    return _.isEqual(cleanComponent(component1), cleanComponent(component2));
  };

  // Filter out datetime and day components
  const dateTimeOfFormData = Object.values(flatFormData).filter(
    (component) => component.type === "day" || component.type === "datetime"
  );
  const dateTimeOfForm = Object.values(flatForm).filter(
    (component) => component.type === "day" || component.type === "datetime"
  );

  // Detailed datetime component comparison
  const dateTimeComponentsChanged = (() => {
    // Check if number of datetime components changed
    if (dateTimeOfFormData.length !== dateTimeOfForm.length) {
      return true;
    }

    // Comprehensive comparison of datetime components
    return !dateTimeOfFormData.every((component) => 
      dateTimeOfForm.some((comp) => compareDateTimeComponent(component, comp))
    );
  })();

  // Remove datetime components from flatFormData and flatForm for further comparison
  const stripDateTimeComponents = (components) => 
    Object.values(components).filter(
      (component) => component.type !== "day" && component.type !== "datetime"
    );

  const strippedFlatFormData = stripDateTimeComponents(flatFormData);
  const strippedFlatForm = stripDateTimeComponents(flatForm);

  // Remove unnecessary properties for comparison
  const cleanComponent = (components) => components.map((component) => {
    const { type, key, label } = component;
    return { type, key, label };
  });

  const strippedFlatFormDataCleaned = cleanComponent(strippedFlatFormData);
  const strippedFlatFormCleaned = cleanComponent(strippedFlatForm);

  // Comprehensive change detection
  return (
    dateTimeComponentsChanged || // Check datetime components specifically
    !_.isEqual(strippedFlatFormDataCleaned, strippedFlatFormCleaned) ||
    formData.display !== form.display ||
    formData.type !== form.type
  );
};
// Adding tenantKey as suffix
const addTenantkeyAsSuffix = (value, tenantkey) => {
  if (value.toLowerCase().endsWith(`-${tenantkey}`)) {
    return value.toLowerCase();
  } else {
    return `${value.toLowerCase()}${tenantkey}-`;
  }
};

export { generateUniqueId, replaceUrl, addTenantkey, removeTenantKey, textTruncate, renderPage, 
  filterSelectOptionByLabel, isFormComponentsChanged,addTenantkeyAsSuffix};
