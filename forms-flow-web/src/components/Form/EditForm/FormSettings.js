import React, {
  useEffect,
  useState,
  useImperativeHandle,
  forwardRef, 
} from "react";
import { Form, FormControl, InputGroup } from "react-bootstrap";
import {
  CopyIcon,
  CustomInfo,
  CustomRadioButton,
  FormInput,
  FormTextArea,
  MultipleSelect
} from "@formsflow/components";

import { MULTITENANCY_ENABLED } from "../../../constants/constants";
import {  addTenantkeyAsSuffix, convertSelectedValueToMultiSelectOption } from "../../../helper/helper";
import { useDispatch, useSelector } from "react-redux";
import { getUserRoles } from "../../../apiManager/services/authorizationService";
import { useTranslation } from "react-i18next";
import { copyText } from "../../../apiManager/services/formatterService";
import _camelCase from "lodash/camelCase";
import { validateFormName, validatePathName } from "../../../apiManager/services/FormServices";
import { HelperServices } from "@formsflow/service";
import PropTypes from 'prop-types';

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
  /* --------------------------- useState Variables --------------------------- */
  const [userRoles, setUserRoles] = useState([]);
  const [copied, setCopied] = useState(false); 
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
    name: "",
    path: "",
  });
  const tenantKey = useSelector((state) => state.tenants?.tenantId);

  const publicUrlPath = `${window.location.origin}/public/form/`;
  const [urlPath,setUrlPath] = useState(publicUrlPath);
  const setSelectedOption = (option, roles = [])=> roles.length ? "specifiedRoles" : option;
  const multiSelectOptionKey = "role";
  /* ------------------------- authorization variables ------------------------ */
  const [rolesState, setRolesState] = useState({
    DESIGN: {
      selectedRoles: convertSelectedValueToMultiSelectOption(formAuthorization.DESIGNER?.roles,
         multiSelectOptionKey),
      selectedOption: setSelectedOption("onlyYou", formAuthorization.DESIGNER?.roles),
    },
    FORM: {
      roleInput: "",
      selectedRoles: convertSelectedValueToMultiSelectOption(formAuthorization.FORM?.roles, 
        multiSelectOptionKey),
      selectedOption: setSelectedOption("registeredUsers", formAuthorization.FORM?.roles),
    },
    APPLICATION: {
      roleInput: "",
      selectedRoles: convertSelectedValueToMultiSelectOption(formAuthorization.APPLICATION?.roles,
         multiSelectOptionKey),
      selectedOption: setSelectedOption("submitter", formAuthorization.APPLICATION?.roles), 
      /* The 'submitter' key is stored in 'resourceDetails'. If the roles array is not empty
       we assume that the submitter is true. */
    }

  });

  /* --------Updating path if multitenant enabled-------------------------- */
  useEffect(()=>{
    if(MULTITENANCY_ENABLED){
      const updatedDisplayPath = HelperServices.removeTenantKeyFromData(formDetails.path,tenantKey);
      setFormDetails((prev) => {
        return {
          ...prev,
          path: updatedDisplayPath
        };
      });
      const updatedUrlPath = addTenantkeyAsSuffix(publicUrlPath,tenantKey);
      setUrlPath(updatedUrlPath);
    }
  },[MULTITENANCY_ENABLED]);

    /* ------------------------- validating form name and path ------------------------ */

  const validateField = async (field, value) => {
    let errorMessage = "";
    setIsValidating((prev) => ({ ...prev, [field]: true }));

    if (!value.trim()) {
      errorMessage = `${field.charAt(0).toUpperCase() + field.slice(1)} is required`;
    } else {
      try {
        const response = field === 'name' ? await validateFormName(value,parentFormId) : await validatePathName(value,formId);
        const data = response?.data;
        if (data && data.code === "FORM_EXISTS") {
          errorMessage = data.message;
        }
      } catch (error) {
        errorMessage = error.response?.data?.message || 
        `An error occurred while validating the ${field}.`;
        console.error(`Error validating ${field}:`, errorMessage);
      }
    }
    setErrors((prev) => ({ ...prev, [field]: errorMessage }));
    setIsValidating((prev) => ({ ...prev, [field]: false }));

  };


  
  /* ---------------------- handling form details change ---------------------- */

  const handleFormDetailsChange = (e) => {
    const { name, value, type } = e.target;
    let updatedValue =
      name === "path" ? _camelCase(value).toLowerCase() : value;
  
    if (type === "checkbox") {
      setFormDetails((prev) => ({ ...prev, [name]: e.target.checked ? "wizard" : "form" }));
    } else {
      setFormDetails((prev) => ({ ...prev, [name]: updatedValue }));
    }
  };
  
  const handleBlur = (field, value) => {
        validateField(field, value);
  };
  

  /* ---------------------------- Fetch user roles ---------------------------- */
  useEffect(() => {
    getUserRoles()
      .then((res) => {
        if (res) {
          const { data = [] } = res;
          setUserRoles(data.map((role,index) => ({[multiSelectOptionKey]:role.name, id: index})));
        }
      })
      .catch((error) => console.error("error", error));
  }, [dispatch]);



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
      await copyText(`${urlPath}${formDetails.path}`);
      setCopied(true);
      setTimeout(() => {
        setCopied(false);
      }, 3000);
    } catch (error) {
      console.error(error);
    }
  };

  useImperativeHandle(ref, () => {
    return {
      formDetails: { ...formDetails, anonymous: isAnonymous },
      rolesState: rolesState,
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
      errors.name !== "" ||
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

  return (
    <>
      {/* Section 1: Basic */}
      <div className="section">
        <h5 className="fw-bold">{t("Basic")}</h5>
        <FormInput
          required
          value={formDetails.title}
          label={t("Name")}
          onChange={handleFormDetailsChange}
          dataTestid="form-name"
          name="title"
          ariaLabel={t("Form Name")}
          isInvalid = {!!errors.name}
          feedback = {errors.name}
          turnOnLoader={isValidating.name}
          onBlur={() => handleBlur('name', formDetails.title)}   
          maxLength={200} 
          />
        <FormTextArea
          label={t("Description")}
          name="description"
          value={formDetails.description}
          onChange={handleFormDetailsChange}
          aria-label={t("Description of the edited form")}
          data-testid="form-description"
          maxRows={3}
          minRows={3}
        />
        <CustomInfo heading="Note" 
        content="Allowing the addition of multiple pages in a single form will prevent you from using this form in a bundle later." />

        <Form.Check
          data-testid="form-edit-wizard-display"
          type="checkbox"
          id="formDisplaychange"
          label={t("Allow adding multiple pages in this form")}
          checked={formDetails.display === "wizard"}
          name="display"
          onChange={handleFormDetailsChange}
          className="field-label"
        />
      </div>

      <div className="modal-hr" />

      <div className="section">
        <h5 className="fw-bold">{t("Permissions")}</h5>

        <Form.Label className="field-label">
          {t("Who Can View/Edit This Form")}
        </Form.Label>
        <CustomRadioButton
          items={[
            {
              label: t("Only You"),
              value:"onlyYou",
            },
            {
              label: t("You and specified roles"),
              value: "specifiedRoles",
            },
          ]}
          onChange={
            (value) => {
              handleRoleStateChange(DESIGN, "selectedOption", value);
            }
          }
          dataTestid="who-can-edit-this-form"
          id="who-can-edit-this-form"
          ariaLabel={t("Edit Submission Role")} 
          selectedValue={rolesState.DESIGN.selectedOption}
        />

        {rolesState.DESIGN.selectedOption === "onlyYou" && (
          <FormInput disabled={true} />
        )}
        {rolesState.DESIGN.selectedOption === "specifiedRoles" && (
          <MultipleSelect
          options={userRoles}  
          selectedValues={rolesState.DESIGN.selectedRoles} 
          onSelect={handleRoleSelectForDesign}  
          onRemove={handleRoleSelectForDesign}  
          displayValue={multiSelectOptionKey}
          avoidHighlightFirstOption={true}
          />
 
        )}

        <Form.Label className="field-label mt-3">
          {t("Who Can Create Submissions")}
        </Form.Label>
        <Form.Check
          type="checkbox"
          id="anonymouseCheckbox"
          label={t("Anonymous users")}
          checked={isAnonymous}
          onChange={() => {
            setIsAnonymous(!isAnonymous);
          }}
          className="field-label"
        />

        <CustomRadioButton
          items={[
            {
              label: t("Registered users"),
              value:"registeredUsers",
            },
            {
              label: t("Specific roles"),
              value:"specifiedRoles"
            },
          ]}
          id="who-can-create-submission"
          dataTestid="create-submission-role"
          ariaLabel={t("Create Submission Role")}
          onChange={
            (value) => {
              handleRoleStateChange(FORM, "selectedOption", value);
            }
          }
          selectedValue={rolesState.FORM.selectedOption}
        />
        {rolesState.FORM.selectedOption === "registeredUsers" && (
          <FormInput disabled={true} />
        )}
        {rolesState.FORM.selectedOption === "specifiedRoles" && (
            <MultipleSelect 
            options={userRoles} // Options to display in the dropdown
            selectedValues={rolesState.FORM.selectedRoles} // Preselected value to persist in dropdown
            onSelect={handleRoleSelectForForm} // Function will trigger on select event
            onRemove={handleRoleSelectForForm} // Function will trigger on remove event
            displayValue={multiSelectOptionKey} // Property name to display in the dropdown options
            avoidHighlightFirstOption={true}
            />
           
        )}

        <Form.Label className="field-label mt-3">
          {t("Who Can View Submissions")}
        </Form.Label>
        <CustomRadioButton
          items={[
            {
              label: t("Submitter"),
              value:"submitter"
            },
            {
              label: t("Submitter and specified roles"),
              value:"specifiedRoles"
            },
          ]}
          id="who-can-view-submission"
          dataTestid="view-submission-role"
          ariaLabel={t("View Submission Role")}
          onChange={
            (value) => {
              handleRoleStateChange(APPLICATION, "selectedOption", value);
            }
          }
          selectedValue={rolesState.APPLICATION.selectedOption}
        />

        {rolesState.APPLICATION.selectedOption === "submitter" && (
          <FormInput disabled={true} />
        )}

        {rolesState.APPLICATION.selectedOption === "specifiedRoles" && (
          <MultipleSelect 
            options={userRoles} // Options to display in the dropdown
            selectedValues={rolesState.APPLICATION.selectedRoles} // Preselected value to persist in dropdown
            onSelect={handleRoleSelectForApplication} // Function will trigger on select event
            onRemove={handleRoleSelectForApplication} // Function will trigger on remove event
            displayValue={multiSelectOptionKey} // Property name to display in the dropdown options
            avoidHighlightFirstOption={true}
          />
 
        )}
      </div>

      <div className="modal-hr" />
      <div className="section">
        <h5 className="fw-bold">{t("Link for this form")}</h5>
        <CustomInfo heading="Note" 
        content="Making changes to your form URL will make your form inaccessible from your current URL." />
        <Form.Group className="settings-input w-100" controlId="url-input">
          <Form.Label className="field-label">{t("URL")} <span className='required-icon'>*</span></Form.Label>
          <InputGroup className="url-input">
            <InputGroup.Text className="url-non-edit">
              {urlPath}
            </InputGroup.Text>

            <FormControl
              type="text"
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

        </Form.Group>
      </div>
    </>
  );
});

FormSettings.propTypes = {
  setIsSaveButtonDisabled: PropTypes.func.isRequired,
};

export default FormSettings;
