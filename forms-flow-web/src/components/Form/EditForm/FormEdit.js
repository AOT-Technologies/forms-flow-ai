import React, { useReducer, useState, useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useParams } from "react-router-dom";
import { Card } from "react-bootstrap";
import {
  Errors,
  FormBuilder,
  deleteForm,
  Form,
} from "@aot-technologies/formio-react";
import {
  CustomButton,
  ConfirmModal,
  BackToPrevIcon,
  HistoryIcon,
  PreviewIcon,
  FormBuilderModal,
  HistoryModal,
  ImportModal
} from "@formsflow/components";
import { RESOURCE_BUNDLES_DATA } from "../../../resourceBundles/i18n";
import LoadingOverlay from "react-loading-overlay-ts";
import _cloneDeep from "lodash/cloneDeep";
import { useTranslation } from "react-i18next";
import { push } from "connected-react-router";
import ActionModal from "../../Modals/ActionModal.js";
//for save form
import { MULTITENANCY_ENABLED } from "../../../constants/constants";
import { fetchFormById } from "../../../apiManager/services/bpmFormServices";
import { manipulatingFormData } from "../../../apiManager/services/formFormatterService";
import {
  formUpdate,
  validateFormName,
  formCreate,
  formImport,
  publish,
  unPublish,
  getFormHistory,
} from "../../../apiManager/services/FormServices";
import FileService from "../../../services/FileService";
import {
  setFormFailureErrorData,
  setFormSuccessData,
  setRestoreFormData,
  setRestoreFormId,
  setFormDeleteStatus,
  setFormHistories,
} from "../../../actions/formActions";
import {
  saveFormProcessMapperPut,
  getProcessDetails,
  unPublishForm,
} from "../../../apiManager/services/processServices";
import _ from "lodash";
import SettingsModal from "../../Modals/SettingsModal";
import FlowEdit from "./FlowEdit.js";
import ExportModal from "../../Modals/ExportModal.js";
import NewVersionModal from "../../Modals/NewVersionModal";
import { currentFormReducer } from "../../../modules/formReducer.js";
import { toast } from "react-toastify";
import userRoles from "../../../constants/permissions.js";
import { generateUniqueId, isFormComponentsChanged } from "../../../helper/helper.js";
import { useMutation } from "react-query";
import NavigateBlocker from "../../CustomComponents/NavigateBlocker";
import { setProcessData, setFormPreviosData, setFormProcessesData } from "../../../actions/processActions.js";

// constant values
const DUPLICATE = "DUPLICATE";
const IMPORT = "IMPORT";
const EXPORT = "EXPORT";
const FORM_LAYOUT = "FORM_LAYOUT";
const FLOW_LAYOUT = "FLOW_LAYOUT";
const DELETE = "DELETE";

