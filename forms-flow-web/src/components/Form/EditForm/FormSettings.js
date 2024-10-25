import React, {
  useEffect,
  useState,
  useImperativeHandle,
  forwardRef,
  useCallback
} from "react";
import { Form, FormControl, InputGroup } from "react-bootstrap";
import {
  CopyIcon,
  InfoIcon,
  CustomRadioButton,
  FormInput,
  FormTextArea,
} from "@formsflow/components";

import MultiSelectComponent from "../../CustomComponents/MultiSelect";
import { useDispatch, useSelector } from "react-redux";
import { getUserRoles } from "../../../apiManager/services/authorizationService";
import { useTranslation } from "react-i18next";
import { copyText } from "../../../apiManager/services/formatterService";
import _camelCase from "lodash/camelCase";
import _cloneDeep from "lodash/cloneDeep";
import { validateFormName, validatePathName } from "../../../apiManager/services/FormServices";

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
  const { formAccess = [], submissionAccess = [] } = useSelector(
    (state) => state.user
  );
  const roleIds = useSelector((state) => state.user?.roleIds || {});
  const { authorizationDetails: formAuthorization } = useSelector(
    (state) => state.process
  );

  /* --------------------------- useState Variables --------------------------- */
  const [userRoles, setUserRoles] = useState([]);
  const [copied, setCopied] = useState(false);
  const [editIndexValue, setEditIndexValue] = useState(0);
  const [createIndexValue, setCreateIndexValue] = useState(0);
  const [viewIndexValue, setViewIndexValue] = useState(0);
  const [formDetails, setFormDetails] = useState({
    title: processListData.formName,
    path: path,
    description: processListData.description,
    display: display,
  });
  const [isAnonymous, setIsAnonymous] = useState(processListData.anonymous);
  const [errors, setErrors] = useState({
    name: "",
    path: "",
  });
  const [formAccessCopy, setFormAccessCopy] = useState(_cloneDeep(formAccess));
  const [submissionAccessCopy, setSubmissionAccessCopy] = useState(
    _cloneDeep(submissionAccess)
  );

  const publicUrlPath = `${window.location.origin}/public/form/`;

  /* ------------------------- authorization variables ------------------------ */
  const [rolesState, setRolesState] = useState({
    DESIGN: {
      selectedRoles: formAuthorization.DESIGNER?.roles,
      selectedOption: "onlyYou",
    },
    FORM: {
      roleInput: "",
      selectedRoles: formAuthorization.FORM?.roles,
      selectedOption: "registeredUsers",
    },
    APPLICATION: {
      roleInput: "",
      selectedRoles: formAuthorization.APPLICATION?.roles,
      selectedOption: "submitter",
    },
  });

    /* ------------------------- validating form name and path ------------------------ */

  const validateField = async (field, value) => {
    let errorMessage = "";
    if (!value.trim()) {
      errorMessage = `${field.charAt(0).toUpperCase() + field.slice(1)} is required`;
    } else {
      try {
        const response = field === 'name' ? await validateFormName(value) : await validatePathName(value);
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
  };


  
  /* ---------------------- handling form details change ---------------------- */

  const handleFormDetailsChange = (e) => {
    const { name, value, type } = e.target;
    // if form name or path changed need to call validation api based on that
    let updatedValue =
      name === "path" ? _camelCase(value).toLowerCase() : value;
    
    if (type === "checkbox") {
      setFormDetails((prev) => ({ ...prev, [name]: e.target.checked ? "wizard" : "form" }));
    } else {
      setFormDetails((prev) => ({ ...prev, [name]: updatedValue }));
      if (name === "title" || name === "path") {
        validateField(name === "title" ? 'name' : 'path', updatedValue);
      }
    }
  };
  

  /* ---------------------------- Fetch user roles ---------------------------- */
  useEffect(() => {
    getUserRoles()
      .then((res) => {
        if (res) {
          const { data = [] } = res;
          setUserRoles(data.map((role) => role.name));
        }
      })
      .catch((error) => console.error("error", error));
  }, [dispatch]);


  const updateAccessRoles = useCallback((accessList, type, roleId) => {
    return accessList.map((access) => {
      if (access.type === type) {
        const roles = isAnonymous
          ? [...new Set([...access.roles, roleId])]
          : access.roles.filter((id) => id !== roleId);
        return { ...access, roles };
      }
      return access;
    });
  },[isAnonymous]);


  //  chaning the form access
  useEffect(() => {
    setFormAccessCopy((prev) =>
      updateAccessRoles(prev, "read_all", roleIds.ANONYMOUS)
    );
    setSubmissionAccessCopy((prev) =>
      updateAccessRoles(prev, "create_own", roleIds.ANONYMOUS)
    );
  }, [isAnonymous, roleIds.ANONYMOUS]);

  const handleRoleStateChange = (section, key, value) => {
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
      await copyText(`${publicUrlPath}${formDetails.path}`);
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
      accessDetails: {
        formAccess: formAccessCopy,
        submissionAccess: submissionAccessCopy,
      },
      rolesState: rolesState,
    };
  });

  return (
    <>
      {/* Section 1: Basic */}
      <div className="section">
        <h5 className="fw-bold">{t("Basic")}</h5>
        <FormInput
          value={formDetails.title}
          label={t("Name")}
          onChange={handleFormDetailsChange}
          dataTestid="form-name"
          name="title"
          ariaLabel={t("Form Name")}
          onBlur={() => validateField('name', formDetails.title)}
          />
          {errors.name && <div className="validation-text">{errors.name}</div>}
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
        <div className="info-panel">
          <div className="d-flex align-items-center">
            <InfoIcon />
            <div className="field-label ms-2">{t("Note")}</div>
          </div>
          <div className="info-content">
            {t(
              "Allowing the addition of multiple pages in a single form will prevent you from using this form in a bundle later."
            )}
          </div>
        </div>

        <Form.Check
          data-testid="form-edit-wizard-display"
          type="checkbox"
          id="createCheckbox"
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
          {t("Who Can Edit This Form")}
        </Form.Label>
        <CustomRadioButton
          items={[
            {
              label: t("Only You"),
              onClick: () => {
                handleRoleStateChange(DESIGN, "selectedOption", "onlyYou");
                setEditIndexValue(0);
              },
            },
            {
              label: t("You and specified roles"),
              onClick: () => {
                handleRoleStateChange(
                  DESIGN,
                  "selectedOption",
                  "specifiedRoles"
                );
                setEditIndexValue(1);
              },
            },
          ]}
          dataTestid="edit-submission-role"
          ariaLabel={t("Edit Submission Role")}
          indexValue={editIndexValue}
        />

        {rolesState.DESIGN.selectedOption === "onlyYou" && (
          <FormInput disabled={true} />
        )}
        {rolesState.DESIGN.selectedOption === "specifiedRoles" && (
          <MultiSelectComponent
            allRoles={userRoles}
            selectedRoles={rolesState.DESIGN.selectedRoles}
            setSelectedRoles={(roles) =>
              handleRoleStateChange(DESIGN, "selectedRoles", roles)
            }
          />
        )}

        <Form.Label className="field-label mt-3">
          {t("Who Can Create Submissions")}
        </Form.Label>
        <Form.Check
          type="checkbox"
          id="createCheckbox"
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
              onClick: () => {
                handleRoleStateChange(
                  FORM,
                  "selectedOption",
                  "registeredUsers"
                );

                setCreateIndexValue(0);
                // Set index value for Registered users
              },
            },
            {
              label: t("Specific roles"),
              onClick: () => {
                handleRoleStateChange(FORM, "selectedOption", "specifiedRoles");
                setCreateIndexValue(1); // Set index value for Specific roles
              },
            },
          ]}
          dataTestid="create-submission-role"
          ariaLabel={t("Create Submission Role")}
          indexValue={createIndexValue}
        />
        {rolesState.FORM.selectedOption === "registeredUsers" && (
          <FormInput disabled={true} />
        )}
        {rolesState.FORM.selectedOption === "specifiedRoles" && (
          <MultiSelectComponent
            allRoles={userRoles}
            selectedRoles={rolesState.FORM.selectedRoles}
            setSelectedRoles={(roles) =>
              handleRoleStateChange(FORM, "selectedRoles", roles)
            }
          />
        )}

        <Form.Label className="field-label mt-3">
          {t("Who Can View Submissions")}
        </Form.Label>
        <CustomRadioButton
          items={[
            {
              label: t("Submitter"),
              onClick: () => {
                handleRoleStateChange(
                  APPLICATION,
                  "selectedOption",
                  "submitter"
                );

                setViewIndexValue(0); // Set index value for Submitter
              },
            },
            {
              label: t("Submitter and specified roles"),
              onClick: () => {
                handleRoleStateChange(
                  APPLICATION,
                  "selectedOption",
                  "specifiedRoles"
                );
                setViewIndexValue(0);
              },
            },
          ]}
          dataTestid="view-submission-role"
          ariaLabel={t("View Submission Role")}
          indexValue={viewIndexValue}
        />

        {rolesState.APPLICATION.selectedOption === "submitter" && (
          <FormInput disabled={true} />
        )}

        {rolesState.APPLICATION.selectedOption === "specifiedRoles" && (
          <MultiSelectComponent
            allRoles={userRoles}
            selectedRoles={rolesState.APPLICATION.selectedRoles}
            setSelectedRoles={(roles) =>
              handleRoleStateChange(APPLICATION, "selectedRoles", roles)
            }
          />
        )}
      </div>

      <div className="modal-hr" />
      <div className="section">
        <h5 className="fw-bold">{t("Link for this form")}</h5>
        <div className="info-panel">
          <div className="d-flex align-items-center">
            <InfoIcon />
            <div className="field-label ms-2">{t("Note")}</div>
          </div>
          <div className="info-content">
            {t(
              "Making changes to your form URL will make your form inaccessible from your current URL."
            )}
          </div>
        </div>
        <Form.Group className="settings-input w-100" controlId="url-input">
          <Form.Label className="field-label">{t("URL Path")}</Form.Label>
          <InputGroup className="url-input">
            <InputGroup.Text className="url-non-edit">
              {publicUrlPath}
            </InputGroup.Text>

            <FormControl
              type="text"
              value={formDetails.path}
              className="url-edit"
              name="path"
              onChange={handleFormDetailsChange}
              onBlur={() => validateField('path', formDetails.path)}            />
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

export default FormSettings;
