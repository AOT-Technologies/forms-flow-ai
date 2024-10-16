import React, { useReducer, useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Card } from "react-bootstrap";
import { Errors, FormBuilder } from "@aot-technologies/formio-react";
import { CustomButton, ConfirmModal, BackToPrevIcon } from "@formsflow/components";
import { RESOURCE_BUNDLES_DATA } from "../../../resourceBundles/i18n";
import LoadingOverlay from "react-loading-overlay-ts";
import _set from "lodash/set";
import _cloneDeep from "lodash/cloneDeep";
import _camelCase from "lodash/camelCase";
import { Translation, useTranslation } from "react-i18next";
import { push } from "connected-react-router";
import { HistoryIcon, PreviewIcon } from "@formsflow/components";
import ActionModal from "../../Modals/ActionModal.js";
//for save form
import { MULTITENANCY_ENABLED } from "../../../constants/constants";

import { manipulatingFormData } from "../../../apiManager/services/formFormatterService";
import {
  formUpdate,
  validateFormName,
} from "../../../apiManager/services/FormServices";
import { formCreate, publish, unPublish } from "../../../apiManager/services/FormServices";
import utils from "@aot-technologies/formiojs/lib/utils";
import {
  setFormFailureErrorData,
  setFormSuccessData,
} from "../../../actions/formActions";
import {
  saveFormProcessMapperPut,
  getProcessDetails,
  getFormProcesses
} from "../../../apiManager/services/processServices";
 
import { setProcessData } from '../../../actions/processActions.js';

import _isEquial from "lodash/isEqual";
import { FormBuilderModal } from "@formsflow/components";
import _ from "lodash";

import { useParams } from "react-router-dom";

import SettingsModal from "../../CustomComponents/settingsModal";
import FlowEdit from "./FlowEdit.js";

// constant values
const DUPLICATE = "DUPLICATE";
// const SAVE_AS_TEMPLATE= "SAVE_AS_TEMPLATE";
// const IMPORT= "IMPORT";
// const EXPORT= "EXPORT";
//const DELETE = "DELETE";

