import React, {
  useEffect,
  useState,
  useRef
} from "react";
import { useTranslation } from "react-i18next";
import {
  CustomTextInput,
  CustomTextArea,
  DropdownMultiSelect,
  CustomUrl,
  // CustomCheckbox,
} from "@formsflow/components";
import {
  removeTenantKeywithSlash,
  addTenantkey,
} from "../../../helper/helper";
import { useDispatch, useSelector } from "react-redux";
import { getUserRoles } from "../../../apiManager/services/authorizationService";
import _camelCase from "lodash/camelCase";
import {
  validateFormName,
  validatePathName,
} from "../../../apiManager/services/FormServices";
import PropTypes from "prop-types";
import { MULTITENANCY_ENABLED } from "../../../constants/constants";

//CONST VARIABLES
const DESIGN = "DESIGN";
const FORM = "FORM";
const APPLICATION = "APPLICATION";

const SettingsTab = (
  { 
  // handleConfirm,
  isCreateRoute,
  rolesState,
  formDetails,
  isAnonymous,
  setIsAnonymous,
  setFormDetails,
  setRolesState
}
) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();

  /* ---------------------------- redux store data ---------------------------- */
  const { parentFormId, formId } = useSelector(
    (state) => state.process.formProcessList
  );
  const tenantKey = useSelector((state) => state.tenants?.tenantId);

  /* --------------------------- useState Variables --------------------------- */
  const [userRoles, setUserRoles] = useState([]);
  const blurStatus = useRef({ title: false, path: false });
  // const [copied, setCopied] = useState(false);
  // const [isSaveButtonDisabled, setIsSaveButtonDisabled] = useState(false);
  // const [isValidating, setIsValidating] = useState(false);
 
  const [validationState, setValidationState] = useState({
    name: false,
    path: false,
  });
  
  const [errors, setErrors] = useState({
    title: "",
    path: "",
  });

  const publicUrlPath = `${window.location.origin}/public/form/`;
  const multiSelectOptionKey = "role";


  /* ------------------------- authorization variables ------------------------ */


  /* ------------------------- validating form name and path ------------------------ */
  const validateField = async (field, value) => {
    if (!value?.trim()) {
      const errorMessage = `${
        field.charAt(0).toUpperCase() + field.slice(1)
      } is required.`;
      setErrors((prev) => ({ ...prev, [field]: errorMessage }));
      return false;
    }

    setValidationState((prev) => ({ ...prev, [field]: true }));
    let errorMessage = "";

    try {
      const response =
        field === "title"
          ? await validateFormName(value, parentFormId)
          : await validatePathName(value, formId);

      const data = response?.data;
      if (data?.code === "FORM_EXISTS") {
        errorMessage = data.message;
      }
    } catch (error) {
      errorMessage =
        error.response?.data?.message ||
        `An error occurred while validating the ${field}.`;
      console.error(`Error validating ${field}:`, errorMessage);
    }

    setErrors((prev) => ({ ...prev, [field]: errorMessage }));
    setValidationState((prev) => ({ ...prev, [field]: false }));
    return !errorMessage; // Return true if no error
  };  

  /* ---------------------- handling form details change ---------------------- */
  const handleFormDetailsChange = (e) => {
    const { name, value, type } = e.target;
    const sanitizedValue = value.replace(/[#+]/g, "");
    setErrors((prev) => ({ ...prev, [name]: "" }));
    blurStatus.current[name] = false;  
    let updatedValue = name === "path" ? _camelCase(sanitizedValue).toLowerCase() : sanitizedValue;

    // For path field, add tenant key if multi-tenancy is enabled
    if (name === "path" && MULTITENANCY_ENABLED && tenantKey) {
      updatedValue = addTenantkey(updatedValue, tenantKey);
    }

    if (type === "checkbox") {
      setFormDetails((prev) => ({ ...prev, [name]: e.target.checked ? "wizard" : "form" }));
      return;
    }

    // When creating a new form, auto-populate path from title changes
    if (isCreateRoute && name === "title") {
      let generatedPath = _camelCase(sanitizedValue).toLowerCase();
      if (MULTITENANCY_ENABLED && tenantKey) {
        generatedPath = addTenantkey(generatedPath, tenantKey);
      }
      setFormDetails((prev) => ({ ...prev, title: updatedValue, path: generatedPath }));
      return;
    }

    setFormDetails((prev) => ({ ...prev, [name]: updatedValue }));
  };

  const handleBlur = (field, sanitizedValue) => {
    validateField(field, sanitizedValue);
  };

  /* ---------------------------- Fetch user roles ---------------------------- */
  useEffect(() => {
    getUserRoles()
      .then((res) => {
        if (res) {
          const { data = [] } = res;
          setUserRoles(
            data.map((role, index) => {
              const originalRoleName = role.name;
              let displayRoleName = originalRoleName;

              // Remove tenant key if multi-tenancy is enabled and tenantKey exists
              if (MULTITENANCY_ENABLED && tenantKey) {
                const cleanedRole = removeTenantKeywithSlash(
                  originalRoleName,
                  tenantKey,
                  MULTITENANCY_ENABLED
                );
                displayRoleName =
                  cleanedRole !== false ? cleanedRole : originalRoleName;
              }

              return {
                [multiSelectOptionKey]: displayRoleName, // For UI display
                originalRole: originalRoleName, // For backend communication
                id: index,
              };
            })
          );
        }
      })
      .catch((error) => console.error("error", error));
  }, [dispatch, tenantKey]);

  const handleRoleStateChange = (section, key, value = []) => {
    setRolesState((prevState) => ({
      ...prevState,
      [section]: {
        ...prevState[section],
        [key]: value,
      },
    }));
  };



  // const handleConfirmFunction = async () => {
  //   const fieldsToValidate = ["title", "path"];

  //   // Reset validation error state at the beginning
  //   let validationError = false;

  //   for (const field of fieldsToValidate) {
  //     setIsValidating(true);
  //     const fieldValue = formDetails?.[field];
  //     if (!fieldValue || !(await validateField(field, fieldValue))) {
  //       validationError = true;
  //       setIsValidating(false);
  //       break; // Stop further validation if any field fails
  //     }
  //   }
  //   if (!validationError) {
  //     setIsValidating(false);
  //     const formData = {
  //       formDetails: { ...formDetails, anonymous: isAnonymous },
  //       rolesState: convertRolesForBackend(
  //         rolesState,
  //         userRoles,
  //         multiSelectOptionKey
  //       ),
  //     };
  //     handleConfirm(formData);
  //   }
  // };

  // useEffect(() => {
  //   const isAnyRoleEmpty = Object.values(rolesState).some(
  //     (section) =>
  //       section.selectedOption === "specifiedRoles" &&
  //       section.selectedRoles.length === 0
  //   );

  //   const hasFormErrors =
  //     errors.path !== "" ||
  //     errors.title !== "" ||
  //     formDetails.title === "" ||
  //     formDetails.path === "";

  //   // checking both values for disabling the save changes button
  //   // const shouldDisableSaveButton = isAnyRoleEmpty || hasFormErrors;

  //   // setIsSaveButtonDisabled(shouldDisableSaveButton);
  // }, [rolesState, errors, formDetails]);


  const handleRoleSelectForDesign = (roles) =>
    handleRoleStateChange(DESIGN, "selectedRoles", roles);
  const handleRoleSelectForForm = (roles) =>
    handleRoleStateChange(FORM, "selectedRoles", roles);
  const handleRoleSelectForApplication = (roles) =>
    handleRoleStateChange(APPLICATION, "selectedRoles", roles);

 console.log(errors, validationState,"errors and validation state");


  return (
    <div className="form-edit-settings">
      <div className="grid-section">
        <div className="settings-header">
          {" "}
          <p className="settings-header-text">{t("Form Basics")}</p>
        </div>
        <div className="settings-contents">
          <div className="form-name-container">
            <p className="settings-labels ">Form Name</p>
            <CustomTextInput
              value={formDetails.title}
              dataTestId="basic-form-settings"
              ariaLabel={t("Form Name")}
              setValue={(val) =>
                handleFormDetailsChange({
                  target: { name: "title", value: val, type: "text" },
                })
              }
              onBlur={() => handleBlur('title', formDetails.title)}
              maxLength={200}
            />
          </div>
          <div className="description-container">
            <p className="settings-labels">Form Description</p>
            <CustomTextArea
              setValue={(val) =>
                handleFormDetailsChange({
                  target: { name: "description", value: val, type: "text" },
                })
              }
              aria-label={t("Description of the edited form")}
              maxRows={3}
              minRows={3}
              id="form-description"
            />
          </div>
          {/*  need to use custom checkbox when component is ready */}
          {/* <CustomCheckbox
            onChange={handleFormDetailsChange}
            aria-label={t("Allow multiple pages in this form")}
            id="allow-adding-multiple-pages"
            label={t("Allow multiple pages in this form")}
            items={allowMultiplePagesOption}
            selectedValues={formDetails.display === "wizard" ? ["wizard"] : []}
            name="display"
            inline={true}
            variant="secondary"
          /> */}
          <label
            htmlFor="allow-adding-multiple-pages"
            className="input-checkbox"
          >
            <input
              id="allow-adding-multiple-pages"
              type="checkbox"
              checked={formDetails.display === "wizard"}
              onChange={handleFormDetailsChange}
              data-testid="form-edit-wizard-display"
              name="display"
            />
            <span>Allow adding multiple pages in this form</span>
          </label>
        </div>
      </div>
      <div className="grid-section">
        <div className="settings-header">
          <p className="settings-header-text">{t("Form Permissions")}</p>
        </div>
        <div className="settings-contents permissions-container">
          <DropdownMultiSelect
            dropdownLabel="Who Can View/Edit This Form"
            enableMultiSelect={rolesState?.DESIGN?.selectedOption !== "onlyYou"}
            inputDropDownSelectedValue={rolesState?.DESIGN?.selectedOption}
            options={[
              {
                label: t("Only owner"),
                value: "onlyYou",
              },
              {
                label: t("Owner and specific roles"),
                value: "specifiedRoles",
              },
            ]}
            multiSelectedValues={rolesState?.DESIGN?.selectedRoles}
            multiSelectOptions={userRoles || []}
            onDropdownChange={(value) => {
              handleRoleStateChange(DESIGN, "selectedOption", value);
            }}
            onMultiSelectionChange={handleRoleSelectForDesign}
            displayValue={multiSelectOptionKey}
            ariaLabel="design-permission"
            dataTestId="design-permission"
            id="who-can-view"
            variant="secondary"
          />
          <div className="d-flex flex-column gap-2">
            <DropdownMultiSelect
              dropdownLabel="Who Can Create Submissions"
              enableMultiSelect={
                rolesState?.FORM?.selectedOption !== "registeredUsers"
              }
              inputDropDownSelectedValue={rolesState.FORM.selectedOption}
              options={[
                {
                  label: t("Registered users"),
                  value: "registeredUsers",
                },
                {
                  label: t("Specific roles"),
                  value: "specifiedRoles",
                },
              ]}
              multiSelectedValues={rolesState.FORM.selectedRoles}
              multiSelectOptions={userRoles}
              onDropdownChange={(value) => {
                handleRoleStateChange(FORM, "selectedOption", value);
              }}
              onMultiSelectionChange={handleRoleSelectForForm}
              displayValue={multiSelectOptionKey}
              ariaLabel="form-permission"
              dataTestId="form-permission"
              id="who-can-create"
              variant="secondary"
            />

            <label htmlFor="anonymouse-checkbox" className="input-checkbox">
              <input
                id="anonymouse-checkbox"
                type="checkbox"
                checked={isAnonymous}
                onChange={() => {
                  setIsAnonymous(!isAnonymous);
                }}
                data-testid="form-edit-allow-anonymous"
              />
              <span>
                {t("Also allow anonymous users to create submissions")}
              </span>
            </label>
          </div>

          <DropdownMultiSelect
            dropdownLabel="Who Can View Submissions"
            enableMultiSelect={
              rolesState?.APPLICATION?.selectedOption !== "submitter"
            }
            inputDropDownSelectedValue={rolesState.APPLICATION.selectedOption}
            options={[
              {
                label: t("Submitter"),
                value: "submitter",
              },
              {
                label: t("Submitter and specified roles"),
                value: "specifiedRoles",
              },
            ]}
            multiSelectedValues={rolesState.APPLICATION.selectedRoles}
            multiSelectOptions={userRoles}
            onDropdownChange={(value) => {
              handleRoleStateChange(APPLICATION, "selectedOption", value);
            }}
            onMultiSelectionChange={handleRoleSelectForApplication}
            displayValue={multiSelectOptionKey}
            dataTestId="application-permission"
            id="who-can-submit"
            variant="secondary"
          />
        </div>
      </div>
      <CustomUrl
        key={`custom-url-${formDetails.path}`} // Force re-mount when path changes
        initialUrl={
          MULTITENANCY_ENABLED && tenantKey
            ? removeTenantKeywithSlash(
                formDetails.path,
                tenantKey,
                MULTITENANCY_ENABLED
              )
            : formDetails.path
        }
        baseUrl={
          MULTITENANCY_ENABLED && tenantKey
            ? `${publicUrlPath}${tenantKey}-`
            : publicUrlPath
        }
        onBlur={(currentValue) => {
          // Update formDetails.path with the current value from CustomUrl
          const updatedPath = MULTITENANCY_ENABLED && tenantKey 
            ? addTenantkey(currentValue, tenantKey)
            : currentValue;
          setFormDetails(prev => ({ ...prev, path: updatedPath }));
          handleBlur("path", updatedPath);
        }}
        saveButtonText={t("Save URL")}
      />
    </div>
  );
};

SettingsTab.propTypes = {
  isCreateRoute: PropTypes.bool,
  rolesState: PropTypes.object,
  formDetails: PropTypes.object,
  isAnonymous: PropTypes.bool,
  setIsAnonymous: PropTypes.func,
  setFormDetails: PropTypes.func,
  setRolesState: PropTypes.func,
};

export default SettingsTab;
