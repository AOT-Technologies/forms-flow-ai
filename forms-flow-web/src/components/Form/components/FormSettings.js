
import React, {
  useEffect,
  useState,
  useImperativeHandle,
  forwardRef,
  useRef
} from "react";
// import { Form, FormControl, InputGroup } from "react-bootstrap";
// import { Form } from "react-bootstrap";
import {
  CopyIcon,
  CheckIcon,
  CustomInfo,
  FormInput,
  FormTextArea,
  CustomTabs,
  DropdownMultiSelect,
  CheckboxCheckedIcon,
  CheckboxUncheckedIcon,
} from "@formsflow/components";
import {  convertSelectedValueToMultiSelectOption, removeTenantKeywithSlash, addTenantkey } from "../../../helper/helper";
import { useDispatch, useSelector } from "react-redux";
import { getUserRoles } from "../../../apiManager/services/authorizationService";
import { useTranslation } from "react-i18next";
import { copyText } from "../../../apiManager/services/formatterService";
import _camelCase from "lodash/camelCase";
import { validateFormName, validatePathName } from "../../../apiManager/services/FormServices";
import PropTypes from 'prop-types';
import {MULTITENANCY_ENABLED} from "../../../constants/constants";

//CONST VARIABLES
const DESIGN = "DESIGN";
const FORM = "FORM";
const APPLICATION = "APPLICATION";

const FormSettings = forwardRef((props, ref) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();

  /* ---------------------------- redux store data ---------------------------- */
  const processListData = useSelector((state) => state.process.formProcessList);
  const { path, display } = useSelector((state) => state.form.form);

  const { authorizationDetails: formAuthorization } = useSelector(
    (state) => state.process
  );
  const {parentFormId,formId} = useSelector((state) => state.process.formProcessList);
  const tenantKey = useSelector((state) => state.tenants?.tenantId);
  /* --------------------------- useState Variables --------------------------- */
  const [userRoles, setUserRoles] = useState([]);
  const [copied, setCopied] = useState(false);
  // to check if already vlidated and passed.
  const blurStatus = useRef({ title: false, path: false });
  const [formDetails, setFormDetails] = useState({
    title: processListData.formName,
    path: path,
    description: processListData.description,
    display: display,
  });
  const [isValidating, setIsValidating] = useState({
    name: false,
    path: false,
  });
  const [isAnonymous, setIsAnonymous] = useState(processListData.anonymous || false);
  const [errors, setErrors] = useState({
    title: "",
    path: "",
  });

  const publicUrlPath = `${window.location.origin}/public/form/`;
  const setSelectedOption = (option, roles = [])=> roles.length ? "specifiedRoles" : option;
  const multiSelectOptionKey = "role";

  // Helper function to convert role names to display names for UI
  const convertRoleToDisplayName = (roleName) => {
    if (MULTITENANCY_ENABLED && tenantKey) {
      const cleanedRole = removeTenantKeywithSlash(
        roleName,
        tenantKey,
        MULTITENANCY_ENABLED
      );
      return cleanedRole !== false ? cleanedRole : roleName;
    }
    return roleName;
  };
  /* ------------------------- authorization variables ------------------------ */
  const [rolesState, setRolesState] = useState({
    DESIGN: {
      selectedRoles: convertSelectedValueToMultiSelectOption(
        formAuthorization.DESIGNER?.roles?.map(role => convertRoleToDisplayName(role)) || [],
        multiSelectOptionKey
      ),
      selectedOption: setSelectedOption("onlyYou", formAuthorization.DESIGNER?.roles),
    },
    FORM: {
      roleInput: "",
      selectedRoles: convertSelectedValueToMultiSelectOption(
        formAuthorization.FORM?.roles?.map(role => convertRoleToDisplayName(role)) || [],
        multiSelectOptionKey
      ),
      selectedOption: setSelectedOption("registeredUsers", formAuthorization.FORM?.roles),
    },
    APPLICATION: {
      roleInput: "",
      selectedRoles: convertSelectedValueToMultiSelectOption(
        formAuthorization.APPLICATION?.roles?.map(role => convertRoleToDisplayName(role)) || [],
        multiSelectOptionKey
      ),
      selectedOption: setSelectedOption("submitter", formAuthorization.APPLICATION?.roles),
      /* The 'submitter' key is stored in 'resourceDetails'. If the roles array is not empty
       we assume that the submitter is true. */
    }

  });


  /* ------------------------- validating form name and path ------------------------ */

  const validateField = async (field, value) => {
    if (!value.trim()) {
      const errorMessage = `${field.charAt(0).toUpperCase() + field.slice(1)} is required.`;
      setErrors((prev) => ({ ...prev, [field]: errorMessage }));
      return false;
    }

    setIsValidating((prev) => ({ ...prev, [field]: true }));
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
        console.error(`Error validating ${field}:`,errorMessage);
    }

    setErrors((prev) => ({ ...prev, [field]: errorMessage }));
    setIsValidating((prev) => ({ ...prev, [field]: false }));
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
    } else {
      setFormDetails((prev) => ({ ...prev, [name]: updatedValue }));
    }
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
          setUserRoles(data.map((role,index) => {
            const originalRoleName = role.name;
            let displayRoleName = originalRoleName;
            
            // Remove tenant key if multi-tenancy is enabled and tenantKey exists
            if (MULTITENANCY_ENABLED && tenantKey) {
              const cleanedRole = removeTenantKeywithSlash(
                originalRoleName,
                tenantKey,
                MULTITENANCY_ENABLED
              );
              displayRoleName = cleanedRole !== false ? cleanedRole : originalRoleName;
            }
            
            return {
              [multiSelectOptionKey]: displayRoleName, // For UI display
              originalRole: originalRoleName, // For backend communication
              id: index
            };
          }));
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

  const copyPublicUrl = async () => {
    try {
      // If multi-tenancy is enabled and the path already contains tenant key, use it as is
      // Otherwise, construct the full URL with tenant key
      const fullUrl = MULTITENANCY_ENABLED && tenantKey 
        ? `${window.location.origin}/public/form/${formDetails.path}`
        : `${publicUrlPath}${formDetails.path}`;
      await copyText(fullUrl);
      setCopied(true);
      setTimeout(() => {
        setCopied(false);
      }, 3000);
    } catch (error) {
      console.error(error);
    }
  };

