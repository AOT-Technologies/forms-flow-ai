import React, { useReducer, useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Card } from "react-bootstrap";
import { Errors, FormBuilder } from "@aot-technologies/formio-react";
import { CustomButton, ConfirmModal, BackToPrevIcon, HistoryIcon, PreviewIcon, FormBuilderModal  } from "@formsflow/components";
import { RESOURCE_BUNDLES_DATA } from "../../../resourceBundles/i18n";
import LoadingOverlay from "react-loading-overlay-ts";
import _cloneDeep from "lodash/cloneDeep";
import { Translation, useTranslation } from "react-i18next";
import { push } from "connected-react-router";
import ActionModal from "../../Modals/ActionModal.js";
//for save form
import { MULTITENANCY_ENABLED } from "../../../constants/constants";
import { fetchFormById } from "../../../apiManager/services/bpmFormServices";
import { manipulatingFormData } from "../../../apiManager/services/formFormatterService";
import {
  formUpdate,
  validateFormName,
  formCreate, publish, unPublish
} from "../../../apiManager/services/FormServices";
import utils from "@aot-technologies/formiojs/lib/utils";
import {
  setFormFailureErrorData,
  setFormSuccessData,
  setRestoreFormData,
  setRestoreFormId,
} from "../../../actions/formActions";
import {
  saveFormProcessMapperPut,
  getProcessDetails
} from "../../../apiManager/services/processServices";
import { setProcessData } from '../../../actions/processActions.js';
import _isEquial from "lodash/isEqual";
import _ from "lodash";
import SettingsModal from "../../CustomComponents/settingsModal";
import FlowEdit from "./FlowEdit.js";
import ExportModal from "../../Modals/ExportModal.js";
import NewVersionModal from "../../Modals/NewVersionModal";
import {currentFormReducer} from "../../../modules/formReducer.js";
// constant values
const DUPLICATE = "DUPLICATE";
// const SAVE_AS_TEMPLATE= "SAVE_AS_TEMPLATE";
// const IMPORT= "IMPORT";
const EXPORT = "EXPORT";
//const DELETE = "DELETE";

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
  const [form, dispatchFormAction] = useReducer(currentFormReducer, _cloneDeep(formData));
  const [showFlow, setShowFlow] = useState(false);
  const [showLayout, setShowLayout] = useState(true);
  const tenantKey = useSelector((state) => state.tenants?.tenantId);
  const redirectUrl = MULTITENANCY_ENABLED ? `/tenant/${tenantKey}/` : "/";
  const [nameError, setNameError] = useState("");
  const [newVersionModal, setNewVersionModal] = useState(false);
  const [isNewVersionLoading, setIsNewVersionLoading] = useState(false);
  const [currentFormLoading, setCurrentFormLoading] = useState(false);

  // flow edit
  const [isProcessDetailsLoading, setIsProcessDetailsLoading] = useState(false);

  //for save form
  const [promptNewVersion, setPromptNewVersion] = useState(processListData.promptNewVersion);
  const [version, setVersion] = useState({ major: 1, minor: 0 });
  const [isPublished, setIsPublished] = useState(processListData?.status == "active" ? true : false);
  const [isPublishLoading, setIsPublishLoading] = useState(false);
  const publishText = isPublished ? "Unpublish" : "Publish";
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
  const [hasRendered, setHasRendered] = useState(false);

  const formPath = useSelector((state) => state.form.form.path);
  const [newPath, setNewPath] = useState(formPath);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState("");
  const preferred_userName = useSelector(
    (state) => state.user?.userDetail?.preferred_username || ""
  );

  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const handleToggleSettingsModal = () => setShowSettingsModal(!showSettingsModal);
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
    if (restoredFormId) {
      setCurrentFormLoading(true);
      fetchFormById(restoredFormId)
        .then((res) => {
          if (res.data) {
            const { data } = res;
            dispatch(setRestoreFormData(res.data));
            dispatchFormAction({
              type: "components",
              value: _cloneDeep(data.components),
            });
            dispatchFormAction({ type: "type", value: data.type });
            dispatchFormAction({ type: "display", value: data.display });
          }
        })
        .catch((err) => {
          console.log(err.response.data);
        })
        .finally(() => {
          setCurrentFormLoading(false);
        });
    }
    return () => {
      dispatch(setRestoreFormData({}));
      dispatch(setRestoreFormId(null));
    };
  }, [restoredFormId]);

  useEffect(() => {
    if (processListData.processKey) {
      setIsProcessDetailsLoading(true);
      getProcessDetails(processListData.processKey).then((response) => {
        const { data } = response;
        dispatch(setProcessData(data));
        setIsProcessDetailsLoading(false);
      }
      );
    }
  }, [processListData.processKey]);





  const updateFormName = (formName) => {
    setFormDetails((prevState) => ({
      ...prevState,
      name: formName,
    }));
    dispatchFormAction({ type: "title", value:formName });
  };
  const updateFormDescription = (formDescription) => {
    setFormDetails((prevState) => ({
      ...prevState,
      description: formDescription,
    }));
    dispatchFormAction({ type: "description", value:formDescription });
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
      majorVersion: processListData.majorVersion,
      minorVersion: processListData.minorVersion,
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

    const savePromise = dispatch(saveFormProcessMapperPut({ mapper, authorizations }));
    const updatePromise = updateFormPath();

    Promise.all([savePromise, updatePromise])
      .then(() => {
        handleToggleSettingsModal();
      })
      .catch(error => {
        console.error("Error saving form process:", error);
      });
  };


  const saveFormData = () => {
    setShowModal(false);
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
      })
      .catch((err) => {
        const error = err.response?.data || err.message;
        dispatch(setFormFailureErrorData("form", error));
      })
      .finally(() => {
        setFormSubmitted(false);
      });
  };


  const updateFormPath = () => {
    const newFormData = manipulatingFormData(
      _.cloneDeep(form),
      MULTITENANCY_ENABLED,
      tenantKey,
      formAccess,
      submissionAccess
    );
    newFormData.path = newPath;
    newFormData.title = formDetails.name;
    formUpdate(newFormData._id, newFormData);


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

  const handlePublishAsNewVersion = (formName, formDescription) => {
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

  const confirmUnpublishAction = () => {
    closeModal();
    setIsPublishLoading(true);
    unPublish(processListData.id)
      .then(() => {
        setPromptNewVersion(true);
        setIsPublished(!isPublished);
      })
      .catch((err) => {
        const error = err.response?.data || err.message;
        dispatch(setFormFailureErrorData("form", error));
      })
      .finally(() => {
        setIsPublishLoading(false);
      });
  };

  const confirmPublishAction = () => {
    closeModal();
    setIsPublishLoading(true);
    publish(processListData.id)
      .then(() => {
        setIsPublished(!isPublished);
      })
      .catch((err) => {
        const error = err.response?.data || err.message;
        dispatch(setFormFailureErrorData("form", error));
      })
      .finally(() => {
        setIsPublishLoading(false);
        dispatch(push(`${redirectUrl}form/`));
      });
  };

  const handlePublish = () => {
    if (processListData.status === "active") {
      openUnpublishModal();
    }
    else {
      openPublishModal();
    }
  };
  const handleVersioning = () => {
    setVersion((prevVersion) => ({
      ...prevVersion,
      major: ((processListData.majorVersion + 1) + ".0"),  // Increment the major version
      minor: processListData.majorVersion + "." + (processListData.minorVersion + 1),  // Reset the minor version to 0
    }));
    openSaveModal();
  };

  const closeNewVersionModal = () => {
    setNewVersionModal(false);
  };

  const saveAsNewVersion = async () => {
    try {
      setIsNewVersionLoading(true);
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

      const res = await formCreate(newFormData);
      const form = res.data;
      dispatch(setFormSuccessData("form", form));
      dispatch(push(`${redirectUrl}formflow/${form._id}/edit/`));
      setPromptNewVersion(false);
    } catch (err) {
      const error = err.response?.data || err.message;
      dispatch(setFormFailureErrorData("form", error));
    } finally {
      setIsNewVersionLoading(false);
      setNewVersionModal(false);
      setFormSubmitted(false);
    }
  };
 

  const openSaveModal = () => {
    setModalType("save");
    setShowModal(true);
  };

  const openPublishModal = () => {
    setModalType("publish");
    setShowModal(true);
  };

  const openUnpublishModal = () => {
    setModalType("unpublish");
    setShowModal(true);
  };

  const handleShowVersionModal = () => {
    setNewVersionModal(true);
    setShowModal(false);
  };

  const closeModal = () => {
    setModalType("");
    setShowModal(false);
  };

  const getModalContent = () => {
    switch (modalType) {
      case "save":
        return {
          title: "Save Your Changes",
          message: "Saving as an incremental version will affect previous submissions. Saving as a new full version will not affect previous submissions.",
          primaryBtnAction: saveFormData,
          secondayBtnAction: handleShowVersionModal,
          primaryBtnText: `Save as Version ${version.minor}`,
          secondaryBtnText: `Save as Version ${version.major}`,
        };
      case "publish":
        return {
          title: "Confirm Publish",
          message: "Publishing will save any unsaved changes and lock the entire form, including the layout and the flow. to perform any additional changes you will need to unpublish the form again.",
          primaryBtnAction: confirmPublishAction,
          secondayBtnAction: closeModal,
          primaryBtnText: "Publish This Form",
          secondaryBtnText: "Cancel",
        };
      case "unpublish":
        return {
          title: "Confirm Unpublish",
          message: "This form is currently live. To save changes to form edits, you need ot unpublish it first. By Unpublishing this form, you will make it unavailble for new submissin to those who currently have access to it. You can republish the form after making your edits. ",
          primaryBtnAction: confirmUnpublishAction,
          secondayBtnAction: closeModal,
          primaryBtnText: "Unpublish and Edit This Form",
          secondaryBtnText: "Cancel, Keep This Form Unpublished",
        };
      default:
        return {};
    }
  };

  const modalContent = getModalContent();

  // loading up to set the data to the form variable
  if (!form?._id || currentFormLoading) {
    return (
      <div className="d-flex justify-content-center">
        <div className="spinner-grow" role="status">
          <span className="sr-only">
            {t("Loading...")}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div>
        <LoadingOverlay
          active={formSubmitted}
          spinner
          text={t("Loading...")}
        >

          <SettingsModal show={showSettingsModal} handleClose={handleToggleSettingsModal}
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
                    onClick={handleToggleSettingsModal}
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
                        onClick={promptNewVersion ? handleVersioning : saveFormData}
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
              {/* TBD: Add a loader instead. */}
              {isProcessDetailsLoading ? <>loading...</> :
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

      <ExportModal
        showExportModal={selectedAction === EXPORT}
        onClose={handleCloseSelectedAction}
        formId={processListData.id}
      />

      <NewVersionModal
        show={newVersionModal}
        newVersion={version.major}
        title={<Translation>{(t) => t("Create a New Full Version")}</Translation>}
        createNewVersion={saveAsNewVersion}
        onClose={closeNewVersionModal}
        isNewVersionLoading={isNewVersionLoading}
        size="md"
      />

      {showModal && (
        <ConfirmModal
          show={showModal}
          title={modalContent.title}
          message={modalContent.message}
          primaryBtnAction={modalContent.primaryBtnAction}
          onClose={closeModal}
          secondayBtnAction={modalContent.secondayBtnAction}
          primaryBtnText={modalContent.primaryBtnText}
          secondaryBtnText={modalContent.secondaryBtnText}
          size="md"
        />
      )}
    </div>
  );
});

export default Edit;