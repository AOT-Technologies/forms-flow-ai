import React, { useReducer, useState, useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useParams, useLocation } from "react-router-dom";
// import { Card } from "react-bootstrap";
import {
  Errors,
  FormBuilder,
  deleteForm,
  Form,
} from "@aot-technologies/formio-react";
import {
  V8CustomButton,
  FormBuilderModal,
  HistoryPage,
  ImportModal,
  CustomInfo,
  PromptModal,
  FormStatusIcon,
  BreadCrumbs,
  VariableSelection,
  Switch,
  CustomTextInput,
  FileUploadPanel,
  NoteIcon
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
import { addHiddenApplicationComponent } from "../../../constants/applicationComponent";
import {
  formUpdate,
  validateFormName,
  formCreate,
  formImport,
  publish,
  unPublish,
  getFormHistory,
  createFormWithWorkflow,
} from "../../../apiManager/services/FormServices";
import FileService from "../../../services/FileService";
import {
  setFormFailureErrorData,
  setFormSuccessData,
  setRestoreFormData,
  setRestoreFormId,
  setFormDeleteStatus,
  setFormHistories,
  setFormAuthorizationDetails,
} from "../../../actions/formActions";
import {
  saveFormProcessMapperPut,
  getProcessDetails,
  unPublishForm,
  getFormProcesses,
  getProcessHistory,
  fetchRevertingProcessData
} from "../../../apiManager/services/processServices";
import _ from "lodash";
import SettingsTab from "./SettingsTab.js";
import FlowEdit from "./FlowEdit.js";
import ExportModal from "../../../components/Modals/ExportModal.js";
import NewVersionModal from "../../../components/Modals/NewVersionModal";
import { currentFormReducer } from "../../../modules/formReducer.js";
import { toast } from "react-toastify";
import userRoles from "../../../constants/permissions.js";
import {
  generateUniqueId,
  convertMultiSelectOptionToValue,
  removeTenantKeywithSlash,
  convertSelectedValueToMultiSelectOption
} from "../../../helper/helper.js";
import { useMutation } from "react-query";
import NavigateBlocker from "../../../components/CustomComponents/NavigateBlocker";
import { setProcessData, setFormPreviosData, setFormProcessesData } from "../../../actions/processActions.js";
import { convertToNormalForm, convertToWizardForm } from "../../../helper/convertFormDisplay.js";
import { SystemVariables } from '../../../constants/variables';
import EditorActions from "./EditActions";

// constant values
const ACTION_OPERATIONS = {
  DUPLICATE : "DUPLICATE",
  IMPORT : "IMPORT",
  EXPORT : "EXPORT",
  DELETE : "DELETE"
};
const FORM_LAYOUT = "FORM_LAYOUT";
const FLOW_LAYOUT = "FLOW_LAYOUT";

// Tab configuration
const tabConfig = {
  primary: {
    form: {
      label: "Form",
      query: "?tab=form",
      secondary: {
        settings: {
          label: "Settings",
          query: "?tab=form&sub=settings"
        },
        history: {
          label: "History",
          query: "?tab=form&sub=history"
        },
        preview: {
          label: "Preview",
          query: "?tab=form&sub=preview"
        },
      }
    },
    bpmn: {
      label: "BPMN",
      query: "?tab=bpmn",
      secondary: {
        editor: {
          label: "Layout",
          query: "?tab=bpmn&sub=layout"
        },
        history: {
          label: "History",
          query: "?tab=bpmn&sub=history"
        },
        variables: {
          label: "Variables",
          query: "?tab=bpmn&sub=variables",
          tertiary: {
            system: {
              label: "System",
              query: "?tab=bpmn&sub=variables&subsub=system"
            },
            form: {
              label: "Form",
              query: "?tab=bpmn&sub=variables&subsub=form"
            }
          }
        }
      }
    },
    actions: {
      label: "Actions",
      query: "?tab=actions"
    }
  }
};

const EditComponent = () => {
  const dispatch = useDispatch();
  const { formId } = useParams();
  const location = useLocation();
  const { t } = useTranslation();
  //this variable handle the flow and layot tab switching
  const sideTabRef = useRef(null);
   // Check if we're on the create route - defined once for reuse
   const isCreateRoute = location.pathname.includes('/create');
  // Tab state management
  const [activeTab, setActiveTab] = useState({
    primary: 'form',
    secondary: null,
    tertiary: null
  });

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
  const [formHistoryLoading, setFormHistoryLoading] = useState(false);
  const { path, display } = useSelector((state) => state.form.form);

  const { authorizationDetails: formAuthorization } = useSelector(
    (state) => state.process
  );
  /* ---------------------------  form data --------------------------- */
  const { form: formData, error: errors } = useSelector((state) => state.form);

  /* ----------------- current form data when user is editing ----------------- */
  // Initialize form state properly for new forms
  const getInitialFormState = () => {
    // For new forms (create route), initialize with hidden application components
    if (!formId || formData?.isNewForm) {
      const initialForm = {
        title: "",
        name: "",
        path: "",
        type: "form",
        display: "form",
        components: [],
        isNewForm: true,
        anonymous: false,
      };
      // Add hidden application components to the initial form
      return addHiddenApplicationComponent(initialForm);
    }
    // For existing forms, use the formData from Redux store
    return _cloneDeep(formData);
  };

  const [form, dispatchFormAction] = useReducer(
    currentFormReducer,
    getInitialFormState()
  );

  // Update form state when Redux store formData changes (especially for new forms)
  useEffect(() => {
    if (formData && (!formId || formData?.isNewForm)) {
      // For new forms, ensure we have the latest formData from Redux store
      if (formData.isNewForm && formData.components?.length === 0) {
        dispatchFormAction({ type: "replaceForm", value: _cloneDeep(formData) });
      }
    } else if (formData && formId && !formData.isNewForm) {
      // For existing forms, update if the formData has changed
      if (formData._id !== form._id) {
        dispatchFormAction({ type: "replaceForm", value: _cloneDeep(formData) });
        // Reset form change state when loading a different form to prevent false unsaved changes
        setFormChangeState({ initial: false, changed: false });
      }
    }
  }, [formData, formId, form._id]);

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
  const { createDesigns,viewDesigns } = userRoles();
  const [formChangeState, setFormChangeState] = useState({ initial: false, changed: false });
  const [workflowIsChanged, setWorkflowIsChanged] = useState(false);
  const [migration, setMigration] = useState(false);
  const [loadingVersioning, setLoadingVersioning] = useState(false); // Loader state for versioning
  const [isNavigatingAfterSave, setIsNavigatingAfterSave] = useState(false); // Flag to prevent blocker during save navigation
  const setSelectedOption = (option, roles = []) =>
    roles.length ? "specifiedRoles" : option;
  const multiSelectOptionKey = "role";
  // Initialize roles state with proper defaults for new forms
  const getInitialRolesState = () => {
    // For new forms (no formId), use default values
    if (isCreateRoute) {
      return {
        DESIGN: {
          selectedRoles: [],
          selectedOption: "onlyYou",
        },
        FORM: {
          roleInput: "",
          selectedRoles: [],
          selectedOption: "registeredUsers",
        },
        APPLICATION: {
          roleInput: "",
          selectedRoles: [],
          selectedOption: "submitter",
        }
      };
    }

    // For existing forms, use authorization data
    return {
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
    };
  };

  const [rolesState, setRolesState] = useState(getInitialRolesState());

  // Initialize form details with proper defaults for new forms
  const getInitialFormDetails = () => {
    // For new forms (no formId), use default values
    if (isCreateRoute) {
      return {
        title: "",
        path: "",
        description: "",
        display: "form",
      };
    }

    // For existing forms, use process list data
    return {
      title: processListData.formName,
      path: path,
      description: processListData.description,
      display: display,
    };
  };

  const [formDetails, setFormDetails] = useState(getInitialFormDetails());

  // Initialize anonymous state with proper defaults for new forms
  const getInitialAnonymousState = () => {
    // For new forms (no formId), use default value
    if (isCreateRoute) {
      return false;
    }

    // For existing forms, use process list data
    return processListData.anonymous || false;
  };

  const [isAnonymous, setIsAnonymous] = useState(getInitialAnonymousState());

  // Update roles state when formAuthorization changes (for existing forms)
  useEffect(() => {
    if (!isCreateRoute && formAuthorization) {
      setRolesState({
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
        }
      });
    }
  }, [formAuthorization, isCreateRoute]);

  // Update form details when processListData changes (for existing forms)
  useEffect(() => {
    if (!isCreateRoute && processListData) {
      setFormDetails({
        title: processListData.formName,
        path: path,
        description: processListData.description,
        display: display,
      });
      setIsAnonymous(processListData.anonymous || false);
    }
  }, [processListData, path, display, isCreateRoute]);


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
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 10 });
  
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
      setActiveTab({
        primary: 'form', 
        secondary: null,   
        tertiary: null  
      });
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
    restoredFormId,
  } = useSelector((state) => state.formRestore);

  /* ------------------------- BPMN history variables ------------------------- */
  const [showBpmnHistoryModal, setShowBpmnHistoryModal] = useState(false);
  const [bpmnHistoryData, setBpmnHistoryData] = useState({ processHistory: [], totalCount: 0 });

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
  const  publishText = isPublished ? "Unpublish" : "Publish";
  const [formSubmitted, setFormSubmitted] = useState(false);

  const applicationCount = useSelector(
    (state) => state.process?.applicationCount
  );

  const formHistory = formHistoryData.formHistory || [];
  // const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [modalType, setModalType] = useState("");

  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const handleToggleSettingsModal = () =>
    setShowSettingsModal(!showSettingsModal);
  const [selectedAction, setSelectedAction] = useState(null);
  const [newActionModal, setNewActionModal] = useState(false);
  const [currentBpmnXml, setCurrentBpmnXml] = useState(null);
  // const [isSettingsSaving, setIsSettingsSaving] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);
  const onCloseActionModal = () => setNewActionModal(false);
  const processData = useSelector((state) => state.process?.processData);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const CategoryType = {
    FORM: "FORM",
    WORKFLOW: "WORKFLOW",
  };



  // Reset navigation flag when route changes (after successful navigation)
  useEffect(() => {
    if (!isCreateRoute && isNavigatingAfterSave) {
      setIsNavigatingAfterSave(false);
    }
  }, [isCreateRoute, isNavigatingAfterSave]);

  // Parse URL parameters for tab state
