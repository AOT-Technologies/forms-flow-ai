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
  Alert,
  AlertVariant,
  CustomProgressBar,
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
  formFlowUpdate,
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
import { StyleServices } from "@formsflow/service";

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
        builder: {
          label: "Builder",
          query: "?tab=form&sub=builder"
        },
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
    flow: {
      label: "Flow",
      query: "?tab=flow",
      secondary: {
        layout: {
          label: "Layout",
          query: "?tab=flow&sub=layout"
        },
        history: {
          label: "History",
          query: "?tab=flow&sub=history"
        },
        variables : {
          label: "Variables",
          query: "?tab=flow&sub=variables"
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

  const [saveDisabled, setSaveDisabled] = useState(true);

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
  const [flowHistoryLoading, setFlowHistoryLoading] = useState(false);
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
  
  // Track initial state for formDetails, rolesState, and isAnonymous to detect changes
  const [initialFormDetails, setInitialFormDetails] = useState(null);
  const [initialRolesState, setInitialRolesState] = useState(null);
  const [initialIsAnonymous, setInitialIsAnonymous] = useState(null);
  const [settingsChanged, setSettingsChanged] = useState(false);
  const formBuilderInitializedRef = useRef(false);
  const [systemAltVariables, setSystemAltVariables] = useState(() => {
    const initial = {};
    for (const v of SystemVariables) {
      initial[v.key] = v.altVariable || '';
    }
    return initial;
  });
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

  const [isFormSettingsChanged, setIsFormSettingsChanged] = useState(false);
  const prevFormDetailsRef = useRef(null);

  useEffect(() => {
    if (prevFormDetailsRef.current === null) {
      prevFormDetailsRef.current = formDetails;
      return;
    }
    const isChanged = !_.isEqual(prevFormDetailsRef.current, formDetails);
    setIsFormSettingsChanged(isChanged);
    prevFormDetailsRef.current = formDetails;
  }, [formDetails]);

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

  // Initialize initial state for formDetails, rolesState, and isAnonymous
  useEffect(() => {
    // Set initial values if not already set
    if (formDetails && !initialFormDetails) {
      setInitialFormDetails(_cloneDeep(formDetails));
    }
    if (rolesState && !initialRolesState) {
      setInitialRolesState(_cloneDeep(rolesState));
    }
    if (isAnonymous !== null && initialIsAnonymous === null) {
      setInitialIsAnonymous(isAnonymous);
    }

    // Track changes only if initial values are set
    if (
      initialFormDetails &&
      initialRolesState &&
      initialIsAnonymous !== null
    ) {
      const formDetailsChanged = !_.isEqual(formDetails, initialFormDetails);
      const rolesStateChanged = !_.isEqual(rolesState, initialRolesState);
      const isAnonymousChanged = isAnonymous !== initialIsAnonymous;
      setSettingsChanged(
        formDetailsChanged || rolesStateChanged || isAnonymousChanged
      );
    }
  }, [
    formDetails,
    rolesState,
    isAnonymous,
    initialFormDetails,
    initialRolesState,
    initialIsAnonymous,
  ]);


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
  const  publishText = isPublished ? "Unpublish" : "Publish";
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [showPublishAlert, setShowPublishAlert] = useState(false);
  const [publishAlertMessage, setPublishAlertMessage] = useState("");
  const [publishProgress, setPublishProgress] = useState(0);

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
  const processId  = processData.id;
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

  // Set default secondary tab for form to 'builder'
  let secondaryTab = sub;
  if (tab === 'form' && !sub) {
    secondaryTab = 'builder';
  }

  setActiveTab({
    primary: tab,
    secondary: secondaryTab,
    tertiary: subsub
  });

  // Set FormBuilder initialization flag when component first loads on form/builder tab
  if (tab === 'form' && (secondaryTab === 'builder' || secondaryTab === null)) {
    formBuilderInitializedRef.current = false;
    setTimeout(() => {
      formBuilderInitializedRef.current = true;
    }, 200);
  }

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
    // if (activeTab.primary === "flow" && activeTab.secondary === "history") {
    //   handleBpmnHistory();
    // }
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
    setActiveTab(newTab);

    // Set FormBuilder initialization flag when switching to form/builder tab
    if (primary === 'form' && (secondary === 'builder' || secondary === null)) {
      formBuilderInitializedRef.current = false;
      // Clear the flag after a short delay to allow FormBuilder to initialize
      setTimeout(() => {
        formBuilderInitializedRef.current = true;
      }, 200);
    }
  
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
        .catch(() => {
          // Error handled silently
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
      const updateFormResponse = {};
      // await formUpdate(form._id, newFormData);

      dispatchFormAction({
        type: "formChange",
        value: { ...updateFormResponse.data, components: form.components },
      });
      dispatch(setFormSuccessData("form", updateFormResponse.data));
      
      // Reset settings changed state after successful save
      setSettingsChanged(false);
      setInitialFormDetails(_cloneDeep(formDetails));
      setInitialRolesState(_cloneDeep(rolesState));
    } catch (error) {
      console.error(error);
    } finally {
      // setIsSettingsSaving(false);
      handleToggleSettingsModal();
    }
  };

  const handleUnpublishAndSaveChanges = () => {
    if  (isPublished && (formChangeState.changed || workflowIsChanged || settingsChanged)) {
      setModalType("unpublishBeforeSaving");
      setShowConfirmModal(true);
    }
  };

  useEffect(() => {
    const shouldDisable = !(isFormSettingsChanged || workflowIsChanged || formChangeState?.changed);
    setSaveDisabled(shouldDisable);
  }, [isFormSettingsChanged, workflowIsChanged, formChangeState.changed]);

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
      const parentFormId = processListData.parentFormId;
      
      // Update newFormData with the latest form details and settings
      newFormData.title = formDetails.title;
      newFormData.name = formDetails.path;
      newFormData.path = formDetails.path;
      newFormData.description = formDetails.description || ""; 
      newFormData.display = formDetails.display;
      newFormData.componentChanged = true;
      newFormData.newVersion = true;
      newFormData.anonymous = isAnonymous;
      newFormData.parentFormId = previousData.parentFormId;
      
      if (isAnonymous) {
        newFormData.access = addAndRemoveAnonymouseId(_cloneDeep(formAccessRoles), "read_all", true);
        newFormData.submissionAccess = addAndRemoveAnonymouseId(_cloneDeep(submissionAccessRoles), "create_own", true);
      } else {
        // Keep the default access roles from manipulatingFormData
        newFormData.access = formAccessRoles;
        newFormData.submissionAccess = submissionAccessRoles;
      }
      const mapper = {
        id: processListData.id,
        formName: formDetails?.title,
        description: formDetails?.description,
        anonymous: isAnonymous,
        parentFormId: parentFormId,
        formType: form.type,
        majorVersion: processListData.majorVersion,
        minorVersion: processListData.minorVersion,
      };

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

    //Authorizations
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

    // Prepare the payload - only include workflow data if user has interacted with BPMN
    const payload = {
      formData: newFormData,
      authorizations,
      mapper,
      ...(includeWorkflow && {
        process: {
          id: processId,
          processType,
          processData,
        }
      })
    };

    // Only include processData and processType if workflow was created/modified
     const { data } = await formFlowUpdate(payload, mapper.id );
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
const saveFormWithWorkflow = async (publishAfterSave = false) => {
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
    //Need to add check of 
    setIsNavigatingAfterSave(true);

    // Navigate to edit page with the new form ID
    const formId = data.formData._id;
    toast.success(t("Form and workflow created successfully"));
    
    // If publishAfterSave is true, publish the form after creation
    if (publishAfterSave && data.mapper?.id) {
      try {
        await publish(data.mapper.id);
        setIsPublished(true);
        toast.success(t("Form published successfully"));
      } catch (publishError) {
        console.error("Error publishing after save:", publishError);
        toast.error(t("Form created but failed to publish"));
      }
    }
    
    dispatch(push(`${redirectUrl}formflow/${formId}/edit`));
  } catch (err) {
    const error = err.response?.data || err.message;
    toast.error(error?.message || t("Failed to create form and workflow"));
    dispatch(setFormFailureErrorData("form", error));
  } finally {
    setFormSubmitted(false);
  }
  };

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
    dispatch(setFormHistories({ formHistory: [], totalCount: 0 }));
    if (processListData?.parentFormId) {
      fetchFormHistory(processListData?.parentFormId, 1, paginationModel.pageSize);
    }
  };

  /* ------------------------- BPMN history handlers ------------------------- */
  const handleBpmnHistory = () => {
    const parentKey = processData?.parentProcessKey;
    if (!parentKey) {
      setFlowHistoryLoading(false);
      return;
    }
    setBpmnHistoryData({ processHistory: [], totalCount: 0 });
    setFlowHistoryLoading(true);
    fetchBpmnHistory(parentKey, paginationModel.page + 1, paginationModel.pageSize);
  };

  const fetchBpmnHistory = async (parentProcessKey, page, limit) => {
    try {
      const response = await getProcessHistory({ parentProcessKey, page, limit });
      // setBpmnHistoryData(response.data);
      // setFlowHistoryLoading(false);
      const data = response?.data || { processHistory: [], totalCount: 0 };
      setBpmnHistoryData(data);
    } catch (error) {
      console.error("Error fetching BPMN history:", error);
      setBpmnHistoryData({ processHistory: [], totalCount: 0 });
    } finally {
      setFlowHistoryLoading(false);
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

  const discardSettingsChanges = () => {
    // Reset formDetails to initial state
    if (initialFormDetails) {
      setFormDetails(_cloneDeep(initialFormDetails));
    }
    // Reset rolesState to initial state
    if (initialRolesState) {
      setRolesState(_cloneDeep(initialRolesState));
    }
    // Reset anonymous state to initial value
    if (!initialIsAnonymous) {
      setIsAnonymous(initialIsAnonymous);
    }
    setSettingsChanged(false);
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
    // Always capture form changes for now to fix the save button issue
    // TODO: Re-implement proper initialization logic later
    captureFormChanges();
    dispatchFormAction({ type: "formChange", value: newForm });
  };


  const confirmPublishOrUnPublish = async () => {
    try {
      const actionFunction = isPublished ? unPublish : publish;
      const action = isPublished ? "Unpublishing" : "Publishing";
      const formTitle = formId || t("Untitled Form");
      
      closeModal();
      
      // Show alert with progress bar
      setPublishAlertMessage(`${action} ${formTitle}`);
      setShowPublishAlert(true);
      setPublishProgress(0);
      
      // Simulate progress
      const progressInterval = setInterval(() => {
        setPublishProgress((prev) => {
          if (prev >= 90) {
            return 90;
          }
          return prev + 10;
        });
      }, 150);

      await actionFunction(processListData.id);
      
      // Complete progress
      clearInterval(progressInterval);
      setPublishProgress(100);
      
      if (isPublished) {
        await fetchProcessDetails(processListData);
        dispatch(getFormProcesses(formId));
      }
      setPromptNewVersion(isPublished);
      
      // Store the original state before toggling for success message
      const wasPublished = isPublished;
      setIsPublished(!isPublished);
      
      // Update message to success (use wasPublished since state is toggled)
      const successMessage = wasPublished ? `${t("Unpublished")} ${formId}` : `${t("Published")} ${formId}`;
      setPublishAlertMessage(successMessage);
      
      // Auto-hide alert after 5 seconds
      setTimeout(() => {
        setShowPublishAlert(false);
        setPublishProgress(0);
      }, 3000);
    } catch (err) {
      const error = err.response?.data || err.message;
      dispatch(setFormFailureErrorData("form", error));
      setShowPublishAlert(false);
      setPublishProgress(0);
    } finally {
      // setIsPublishLoading(false);
    }
  };

  const handleConfirmUnpublishAndSave = async () => {
    try {
      closeModal();
      setLoadingVersioning(true);
      
      const formTitle = formData?.title || formDetails?.title || formId || t("Untitled Form");
      
      // Show alert with progress bar
      setPublishAlertMessage(`Unpublishing ${formId}`);
      setShowPublishAlert(true);
      setPublishProgress(0);
      
      // Simulate progress
      const progressInterval = setInterval(() => {
        setPublishProgress((prev) => {
          if (prev >= 90) {
            return 90;
          }
          return prev + 10;
        });
      }, 150);
      
      await unPublish(processListData.id); // Unpublish the process
      
      // Complete progress
      clearInterval(progressInterval);
      setPublishProgress(100);
      
      // Update message to success
      setPublishAlertMessage(`${t("Unpublished")} ${formTitle}`);
      
      // Auto-hide alert after 5 seconds
      setTimeout(() => {
        setShowPublishAlert(false);
        setPublishProgress(0);
      }, 3000);
      // Fetch mapper data
      dispatch(
        getFormProcesses(formId, async (error, data) => {
          if(error){ //handling error
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
          message: t("Saving as an incremental version will affect previous submissions. Saving as a new full version will not affect previous submissions."),
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
          message: t(
                "By unpublishing this form & flow, you will make it unavailable for new submissions."
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
             if (activeTab.primary === 'form' && activeTab.secondary === 'settings' && settingsChanged) {
               discardSettingsChanges();
             } else if (activeTab.primary === 'form' && formChangeState.changed) {
               discardChanges();
             } else if (activeTab.primary === 'bpmn' && workflowIsChanged) {
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
             dataTestId="unpublish-before-saving"
              variant="warning"
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
            if (settingsChanged) {
              discardSettingsChanges();
            } else {
              discardChanges();
            }
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
    if ((formChangeState.changed || workflowIsChanged || settingsChanged) &&
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
      onClose={handleCloseSelectedAction}
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

  const renderDeleteForm = () => {
    const submissionCount = processListData.id && applicationCount;
    const deleteDisabled = submissionCount > 0 || isPublished;
    const customInfoContent = submissionCount > 0
      ? "This form cannot be deleted as it has submissions associated with it"
      : "Deleting this form will delete all the forms data and will make it inaccessible to everyone. This cannot be undone.";

    return (
      <>
        <div className="delete-section">
          <V8CustomButton
            variant="warning"
            disabled={deleteDisabled}
            onClick={renderDeleteModal}
            label={t("Delete Form")}
            aria-label={t("Delete Form")}
            data-testid="delete-form-disabled-btn"
          />
          <CustomInfo variant="warning" content={customInfoContent} />
        </div>
      </>
    );
  };
  

  const handlePublishClick = async () => {
    // If unpublishing, proceed normally
    if (isPublished) {
      openConfirmModal("unpublish");
      return;
    }

    // If publishing, check if there are unsaved changes
    const hasUnsavedChanges = formChangeState.changed || workflowIsChanged || isFormSettingsChanged;
    
    // If there are unsaved changes, save first before publishing
    if (hasUnsavedChanges) {
      try {
        setFormSubmitted(true);
        if (isCreateRoute) {
          // For create route, save the form first, then publish
          // We'll handle publishing after save in saveFormWithWorkflow
          await saveFormWithWorkflow(true); // Pass true to indicate publish after save
          return;
        } else {
          // For edit route, save unsaved changes first
          await saveFormData({ showToast: false });
        }
      } catch (error) {
        // If save fails, don't proceed with publish
        setFormSubmitted(false);
        return;
      }
    }

    // After saving (or if no changes), proceed with publish
    if (!processListData.isMigrated) {
      setMigration(true);
    } else {
      openConfirmModal("publish");
    }
  };
  
  const handlePaginationModelChange = (newPaginationModel) => {
    setPaginationModel(newPaginationModel);
    if (activeTab.primary === 'form' && activeTab.secondary === 'history') {
      if (processListData?.parentFormId) {
          fetchFormHistory(
            processListData.parentFormId,
            newPaginationModel.page + 1,
            newPaginationModel.pageSize
          );
        }
    }
    if (activeTab.primary === 'flow' && activeTab.secondary === 'history') {
      if (processData?.parentProcessKey) {
        setFlowHistoryLoading(true);
        fetchBpmnHistory(
          processData.parentProcessKey,
          newPaginationModel.page + 1,
          newPaginationModel.pageSize
        );
      }
    }
  };
  // Render tab content based on active tab
  const renderTabContent = () => {
    switch (activeTab.primary) {
      case 'form':
        // Check if builder sub-tab is active
        if (activeTab.secondary === 'builder') {
          return (
            <div className={`form-builder custom-scroll ${isPublished ? 'published-builder' : 'unpublished-builder'}`}>
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
                  key={`${form._id}-builder`}
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
        }
        // Check if history sub-tab is active
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
              handlePaginationModelChange={handlePaginationModelChange}
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
        // This should never be reached since we always set a default secondary tab
        // But if it is reached, redirect to builder tab
        return (
          <div className="form-builder custom-scroll">
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
          </div>
        );
      
      case 'flow':
        if (activeTab.secondary === 'history' && processData?.parentProcessKey) {
          return (
            <HistoryPage
              revertBtnText={t("Revert")}
              allHistory={bpmnHistoryData.processHistory}
              categoryType={CategoryType.WORKFLOW}
              revertBtnAction={(processId) => revertBpmnHistory(processId)}
              historyCount={bpmnHistoryData.totalCount}
              disableAllRevertButton={isPublished}
              refreshBtnAction={handleBpmnHistory}
              paginationModel={paginationModel}
              handlePaginationModelChange={handlePaginationModelChange}
              loading={flowHistoryLoading}
            />
          );
        }
          return (
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
              activeTab={activeTab}
              allHistory={bpmnHistoryData.processHistory}
            />
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
                altVariable: systemAltVariables[variable.key],
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
                { field: 'type', headerName: 'Type', flex: 2.8, sortable: false },
                { field: 'variable', headerName: 'Variable', flex: 1.5, sortable: false, 
                  renderCell: (params) => (
                    <span style={{ color: StyleServices.getCSSVariable('--ff-gray-dark') }}>{params.value}</span>
                  )
                },
                {
                  field: 'altVariable',
                  headerName: 'Alternative Field',
                  flex: 3.2,
                  sortable: false,
                  renderCell: (params) => (
                    <CustomTextInput
                      value={systemAltVariables[params.row.variable]}
                      datatestid={`alt-variable-input-${params.row.variable}`}
                      aria-label="System variable alternative field"
                      placeholder=""
                      setValue={handleAltVariableInputChange(params)}
                      style={{ color: StyleServices.getCSSVariable('--ff-gray-dark') }}
                    />
                  ),
                },
                {
                  field: "selected",
                  headerName: "Selected",
                  flex: 1.3,
                  sortable: false,
                  headerClassName: 'last-column',
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
            
            {/* Always keep FlowEdit mounted but hide when showing variables or history */}
            <div className="bpmn-editor" style={{ display: (variableContent || activeTab.secondary === 'history') ? 'none' : 'block' }}>
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
          renderDeleteForm={renderDeleteForm}
          mapperId={processListData.id} 
          formTitle={form.title}
          />
        ) ;
      default:
        return null;
    }
  };

  const handleAltVariableInputChange = (params) => {
    return (newVal) => {
      params.row.altVariable = newVal;
      setSystemAltVariables(prev => ({ ...prev, [params.row.variable]: newVal }));
    };
  };

  // Render secondary controls based on active primary tab
  const renderSecondaryControls = () => {
    const currentTab = tabConfig.primary[activeTab.primary];
    if (!currentTab?.secondary) return null;

    return (
      <div className="secondary-controls d-flex gap-2">
        {Object.entries(currentTab.secondary).map(([key, config]) => {
          // Disable history and preview buttons on create route
          const isDisabled = config.disabled || (isCreateRoute && (key === 'history' || key === 'preview')) || (isCreateRoute && (activeTab.primary === "actions")) || (!saveDisabled && key === 'preview');
          return (
            <V8CustomButton
              key={key}
              label={t(config.label)}
              onClick={() => {
                if (isDisabled) return; // Don't execute if disabled

                if (key === 'builder') {
                  handleTabClick('form', 'builder');
                } else if (key === 'settings') {
                  handleTabClick('form', 'settings');
                } else if (key === 'history') {
                  if (activeTab.primary === 'form') {
                    handleTabClick('form', 'history');
                    handleFormHistory();
                  } else if (activeTab.primary === 'flow') {
                    activeTab.secondary = 'history';
                    handleBpmnHistory();
                    // handleTabClick('flow', 'history');
                  } else if (activeTab.primary === 'bpmn') {
                    handleTabClick('bpmn', 'history');
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
          (formChangeState.changed || workflowIsChanged || settingsChanged) &&
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
            {/* Header Section 1 - Back button and form title */}
            <div className="toast-section">
              <Alert
                message={publishAlertMessage}
                variant={AlertVariant.FOCUS}
                isShowing={showPublishAlert}
                rightContent={<CustomProgressBar progress={publishProgress} />}
              />
            </div>
            <div className="header-section-1">
              <div className="section-seperation-left d-flex flex-column gap-0">
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
                      disabled={isPublished || saveDisabled}
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
                      disabled={false}
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
                          // Determine default secondary tab for this primary tab
                          const defaultSecondary = key === 'form' ? 'builder' : null;
                          const primaryDisabled = isCreateRoute && key === 'actions';
                          
                          // Check if this primary tab should be highlighted
                          // It should be highlighted if it's the active primary tab, regardless of secondary tab
                          const isPrimaryTabActive = activeTab.primary === key;
                          
                          return (
                            <V8CustomButton
                              key={key}
                              onClick={() => {
                                // When clicking a primary tab, go to the default view
                                // For form tab, default to builder; for others, go to main view
                                
                                // Only skip navigation if already on the default view
                                const isOnDefaultView = activeTab.primary === key && 
                                  activeTab.secondary === defaultSecondary && 
                                  !activeTab.tertiary;
                                
                                if (isOnDefaultView) {
                                  // Already on this tab's default view, avoid navigation
                                  return;
                                }
                                // Switch to default view
                                handleTabClick(key, defaultSecondary, null);
                              }}
                              data-testid={`tab-${key}`}
                              aria-label={t(`${config.label} Tab`)}
                              role="tab"
                              aria-selected={isPrimaryTabActive}
                              label={t(config.label)}
                              selected={isPrimaryTabActive}
                              disabled={primaryDisabled}
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
                        activeTab.primary === 'form' && activeTab.secondary === 'settings'
                          ? !settingsChanged
                          : activeTab.primary === 'form'
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

            {/* Header Section 4 - Published form info */}
            {isPublished && (
              <div className="header-section-4">
                <div className="">
                  <CustomInfo
                    dataTestId="published-form-info"
                    variant="info"
                    heading="Note"
                    content="This form is published. To make changes to it, you will need to unpublish it first which will make it temporarily unavailable to those who have access to it."
                  />
                </div>
              </div>
            )}

            {/* Body Section - Main content */}
            <div className="body-section formedit-layout" >
              {renderTabContent()}
            </div>

            {/* BPMN History Section - Show when on BPMN history tab */}
            {(activeTab.primary === 'bpmn' && activeTab.secondary === 'history') && (
              <div className="body-section">
                {/* <HistoryPage
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
                /> */}
                <HistoryPage
                  revertBtnText={t("Revert")}
                  allHistory={bpmnHistoryData.processHistory}
                  categoryType={CategoryType.WORKFLOW}
                  revertBtnAction={(processId) => revertBpmnHistory(processId)}
                  historyCount={bpmnHistoryData.totalCount}
                  disableAllRevertButton={isPublished}
                  refreshBtnAction={handleBpmnHistory}
                  paginationModel={paginationModel}
                  handlePaginationModelChange={handlePaginationModelChange}
                  loading={flowHistoryLoading}
                />
              </div>
            )}
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