const reducer = (form, { type, value }) => {
  const formCopy = _cloneDeep(form);
  switch (type) {
    case "formChange":
      for (let prop in value) {
        if (Object.prototype.hasOwnProperty.call(value, prop)) {
          form[prop] = value[prop];
        }
      }
      return form;
    case "replaceForm":
      return _cloneDeep(value);
    case "title":
      if (type === "title" && !form._id) {
        formCopy.name = _camelCase(value);
        formCopy.path = _camelCase(value).toLowerCase();
      }
      break;
    default:
      break;
  }
  _set(formCopy, type, value);
  return formCopy;
};
const Edit = React.memo(() => {
  const dispatch = useDispatch();
  const workflow = useSelector((state) => state.process.workflowAssociated);
  const lang = useSelector((state) => state.user.lang);
  const { t } = useTranslation();
  const errors = useSelector((state) => state.form?.error);
  const processListData = useSelector(
    (state) => state.process?.formProcessList
  );
  const formAuthorization = useSelector((state) => state.process.authorizationDetails);
  const formData = useSelector((state) => state.form?.form);
  const [form, dispatchFormAction] = useReducer(reducer, _cloneDeep(formData));
  const [showFlow, setShowFlow] = useState(false);
  const [showLayout, setShowLayout] = useState(true);
  const tenantKey = useSelector((state) => state.tenants?.tenantId);
  const redirectUrl = MULTITENANCY_ENABLED ? `/tenant/${tenantKey}/` : "/";
  const { formId } = useParams();
  const [nameError, setNameError] = useState("");

  // flow edit 
  const [isProcessDetailsLoading, setIsProcessDetailsLoading] = useState(false);

  //for save form
  const [promptNewVersion, setPromptNewVersion] = useState(processListData.promptNewVersion);
  const [version, setVersion] = useState({ major: 1, minor: 0 });
  const [isPublished, setIsPublished] = useState(processListData?.status == "active" ? true : false);
  const [isPublishLoading, setIsPublishLoading] = useState(false);
  const publishText = isPublished ? "Unpublish" : "Publish";
  const [versionSaved, setVersionSaved] = useState(false);
  const prviousData = useSelector((state) => state.process?.formPreviousData);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const formAccess = useSelector((state) => state.user?.formAccess || []);
  const submissionAccess = useSelector(
    (state) => state.user?.submissionAccess || []
  );
  const previousData = useSelector((state) => state.process?.formPreviousData);
  const restoredFormData = useSelector(
    (state) => state.formRestore?.restoredFormData
  );
  const restoredFormId = useSelector(
    (state) => state.formRestore?.restoredFormId
  );
  // const applicationCount = useSelector(
  //   (state) => state.process?.applicationCount
  // );
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [hasRendered, setHasRendered] = useState(false);

  const formPath = useSelector((state) => state.form.form.path);
  const [newPath, setNewPath] = useState(formPath);


  const preferred_userName = useSelector(
    (state) => state.user?.userDetail?.preferred_username || ""
  );

  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const handleOpenModal = () => setShowSettingsModal(true);
  const handleCloseModal = () => setShowSettingsModal(false);
  const [selectedAction, setSelectedAction] = useState(null);
  const [newActionModal, setNewActionModal] = useState(false);
  const onCloseActionModal = () => setNewActionModal(false);
  const CategoryType = {
    FORM: "FORM",
    WORKFLOW: "WORKFLOW",
  };

  const handleCloseSelectedAction = () => {
    setSelectedAction(null);
    if (selectedAction === DUPLICATE) {
      setNameError("");
      setFormSubmitted(false);
    }
  };

  const [formDetails, setFormDetails] = useState({
    name: processListData.formName,
    description: processListData.description,
  });

  const [formDisplay, setFormDisplay] = useState(processListData.formType);

  const [rolesState, setRolesState] = useState({
    edit: {
      roleInput: '',
      filteredRoles: [],
      selectedRoles: formAuthorization.DESIGNER?.roles,
      selectedOption: 'onlyYou',
    },
    create: {
      roleInput: '',
      filteredRoles: [],
      selectedRoles: formAuthorization.FORM?.roles,
      selectedOption: 'registeredUsers',
      isPublic: processListData.anonymous ? processListData.anonymous : false,

    },
    view: {
      roleInput: '',
      filteredRoles: [],
      selectedRoles: formAuthorization.APPLICATION?.roles,
      selectedOption: 'submitter',
    },
  });

  useEffect(() => {
    if (showFlow) {
      setHasRendered(true);
    }
  }, [showFlow]);

  const handleFormPathChange = (e) => {
    setNewPath(e.target.value);
  };

  const handleShowLayout = () => {
    setShowFlow(false);
    setShowLayout(true);
  };
  const handleShowFlow = () => {
    setShowFlow(true);
    setShowLayout(false);
  };

  useEffect(() => {
    if (formId) {
      // Fetch form processes with formId
      dispatch(getFormProcesses(formId,(err,data)=>{
        if(err) return;
        setIsProcessDetailsLoading(true);
        getProcessDetails(data.processKey).then((response)=>{
          const { data } = response;
          dispatch(setProcessData(data));
          setIsProcessDetailsLoading(false);
        }
      );
      }));
    }
  }, [formId]);

 



  const updateFormName = (formName) => {
    setFormDetails((prevState) => ({
      ...prevState,
      name: formName,
    }));
    dispatchFormAction({ type: "title", formName });
  };
  const updateFormDescription = (formDescription) => {
    setFormDetails((prevState) => ({
      ...prevState,
      description: formDescription,
    }));
    dispatchFormAction({ type: "description", formDescription });
  };


  //for save farm
  //for save farm

  const validateFormNameOnBlur = () => {
    if (!form.title || form.title.trim() === "") {
      setNameError("This field is required");
      return;
    }

    validateFormName(form.title)
      .then((response) => {
        const data = response?.data;
        if (data && data.code === "FORM_EXISTS") {
          setNameError(data.message); // Set exact error message
        } else {
          setNameError("");
        }
      })
      .catch((error) => {
        const errorMessage =
          error.response?.data?.message ||
          "An error occurred while validating the form name.";
        setNameError(errorMessage); // Set the error message from the server
        console.error("Error validating form name:", errorMessage);
      });
  };
  const isFormComponentsChanged = () => {
    if (restoredFormData && restoredFormId) {
      return true;
    }
    let flatFormData = utils.flattenComponents(formData.components);
    let flatForm = utils.flattenComponents(form.components);
    const dateTimeOfFormData = Object.values(flatFormData).filter(
      (component) => component.type == "day" || component.type == "datetime"
    );
    const dateTimeOfForm = Object.values(flatForm).filter(
      (component) => component.type == "day" || component.type == "datetime"
    );
    let comparisonBetweenDateTimeComponent = true;
    if (dateTimeOfFormData?.length === dateTimeOfForm.length) {
      dateTimeOfFormData.forEach((formDataComponent) => {
        if (comparisonBetweenDateTimeComponent) {
          const isEqual = dateTimeOfForm.some(
            (formComponent) => formComponent.type === formDataComponent.type
          );
          if (!isEqual) {
            comparisonBetweenDateTimeComponent = isEqual;
          }
        }
      });
    } else {
      return true;
    }
    // if existing all datetime components are same we need to remove those compoenent and need to check isEqual
    if (comparisonBetweenDateTimeComponent) {
      flatFormData = Object.values(flatFormData).filter(
        (component) => component.type !== "day" && component.type !== "datetime"
      );
      flatForm = Object.values(flatForm).filter(
        (component) => component.type !== "day" && component.type !== "datetime"
      );
    } else {
      return true;
    }

    return (
      !_isEquial(flatFormData, flatForm) ||
      formData.display !== form.display ||
      formData.type !== form.type
    );
  };

  const handleConfirmSettings = () => {
    const parentFormId = processListData.parentFormId;
    const mapper = {
      formId: form._id,
      formName: formDetails?.name,
      description: formDetails?.description,
      status: processListData.status || "inactive",
      taskVariables: processListData.taskVariables
        ? processListData.taskVariables
        : [],
      anonymous: rolesState.create.isPublic,
      parentFormId: parentFormId,
      formType: form.type,
      display: formDisplay,
      processKey: workflow?.value,
      processName: workflow?.name,
      id: processListData.id,
      workflowChanged: false,
      statusChanged: false,
      resourceId: form._id,
      majorVersion:processListData.majorVersion,
      minorVersion:processListData.minorVersion,
    };

    const authorizations = {
      application: {
        resourceId: parentFormId,
        resourceDetails: {},
        roles: rolesState.view.selectedOption === "specifiedRoles" ? rolesState.view.selectedRoles : [],
        ...(rolesState.view.selectedOption === "submitter" && { userName: preferred_userName }) // TBD
      },
      designer: {
        resourceId: parentFormId,
        resourceDetails: {},
        roles: rolesState.edit.selectedOption === "specifiedRoles" ? rolesState.edit.selectedRoles : [],
        ...(rolesState.edit.selectedOption === "onlyYou" && { userName: preferred_userName })
      },
      form: {
        resourceId: parentFormId,
        resourceDetails: {},
        roles: rolesState.create.selectedOption === "specifiedRoles" ? rolesState.create.selectedRoles : [],
      }
    };
    dispatch(saveFormProcessMapperPut({ mapper, authorizations }));
    handleCloseModal();
  };


  const closeSaveModal = () => {
    setShowSaveModal(false);
  };

  const saveFormData = () => {
    setShowSaveModal(false);
    setFormSubmitted(true);
    const newFormData = manipulatingFormData(
      form,
      MULTITENANCY_ENABLED,
      tenantKey,
      formAccess,
      submissionAccess
    );
    newFormData.componentChanged = isFormComponentsChanged();
    newFormData.parentFormId = previousData.parentFormId;
    //To DO :  Below line to be fixed after Review
    newFormData.title = processListData.formName;
    formUpdate(newFormData._id, newFormData)
      .then(() => {
        setPromptNewVersion(false);
        setVersionSaved(true);
      })
      .catch((err) => {
        const error = err.response?.data || err.message;
        dispatch(setFormFailureErrorData("form", error));
      })
      .finally(() => {
        setFormSubmitted(false);
      });
  };

  const backToForm = () => {
    dispatch(push(`${redirectUrl}form/`));
  };

  const handleHistory = () => {
    console.log("handleHistory");
  };

 

  const handlePreview = () => {
    console.log("handlePreview");
  };

 

  const discardChanges = () => {
    console.log("discardChanges");
  };


  const editorActions = () => {
    setNewActionModal(true);
  };

  const handleChange = (path, event) => {
    setFormSubmitted(false);
    const { target } = event;
    const value = target.type === "checkbox" ? target.checked : target.value;
    value == "" ? setNameError("This field is required") : setNameError("");

    dispatchFormAction({ type: path, value });
  };

  const handlePublishAsNewVersion = (formName,formDescription) => {
    setFormSubmitted(true);
    const newFormData = manipulatingFormData(
      _.cloneDeep(form),
      MULTITENANCY_ENABLED,
      tenantKey,
      formAccess,
      submissionAccess
    );

    const newPathAndName =
    "duplicate-version-" + Math.random().toString(16).slice(9);
    newFormData.path = newPathAndName;
    newFormData.title = form.title;
    newFormData.name = newPathAndName;
    newFormData.componentChanged = true;
    delete newFormData.machineName;
    delete newFormData.parentFormId;
    newFormData.newVersion = true;
    newFormData.description = formDescription;
    delete newFormData._id;

    formCreate(newFormData)
      .then((res) => {
        const form = res.data;
        dispatch(setFormSuccessData("form", form));
        dispatch(push(`${redirectUrl}formflow/${form._id}/edit/`));
      })
      .catch((err) => {
        let error;
        if (err.response?.data) {
          error = err.response.data;
          console.log(error);
          setNameError(error?.errors?.name?.message);
        } else {
          error = err.message;
          setNameError(error?.errors?.name?.message);
        }
      })
      .finally(() => {
        setFormSubmitted(false);
      });
  };

  const formChange = (newForm) =>
    dispatchFormAction({ type: "formChange", value: newForm });

  const handlePublish = () => {
    if (!promptNewVersion) {
      setIsPublishLoading(true);
      if (processListData.status === "active") {
        unPublish(processListData.id)
          .then(() => {
            setPromptNewVersion(true);
            setIsPublishLoading(false);
            setIsPublished(!isPublished);
            setVersionSaved(true);
          })
          .catch((err) => {
            setIsPublishLoading(false);
            const error = err.response?.data || err.message;
            dispatch(setFormFailureErrorData("form", error));
          });
      }
      else {
        publish(processListData.id)
          .then(() => {
            setIsPublishLoading(false);
            setIsPublished(!isPublished);
            setVersionSaved(true);
          })
          .catch((err) => {
            setIsPublishLoading(false);
            const error = err.response?.data || err.message;
            dispatch(setFormFailureErrorData("form", error));
          })
          .finally(() => {
            setIsPublishLoading(false);
            dispatch(push(`${redirectUrl}form/`));
          });
      }

    }
    else {
      setVersion((prevVersion) => ({
        ...prevVersion,
        major: ((processListData.majorVersion + 1) + ".0"),  // Increment the major version
        minor: processListData.majorVersion + "." + (processListData.minorVersion + 1),  // Reset the minor version to 0
      }));
      setShowSaveModal(true);
    }


  };

  const handleVersioning = () => {
    setVersion((prevVersion) => ({
      ...prevVersion,
      major: ((processListData.majorVersion + 1) + ".0"),  // Increment the major version
      minor: processListData.majorVersion + "." + (processListData.minorVersion + 1),  // Reset the minor version to 0
    }));

    //get mapper data

    //call for new version save 
    setShowSaveModal(true);
  };

  const saveAsNewVersion = async () => {
    setFormSubmitted(true);
    const newFormData = manipulatingFormData(
      form,
      MULTITENANCY_ENABLED,
      tenantKey,
      formAccess,
      submissionAccess
    );
    const oldFormData = manipulatingFormData(
      formData,
      MULTITENANCY_ENABLED,
      tenantKey,
      formAccess,
      submissionAccess
    );

    const newPathAndName = "-v" + Math.random().toString(16).slice(9);
    oldFormData.path += newPathAndName;
    oldFormData.name += newPathAndName;
    await formUpdate(oldFormData._id, oldFormData);
    newFormData.componentChanged = true;
    newFormData.newVersion = true;
    newFormData.parentFormId = prviousData.parentFormId;
    delete newFormData.machineName;
    delete newFormData._id;
    formCreate(newFormData)
      .then(() => {
        setPromptNewVersion(false);
      })
      .catch((err) => {
        const error = err.response.data || err.message;
        dispatch(setFormFailureErrorData("form", error));
      })
      .finally(() => {
        setFormSubmitted(false);
      });
  };
  return (
    <div>
      <div>
        <LoadingOverlay
          active={formSubmitted}
          spinner
          text={t("Loading...")}
        >

          <SettingsModal show={showSettingsModal} handleClose={handleCloseModal}
            handleConfirm={handleConfirmSettings}
            rolesState={rolesState} setRolesState={setRolesState}
            setFormDetails={setFormDetails} formDetails={formDetails}
            updateFormName={updateFormName} formDisplay={formDisplay}
            setFormDisplay={setFormDisplay}
            updateFormDescription={updateFormDescription} newPath={newPath}
            handleFormPathChange={handleFormPathChange} />

          <Errors errors={errors} />

          <Card className="editor-header">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div className="d-flex align-items-center justify-content-between">
                  <BackToPrevIcon onClick={backToForm} />
                  <div className="mx-4 editor-header-text">{form.title}</div>
                  <span data-testid={`form-status-${form._id}`} className="d-flex align-items-center white-text mx-3">
                    {isPublished ? (
                      <>
                        <div className="status-live"></div>
                      </>
                    ) : (
                      <div className="status-draft"></div>
                    )}
                    {isPublished ? t("Live") : t("Draft")}
                  </span>
                </div>
                <div>
                  <CustomButton
                    variant="dark"
                    size="md"
                    label={<Translation>{(t) => t("Settings")}</Translation>}
                    onClick={handleOpenModal}
                    dataTestid="eidtor-settings-testid"
                    ariaLabel={t("Designer Settings Button")}
                  />
                  <CustomButton
                    variant="dark"
                    size="md"
                    className="mx-2"
                    label={t("Actions")}
                    onClick={editorActions}
                    dataTestid="designer-action-testid"
                    ariaLabel={(t) => t("Designer Actions Button")}
                  />
                  <CustomButton
                    variant="light"
                    size="md"
                    label={t(publishText)}
                    buttonLoading={isPublishLoading ? true : false}
                    onClick={handlePublish}
                    dataTestid="handle-publish-testid"
                    ariaLabel={`${t(publishText)} ${t("Button")}`}
                  />
                </div>
              </div>
            </Card.Body>
          </Card>
          <div className="d-flex mb-3">
            <div
              className={`wraper form-wraper ${showLayout ? "visible" : ""}`}
            >
              <Card>
                <Card.Header>
                  <div
                    className="d-flex justify-content-between align-items-center"
                    style={{ width: "100%" }}
                  >
                    <div className="d-flex align-items-center justify-content-between">
                      <div className="mx-2 builder-header-text">Layout</div>
                      <div>
                        <CustomButton
                          variant="secondary"
                          size="md"
                          icon={<HistoryIcon />}
                          label={t("History")}
                          onClick={handleHistory}
                          dataTestid="handle-form-history-testid"
                          ariaLabel={t("Form History Button")}
                        />
                        <CustomButton
                          variant="secondary"
                          size="md"
                          className="mx-2"
                          icon={<PreviewIcon />}
                          label={t("Preview")}
                          onClick={handlePreview}
                          dataTestid="handle-preview-testid"
                          ariaLabel={t("Preview Button")}
                        />
                      </div>
                    </div>
                    <div>
                      <CustomButton
                        variant="primary"
                        size="md"
                        className="mx-2"
                        disabled={isPublished}
                        label={
                          <Translation>{(t) => t("Save Layout")}</Translation>
                        }
                        onClick={versionSaved ? handleVersioning : handleVersioning}
                        dataTestid="save-form-layout"
                        ariaLabel={t("Save Form Layout")}
                      />
                      <CustomButton
                        variant="secondary"
                        size="md"
                        label={
                          <Translation>
                            {(t) => t("Discard Changes")}
                          </Translation>
                        }
                        onClick={discardChanges}
                        dataTestid="discard-button-testid"
                        ariaLabel={t("cancelBtnariaLabel")}
                      />
                    </div>
                  </div>
                </Card.Header>
                <Card.Body>
                  <div className="form-builder">
                    <FormBuilder
                      key={form._id}
                      form={form}
                      onChange={formChange}
                      options={{
                        language: lang,
                        i18n: RESOURCE_BUNDLES_DATA,
                      }}
                    />
                  </div>
                </Card.Body>
              </Card>
            </div>
            <div className={`wraper flow-wraper ${showFlow ? "visible" : ""}`}>
            {isProcessDetailsLoading ? <>loading...</>  : 
              <FlowEdit />}
            </div>
            {showFlow && (
              <div
                className={`form-flow-wraper-left ${showFlow ? "visible" : ""}`}
                onClick={handleShowLayout}
              >
                Layout
              </div>
            )}
            {showLayout && (
              <div
                className={`form-flow-wraper-right ${showLayout && hasRendered ? "visible" : ""
                  }`}
                onClick={handleShowFlow}
              >
                Flow
              </div>
            )}

            {/* {showLayout && <div className={`form-flow-wraper-right ${showLayout ? 'visible' : ''}`} onClick={handleShowFlow}>Flow</div>} */}
          </div>
        </LoadingOverlay>
      </div>
      <ActionModal
        newActionModal={newActionModal}
        onClose={onCloseActionModal}
        CategoryType={CategoryType.FORM}
        onAction={setSelectedAction}
      />
      <FormBuilderModal
        modalHeader={t("Duplicate")}
        nameLabel={t("New Form Name")}
        descriptionLabel={t("New Form Description")}
        showBuildForm={selectedAction === DUPLICATE}
        formSubmitted={formSubmitted}
        onClose={handleCloseSelectedAction}
        handleChange={handleChange}
        primaryBtnLabel={t("Save and Edit form")}
        primaryBtnAction={handlePublishAsNewVersion}
        setNameError={setNameError}
        nameValidationOnBlur={validateFormNameOnBlur}
        nameError={nameError}
      />
      <ConfirmModal
        show={showSaveModal}
        title={<Translation>{(t) => t("Save Your Changes")}</Translation>}
        message={<Translation>{(t) => t("Saving as an incremental version will affect previous submissions. Saving as a new full version will not affect previous submissions.")}</Translation>}
        primaryBtnAction={saveFormData}
        onClose={closeSaveModal}
        secondayBtnAction={saveAsNewVersion}
        primaryBtnText={<Translation>{(t) => t(`Save as Version ${version.minor}`)}</Translation>}
        secondaryBtnText={<Translation>{(t) => t(`Save as Version ${version.major}`)}</Translation>}
        size="md"
      />
    </div>
  );
});

export default Edit;