useEffect(() => {
  const queryParams = new URLSearchParams(location.search);
  const tab = queryParams.get("tab") || "form";
  const sub = queryParams.get("sub");
  let subsub = queryParams.get("subsub");

  if (tab === 'bpmn' && sub === 'variables' && subsub === null) {
    subsub = 'system';
  }

  setActiveTab({
    primary: tab,
    secondary: sub,
    tertiary: subsub
  });

  // Legacy support for view parameter
  const view = queryParams.get("view");
  if (view === "flow") {
    setCurrentLayout(FLOW_LAYOUT);
    sideTabRef.current = true;
  } else {
    setCurrentLayout(FORM_LAYOUT);
  }
}, [location.search, location.pathname, isCreateRoute]);

  useEffect(() => {
    if (activeTab.primary === "form" && activeTab.secondary === "history") {
      handleFormHistory();
    }
  }, [activeTab.primary, activeTab.secondary, processListData?.parentFormId,
      paginationModel.pageSize]);

  // Tab navigation functions
  const handleTabClick = async (primary, secondary = null, tertiary = null) => {
    // Allow BPMN tab on create route
    if (primary === 'bpmn' && secondary === 'variables' && tertiary === null) {
      tertiary = 'system';
    }
  
    // CAPTURE CURRENT BPMN XML BEFORE SWITCHING AWAY FROM BPMN TAB
    if (activeTab.primary === 'bpmn' && primary !== 'bpmn') {
      try {
        const bpmnModeler = flowRef.current?.getBpmnModeler();
        if (bpmnModeler) {
          const { xml } = await bpmnModeler.saveXML({ format: true });
          setCurrentBpmnXml(xml); // Store in local state
        }
      } catch (error) {
        console.error('Error capturing BPMN XML:', error);
      }
    }
  
    const newTab = { primary, secondary, tertiary };
    console.log("newTab", newTab);
    setActiveTab(newTab);
  
    // Update URL with new tab parameters
    const queryParams = new URLSearchParams();
    queryParams.set("tab", primary);
    if (secondary) queryParams.set("sub", secondary);
    if (tertiary) queryParams.set("subsub", tertiary);
  
    if (isCreateRoute || !formId) {
      // On create route (no formId yet), preserve current pathname and only change search
      dispatch(
        push({
          pathname: location.pathname,
          search: `?${queryParams.toString()}`,
        })
      );
    } else {
      const newUrl = `${redirectUrl}formflow/${formId}/edit?${queryParams.toString()}`;
      console.log("newUrl", newUrl);
      dispatch(push(newUrl));
    }
  };
  

  const handleCurrentLayout = (e) => {
    //wehn the current is assigned with element then only the visible class will render
    sideTabRef.current = e;
    const newLayout = isFormLayout ? FLOW_LAYOUT : FORM_LAYOUT;
    setCurrentLayout(newLayout);

    const queryParams = newLayout === FLOW_LAYOUT ? "view=flow" : "";
    if (isCreateRoute || !formId) {
      // Keep current path on create route
      dispatch(
        push({
          pathname: location.pathname,
          search: queryParams ? `?${queryParams}` : "",
        })
      );
    } else {
      const newUrl = `${redirectUrl}formflow/${formId}/edit`;
      dispatch(
        push({
          pathname: newUrl,
          search: queryParams && `?${queryParams}`,
        })
      );
    }
  };

