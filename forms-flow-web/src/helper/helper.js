import { Translation } from "react-i18next";
import "./helper.scss";

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
    tenantKeyCheck &&
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
  if (!processLoadError && ((formStatus === "inactive") || !formStatus)) {
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
export { replaceUrl, addTenantkey, removeTenantKey, textTruncate, renderPage };
