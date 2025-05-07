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
  ImportModal,
  CustomInfo
} from "@formsflow/components";
import { RESOURCE_BUNDLES_DATA } from "../../../resourceBundles/i18n";
import LoadingOverlay from "react-loading-overlay-ts";
import _cloneDeep from "lodash/cloneDeep";
import { useTranslation } from "react-i18next";
import { push } from "connected-react-router";
import ActionModal from "../../../components/Modals/ActionModal.js";
//for save form
import { MULTITENANCY_ENABLED, MAX_FILE_SIZE } from "../../../constants/constants";
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
  getFormProcesses
} from "../../../apiManager/services/processServices";
import _ from "lodash";
import SettingsModal from "../../../components/Modals/SettingsModal.js";
import FlowEdit from "./FlowEdit.js";
import ExportModal from "../../../components/Modals/ExportModal.js";
import NewVersionModal from "../../../components/Modals/NewVersionModal";
import { currentFormReducer } from "../../../modules/formReducer.js";
import { toast } from "react-toastify";
import userRoles from "../../../constants/permissions.js";
import { generateUniqueId, isFormComponentsChanged, addTenantkey, textTruncate,
  convertMultiSelectOptionToValue } from "../../../helper/helper.js";
import { useMutation } from "react-query";
import NavigateBlocker from "../../../components/CustomComponents/NavigateBlocker";
import { setProcessData, setFormPreviosData, setFormProcessesData } from "../../../actions/processActions.js";