const handleSaveLayout = () => {
  if (isCreateRoute) {
    // For create route, use the new combined API
    saveFormWithWorkflow();
    return;
  }
  if (promptNewVersion) {
    handleVersioning();
    return;
  }
  saveFormData({ showToast: false });
};

  const handleCloseSelectedAction = () => {
    setSelectedAction(null);
    setPendingAction(null); // Clear pending action when closing modals
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
   if(!isCreateRoute){
    const mapperId = processListData.id;
    const response = await getProcessDetails({processKey:processListData.processKey, mapperId});
    dispatch(setProcessData(response.data));
   }
  };

  useEffect(async () => {
    if (processListData.processKey && !isCreateRoute) {
      setIsProcessDetailsLoading(true);
      await fetchProcessDetails(processListData);
      setIsProcessDetailsLoading(false);
    }
  }, [processListData.processKey, isCreateRoute]);

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
    // setIsSettingsSaving(true);
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

    // update the form Access and submission access if anonymouse changed
    const formAccess = addAndRemoveAnonymouseId(_cloneDeep(formAccessRoles), "read_all", formDetails.anonymous);
    const submissionAccess = addAndRemoveAnonymouseId(_cloneDeep(submissionAccessRoles), "create_own", formDetails.anonymous);
    const newFormData = {
      title: formDetails.title,
      display: formDetails.display,
      path: formDetails.path,
      submissionAccess: submissionAccess,
      access: formAccess,
    };

    if(formDetails.display !== form.display){
      newFormData["components"] = formDetails.display == "form" ?
      convertToNormalForm(formData.components) : convertToWizardForm(formData.components);
    }


    try {
      await dispatch(saveFormProcessMapperPut({ mapper, authorizations }));
      const updateFormResponse = await formUpdate(form._id, newFormData);
      dispatchFormAction({
        type: "formChange",
        value: { ...updateFormResponse.data, components: form.components },
      });
      dispatch(setFormSuccessData("form", updateFormResponse.data));
    } catch (error) {
      console.error(error);
    } finally {
      // setIsSettingsSaving(false);
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
      const isFormChanged = true; // Hard code the value to always make backend call on Save Layout
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

  /* ------------------------ Save form with workflow for create route ------------------------ */
const saveFormWithWorkflow = async () => {
  try {
    setFormSubmitted(true);

    // Prepare form data
    const formData = manipulatingFormData(
      form,
      MULTITENANCY_ENABLED,
      tenantKey,
      formAccessRoles,
      submissionAccessRoles
    );
    // Add required fields from settings
    formData.title = formDetails.title;
    formData.name = formDetails.path;
    formData.path = formDetails.path;
    formData.description = formDetails.description || "";
    formData.display = formDetails.display;
    formData.componentChanged = true;
    formData.newVersion = true;
    formData.anonymous = isAnonymous;
    
    // Update form access and submission access based on isAnonymous
    if (isAnonymous) {
      formData.access = addAndRemoveAnonymouseId(_cloneDeep(formAccessRoles), "read_all", true);
      formData.submissionAccess = addAndRemoveAnonymouseId(_cloneDeep(submissionAccessRoles), "create_own", true);
    } else {
      // Keep the default access roles from manipulatingFormData
      formData.access = formAccessRoles;
      formData.submissionAccess = submissionAccessRoles;
    }

    // Get workflow data from FlowEdit component only if user has interacted with BPMN
    let processData = null;
    let processType = null;
    let includeWorkflow = false;

    // Check if user has visited/modified the BPMN tab
    const bpmnModeler = flowRef.current?.getBpmnModeler();
    if (bpmnModeler || currentBpmnXml || workflowIsChanged) {
      // User has interacted with workflow, so include it
      includeWorkflow = true;
      processType = "BPMN";

      // Extract BPMN XML from the modeler
      if (bpmnModeler) {
        try {
          const { createXMLFromModeler } = await import("../../../helper/processHelper.js");
          processData = await createXMLFromModeler(bpmnModeler);
          
          if (!processData) {
            // If no processData extracted, throw error
            throw new Error("Failed to extract workflow data from modeler");
          }
        } catch (xmlError) {
          console.error("Error extracting workflow XML:", xmlError);
          toast.error(t("Failed to extract workflow data. Please check your workflow design."));
          setFormSubmitted(false);
          return; // Stop the save process
        }
      } else if (currentBpmnXml) {
        // Use cached BPMN XML if modeler isn't currently mounted
        processData = currentBpmnXml;
      }
    }

    // Prepare authorizations
    const filterAuthorizationData = (authorizationData) => {
      if(authorizationData.selectedOption === "submitter"){
        return {roles: [], userName: null, resourceDetails:{submitter:true}};
      }
      if (authorizationData.selectedOption === "specifiedRoles") {
        return { roles: convertMultiSelectOptionToValue(authorizationData.selectedRoles, "role"), userName: "" };
      }
      return { roles: [], userName: preferred_username };
    };

    const authorizations = {
      application: {
        resourceId: null,
        resourceDetails:{submitter:false},
        ...filterAuthorizationData(rolesState.APPLICATION),
      },
      designer: {
        resourceId: null,
        resourceDetails: {},
        ...filterAuthorizationData(rolesState.DESIGN),
      },
      form: {
        resourceId: null,
        resourceDetails: {},
        roles:
          rolesState.FORM.selectedOption === "specifiedRoles"
            ? convertMultiSelectOptionToValue(rolesState.FORM.selectedRoles, "role")
            : [],
      },
    };

    // Prepare the payload - only include workflow data if user has interacted with BPMN
    const payload = {
      formData,
      authorizations
    };

    // Only include processData and processType if workflow was created/modified
    if (includeWorkflow) {
      payload.processData = processData;
      payload.processType = processType;
    }
          
    // Call the new combined API
    const response = await createFormWithWorkflow(payload);
    const { data } = response;

    // Update Redux store with response data
    if (data.formData) {
      dispatch(setFormSuccessData("form", data.formData));
    }
    if (data.mapper) {
      dispatch(setFormPreviosData(data.mapper));
      dispatch(setFormProcessesData(data.mapper));
    }
    if (data.process) {
      dispatch(setProcessData(data.process));
    }
    if (data.authorizations) {
      dispatch(setFormAuthorizationDetails(data.authorizations));
    }

    // Reset form change state and workflow change state
    setFormChangeState({ initial: false, changed: false });
    setWorkflowIsChanged(false);
    setIsNavigatingAfterSave(true);

    // Navigate to edit page with the new form ID
    const formId = data.formData._id;
    toast.success(t("Form and workflow created successfully"));
    dispatch(push(`${redirectUrl}formflow/${formId}/edit`));
  } catch (err) {
    const error = err.response?.data || err.message;
    toast.error(error?.message || t("Failed to create form and workflow"));
    dispatch(setFormFailureErrorData("form", error));
  } finally {
    setFormSubmitted(false);
  }
};

  // const backToForm = () => {
  //   dispatch(push(`${redirectUrl}formflow`));
  // };
  // const closeHistoryModal = () => {
  //   setShowHistoryModal(false);
  // };
  const fetchFormHistory = (parentFormId, page, limit) => {
    setFormHistoryLoading(true);
    parentFormId = parentFormId && typeof parentFormId === 'string' ? parentFormId : processListData?.parentFormId;
    page = page ? page : paginationModel.page + 1;
    limit = limit ? limit : paginationModel.pageSize;
    getFormHistory(parentFormId,page, limit)
      .then((res) => {
        dispatch(setFormHistories(res.data));
        setFormHistoryLoading(false);
      })
      .catch(() => {
        setFormHistories([]);
      });
  };

  const handleFormHistory = () => {
    console.log("handleFormHistory", processListData);
    // setShowHistoryModal(true);
    dispatch(setFormHistories({ formHistory: [], totalCount: 0 }));
    if (processListData?.parentFormId) {
      fetchFormHistory(processListData?.parentFormId, 1, paginationModel.pageSize);
    }
  };

  // const loadMoreBtnAction = () => {
  //   fetchFormHistory(processListData?.parentFormId);
  // };

  /* ------------------------- BPMN history handlers ------------------------- */
  const handleBpmnHistory = () => {
    setShowBpmnHistoryModal(true);
    setBpmnHistoryData({ processHistory: [], totalCount: 0 });
    if (processData?.parentProcessKey) {
      fetchBpmnHistory(processData.parentProcessKey, 1, 4);
    }
  };

  const fetchBpmnHistory = async (parentProcessKey, page = 1, limit = 4) => {
    try {
      const response = await getProcessHistory({ parentProcessKey, page, limit });
      setBpmnHistoryData(response.data);
    } catch (error) {
      console.error("Error fetching BPMN history:", error);
      setBpmnHistoryData({ processHistory: [], totalCount: 0 });
    }
  };

  const loadMoreBpmnHistory = () => {
    if (processData?.parentProcessKey) {
      fetchBpmnHistory(processData.parentProcessKey);
    }
  };

  const revertBpmnHistory = async (processId) => {
    try {
      const response = await fetchRevertingProcessData(processId);
      // Update the process data with reverted data
      dispatch(setProcessData(response.data));
      setWorkflowIsChanged(true);
      toast.success(t("Process reverted successfully"));
    } catch (error) {
      console.error("Error reverting BPMN history:", error);
      toast.error(t("Failed to revert process"));
    }
  };

  const closeBpmnHistoryModal = () => {
    setShowBpmnHistoryModal(false);
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
    if (isCreateRoute) {
      // On create route, reset to initial state with hidden components only
      const initialForm = {
        title: "",
        name: "",
        path: "",
        type: "form",
        display: formDetails.display || "form",
        components: [],
        isNewForm: true,
        anonymous: false,
      };
      const formWithHiddenComponents = addHiddenApplicationComponent(initialForm);
      dispatchFormAction({
        type: "replaceForm",
        value: formWithHiddenComponents,
      });
    } else {
      // On edit route, revert to original form data
      dispatchFormAction({
        type: "components",
        value: _cloneDeep(formData.components),
      });
    }
    setFormChangeState(prev => ({ ...prev, changed: false }));
    setShowConfirmModal(false);
  };

  const handleWorkflowDiscard = () => {
    // Handle workflow discard similar to FlowEdit.js handleDiscardConfirm
    if (flowRef.current) {
      // On create route, revert to default XML; on edit route, revert to original processData
      const xmlToRevert = isCreateRoute 
        ? flowRef.current?.getDefaultXml?.() 
        : processData?.processData;
      
      // Import the XML back to the BPMN editor
      flowRef.current?.handleImport(xmlToRevert);
      // Reset workflow change state
      setWorkflowIsChanged(false);
      
    }
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


  //these are the functions for conversion of roles for backend (payload)
  // and these will be used on form editcomponent when integrating save functinality

  // Extract role conversion to a separate function
  // const convertSelectedRole = (
  //   selectedRole,
  //   userRoles,
  //   multiSelectOptionKey
  // ) => {
  //   const originalRoleData = userRoles.find(
  //     (role) =>
  //       role[multiSelectOptionKey] === selectedRole[multiSelectOptionKey]
  //   );

  //   return {
  //     ...selectedRole,
  //     [multiSelectOptionKey]:
  //       originalRoleData?.originalRole || selectedRole[multiSelectOptionKey],
  //   };
  // };

  // Process section data separately
  // const convertSectionRoles = (
  //   sectionData,
  //   userRoles,
  //   multiSelectOptionKey
  // ) => {
  //   return {
  //     ...sectionData,
  //     selectedRoles:
  //       sectionData.selectedRoles?.map((selectedRole) =>
  //         convertSelectedRole(selectedRole, userRoles, multiSelectOptionKey)
  //       ) || [],
  //   };
  // };

  // Main conversion function
  // const convertRolesForBackend = (
  //   rolesState,
  //   userRoles,
  //   multiSelectOptionKey
  // ) => {
  //   const convertedState = {};

  //   Object.keys(rolesState).forEach((section) => {
  //     convertedState[section] = convertSectionRoles(
  //       rolesState[section],
  //       userRoles,
  //       multiSelectOptionKey
  //     );
  //   });

  //   return convertedState;
  // };

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
          secondaryBtnAction: handleShowVersionModal,
          primaryBtnText: `${t("Save as Version")} ${version.minor}`,
          secondaryBtnText: `${t("Save as Version")} ${version.major}`,
        };
      case "publish":
        return {
          title: t("Confirm Publish"),
          message: t("Publishing will save any unsaved changes and lock the entire form, including the layout and the flow. To perform any additional changes you will need to unpublish the form again."),
          primaryBtnAction: confirmPublishOrUnPublish,
          secondaryBtnAction: closeModal,
          primaryBtnText: t("Publish This Form"),
          secondaryBtnText: t("Cancel"),
        };
      case "unpublish":
        return {
          title: t("Unpublish"),
          message: (
            <CustomInfo
              className="note"
              heading={t("Note")}
              content={t(
                "By unpublishing this form & flow, you will make it unavailable for new submissions."
              )
              }
              dataTestId="unpublish-info"
            />
          ),
          primaryBtnAction: confirmPublishOrUnPublish,
          secondaryBtnAction: closeModal,
          primaryBtnText: t("Unpublish This Form & Flow"),
          secondaryBtnText: t("Cancel, Keep This Form & Flow Published"),
        };
       case "discard":
         return {
           title: t("Discard Changes?"),
           message:
             t("Discarding changes is permanent and cannot be undone.?"),
             secondaryBtnAction : () => {
             // Only discard changes from the currently active tab
             if (activeTab.primary === 'form' && formChangeState.changed) {
               discardChanges();
             }
             if (activeTab.primary === 'bpmn' && workflowIsChanged) {
               // Handle workflow discard similar to FlowEdit.js
               handleWorkflowDiscard();
             }
             closeModal();
           },
           primaryBtnAction: closeModal,
           secondaryBtnText: t("Discard Changes"),
           primaryBtnText: t("cancel"),
         };
      case "unpublishBeforeSaving":
        return {
          title: "Unpublish Before Saving",
          message:
          (
            <CustomInfo
              dataTestId="unpublish-before-saving"
              heading="Note"
              content="This form is currently live. To save the changes to your form, you need to unpublish it first.    By unpublishing this form, you will make it unavailable for new submissions. You can republish this form after making your edits."
            />
          ),
          primaryBtnAction: handleConfirmUnpublishAndSave,
          secondaryBtnAction: closeModal,
          primaryBtnText: isFlowLayout ? "Unpublish and Save Flow" : "Unpublish and Save Layout",
          secondaryBtnText: "Cancel, Keep This Form Published",
          };
      case "unsavedChangesBeforeAction":
        return {
          title: t("You Have Unsaved Changes"),
          message: (
            <CustomInfo
              heading={t("Note")}
              content={t("You have unsaved changes. To proceed with the {{action}} action, you must either save your changes or discard them.", { action: pendingAction?.toLowerCase() || "requested" })}
            />
          ),
          primaryBtnAction: () => {
            // Stay in editor and cancel the action
            setPendingAction(null);
            closeModal();
          },
          secondaryBtnAction: () => {
            // Discard changes and proceed with the action
            discardChanges();
            if (pendingAction) {
              setSelectedAction(pendingAction);
              setPendingAction(null);
            }
            closeModal();
          },
          primaryBtnText: t("Stay in the Editor"),
          secondaryBtnText: t("Discard Changes and Continue"),
        };
      default:
        return {};
    }
  };

  const modalContent = getModalContent();

  // loading up to set the data to the form variable
  if ((!form || (!form._id && !form.isNewForm)) || restoreFormDataLoading) {
    return (
      <div className="d-flex justify-content-center">
        <div className="spinner-grow" aria-live="polite">
          <span className="sr-only">{t("Loading...")}</span>
        </div>
      </div>
    );
  }

  const handleActionWithUnsavedCheck = (action) => {
    // Check if there are unsaved changes for specific actions that should not proceed
    if ((formChangeState.changed || workflowIsChanged) &&
        (action === ACTION_OPERATIONS.DUPLICATE || action === ACTION_OPERATIONS.IMPORT)) {
      setPendingAction(action);
      // Show confirmation modal for unsaved changes
      setModalType("unsavedChangesBeforeAction");
      setShowConfirmModal(true);
      return;
    }
    // If no unsaved changes, proceed normally
    setSelectedAction(action);
  };

  // const handleCloseActionModal = () => {
  //   setSelectedAction(null); // Reset action
  //   setPendingAction(null); // Reset pending action
  // };

  // deleting form hardly from formio and mark inactive in mapper table
  const handleDelete = () => {
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


   const renderFileUpload = () => {
    return (
      <FileUploadPanel
      onClose={() => console.log("Closed")}
       uploadActionType={UploadActionType}
      importError={null}
      importLoader={importLoader}
      formName={formTitle}
      description="Upload a new form definition to import."
      handleImport={handleImport}
      fileItems={fileItems}
      fileType={UploadActionType}
      primaryButtonText={primaryButtonText}
      headerText="Import Configuration"
      processVersion={null}
    />
    );
  };

   const renderDeleteModal = () => {
    setShowDeleteModal(true);
  };
  const handleCloseDelete = () => {
    setShowDeleteModal(false);
  };

  // this values will be used in settings tab when integrating save functinality

  const renderDeleteForml = () => {
    const hasSubmissions = processListData.id && applicationCount;

    // if (hasSubmissions) {
    //   return (
    //     <ConfirmModal
    //       {...commonProps}
    //       title={t("You Cannot Delete This Form & Flow")}
    //       message={<CustomInfo heading={t("Note")} content={t(
    //         "You cannot delete a form & flow that has submissions associated with it."
    //       )} />}
    //       secondaryBtnAction={handleCloseActionModal}
    //       secondaryBtnText={t("Dismiss")}
    //       secondoryBtndataTestid="dismiss-button"
    //       secondoryBtnariaLabel="Dismiss button"
    //     />
    //   );
    // } else {
     
        return (
          <>
          <div className="delete-section">
            <V8CustomButton
              variant="warning"
              disabled ={hasSubmissions}
              onClick = {renderDeleteModal}
              label={t("Delete Form")}
              aria-label={t("Delete Form")}
              data-testid="delete-form-disabled-btn"
            />
           { Boolean(hasSubmissions) &&  <div className="delete-note">
            <NoteIcon />
            <div className="delete-note-text">
            This form cannot be deleted as it has submissions associated with it
            </div>
            </div>}
          </div>
{/*   
          { showDeleteModal && <ConfirmModal
            {...commonProps}
            title={t("You Cannot Delete This Form & Flow")}
            message={<CustomInfo heading={t("Note")} content={t(
              "You cannot delete a form & flow that has submissions associated with it."
            )} />}
            secondaryBtnAction={handleCloseActionModal}
            secondaryBtnText={t("Dismiss")}
            secondoryBtndataTestid="dismiss-button"
            secondoryBtnariaLabel="Dismiss button"
          />} */}
          </>
        );
  
    // }
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

  // Render tab content based on active tab
  const renderTabContent = () => {
    switch (activeTab.primary) {
      case 'form':
        if (activeTab.secondary === 'history') {
          return (
            <HistoryPage
              revertBtnText={t("Revert")}
              allHistory={formHistory}
              categoryType={CategoryType.FORM}
              revertBtnAction={revertFormBtnAction}
              historyCount={formHistoryData.totalCount}
              disableAllRevertButton={isPublished}
              loading={formHistoryLoading}
              refreshBtnAction={fetchFormHistory}
              paginationModel={paginationModel}
              handlePaginationModelChange={setPaginationModel}
            />
          );
        }
        // Check if settings sub-tab is active
        if (activeTab.secondary === 'settings') {
          return (

              <SettingsTab
                handleConfirm={handleConfirmSettings}
                isCreateRoute={isCreateRoute}
                rolesState={rolesState}
                formDetails={formDetails}
                isAnonymous={isAnonymous}
                setIsAnonymous={setIsAnonymous}
                setFormDetails={setFormDetails}
                setRolesState={setRolesState}
              />

          );
        }
        return (
          <div className="form-builder custom-scroll">
            {!createDesigns ? (
              <div className="px-4 pt-4 form-preview">
                <Form
                  form={form}
                  options={{
                    disableAlerts: true,
                    noAlerts: true,
                    language: lang,
                    i18n: RESOURCE_BUNDLES_DATA,
                    buttonSettings: { showCancel: false },
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
        );
      case 'bpmn': {
        // Determine which content to show
        let variableContent = null;
        if (activeTab.secondary === 'variables') {
          switch (activeTab.tertiary) {
            case 'system': {
              const rowVariables = SystemVariables.map((variable, idx) => ({
                id: idx + 1,
                type: variable.labelOfComponent,
                variable: variable.key,
                altVariable: variable.altVariable,
                selected: (
                  <Switch
                    type="primary"
                    withIcon={true}
                    checked={true}
                    onChange={() => {}}
                    ariaLabel="System variable always selected"
                    dataTestId={`system-variable-switch-${variable.key || idx}`}
                    disabled
                  />
                ),
              }));
              const columns = [
                { field: 'type', headerName: 'Type', flex:1.5, sortable: false },
                { field: 'variable', headerName: 'Variable', flex:1, sortable: false },
                {
                  field: 'altVariable',
                  headerName: 'Alternative Field',
                  flex: 1,
                  sortable: false,
                  renderCell: (params) => (
                    <CustomTextInput
                      value={params.row.altVariable}
                      datatestid={`alt-variable-input-${params.row.variable}`}
                      aria-label="System variable alternative field"
                      placeholder=""
                      setValue={(newVal) => {
                        params.row.altVariable = newVal;
                      }}
                    />
                  ),
                },
                {
                  field: "selected",
                  headerName: "Selected",
                  flex: 1,
                  sortable: false,
                  renderCell: (params) => (
                    <Switch
                      type="primary"
                      withIcon={true}
                      checked={true}
                      onChange={(e) => {
                        params.row.selected = e;
                      }}
                      aria-label={t("System variable selection")}
                      datatestid={`system-variable-switch-${params.row.variable}`}
                    />
                  ),
                },
              ];

              variableContent = (
                <VariableSelection
                  rowVariables={rowVariables}
                  columns={columns}
                  tabKey='system'
                  form={form}
                />
              );
              break;
            }
            case 'form':
              variableContent = (
                <VariableSelection
                  tabKey='form'
                  form={form}
                />
              );
              break;
            default:
              break;
          }
        }

        return (
          <>
            {/* Show variable content when on variables tab */}
            {variableContent && <div className="variable-content">{variableContent}</div>}
            
            {/* Always keep FlowEdit mounted but hide when showing variables */}
            <div className="bpmn-editor" style={{ display: variableContent ? 'none' : 'block' }}>
              {isProcessDetailsLoading ? (
                <div className="d-flex justify-content-center p-4">
                  <div className="spinner-grow" aria-live="polite">
                    <span className="sr-only">{t("Loading...")}</span>
                  </div>
                </div>
              ) : (
                <FlowEdit
                  ref={flowRef}
                  setWorkflowIsChanged={setWorkflowIsChanged}
                  workflowIsChanged={workflowIsChanged}
                  CategoryType={CategoryType}
                  isPublished={isPublished}
                  migration={migration}
                  redirectUrl={redirectUrl}
                  setMigration={setMigration}
                  isMigrated={processListData.isMigrated}
                  mapperId={processListData.id}
                  layoutNotsaved={formChangeState.changed}
                  handleCurrentLayout={handleCurrentLayout}
                  isMigrationLoading={isMigrationLoading}
                  setIsMigrationLoading={setIsMigrationLoading}
                  handleUnpublishAndSaveChanges={handleUnpublishAndSaveChanges}
                  isCreateRoute={isCreateRoute}
                  currentBpmnXml={currentBpmnXml} 
                  setCurrentBpmnXml={setCurrentBpmnXml}
                />
              )}
            </div>
          </>
        );
      }
      case 'actions':
        return (
          <EditorActions 
          renderUpload={renderFileUpload}
          renderDeleteForm={renderDeleteForml}
          mapperId={processListData.id} 
          formTitle={form.title}
          />
        ) ;
      default:
        return null;
    }
  };

  // Render secondary controls based on active primary tab
  const renderSecondaryControls = () => {
    const currentTab = tabConfig.primary[activeTab.primary];
    if (!currentTab?.secondary) return null;

    return (
      <div className="secondary-controls d-flex gap-2">
        {Object.entries(currentTab.secondary).map(([key, config]) => {
          // Disable history and preview buttons on create route
          const isDisabled = config.disabled || (isCreateRoute && (key === 'history' || key === 'preview'));
          return (
            <V8CustomButton
              key={key}
              label={t(config.label)}
              onClick={() => {
                if (isDisabled) return; // Don't execute if disabled

                if (key === 'settings') {
                  handleTabClick('form', 'settings');
                } else if (key === 'history') {
                  if (activeTab.primary === 'form') {
                    activeTab.secondary = 'history';
                    handleTabClick('form', 'history');
                    handleFormHistory();
                  } else if (activeTab.primary === 'bpmn') {
                    handleBpmnHistory();
                  }
                } else if (key === 'preview') {
                  handlePreview();
                } else if (key === 'editor') {
                  handleTabClick('bpmn', 'editor');
                } else if (key === 'variables') {
                  handleTabClick('bpmn', 'variables');
                }
              }}
              disabled={isDisabled}
              dataTestId={`${activeTab.primary}-${key}-button`}
              ariaLabel={t(`${config.label} Button`)}
              variant="secondary"
              selected={activeTab.secondary === key}
            />
          );
        })}
      </div>
    );
  };

  // Render tertiary controls for BPMN Variables
  const renderTertiaryControls = () => {
    if (activeTab.primary === 'bpmn' && activeTab.secondary === 'variables') {
      const variablesConfig = tabConfig.primary.bpmn.secondary.variables;
      if (!variablesConfig?.tertiary) return null;

      return (
        <div className="tertiary-controls d-flex gap-2 mt-2">
          {Object.entries(variablesConfig.tertiary).map(([key, config]) => (
            <V8CustomButton
              key={key}
              label={t(config.label)}
              onClick={() => handleTabClick('bpmn', 'variables', key)}
              dataTestId={`bpmn-variables-${key}-button`}
              ariaLabel={t(`${config.label} Button`)}
              variant="secondary"
              selected={activeTab.tertiary === key}
            />
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="form-create-edit-layout">
      <NavigateBlocker
        isBlock={
          (formChangeState.changed || workflowIsChanged) &&
          !isMigrationLoading &&
          !isDeletionLoading &&
          !isNavigatingAfterSave
        }
        message={t("Discarding changes is permanent and cannot be undone.")}
      />

      <LoadingOverlay
        active={formSubmitted || loadingVersioning}
        spinner
        text={t("Loading...")}
      >
        <Errors errors={errors} />

        <div className="">
          <div className="">
            <BreadCrumbs
              items={[
                { label: t("Build"), href: "/formflow" },
                { label: t("Create New Form"), href: location.pathname },
              ]}
              variant="minimized"
              underlined={true}
              dataTestId="buildForm-breadcrumb"
              ariaLabel={t("Build Form Breadcrumb")}
            />
            {/* Header Section 1 - Back button and form title */}
            <div className="header-section-1">
              <div className="section-seperation-left">
                <p className="form-title">
                  {formData?.title || t("Untitled Form")}
                </p>
              </div>
              <div className="section-seperation-right">
                <div
                  className="form-status"
                  data-testid={`form-status-${form?._id || "new"}`}
                >
                  <FormStatusIcon color={isPublished ? "#00C49A" : "#DAD9DA"} />
                  <span className="status-text">
                    {isPublished ? t("Published") : t("Unpublished")}
                  </span>
                </div>
                {createDesigns && (
                  <>
                    <V8CustomButton
                      disabled={
                        isCreateRoute
                          ? !formDetails.title?.trim()
                          : !formChangeState.changed && !workflowIsChanged
                      }
                      label={t("Save")}
                      onClick={
                        isPublished
                          ? handleUnpublishAndSaveChanges
                          : handleSaveLayout
                      }
                      dataTestId="save-form-layout"
                      ariaLabel={t("Save Form Layout")}
                    />
                    <V8CustomButton
                      label={t(publishText)}
                      onClick={handlePublishClick}
                      dataTestId="handle-publish-testid"
                      ariaLabel={`${t(publishText)} ${t("Button")}`}
                      darkPrimary
                    />
                  </>
                )}
              </div>
            </div>

            {/* Header Section 2 - Action buttons */}
            <div className="header-section-2">
              <div className="section-seperation-left">
                {(createDesigns || viewDesigns) && (
                  <div className="action-buttons d-flex">
                    <div className="section-seperation-left">
                      {Object.entries(tabConfig.primary).map(
                        ([key, config]) => {
                          // Disable BPMN tab on create route
                          //const isDisabled = key === "bpmn";

                          return (
                            <V8CustomButton
                              key={key}
                              onClick={() => handleTabClick(key)}
                              data-testid={`tab-${key}`}
                              aria-label={t(`${config.label} Tab`)}
                              role="tab"
                              aria-selected={activeTab.primary === key}
                              label={t(config.label)}
                              selected={activeTab.primary === key}
                              //disabled={isDisabled}
                            />
                          );
                        }
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Header Section 3 - Tab navigation */}
            { activeTab?.primary !== "actions" && <div className="header-section-3">
              <div className="section-seperation-left">
                {renderSecondaryControls()}
              </div>
              <div className="section-seperation-right">
                {createDesigns && (
                  <div className="form-actions d-flex gap-2">
                    <V8CustomButton
                      label={t("Discard Changes")}
                      onClick={() => openConfirmModal("discard")}
                      disabled={
                        activeTab.primary === 'form' 
                          ? !formChangeState.changed 
                          : !workflowIsChanged
                      }
                      dataTestId="discard-button-testid"
                      ariaLabel={t("Discard Changes Button")}
                      secondary
                    />
                  </div>
                )}
              </div>
            </div>}

            {/* Header Section 4 - Tertiary controls */}
            {activeTab.primary === "bpmn" &&
              activeTab.secondary === "variables" && (
                <div className="header-section-4">
                  <div className="section-seperation-left">
                    {renderTertiaryControls()}
                  </div>
                </div>
              )}

            {/* Body Section - Main content */}
            <div className="body-section formedit-layout">
              {renderTabContent()}
            </div>
          </div>
        </div>
      </LoadingOverlay>

      {/* Modals */}
      <ActionModal
        newActionModal={newActionModal}
        onClose={onCloseActionModal}
        CategoryType={CategoryType.FORM}
        onAction={handleActionWithUnsavedCheck}
        published={isPublished}
        isMigrated={processListData.isMigrated}
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

      {selectedAction === ACTION_OPERATIONS.IMPORT && (
        <ImportModal
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
        />
      )}

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
        <PromptModal
          show={showConfirmModal}
          title={modalContent.title}
          message={modalContent.message}
          messageSecondary={modalContent.messageSecondary || ""}
          primaryBtnAction={modalContent.primaryBtnAction}
          onClose={closeModal}
          secondaryBtnAction={modalContent.secondaryBtnAction}
          primaryBtnText={modalContent.primaryBtnText}
          secondaryBtnText={modalContent.secondaryBtnText}
          type="warning"
        />
      )}

      {/* <HistoryPage
        // show={showHistoryModal}
        // onClose={closeHistoryModal}
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
      /> */}

      {showBpmnHistoryModal && (
        <HistoryPage
          show={showBpmnHistoryModal}
          onClose={closeBpmnHistoryModal}
          title={t("BPMN History")}
          loadMoreBtnText={t("Load More")}
          loadMoreBtndataTestId="load-more-bpmn-history"
          revertBtnText={t("Revert To This")}
          allHistory={bpmnHistoryData.processHistory}
          loadMoreBtnAction={loadMoreBpmnHistory}
          categoryType={CategoryType.WORKFLOW}
          revertBtnAction={revertBpmnHistory}
          historyCount={bpmnHistoryData.totalCount}
          disableAllRevertButton={isPublished}
        />
      )}

        <PromptModal
        show={showDeleteModal}
        onClose={handleCloseDelete}
        title="Delete Item"
        message="Are you sure you want to delete this item?"
        type="warning"
        primaryBtnText="Delete"
        primaryBtnAction={handleDelete}
        secondaryBtnText="Cancel"
        secondaryBtnAction={handleCloseDelete}
      />  

    </div>
  );
};

export const Edit = React.memo(EditComponent);
