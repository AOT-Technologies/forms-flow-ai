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
  if (restoredFormData && restoredFormId) {
    return true;
  }
  // Flatten original and current form data
  const flatFormData = utils.flattenComponents(formData.components);
  const flatForm = utils.flattenComponents(form.components);

  // Filter and compare datetime components (day, datetime) from both forms
  const filterDateTimeComponents = (form) =>
    Object.values(form).filter((component) => component.type === "day" || component.type === "datetime");

  const dateTimeOfFormData = filterDateTimeComponents(flatFormData);
  const dateTimeOfForm = filterDateTimeComponents(flatForm);

  // If datetime components don't match in number or type, return true
  if (dateTimeOfFormData.length !== dateTimeOfForm.length || 
      !dateTimeOfFormData.every((component) => 
        dateTimeOfForm.some((comp) => comp.type === component.type))) {
    return true;
  }

  // Remove datetime components from flatFormData and flatForm for further comparison
  const strippedFlatFormData = Object.values(flatFormData).filter(
    (component) => component.type !== "day" && component.type !== "datetime"
  );
  const strippedFlatForm = Object.values(flatForm).filter(
    (component) => component.type !== "day" && component.type !== "datetime"
  );

  // Remove 'id' property from each component for comparison
  const omitId = (components) => components.map((component) => _.omit(component, ['id']));
  const strippedFlatFormDataWithoutId = omitId(strippedFlatFormData);
  const strippedFlatFormWithoutId = omitId(strippedFlatForm);


  // Return true if the forms are not equal or if display/type properties differ
  return (
    !_.isEqual(strippedFlatFormDataWithoutId, strippedFlatFormWithoutId) ||
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