// Extract role conversion to a separate function
const convertSelectedRole = (selectedRole, userRoles, multiSelectOptionKey) => {
  const originalRoleData = userRoles.find(role => 
    role[multiSelectOptionKey] === selectedRole[multiSelectOptionKey]
  );
  
  return {
    ...selectedRole,
    [multiSelectOptionKey]: originalRoleData?.originalRole || selectedRole[multiSelectOptionKey],
  };
};

// Process section data separately
const convertSectionRoles = (sectionData, userRoles, multiSelectOptionKey) => {
  return {
    ...sectionData,
    selectedRoles: sectionData.selectedRoles?.map(selectedRole => 
      convertSelectedRole(selectedRole, userRoles, multiSelectOptionKey)
    ) || []
  };
};

// Main conversion function
const convertRolesForBackend = (rolesState, userRoles, multiSelectOptionKey) => {
  const convertedState = {};
  
  Object.keys(rolesState).forEach(section => {
    convertedState[section] = convertSectionRoles(
      rolesState[section], 
      userRoles,
      multiSelectOptionKey
    );
  });
  
  return convertedState;
};

useImperativeHandle(ref, () => {
  return {
    formDetails: { ...formDetails, anonymous: isAnonymous },
    rolesState: convertRolesForBackend(rolesState, userRoles, multiSelectOptionKey),
    validateField,
  };
});

  useEffect(() => {
    const isAnyRoleEmpty = Object.values(rolesState).some(
      (section) =>
        section.selectedOption === "specifiedRoles" &&
        section.selectedRoles.length === 0
    );

    const hasFormErrors =
      errors.path !== "" ||
      errors.title !== "" ||
      formDetails.title === "" ||
      formDetails.path === "";

    // checking both values for disabling the save changes button
    const shouldDisableSaveButton = isAnyRoleEmpty || hasFormErrors;

    props.setIsSaveButtonDisabled(shouldDisableSaveButton);
  }, [rolesState, errors, formDetails]);

  const handleRoleSelectForDesign = (roles) => handleRoleStateChange(DESIGN, "selectedRoles", roles);
  const handleRoleSelectForForm = (roles) => handleRoleStateChange(FORM, "selectedRoles", roles);
  const handleRoleSelectForApplication = (roles) =>
    handleRoleStateChange(APPLICATION, "selectedRoles", roles);

  const  [key,setKey] = useState("Basic");
  const tabs = [
    {
      eventKey: "Basic",
      title: <span data-testid="tab-title-basic">{t("Basic")}</span>,
      content: (
        <>
        <FormInput
          required
          value={formDetails.title}
          label={t("Name")}
          onChange={handleFormDetailsChange}
          dataTestId="basic-form-settings"
          name="title"
          ariaLabel={t("Form Name")}
          isInvalid = {!!errors.title}
          feedback = {errors.title}
          turnOnLoader={isValidating.name}
          onBlur={() => handleBlur('title', formDetails.title)}   
          maxLength={200} 
          id="formflow-name"
          />

        <FormTextArea
          dataTestId="form-description"
          label={t("Description")}
          name="description"
          value={formDetails.description}
          onChange={handleFormDetailsChange}
          aria-label={t("Description of the edited form")}
          data-testid="form-description"
          maxRows={3}
          minRows={3}
          id="form-description"
        />
        <CustomInfo heading={t("Note")}
        content={t("Allowing the addition of multiple pages in a single form will prevent you from using this form in a bundle later.")} />

        {/* <Form.Check
          data-testid="form-edit-wizard-display"
          type="checkbox"
          id="formDisplaychange"
          label={t("Allow adding multiple pages in this form")}
          checked={formDetails.display === "wizard"}
          name="display"
          onChange={handleFormDetailsChange}
          className="field-label"
        /> */}


        <label htmlFor="allow-adding-multiple-pages" className="input-checkbox">
          <input
            id="allow-adding-multiple-pages"
            type="checkbox"
            checked={formDetails.display === "wizard"}
            onChange={handleFormDetailsChange}
            data-testid="form-edit-wizard-display"
            name="display"
            />
          <span>Allow adding multiple pages in this form</span>
          {formDetails.display === "wizard" ? <CheckboxCheckedIcon /> : <CheckboxUncheckedIcon /> }
        </label>

        </>
      ),
    },
    {
      eventKey: "Permissions",
      title: <span data-testid="tab-title-permissions">{t("Permissions")}</span>,
      content: (
        <>
        <DropdownMultiSelect
          dropdownLabel="Who Can View/Edit This Form"
          enableMultiSelect= { 
            rolesState?.DESIGN?.selectedOption !== "onlyYou"
          }
          inputDropDownSelectedValue={rolesState?.DESIGN?.selectedOption}
          inputDropDownOptions={[
            {
              label: t("Only owner"),
              value:"onlyYou",
            },
            {
              label: t("Owner and specific roles"),
              value: "specifiedRoles",
            },
          ]}
          multiSelectedValues={rolesState?.DESIGN?.selectedRoles }
          multiSelectOptions={userRoles || []}
          onDropdownChange={(value) => {
            handleRoleStateChange(DESIGN, "selectedOption", value);
          }}
         onMultiSelectionChange={handleRoleSelectForDesign}
         displayValue={multiSelectOptionKey}
         ariaLabel="design-permission"
         dataTestId="design-permission"
          id="who-can-view"
        />

        <DropdownMultiSelect
          dropdownLabel="Who Can Create Submissions"
          enableMultiSelect={ 
            rolesState?.FORM?.selectedOption !== "registeredUsers" 
          }
          inputDropDownSelectedValue={rolesState.FORM.selectedOption}
          inputDropDownOptions={[
            {
              label: t("Registered users"),
              value:"registeredUsers",
            },
            {
              label: t("Specific roles"),
              value:"specifiedRoles"
            },
          ]}
          multiSelectedValues={rolesState.FORM.selectedRoles }
          multiSelectOptions={userRoles}
          onDropdownChange={
            (value) => {
              handleRoleStateChange(FORM, "selectedOption", value);
            }
          }
         onMultiSelectionChange={handleRoleSelectForForm}
          displayValue={multiSelectOptionKey}
          ariaLabel="form-permission"
          dataTestId="form-permission"
          id="who-can-create"
        />



        {/* <Form.Check
          type="checkbox"
          id="anonymouseCheckbox"
          label={t("Also allow anonymous users to create submissions")}
          checked={isAnonymous}
          onChange={() => {
            setIsAnonymous(!isAnonymous);
          }}
          className="field-label"
        /> */}

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
          <span>{t("Also allow anonymous users to create submissions")}</span>
          {isAnonymous ? <CheckboxCheckedIcon /> : <CheckboxUncheckedIcon /> }
        </label>


        <DropdownMultiSelect
          dropdownLabel="Who Can View Submissions"
          enableMultiSelect={ 
            rolesState?.APPLICATION?.selectedOption !== "submitter"
          }
          inputDropDownSelectedValue={rolesState.APPLICATION.selectedOption}
          inputDropDownOptions={[
            {
              label: t("Submitter"),
              value:"submitter"
            },
            {
              label: t("Submitter and specified roles"),
              value:"specifiedRoles"
            },
          ]}
          multiSelectedValues={rolesState.APPLICATION.selectedRoles }
          multiSelectOptions={userRoles}
          onDropdownChange={
            (value) => {
              handleRoleStateChange(APPLICATION, "selectedOption", value);
            }
          }
         onMultiSelectionChange={handleRoleSelectForApplication}
          displayValue={multiSelectOptionKey}
          dataTestId="application-permission"
          id="who-can-submit"
        />

        </>
      ),
    },
    {
      eventKey :"Link",
      title : <span data-testid="tab-title-link">{t("Link")}</span>,
      content : (
        <>
          <CustomInfo heading={t("Note")} dataTestId={"form-url-info"}
            content={t("Making changes to your form URL will make your form inaccessible from your current URL.")}
          />

          <FormInput
            value={MULTITENANCY_ENABLED && tenantKey 
              ? removeTenantKeywithSlash(formDetails.path, tenantKey, MULTITENANCY_ENABLED) 
              : formDetails.path}
            label={MULTITENANCY_ENABLED && tenantKey 
              ? `${publicUrlPath}${tenantKey}-` 
              : publicUrlPath}
            onChange={handleFormDetailsChange}
            data-test-id="url-edit-input"
            name="path"
            type="text"
            ariaLabel={t("Form Url")}
            onBlur={() => handleBlur('path', formDetails.path)} 
            icon={copied ? <CheckIcon className="svgIcon-success" /> : <CopyIcon />}
            onIconClick={copyPublicUrl}
            id="formflow-url"
            feedback={errors.path ? errors.path : ""}
          />

          {/* Below code is not removed . Can be used for reference */}
          {/* <Form.Group className="settings-input w-100" controlId="url-input">
            <Form.Label className="field-label">{t("URL")} <span className='required-icon'>*</span></Form.Label>
            <InputGroup className="url-input" data-testid="url-input-group">
              <InputGroup.Text className="url-non-edit">
                {urlPath}
              </InputGroup.Text>

              <FormControl
                type="text"
                data-test-id="url-edit-input"
                value={formDetails.path}
                className="url-edit"
                name="path"
                onChange={handleFormDetailsChange}
                onBlur={() => handleBlur('path', formDetails.path)}           />
              <InputGroup.Text className="url-copy" onClick={copyPublicUrl}>
                {copied ? <i className="fa fa-check" /> : <CopyIcon />}
              </InputGroup.Text>
            </InputGroup>
            {errors.path && <div className="validation-text mt-2">{errors.path}</div>}
          </Form.Group> */}
        </>
      )
    }
  ];
  return (
    <div className="tabs">
      <CustomTabs
       defaultActiveKey={key}
       onSelect={setKey}
       tabs={tabs}
       dataTestId="template-form-flow-tabs"
       ariaLabel="Template forms flow  tabs"
       /> 
    </div>     
  );
});

FormSettings.propTypes = {
  setIsSaveButtonDisabled: PropTypes.func.isRequired,
};

export default FormSettings;