const EditComponent = () => {
  const dispatch = useDispatch();
  const { formId } = useParams();
  const { t } = useTranslation();
  //this variable handle the flow and layot tab switching
  const sideTabRef = useRef(null);

  /* ------------------------------- mapper data ------------------------------ */
  const { formProcessList: processListData, formPreviousData: previousData } =
    useSelector((state) => state.process);

  /* -------------------------------- user data and form access data ------------------------------- */
  const {
    formAccess = [],
    submissionAccess = [],
    lang,
    userDetail: { preferred_username },
  } = useSelector((state) => state.user);

  /* ---------------------------  form data --------------------------- */
  const { form: formData, error: errors } = useSelector((state) => state.form);

  /* ----------------- current form data when user is editing ----------------- */
  const [form, dispatchFormAction] = useReducer(
    currentFormReducer,
    _cloneDeep(formData)
  );

  /* ------------------ handling form layout and flow layouts ----------------- */
  const [currentLayout, setCurrentLayout] = useState(FORM_LAYOUT);
  const isFormLayout = currentLayout === FORM_LAYOUT;
  const isFlowLayout = currentLayout === FLOW_LAYOUT;

  const tenantKey = useSelector((state) => state.tenants?.tenantId);
  const redirectUrl = MULTITENANCY_ENABLED ? `/tenant/${tenantKey}/` : "/";

  const [nameError, setNameError] = useState("");
  const [newVersionModal, setNewVersionModal] = useState(false);
  /* ------------------------------ fowvariables ------------------------------ */
  const flowRef = useRef(null);
  /* ------------------------- file import ------------------------- */
  const [formTitle, setFormTitle] = useState("");
  const [importError, setImportError] = useState("");
  const [importLoader, setImportLoader] = useState(false);
  const defaultPrimaryBtnText = "Confirm And Replace";
  const [primaryButtonText, setPrimaryButtonText] = useState(defaultPrimaryBtnText);
  const { createDesigns } = userRoles();
  const [formChangeState, setFormChangeState] = useState({initial:false,changed:false});
  const [workflowIsChanged, setWorkflowIsChanged] = useState(false);

  /* --------- validate form title exist or not --------- */
  const {
    mutate: validateFormTitle, // this function will trigger the api call
    isLoading: validationLoading,
    // isError: error,
  } = useMutation(
    ({ title }) =>
      validateFormName(title),
    {
      onSuccess:({data}, {createButtonClicked,...variables})=>{

        if (data && data.code === "FORM_EXISTS") {
          setNameError(data.message);  // Set exact error message
        } else {
          setNameError("");
          if(createButtonClicked){
            handlePublishAsNewVersion(variables);
          }
        }
      },
      onError: (error) => {
        const errorMessage = error.response?.data?.message || "An error occurred while validating the form name.";
        setNameError(errorMessage);  // Set the error message from the server
      }
    }
  );
  const UploadActionType = {
    IMPORT: "import",
    VALIDATE: "validate",
  };

  useEffect(() => {
    if (importError !== "") {
      setPrimaryButtonText("Try Again");
    }
  }, [importError]);

  const [fileItems, setFileItems] = useState({
    workflow: {
      majorVersion: null,
      minorVersion: null,
    },
    form: {
      majorVersion: null,
      minorVersion: null,
    },
  });


  const handleImport = async (fileContent, UploadActionType,
     selectedLayoutVersion, selectedFlowVersion) => {
    if (!isValidUploadActionType(UploadActionType)) return;
  
    const data = prepareImportData(UploadActionType, selectedLayoutVersion, selectedFlowVersion);
  
    try {
      const res = await formImport(fileContent, JSON.stringify(data));
      await handleImportResponse(res, fileContent, data.action);
    } catch (err) {
      handleImportError(err);
    }
  };
  
  // Helper function to validate the action type
  const isValidUploadActionType = (actionType) => {
    if (!["validate", "import"].includes(actionType)) {
      console.error("Invalid UploadActionType provided");
      setImportLoader(false);
      return false;
    }
    return true;
  };
  
  // Helper function to prepare data for the API request
  const prepareImportData = (actionType, selectedLayoutVersion, selectedFlowVersion) => {
    const data = {
      importType: "edit",
      action: actionType,
      mapperId: processListData.id,
    };

    if (actionType === "import") {
      setImportLoader(true);
      setFormSubmitted(true);

      if (selectedLayoutVersion || selectedFlowVersion) {
        data.form = prepareVersionData(selectedLayoutVersion);
        //the workflow shoul send only the value of skip.
        data.workflow = {
          skip: typeof selectedFlowVersion !== 'string',
        };
      }
    }

    return data;
  };

  // Helper function to prepare version data
  const prepareVersionData = (version) => ({
    skip: typeof version !== 'string', // skip is false if version is a string, true otherwise
    ...(typeof version === 'string' && { selectedVersion: version }), // Include selectedVersion only if version is a string
  });

  // Helper function to handle the API response
  const handleImportResponse = async (res, fileContent, action) => {
    setImportLoader(false);
    setFormSubmitted(false);
    const formExtracted = await extractForm(fileContent);
    const { data: responseData } = res;
    if (!responseData || !formExtracted) return;

    /* -------------------------- if action is validate ------------------------- */
    if (action === "validate") {
      setFileItems({
        workflow: extractVersionInfo(responseData.workflow),
        form: extractVersionInfo(responseData.form),
      });
      setFormTitle(formExtracted.forms[0]?.formTitle || ""); 
    }else{
      /* ------------------------- if the form id changed ------------------------- */
      const formId = responseData.mapper?.formId;
      if(formId && formData._id != formId){
        dispatch(push(`${redirectUrl}formflow/${formId}/edit/`));
        return;
      }
      updateLayout({formExtracted, responseData});
    }
  };

  // Helper function to extract version information
  const extractVersionInfo = (versionData) => (
    {
      majorVersion: versionData?.majorVersion,
      minorVersion: versionData?.minorVersion
    });

  const extractForm = async (fileContent) => {
    try {
      const formExtracted = await FileService.extractFileDetails(fileContent);
      return formExtracted;
    } catch (error) {
      setImportError(error);
      return null;
    }
  };



  const updateLayout = ({formExtracted, responseData}) => {
    /* --------- the response data will contain' mapper and process' key -------- */
    const { forms } = formExtracted || {};
    const { process, mapper } = responseData;
    const isNotFormPlusWorkflow = !forms[0]?.content;
    const extractedForm = forms[0]?.content || forms[0];

    /* if form changed then the response contain mapper key and will update
    1. formio's form data
    2. mapper data
    3. current form data */
    if(mapper && extractedForm){
      if(isNotFormPlusWorkflow){
        dispatchFormAction({
          type: "components",
          value: _cloneDeep(extractedForm.components),
        });
      }else{ 
      const currentFormDataWithImportedData = {...formData, ...extractedForm};
      dispatch(setFormSuccessData("form", currentFormDataWithImportedData));
      dispatch(setFormPreviosData(mapper));
      dispatch(setFormProcessesData(mapper));
      dispatchFormAction({type:"replaceForm",value: currentFormDataWithImportedData});
      }
    }

    /* ---------- if workflow changed then need to updated process dat ---------- */
    if (process) {
      dispatch(setProcessData(process));
    }

    handleCloseSelectedAction();
  };

  // Helper function to handle errors
  const handleImportError = (err) => {
    setImportLoader(false);
    setFormSubmitted(false);
    setImportError(err?.response?.data?.message || "An error occurred");
  };

  /* ------------------------- form history variables ------------------------- */
  const [isNewVersionLoading, setIsNewVersionLoading] = useState(false);
  const [restoreFormDataLoading, setRestoreFormDataLoading] = useState(false);
  const {
    formHistoryData = {},
    restoredFormData,
    restoredFormId,
  } = useSelector((state) => state.formRestore);

  /* -------------------------- getting process data -------------------------- */
  const [isProcessDetailsLoading, setIsProcessDetailsLoading] = useState(false);

  /* ------------------------------ for save form ----------------------------- */
  const [promptNewVersion, setPromptNewVersion] = useState(
    processListData.promptNewVersion
  );
  const [version, setVersion] = useState({ major: 1, minor: 0 });
  const [isPublished, setIsPublished] = useState(
    processListData?.status == "active"
  );
  const [isPublishLoading, setIsPublishLoading] = useState(false);
  const publishText = isPublished ? "Unpublish" : "Publish";
  const [formSubmitted, setFormSubmitted] = useState(false);

  const applicationCount = useSelector(
    (state) => state.process?.applicationCount
  );

  const formHistory = formHistoryData.formHistory || [];
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [modalType, setModalType] = useState("");

  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const handleToggleSettingsModal = () =>
    setShowSettingsModal(!showSettingsModal);
  const [selectedAction, setSelectedAction] = useState(null);
  const [newActionModal, setNewActionModal] = useState(false);
  const [isSettingsSaving, setIsSettingsSaving] = useState(false);
  const onCloseActionModal = () => setNewActionModal(false);

  const CategoryType = {
    FORM: "FORM",
    WORKFLOW: "WORKFLOW",
  };

  // handling form layout and flow layout
  const handleCurrentLayout = (e) => {
    //wehn the current is assigned with element then only the visible class will render
    sideTabRef.current = e;
    setCurrentLayout(isFormLayout ? FLOW_LAYOUT : FORM_LAYOUT);
  };

  const handleCloseSelectedAction = () => {
    setSelectedAction(null);
    if (selectedAction === IMPORT) {
      setFileItems({
        workflow: {
          majorVersion: null,
          minorVersion: null,
        },
        form: {
          majorVersion: null,
          minorVersion: null,
        },
      });
      setImportError("");
      setPrimaryButtonText(defaultPrimaryBtnText);
    }
    if (selectedAction === DUPLICATE) {
      setNameError("");
      setFormSubmitted(false);
    }
  };

  useEffect(() => {
    if (restoredFormId) {
      setRestoreFormDataLoading(true);
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
          setRestoreFormDataLoading(false);
        });
    }
    return () => {
      dispatch(setRestoreFormData({}));
      dispatch(setRestoreFormId(null));
    };
  }, [restoredFormId]);

  const fetchRestoredFormData = (restoredFormId) => {
    if (restoredFormId) {
      fetchFormById(restoredFormId)
        .then((res) => {
          if (res.data) {
            const { data } = res;
            dispatch(setRestoreFormData(data));
            dispatchFormAction({
              type: "components",
              value: _cloneDeep(data.components),
            });
            dispatchFormAction({ type: "type", value: data.type });
            dispatchFormAction({ type: "display", value: data.display });
          }
        })
        .catch((err) => {
          toast.error(err.response.data);
        });
    }

    const cleanup = () => {
      dispatch(setRestoreFormData({}));
      dispatch(setRestoreFormId(null));
    };

    return cleanup;
  };

  useEffect(() => {
    fetchRestoredFormData(restoredFormId);
  }, [restoredFormId]);

  const fetchProcessDetails = async (processListData) => {
    const response = await getProcessDetails(processListData.processKey);
    dispatch(setProcessData(response.data));
  };

  useEffect(async () => {
    if (processListData.processKey) {
      setIsProcessDetailsLoading(true);
      await fetchProcessDetails(processListData);
      setIsProcessDetailsLoading(false);
    }
  }, [processListData.processKey]);

  const validateFormNameOnBlur = ({ title, ...rest }) => {
    if (!title || title.trim() === "") {
      setNameError("This field is required");
      return;
    }
    validateFormTitle({ title, ...rest });
  };


  /* ----------- save settings function to be used in settings modal ---------- */
  const filterAuthorizationData = (authorizationData) => {
    if(authorizationData.selectedOption === "submitter"){
      return {roles: [], userName:null, resourceDetails:{submitter:true}};
    }
    if (authorizationData.selectedOption === "specifiedRoles") {
      return { roles: authorizationData.selectedRoles, userName: "" };
    }
    return { roles: [], userName: preferred_username };
  };

  const handleConfirmSettings = async ({
    formDetails,
    accessDetails,
    rolesState,
  }) => {
    setIsSettingsSaving(true);
    const parentFormId = processListData.parentFormId;
    const mapper = {
      formId: form._id,
      id: processListData.id,
      formName: formDetails?.title,
      description: formDetails?.description,
      anonymous: formDetails.anonymous,
      parentFormId: parentFormId,
      formType: form.type,
      majorVersion: processListData.majorVersion,
      minorVersion: processListData.minorVersion,
    };

    const authorizations = {
      application: {
        resourceId: parentFormId,
        resourceDetails:{submitter:false},
        ...filterAuthorizationData(rolesState.APPLICATION),
      },
      designer: {
        resourceId: parentFormId,
        resourceDetails: {},
        ...filterAuthorizationData(rolesState.DESIGN),
      },
      form: {
        resourceId: parentFormId,
        resourceDetails: {},
        roles:
          rolesState.FORM.selectedOption === "specifiedRoles"
            ? rolesState.FORM.selectedRoles
            : [],
      },
    };

    const formData = {
      title: formDetails.title,
      display: formDetails.display,
      path: formDetails.path,
      submissionAccess: accessDetails.submissionAccess,
      access: accessDetails.formAccess,
    };

    try {
      await dispatch(saveFormProcessMapperPut({ mapper, authorizations }));
      const updateFormResponse = await formUpdate(form._id, formData);
      dispatchFormAction({
        type: "formChange",
        value: { ...updateFormResponse.data, components: form.components },
      });
      dispatch(setFormSuccessData("form", updateFormResponse.data));
    } catch (error) {
      console.error(error);
    } finally {
      setIsSettingsSaving(false);
      handleToggleSettingsModal();
    }
  };

  const saveFormData = async ({ showToast = true }) => {
    try {
      const isFormChanged = isFormComponentsChanged({
        restoredFormData,
        restoredFormId, formData, form
      });
      if (!isFormChanged && !promptNewVersion) {
        showToast && toast.success(t("Form updated successfully"));
        return;
      }
      setShowConfirmModal(false);
      setFormSubmitted(true);
      const newFormData = manipulatingFormData(
        form,
        MULTITENANCY_ENABLED,
        tenantKey,
        formAccess,
        submissionAccess
      );
      newFormData.componentChanged = isFormChanged || promptNewVersion; //after unpublish need to save it in minor version on update
      newFormData.parentFormId = previousData.parentFormId;
      newFormData.title = processListData.formName;

      const { data } = await formUpdate(newFormData._id, newFormData);
      dispatch(setFormSuccessData("form", data));
      setPromptNewVersion(false);
      setFormChangeState(prev => ({ ...prev, changed: false }));
    } catch (err) {
      const error = err.response?.data || err.message;
      dispatch(setFormFailureErrorData("form", error));
    } finally {
      setFormSubmitted(false);
    }
  };

  const backToForm = () => {
    dispatch(push(`${redirectUrl}formflow`));
  };
  const closeHistoryModal = () => {
    setShowHistoryModal(false);
  };
  const fetchFormHistory = (parentFormId, page, limit) => {
    getFormHistory(parentFormId, page, limit)
      .then((res) => {
        dispatch(setFormHistories(res.data));
      })
      .catch(() => {
        setFormHistories([]);
      });
  };

  const handleFormHistory = () => {
    setShowHistoryModal(true);
    dispatch(setFormHistories({ formHistory: [], totalCount: 0 }));
    if (processListData?.parentFormId) {
      fetchFormHistory(processListData?.parentFormId, 1, 4);
    }
  };

  const loadMoreBtnAction = () => {
    fetchFormHistory(processListData?.parentFormId);
  };

  const revertFormBtnAction = (cloneId) => {
    dispatch(setRestoreFormId(cloneId));
    fetchRestoredFormData(cloneId);
  };

  const handlePreview = () => {
    const newTabUrl = `${redirectUrl}formflow/${form._id}/view-edit`;
    window.open(newTabUrl, "_blank");
  };

  const discardChanges = () => {
    dispatchFormAction({
      type: "components",
      value: _cloneDeep(formData.components),
    });
    setFormChangeState(prev=>({...prev,changed:false}));
    handleToggleConfirmModal();
  };

  const editorActions = () => {
    setNewActionModal(true);
  };

  const handlePublishAsNewVersion = ({ description, title }) => {
    setFormSubmitted(true);
    const newFormData = manipulatingFormData(
      _.cloneDeep(form),
      MULTITENANCY_ENABLED,
      tenantKey,
      formAccess,
      submissionAccess
    );

    const newPathAndName = generateUniqueId("duplicate-version-");
    newFormData.path = newPathAndName;
    newFormData.title = title;
    newFormData.name = newPathAndName;
    newFormData.componentChanged = true;
    delete newFormData.machineName;
    delete newFormData.parentFormId;
    newFormData.newVersion = true;
    newFormData.description = description;
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

  const captureFormChanges = ()=>{
    setFormChangeState((prev) => {
      let key = null; 
      if (!prev.initial) {
        key = "initial";
      } else if (!prev.changed) {
        key = "changed";
      }
      return key ? {...prev, [key]:true} : prev;
    });
  };

  const formChange = (newForm) => { 
    captureFormChanges();
    dispatchFormAction({ type: "formChange", value: newForm });
  };
  

  const confirmPublishOrUnPublish = async () => {
    try {
      const actionFunction = isPublished ? unPublish : publish;
      closeModal();
      setIsPublishLoading(true);
      if (!isPublished) {
        await flowRef.current.saveFlow(false);
        await saveFormData({showToast:false});
      }
      await actionFunction(processListData.id);
      if (isPublished) {
        await fetchProcessDetails(processListData);
      } else {
        backToForm();
      }
      setPromptNewVersion(isPublished);
      setIsPublished(!isPublished);
    } catch (err) {
      const error = err.response?.data || err.message;
      dispatch(setFormFailureErrorData("form", error));
    } finally {
      setIsPublishLoading(false);
    }
  };

  const handleVersioning = () => {
    setVersion((prevVersion) => ({
      ...prevVersion,
      major: processListData.majorVersion + 1 + ".0", // Increment the major version
      minor:
        processListData.majorVersion + "." + (processListData.minorVersion + 1), // Reset the minor version to 0
    }));
    openConfirmModal("save");
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
      //TBD: need to only update path and name so no need to send whole data
      const oldFormData = manipulatingFormData(
        formData,
        MULTITENANCY_ENABLED,
        tenantKey,
        formAccess,
        submissionAccess
      );

      const newPathAndName = generateUniqueId("-v");
      oldFormData.path += newPathAndName;
      oldFormData.name += newPathAndName;
      await formUpdate(oldFormData._id, oldFormData);

      newFormData.componentChanged = true;
      newFormData.newVersion = true;
      newFormData.parentFormId = previousData.parentFormId;
      delete newFormData.machineName;
      delete newFormData._id;

      const res = await formCreate(newFormData);
      const response = res.data;
      dispatch(setFormSuccessData("form", response));
      dispatch(push(`${redirectUrl}formflow/${response._id}/edit/`));
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

  /* ------------------------- handling confirm modal ------------------------- */

  const handleToggleConfirmModal = () => setShowConfirmModal(!showConfirmModal);
  const openConfirmModal = (type) => {
    setModalType(type);
    handleToggleConfirmModal();
  };
  const closeModal = () => {
    setModalType("");
    handleToggleConfirmModal();
  };

  const handleShowVersionModal = () => {
    setNewVersionModal(true);
    setShowConfirmModal(false);
  };

  const getModalContent = () => {
    switch (modalType) {
      case "save":
        return {
          title: "Save Your Changes",
          message:
            "Saving as an incremental version will affect previous submissions. Saving as a new full version will not affect previous submissions.",
          primaryBtnAction: saveFormData,
          secondayBtnAction: handleShowVersionModal,
          primaryBtnText: `Save as Version ${version.minor}`,
          secondaryBtnText: `Save as Version ${version.major}`,
        };
      case "publish":
        return {
          title: "Confirm Publish",
          message:
            "Publishing will save any unsaved changes and lock the entire form, including the layout and the flow. to perform any additional changes you will need to unpublish the form again.",
          primaryBtnAction: confirmPublishOrUnPublish,
          secondayBtnAction: closeModal,
          primaryBtnText: "Publish This Form",
          secondaryBtnText: "Cancel",
        };
      case "unpublish":
        return {
          title: "Confirm Unpublish",
          message:
            "This form is currently live. To save changes to form edits, you need ot unpublish it first. By Unpublishing this form, you will make it unavailble for new submissin to those who currently have access to it. You can republish the form after making your edits. ",
          primaryBtnAction: confirmPublishOrUnPublish,
          secondayBtnAction: closeModal,
          primaryBtnText: "Unpublish and Edit This Form",
          secondaryBtnText: "Cancel, Keep This Form Unpublished",
        };
      case "discard":
        return {
          title: "Discard Layout Changes?",
          message:
            "Are you sure you want to discard all the changes to the layout of the form?",
          messageSecondary: "This action cannot be undone.",
          primaryBtnAction: discardChanges,
          secondayBtnAction: closeModal,
          primaryBtnText: "Yes, Discard Changes",
          secondaryBtnText: "No, Keep My Changes",
        };
      default:
        return {};
    }
  };

  const modalContent = getModalContent();

  // loading up to set the data to the form variable
  if (!form?._id || restoreFormDataLoading) {
    return (
      <div className="d-flex justify-content-center">
        <div className="spinner-grow" aria-live="polite">
          <span className="sr-only">{t("Loading...")}</span>
        </div>
      </div>
    );
  }

  //TBD: check the behaviour when a form has some submission and still in draft mode
  const unPublishActiveForm = async () => {
    if (processListData.status === "active") {
      try {
        await unPublish(processListData.id);
        setIsPublished(false);
        dispatch(push(`${redirectUrl}formflow`));
      } catch (err) {
        const error = err.response?.data || err.message;
        dispatch(setFormFailureErrorData("form", error));
      } finally {
        setIsPublishLoading(false);
      }
    }
  };

  const handleCloseActionModal = () => {
    setSelectedAction(null); // Reset action
  };

  // deleting form hardly from formio and mark inactive in mapper table
  const deleteModal = () => {
    if (!applicationCount) {
      dispatch(deleteForm("form", formId));
      dispatch(push(`${redirectUrl}formflow`));
    }

    if (processListData.id) {
      dispatch(
        unPublishForm(processListData.id, (err) => {
          const message = `${_.capitalize(
            processListData?.formType
          )} deletion ${err ? "unsuccessful" : "successfully"}`;
          toast[err ? "error" : "success"](t(message));
        })
      );
    }

    dispatch(
      setFormDeleteStatus({ modalOpen: false, formId: "", formName: "" })
    );
  };

  const renderDeleteModal = () => {
    const hasSubmissions = processListData.id && applicationCount;
    const commonProps = {
      show: selectedAction === DELETE,
      primaryBtnAction: handleCloseActionModal,
      onClose: handleCloseActionModal,
    };

    if (hasSubmissions) {
      return (
        <ConfirmModal
          {...commonProps}
          title={t("You Cannot Delete This Form")}
          message={t(
            "But you may unpublish it if you wish to not receive any more submissions."
          )}
          messageSecondary={t(
            "You may not delete a form that has submissions associated with it."
          )}
          secondayBtnAction={unPublishActiveForm}
          primaryBtnText={t("Keep This Form")}
          secondaryBtnText={t("Unpublish This Form")}
          secondoryBtndataTestid="unpublish-button"
          primaryBtndataTestid="keep-form-button"
          primaryBtnariaLabel="Keep This Form"
          secondoryBtnariaLabel="Unpublish This Form"
        />
      );
    } else {
      return (
        <ConfirmModal
          {...commonProps}
          title={t("Are You Sure You Want to Delete This Form?")}
          message={t("This action cannot be undone.")}
          secondayBtnAction={deleteModal}
          primaryBtnText={t("No, Keep This Form")}
          secondaryBtnText={t("Yes, Delete the Form")}
          secondoryBtndataTestid="yes-delete-button"
          primaryBtndataTestid="no-delete-button"
          primaryBtnariaLabel="No, Keep This Form"
          secondoryBtnariaLabel="Yes, Delete the Form"
        />
      );
    }
  };

  return (
    <div>
      <div>
      <NavigateBlocker isBlock={formChangeState.changed || workflowIsChanged} message={"You have made changes that are not saved yet. The unsaved changes could be either on the Layout or the Flow side."} />
        <LoadingOverlay active={formSubmitted} spinner text={t("Loading...")}>
          <SettingsModal
            show={showSettingsModal}
            isSaving={isSettingsSaving}
            handleClose={handleToggleSettingsModal}
            handleConfirm={handleConfirmSettings}
          />

          <Errors errors={errors} />

          <Card className="editor-header">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div className="d-flex align-items-center justify-content-between">
                  <BackToPrevIcon onClick={backToForm} />
                  <div className="mx-4 editor-header-text">
                    {formData.title}
                  </div>
                  <span
                    data-testid={`form-status-${form._id}`}
                    className="d-flex align-items-center white-text mx-3"
                  >
                    <div
                      className={`status-${isPublished ? "live" : "draft"}`}
                    ></div>
                    {isPublished ? t("Live") : t("Draft")}
                  </span>
                </div>
                {createDesigns && (
                  <div>
                    <CustomButton
                      variant="dark"
                      size="md"
                      label={t("Settings")}
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
                      buttonLoading={isPublishLoading}
                      onClick={() => {
                        isPublished
                          ? openConfirmModal("unpublish")
                          : openConfirmModal("publish");
                      }}
                      dataTestid="handle-publish-testid"
                      ariaLabel={`${t(publishText)} ${t("Button")}`}
                    />
                  </div>
                )}
              </div>
            </Card.Body>
          </Card>
          <div className="d-flex mb-3">
            <div
              className={`wraper form-wraper ${isFormLayout ? "visible" : ""}`}
            >
              <Card>
                <Card.Header>
                  <div
                    className="d-flex justify-content-between align-items-center"
                    style={{ width: "100%" }}
                  >
                    <div className="d-flex align-items-center justify-content-between">
                      <div className="mx-2 builder-header-text">Layout</div>
                      {createDesigns && (
                        <div>
                          <CustomButton
                            variant="secondary"
                            size="md"
                            icon={<HistoryIcon />}
                            label={t("History")}
                            onClick={() => handleFormHistory()}
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
                      )}
                    </div>
                    {createDesigns && (
                      <div>
                        <CustomButton
                          variant="primary"
                          size="md"
                          className="mx-2"
                          disabled={isPublished || !formChangeState.changed}
                          label={t("Save Layout")}
                          onClick={
                            promptNewVersion ? handleVersioning : saveFormData
                          }
                          dataTestid="save-form-layout"
                          ariaLabel={t("Save Form Layout")}
                        />
                        <CustomButton
                          variant="secondary"
                          size="md"
                          label={t("Discard Changes")}
                          onClick={() => {
                            openConfirmModal("discard");
                          }}
                          disabled={!formChangeState.changed}
                          dataTestid="discard-button-testid"
                          ariaLabel={t("cancelBtnariaLabel")}
                        />
                      </div>
                    )}
                  </div>
                </Card.Header>
                <Card.Body>
                  <div className="form-builder">
                    {!createDesigns ? (
                      <div className="px-4 pt-4 form-preview">
                        <Form
                          form={form}
                          options={{
                            disableAlerts: true,
                            noAlerts: true,
                            language: lang, i18n: RESOURCE_BUNDLES_DATA
                          }}
                        />
                      </div>
                    ) : (
                      <FormBuilder
                        key={form._id}
                        form={form}
                        onChange={formChange}

                        options={{
                          language: lang,
                          alwaysConfirmComponentRemoval:true,
                          i18n: RESOURCE_BUNDLES_DATA,
                        }}
                        onDeleteComponent={captureFormChanges}
                      />
                    )}
                  </div>
                </Card.Body>
              </Card>
            </div>
            <div
              className={`wraper flow-wraper ${isFlowLayout ? "visible" : ""}`}
            >
              {/* TBD: Add a loader instead. */}
              {isProcessDetailsLoading ? <>loading...</> : <FlowEdit 
              ref={flowRef}
              setWorkflowIsChanged={setWorkflowIsChanged}
              CategoryType={CategoryType}
              isPublished={isPublished}
              />}
            </div>
            <button
              className={`border-0 form-flow-wraper-${
                isFormLayout ? "right" : "left"
              } ${sideTabRef.current && "visible"}`}
              onClick={handleCurrentLayout}
            >
              {isFormLayout ? "Flow" : "Layout"}
            </button>
          </div>
        </LoadingOverlay>
      </div>
      <ActionModal
        newActionModal={newActionModal}
        onClose={onCloseActionModal}
        CategoryType={CategoryType.FORM}
        onAction={setSelectedAction}
        published={isPublished}
      />
      <FormBuilderModal
        modalHeader={t("Duplicate")}
        nameLabel={t("New Form Name")}
        descriptionLabel={t("New Form Description")}
        showBuildForm={selectedAction === DUPLICATE}
        isLoading={formSubmitted || validationLoading}
        onClose={handleCloseSelectedAction}
        primaryBtnLabel={t("Save and Edit form")}
        primaryBtnAction={handlePublishAsNewVersion}
        setNameError={setNameError}
        nameValidationOnBlur={validateFormNameOnBlur}
        nameError={nameError}
      />

      {selectedAction === IMPORT && <ImportModal
        importLoader={importLoader}
        importError={importError}
        showModal={selectedAction === IMPORT}
        uploadActionType={UploadActionType}
        formName={formTitle}
        onClose={handleCloseSelectedAction}
        handleImport={handleImport}
        fileItems={fileItems}
        headerText="Import File"
        primaryButtonText={primaryButtonText}
        fileType=".json, .bpmn"
      />}

      <ExportModal
        showExportModal={selectedAction === EXPORT}
        onClose={handleCloseSelectedAction}
        mapperId={processListData.id}
        formTitle={form.title}
      />

      <NewVersionModal
        show={newVersionModal}
        newVersion={version.major}
        title={t("Create a New Full Version")}
        createNewVersion={saveAsNewVersion}
        onClose={closeNewVersionModal}
        isNewVersionLoading={isNewVersionLoading}
        size="md"
      />

      {showConfirmModal && (
        <ConfirmModal
          show={showConfirmModal}
          title={modalContent.title}
          message={modalContent.message}
          messageSecondary={modalContent.messageSecondary || ""}
          primaryBtnAction={modalContent.primaryBtnAction}
          onClose={closeModal}
          secondayBtnAction={modalContent.secondayBtnAction}
          primaryBtnText={modalContent.primaryBtnText}
          secondaryBtnText={modalContent.secondaryBtnText}
          size="md"
        />
      )}

      <HistoryModal
        show={showHistoryModal}
        onClose={closeHistoryModal}
        title={t("History")}
        loadMoreBtnText={t("Load More")}
        revertBtnText={t("Revert To This")}
        allHistory={formHistory}
        loadMoreBtnAction={loadMoreBtnAction}
        categoryType={CategoryType.FORM}
        revertBtnAction={revertFormBtnAction}
        historyCount={formHistoryData.totalCount}
        disableAllRevertButton={isPublished}
      />
      {renderDeleteModal()}
    </div>
  );
};

export const Edit = React.memo(EditComponent);