// constant values
const ACTION_OPERATIONS = {
  DUPLICATE : "DUPLICATE",
  IMPORT : "IMPORT",
  EXPORT : "EXPORT",
  DELETE : "DELETE"
};
const FORM_LAYOUT = "FORM_LAYOUT";
const FLOW_LAYOUT = "FLOW_LAYOUT";

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
    roleIds = {}
  } = useSelector((state) => state.user);
  // created a copy for access and submissin access
  const [formAccessRoles, setFormAccessRoles] = useState(_cloneDeep(formAccess));
  const [submissionAccessRoles, setSubmissionAccessRoles] = useState(_cloneDeep(submissionAccess));

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
  const defaultPrimaryBtnText = t("Confirm And Replace");
  const [primaryButtonText, setPrimaryButtonText] = useState(defaultPrimaryBtnText);
  const { createDesigns } = userRoles();
  const [formChangeState, setFormChangeState] = useState({ initial: false, changed: false });
  const [workflowIsChanged, setWorkflowIsChanged] = useState(false);
  const [migration, setMigration] = useState(false);
  const [loadingVersioning, setLoadingVersioning] = useState(false); // Loader state for versioning


  /* ------------------------- migration states ------------------------- */
  const [isMigrationLoading, setIsMigrationLoading] = useState(false);

  /* ------------------------- deletion states ------------------------- */
  const [isDeletionLoading, setIsDeletionLoading] = useState(false);


  /* --------- validate form title exist or not --------- */
  const {
    mutate: validateFormTitle, // this function will trigger the api call
    isLoading: validationLoading,
    // isError: error,
  } = useMutation(
    ({ title }) =>
      validateFormName(title),
    {
      onSuccess: ({ data }, { createButtonClicked, ...variables }) => {

        if (data && data.code === "FORM_EXISTS") {
          setNameError(data.message);  // Set exact error message
        } else {
          setNameError("");
          if (createButtonClicked) {
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

  // add and remove anonymouse access
  const addAndRemoveAnonymouseId = (data, type, isAnonymouse)=>{
    return data.map(access=>{
      if (access.type === type) {
        if (isAnonymouse) {
          access.roles.push(roleIds.ANONYMOUS);
        } else {
          access.roles = access.roles.filter((id) => id !== roleIds.ANONYMOUS);
        }
      }
      return access;
    });
  };

  useEffect(() => {
    // if anonymouse changed then the role ids add or remove from the state
    setFormAccessRoles(prev =>addAndRemoveAnonymouseId(prev, "read_all", processListData.anonymous ));
    setSubmissionAccessRoles(prev=> addAndRemoveAnonymouseId(prev, "create_own",processListData.anonymous ));
  }, [processListData?.anonymous]);


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


  const handleImport = async (
    fileContent,
    UploadActionType,
    selectedLayoutVersion,
    selectedFlowVersion
  ) => {
    if (fileContent.size > MAX_FILE_SIZE) {
      setImportError(
        `File size exceeds the ${
          MAX_FILE_SIZE / (1024 * 1024)
        }MB limit. Please upload a smaller file.`
      );
      return;
    }
    if (!isValidUploadActionType(UploadActionType)) return;

    const data = prepareImportData(
      UploadActionType,
      selectedLayoutVersion,
      selectedFlowVersion
    );

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
      // while import and save need to false this variable to avoid the confirmation modal
      if(promptNewVersion) setPromptNewVersion(false);
      /* ------------------------- if the form id changed ------------------------- */
      const formId = responseData.mapper?.formId;
      if(formId && formData._id != formId){
        dispatch(push(`${redirectUrl}formflow/${formId}/edit`));
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
  // const [isPublishLoading, setIsPublishLoading] = useState(false);
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
  const processData = useSelector((state) => state.process?.processData);

  const CategoryType = {
    FORM: "FORM",
    WORKFLOW: "WORKFLOW",
  };
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const view = queryParams.get("view");
    if (view === "flow") {
      setCurrentLayout(FLOW_LAYOUT);
      sideTabRef.current = true;
    } else {
      setCurrentLayout(FORM_LAYOUT);
    }
  }, [location.search]);

  const handleCurrentLayout = (e) => {
    //wehn the current is assigned with element then only the visible class will render
    sideTabRef.current = e;
    const newLayout = isFormLayout ? FLOW_LAYOUT : FORM_LAYOUT;
    setCurrentLayout(newLayout);

    const queryParams = newLayout === FLOW_LAYOUT ? "view=flow" : "";
    const newUrl = `${redirectUrl}formflow/${formId}/edit`;

    dispatch(push({
      pathname: newUrl,
      search: queryParams && `?${queryParams}`
    }));
  };

const handleSaveLayout = () => {
  if (promptNewVersion) {
    handleVersioning();
    return;
  }
  saveFormData({ showToast: false });
};

  const handleCloseSelectedAction = () => {
    setSelectedAction(null);
    if (selectedAction === ACTION_OPERATIONS.IMPORT) {
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
    if (selectedAction === ACTION_OPERATIONS.DUPLICATE) {
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
    //for the migration, if the diagram is not available in the db, it will fetch from camunda using maper id.
    const mapperId = processListData.id;
    const response = await getProcessDetails({processKey:processListData.processKey, mapperId});
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
      return { roles: convertMultiSelectOptionToValue(authorizationData.selectedRoles, "role"), userName: "" };
    }
    return { roles: [], userName: preferred_username };
  };

  const handleConfirmSettings = async ({
    formDetails,
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
            ? convertMultiSelectOptionToValue(rolesState.FORM.selectedRoles, "role")
            : [],
      },
    };
    const updatepath = MULTITENANCY_ENABLED
      ? addTenantkey(formDetails.path, tenantKey)
      : formDetails.path;

    // update the form Access and submission access if anonymouse changed
    const formAccess = addAndRemoveAnonymouseId(_cloneDeep(formAccessRoles), "read_all", formDetails.anonymous);
    const submissionAccess = addAndRemoveAnonymouseId(_cloneDeep(submissionAccessRoles), "create_own", formDetails.anonymous);
    const formData = {
      title: formDetails.title,
      display: formDetails.display,
      path: updatepath,
      submissionAccess: submissionAccess,
      access: formAccess,
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

  const handleUnpublishAndSaveChanges = () => {
    if  (isPublished && (formChangeState.changed || workflowIsChanged)) {
      setModalType("unpublishBeforeSaving");
      setShowConfirmModal(true);
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
        setFormChangeState(prev => ({ ...prev, changed: false }));
        return;
      }
      setShowConfirmModal(false);
      setFormSubmitted(true);
      const newFormData = manipulatingFormData(
        form,
        MULTITENANCY_ENABLED,
        tenantKey,
        formAccessRoles,
        submissionAccessRoles
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
    setFormChangeState(prev => ({ ...prev, changed: false }));
    setShowConfirmModal(false);
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
      formAccessRoles,
      submissionAccessRoles
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

    //Process details for duplicate .
    if (selectedAction == ACTION_OPERATIONS.DUPLICATE) {
      newFormData.processData = processData?.processData;
      newFormData.processType = processData?.processType;
    }

    formCreate(newFormData)
      .then((res) => {
        const form = res.data;
        dispatch(setFormSuccessData("form", form));
        dispatch(push(`${redirectUrl}formflow/${form._id}/edit`));
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

  const captureFormChanges = () => {
    setFormChangeState((prev) => {
      let key = null;
      if (!prev.initial) {
        key = "initial";
      } else if (!prev.changed) {
        key = "changed";
      }
      return key ? { ...prev, [key]: true } : prev;
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
      // setIsPublishLoading(true);
      if (!isPublished) {

        await flowRef.current.saveFlow({processId: processData.id,showToast: false});
        await saveFormData({ showToast: false });
      }
      await actionFunction(processListData.id);
      if (isPublished) {
        await fetchProcessDetails(processListData);
        dispatch(getFormProcesses(formId));
      }
      setPromptNewVersion(isPublished);
      setIsPublished(!isPublished);
    } catch (err) {
      const error = err.response?.data || err.message;
      dispatch(setFormFailureErrorData("form", error));
    } finally {
      // setIsPublishLoading(false);
    }
  };

  const handleConfirmUnpublishAndSave = async () => {
    try {
      closeModal();
      setLoadingVersioning(true);
      await unPublish(processListData.id); // Unpublish the process
      // Fetch mapper data
      dispatch(
        getFormProcesses(formId, async (error, data) => {
          if(error){ //handling error
            console.log(error);
            setLoadingVersioning(false);
            return;
          }
          /* ----------------------------- saving the data ---------------------------- */
          const response = await getProcessDetails({
            processKey: processListData.processKey,
          });
          dispatch(setProcessData(response.data));
          if (!isFormLayout) {
            if(response)
            await flowRef.current.saveFlow({processId: response.data.id,showToast: false});
            setLoadingVersioning(false); //setloading false after all function complete
          } else {
            setLoadingVersioning(false); //no longer keep loading
            handleVersioning(data.majorVersion, data.minorVersion); // Handle versioning
          }
          /* ----------------------------------- ... ---------------------------------- */
          setIsPublished(!isPublished); // Toggle publish state
          setPromptNewVersion(isPublished); // Prompt for new version
        })
      );
    } catch (error) {
      setLoadingVersioning(false);
      console.error("Error during confirmation:", error);
    }
  };

  const handleVersioning = (majorVersion, minorVersion) => {
    setVersion((prevVersion) => ({
      ...prevVersion,
      major: (majorVersion || processListData.majorVersion) + 1 + ".0", // Increment the major version
      minor: (majorVersion || processListData.majorVersion) + "." + ((minorVersion || processListData.minorVersion) + 1), // Reset the minor version to 0
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
        formAccessRoles,
        submissionAccessRoles
      );
      //TBD: need to only update path and name so no need to send whole data
      const oldFormData = manipulatingFormData(
        formData,
        MULTITENANCY_ENABLED,
        tenantKey,
        formAccessRoles,
        submissionAccessRoles
      );
   
      const newPathAndName = generateUniqueId("-v");
      oldFormData.path += newPathAndName;
      oldFormData.name += newPathAndName;
      await formUpdate(oldFormData._id, oldFormData);

      newFormData.componentChanged = true;
      newFormData.newVersion = true;
      newFormData.parentFormId = processListData.parentFormId;
      newFormData.title = processListData.formName;

      delete newFormData.machineName;
      delete newFormData._id;

      const res = await formCreate(newFormData);
      const response = res.data;
      dispatch(setFormSuccessData("form", response));
      dispatch(push(`${redirectUrl}formflow/${response._id}/edit`));
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


  const openConfirmModal = (type) => {
    setModalType(type);
    setShowConfirmModal(true);
  };
  const closeModal = () => {
    setModalType("");
    setShowConfirmModal(false);
  };

  const handleShowVersionModal = () => {
    setNewVersionModal(true);
    setShowConfirmModal(false);
  };

  const getModalContent = () => {
    switch (modalType) {
      case "save":
        return {
          title: t("Save Your Changes"),
          message:
            t("Saving as an incremental version will affect previous submissions. Saving as a new full version will not affect previous submissions."),
          primaryBtnAction: saveFormData,
          secondayBtnAction: handleShowVersionModal,
          primaryBtnText: `${t("Save as Version")} ${version.minor}`,
          secondaryBtnText: `${t("Save as Version")} ${version.major}`,
        };
      case "publish":
        return {
          title: t("Confirm Publish"),
          message: t("Publishing will save any unsaved changes and lock the entire form, including the layout and the flow. To perform any additional changes you will need to unpublish the form again."),
          primaryBtnAction: confirmPublishOrUnPublish,
          secondayBtnAction: closeModal,
          primaryBtnText: t("Publish This Form"),
          secondaryBtnText: t("Cancel"),
        };
      case "unpublish":
        return {
          title: t("Confirm Unpublish"),
          message: t( "This form is currently live. To save changes to form edits, you need to unpublish it first. By Unpublishing this form, you will make it unavailable for new submissions to those who currently have access to it. You can republish the form after making your edits."),
          primaryBtnAction: confirmPublishOrUnPublish,
          secondayBtnAction: closeModal,
          primaryBtnText: t("Unpublish and Edit This Form"),
          secondaryBtnText: t("Cancel, Keep This Form Unpublished"),
        };
      case "discard":
        return {
          title: t("Discard Layout Changes?"),
          message:
            t("Are you sure you want to discard all the changes to the layout of the form?"),
          messageSecondary: t("This action cannot be undone."),
          primaryBtnAction: discardChanges,
          secondayBtnAction: closeModal,
          primaryBtnText: t("Yes, Discard Changes"),
          secondaryBtnText: t("No, Keep My Changes"),
        };
      case "unpublishBeforeSaving":
        return {
          title: "Unpublish Before Saving",
          message:
          (
            <CustomInfo
              heading="Note"
              content="This form is currently live. To save the changes to your form, you need to unpublish it first.    By unpublishing this form, you will make it unavailable for new submissions. You can republish this form after making your edits."
            />
          ),
          primaryBtnAction: handleConfirmUnpublishAndSave,
          secondayBtnAction: closeModal,
          primaryBtnText: isFlowLayout ? "Unpublish and Save Flow" : "Unpublish and Save Layout",
          secondaryBtnText: "Cancel, Keep This Form Published",
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
        // setIsPublishLoading(false);
      }
    }
  };

  const handleCloseActionModal = () => {
    setSelectedAction(null); // Reset action
  };

  // deleting form hardly from formio and mark inactive in mapper table
  const deleteModal = () => {
    if (!applicationCount) {
      setIsDeletionLoading(true);
      dispatch(deleteForm("form", formId,() => {
        // Callback after form deletion;
        dispatch(push(`${redirectUrl}formflow`));
      }));
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
      show: selectedAction === ACTION_OPERATIONS.DELETE,
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
          secondaryBtnDisable={isDeletionLoading}
          secondaryBtnLoading={isDeletionLoading}
        />
      );
    }
  };

  const handlePublishClick = () => {
    if (!processListData.isMigrated) {
      if (!isPublished) {
        setMigration(true);
      } else {
        openConfirmModal("unpublish");
      }
    } else {
      openConfirmModal(isPublished ? "unpublish" : "publish");
    }
  };

  return (
    <div>
      <div>
        <NavigateBlocker isBlock={(formChangeState.changed || workflowIsChanged) && (!isMigrationLoading && !isDeletionLoading)} message={t("You have made changes that are not saved yet. The unsaved changes could be either on the Layout or the Flow side.")} />
        <LoadingOverlay active={formSubmitted || loadingVersioning} spinner text={t("Loading...")}>
          <SettingsModal
            show={showSettingsModal}
            isSaving={isSettingsSaving}
            handleClose={handleToggleSettingsModal}
            handleConfirm={handleConfirmSettings}
          />

          <Errors errors={errors} />

          <div className="nav-bar">
            
              <div className="icon-back" onClick={backToForm}>
                <BackToPrevIcon/>
              </div>

              <div className="description">
                <p className="text-main">
                  {textTruncate(300,300,formData.title)}
                </p>

                <p className="status" data-testid={`form-status-${form._id}`}>
                  <span className={`status-${isPublished ? "live" : "draft"}`}></span>

                  {isPublished ? t("Live") : t("Draft")}
                </p>
              </div>

              {createDesigns && (
                <div className="buttons">
                  <button
                    className="button-dark"
                    onClick={editorActions}
                    aria-label={(t) => t("Designer Actions Button")}
                    data-testid="designer-action-testid"
                    >
                      {t("Actions")}
                  </button>

                  <button
                    className="button-dark"
                    onClick={handleToggleSettingsModal}
                    aria-label={t("Designer Settings Button")}
                    data-testid="editor-settings-testid"
                    >
                      {t("Settings")}
                  </button>

                  <button
                    className="button-dark-primary "
                    onClick={handlePublishClick}
                    aria-label={`${t(publishText)} ${t("Button")}`}
                    data-testid="handle-publish-testid"
                    >
                      {t(publishText)}
                  </button>


                  {/* <CustomButton
                    variant=""
                    size=""
                    className="button-dark"
                    label={t("Settings")}
                    onClick={handleToggleSettingsModal}
                    dataTestId="editor-settings-testid"
                    ariaLabel={t("Designer Settings Button")}
                  /> */}

                  {/* <CustomButton
                    variant=""
                    size=""
                    className="button-dark"
                    label={t("Actions")}
                    onClick={editorActions}
                    dataTestId="designer-action-testid"
                    ariaLabel={(t) => t("Designer Actions Button")}
                  /> */}
                  {/* <CustomButton
                    variant=""
                    size=""
                    className="button-dark-primary"
                    label={t(publishText)}
                    buttonLoading={isPublishLoading}
                    onClick={handlePublishClick}
                    dataTestId="handle-publish-testid"
                    ariaLabel={`${t(publishText)} ${t("Button")}`}
                  /> */}
                </div>
              )}
            
          </div>

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
                      <div className="mx-2 builder-header-text">{t("Layout")}</div>
                      {createDesigns && (
                        <div>
                          <CustomButton
                            variant="secondary"
                            size="md"
                            icon={<HistoryIcon />}
                            label={t("History")}
                            onClick={() => handleFormHistory()}
                            dataTestId="handle-form-history-testid"
                            ariaLabel={t("Form History Button")}
                          />
                          <CustomButton
                            variant="secondary"
                            size="md"
                            className="mx-2"
                            icon={<PreviewIcon />}
                            label={t("Preview")}
                            onClick={handlePreview}
                            dataTestId="handle-preview-testid"
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
                          disabled={!formChangeState.changed}
                          label={t("Save Layout")}
                          onClick={
                            isPublished ? handleUnpublishAndSaveChanges :  handleSaveLayout

                          }
                          dataTestId="save-form-layout"
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
                          dataTestId="discard-button-testid"
                          ariaLabel={t("cancelBtnariaLabel")}
                        />
                      </div>
                    )}
                  </div>
                </Card.Header>
                <div className="form-edit">
                <Card.Body>
                  <div className="form-builder custom-scroll">
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
                          alwaysConfirmComponentRemoval: true,
                          i18n: RESOURCE_BUNDLES_DATA,
                        }}
                        onDeleteComponent={captureFormChanges}
                      />
                    )}
                  </div>
                </Card.Body>
                </div>
              </Card>
            </div>
            <div
              className={`wraper flow-wraper ${isFlowLayout ? "visible" : ""}`}
            >
              {/* TBD: Add a loader instead. */}
              {isProcessDetailsLoading ? <>loading...</> : <FlowEdit
                ref={flowRef}
                setWorkflowIsChanged={setWorkflowIsChanged}
                workflowIsChanged={workflowIsChanged}
                CategoryType={CategoryType}
                isPublished={isPublished}
                migration={migration}
                redirectUrl={redirectUrl}
                setMigration={setMigration}
                isMigrated = {processListData.isMigrated}
                mapperId={processListData.id}
                layoutNotsaved={formChangeState.changed}
                handleCurrentLayout={handleCurrentLayout}
                isMigrationLoading={isMigrationLoading}
                setIsMigrationLoading={setIsMigrationLoading}
                handleUnpublishAndSaveChanges={handleUnpublishAndSaveChanges}
              />}
            </div>
            <button
              className={`border-0 form-flow-wraper-${ isFormLayout ? "right" : "left"
              } ${sideTabRef.current && "visible"}`}
              onClick={handleCurrentLayout}
              data-testid="form-flow-wraper-button"
            >
              {isFormLayout ? t("Flow") : t("Layout")}
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
        isMigrated = {processListData.isMigrated}
      />
      <FormBuilderModal
        modalHeader={t("Duplicate")}
        nameLabel={t("New Form Name")}
        descriptionLabel={t("New Form Description")}
        showBuildForm={selectedAction === ACTION_OPERATIONS.DUPLICATE}
        isSaveBtnLoading={formSubmitted}
        isFormNameValidating={validationLoading}
        onClose={handleCloseSelectedAction}
        primaryBtnLabel={t("Save and Edit form")}
        primaryBtnAction={handlePublishAsNewVersion}
        setNameError={setNameError}
        nameValidationOnBlur={validateFormNameOnBlur}
        nameError={nameError}
      />

      {selectedAction === ACTION_OPERATIONS.IMPORT && <ImportModal
        importLoader={importLoader}
        importError={importError}
        showModal={selectedAction === ACTION_OPERATIONS.IMPORT}
        uploadActionType={UploadActionType}
        formName={formTitle}
        onClose={handleCloseSelectedAction}
        handleImport={handleImport}
        fileItems={fileItems}
        headerText={t("Import File")}
        primaryButtonText={primaryButtonText}
        fileType=".json, .bpmn"
      />}

      <ExportModal
        showExportModal={selectedAction === ACTION_OPERATIONS.EXPORT}
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
        loadMoreBtndataTestId="load-more-form-history"
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
