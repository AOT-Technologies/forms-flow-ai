import React, { useReducer, useState, useEffect, useRef,useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useParams, useLocation } from "react-router-dom";
import Modal from "react-bootstrap/Modal";
import {
  // Errors,
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
  FileUploadPanel,
  Alert,
  AlertVariant,
  CustomProgressBar,
  useProgressBar,
  CustomTextInput,
  CloseIcon,
  EditPencilIcon
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
  clearFormError,
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
import { currentFormReducer } from "../../../modules/formReducer.js";
import { toast } from "react-toastify";
import userRoles from "../../../constants/permissions.js";
import {
  generateUniqueId,
  convertMultiSelectOptionToValue,
  removeTenantKeywithSlash,
  convertSelectedValueToMultiSelectOption,
  compareRolesState,
  addTenantkey,
} from "../../../helper/helper.js";
import { useMutation } from "react-query";
import NavigateBlocker from "../../../components/CustomComponents/NavigateBlocker";
import { setProcessData, setFormPreviosData, setFormProcessesData } from "../../../actions/processActions.js";
import { convertToNormalForm, convertToWizardForm } from "../../../helper/convertFormDisplay.js";
import { SystemVariables } from '../../../constants/variables';
import EditorActions from "./EditActions";
import { getRoute } from "../../../constants/constants";
import { navigateToDesignFormBuild } from "../../../helper/routerHelper";

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
    //Commented out for the the time being.
    // flow: {
    //   label: "Flow",
    //   query: "?tab=flow",
    //   secondary: {
    //     layout: {
    //       label: "Layout",
    //       query: "?tab=flow&sub=layout"
    //     },
    //     history: {
    //       label: "History",
    //       query: "?tab=flow&sub=history"
    //     },
    //     variables : {
    //       label: "Variables",
    //       query: "?tab=flow&sub=variables"
    //     },
    //   }
    // },
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
            form: {
              label: "Form",
              query: "?tab=bpmn&sub=variables&subsub=form"
            },
            system: {
              label: "System",
              query: "?tab=bpmn&sub=variables&subsub=system"
            },
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
  // saving the form variables to the state
  const [savedFormVariables, setSavedFormVariables] = useState({});
  // Store initial savedFormVariables to detect changes
  const initialSavedFormVariablesRef = useRef({});
  const formProcessList = useSelector(
    (state) => state.process.formProcessList
  );
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

  // Helper function to extract authorization data handling both uppercase and lowercase keys
  const getAuthorizationData = (authorization) => {
    if (!authorization) return { designerAuth: null, formAuth: null, applicationAuth: null };
    
    return {
      designerAuth: authorization.DESIGNER || authorization.designer,
      formAuth: authorization.FORM || authorization.form,
      applicationAuth: authorization.APPLICATION || authorization.application,
    };
  };
  /* ------------------ handling form layout and flow layouts ----------------- */
  const [currentLayout, setCurrentLayout] = useState(FORM_LAYOUT);
  const isFormLayout = currentLayout === FORM_LAYOUT;
  const isFlowLayout = currentLayout === FLOW_LAYOUT;

  const tenantKey = useSelector((state) => state.tenants?.tenantId);
  const redirectUrl = MULTITENANCY_ENABLED ? `/tenant/${tenantKey}/` : "/";

  const [nameError, setNameError] = useState("");
  const [showNameFormModal, setShowNameFormModal] = useState(false);
  /* ------------------------------ fowvariables ------------------------------ */
  const flowRef = useRef(null);
  /* ------------------------- file import ------------------------- */
  const [formTitle, setFormTitle] = useState("");
  const [importError, setImportError] = useState("");
  const [importLoader, setImportLoader] = useState(false);
  const defaultPrimaryBtnText = t("Replace existing form");
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
  const [migration, setMigration] = useState(false);
  const [loadingVersioning, setLoadingVersioning] = useState(false); // Loader state for versioning
  const [isSavingNewVersion, setIsSavingNewVersion] = useState(false); // Loader state for saving new version
  const [isNavigatingAfterSave, setIsNavigatingAfterSave] = useState(false); // Flag to prevent blocker during save navigation
  const isNavigatingAfterSaveRef = useRef(false); 
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
    const { designerAuth, formAuth, applicationAuth } = getAuthorizationData(formAuthorization);
    
    return {
      DESIGN: {
        selectedRoles: convertSelectedValueToMultiSelectOption(
          designerAuth?.roles?.map(role => convertRoleToDisplayName(role)) || [],
          multiSelectOptionKey
        ),
        selectedOption: setSelectedOption("onlyYou", designerAuth?.roles),
      },
      FORM: {
        roleInput: "",
        selectedRoles: convertSelectedValueToMultiSelectOption(
          formAuth?.roles?.map(role => convertRoleToDisplayName(role)) || [],
          multiSelectOptionKey
        ),
        selectedOption: setSelectedOption("registeredUsers", formAuth?.roles),
      },
      APPLICATION: {
        roleInput: "",
        selectedRoles: convertSelectedValueToMultiSelectOption(
          applicationAuth?.roles?.map(role => convertRoleToDisplayName(role)) || [],
          multiSelectOptionKey
        ),
        selectedOption: setSelectedOption("submitter", applicationAuth?.roles),
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

  // Keep title–path behavior consistent with SettingsTab for create route
  const updateFormTitleAndPath = (rawTitle) => {
    const sanitizedValue = rawTitle?.replace(/[^a-zA-Z0-9\s\-_()]/g, "") || "";

    setFormDetails((prev) => {
      // For edit route, only update title
      if (!isCreateRoute) {
        return {
          ...prev,
          title: sanitizedValue,
        };
      }

      // For create route, auto-generate path from title as in SettingsTab
      let generatedPath = _.camelCase(sanitizedValue).toLowerCase();
      if (MULTITENANCY_ENABLED && tenantKey) {
        generatedPath = addTenantkey(generatedPath, tenantKey);
      }

      return {
        ...prev,
        title: sanitizedValue,
        path: generatedPath,
      };
    });
  };

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
    if (!isCreateRoute && formAuthorization && Object.keys(formAuthorization).length > 0) {
      const { designerAuth, formAuth, applicationAuth } = getAuthorizationData(formAuthorization);
      
      // Only update if we have at least one valid authorization section
      // This prevents resetting rolesState when authorization data is temporarily empty
      if (designerAuth || formAuth || applicationAuth) {
        const newRolesState = {
          DESIGN: {
            selectedRoles: convertSelectedValueToMultiSelectOption(
              designerAuth?.roles?.map(role => convertRoleToDisplayName(role)) || [],
              multiSelectOptionKey
            ),
            selectedOption: setSelectedOption("onlyYou", designerAuth?.roles),
          },
          FORM: {
            roleInput: "",
            selectedRoles: convertSelectedValueToMultiSelectOption(
              formAuth?.roles?.map(role => convertRoleToDisplayName(role)) || [],
              multiSelectOptionKey
            ),
            selectedOption: setSelectedOption("registeredUsers", formAuth?.roles),
          },
          APPLICATION: {
            roleInput: "",
            selectedRoles: convertSelectedValueToMultiSelectOption(
              applicationAuth?.roles?.map(role => convertRoleToDisplayName(role)) || [],
              multiSelectOptionKey
            ),
            selectedOption: setSelectedOption("submitter", applicationAuth?.roles),
          }
        };
        setRolesState(newRolesState);
        
        // Update initial state if it's already set (happens after save when data is refreshed)
        if (initialRolesState) {
          setInitialRolesState(_cloneDeep(newRolesState));
        }
      }
    }
  }, [formAuthorization, isCreateRoute]);

  // Update form details when processListData changes (for existing forms)
  // Avoid overwriting unsaved local changes (e.g., title/description typed in Settings)
  useEffect(() => {
    if (!isCreateRoute && processListData) {
      const newFormDetails = {
        title: processListData.formName,
        path: path,
        description: processListData.description,
        display: display,
      };
      const newIsAnonymous = processListData.anonymous || false;

      const hasLocalSettingsChanges = settingsChanged || isFormSettingsChanged;

      // Only sync Redux → local state when there are no unsaved local changes.
      // This prevents losing edits when mapper data is refreshed (e.g., after unpublish).
      if (!hasLocalSettingsChanges) {
        setFormDetails(newFormDetails);
        setIsAnonymous(newIsAnonymous);
      }

      // Always keep initial snapshots in sync once they exist,
      // so future change detection works against the latest saved data.
      if (initialFormDetails) {
        setInitialFormDetails(_cloneDeep(newFormDetails));
      }
      if (initialIsAnonymous !== null) {
        setInitialIsAnonymous(newIsAnonymous);
      }
    }
  }, [
    processListData,
    path,
    display,
    isCreateRoute,
    settingsChanged,
    isFormSettingsChanged,
  ]);

  

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
      const rolesStateChanged = !compareRolesState(
        rolesState,
        initialRolesState,
        multiSelectOptionKey
      );
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
  const titleInputRef = useRef(null);


  const handleCancelUpload = () => {
      setImportError("");
      setImportLoader(false);
      setFormTitle("");
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
      setPrimaryButtonText(defaultPrimaryBtnText);
  };

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
      // Use responseData.mapper?.formId if available, otherwise use processListData.formId (previous formId)
      const formId = responseData.mapper?.formId || processListData?.formId;
      dispatch(push(`${redirectUrl}formflow/${formId}/edit?tab=form&subtab=builder`));
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
      setCurrentBpmnXml(null);
      if (flowRef.current && process.processData) {
        flowRef.current?.handleImport(process.processData);
      }
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
    // For create routes, always start as unpublished
    // For edit routes, check processListData status
    isCreateRoute ? false : (processListData?.status == "active")
  );
  const  publishText = isPublished ? "Unpublish" : "Publish";
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [showPublishAlert, setShowPublishAlert] = useState(false);
  const [publishAlertMessage, setPublishAlertMessage] = useState("");
  
  // Use progress bar hook for publish/unpublish progress
  const { progress: publishProgress, start, complete, reset } = useProgressBar({
    increment: 10,
    interval: 150,
    useCap: true,
    capProgress: 90,
  });

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
      isNavigatingAfterSaveRef.current = false;
    }
  }, [isCreateRoute, isNavigatingAfterSave]);

  // Helper function to reset and reinitialize FormBuilder when switching to form/builder tab
  const resetFormBuilderInitialization = (primaryTab, secondaryTab) => {
    if (primaryTab === 'form' && (secondaryTab === 'builder' || secondaryTab === null)) {
      formBuilderInitializedRef.current = false;
      setTimeout(() => {
        formBuilderInitializedRef.current = true;
      }, 200);
    }
  };

  // Parse URL parameters for tab state
useEffect(() => {
  const queryParams = new URLSearchParams(location.search);
  const tab = queryParams.get("tab") || "form";
  const sub = queryParams.get("sub");
  let subsub = queryParams.get("subsub");

  if (tab === 'bpmn' && sub === 'variables' && subsub === null) {
    subsub = 'form';
  }

  let secondaryTab = sub;
  if (tab === 'form' && !sub) {
    secondaryTab = 'builder';
  }
  if (tab === 'bpmn' && !sub) {
    secondaryTab = 'editor';
  }

  setActiveTab({
    primary: tab,
    secondary: secondaryTab,
    tertiary: subsub
  });

  // Set FormBuilder initialization flag when component first loads on form/builder tab
  resetFormBuilderInitialization(tab, secondaryTab);

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
      tertiary = 'form';
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
    resetFormBuilderInitialization(primary, secondary);
  
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
  if(promptNewVersion){
    handleVersioning();
    return;
  }
  saveFormData({ showToast: false });
};

const isFormTitleMissing = () => {
  const trimmedTitle = formDetails?.title?.trim();
  const defaultTitle = t("Untitled Form");
  return !trimmedTitle || trimmedTitle === defaultTitle;
};

  const handleSaveButtonClick = () => {
  // Reset any previous errors when save is clicked
  dispatch(clearFormError("form"));
  
  if (isFormTitleMissing()) {
    setShowNameFormModal(true);
    return;
  }

  if (isPublished) {
    handleUnpublishAndSaveChanges();
  } else {
    handleSaveLayout();
  }
};

// Handler for save action from NavigateBlocker
const handleSaveFromBlocker = async () => {
  try {
    // Set flag to allow navigation after save
    setIsNavigatingAfterSave(true);
    isNavigatingAfterSaveRef.current = true;
    
    if (isCreateRoute) {
      await saveFormWithWorkflow();
    } else {
      await saveFormData({ showToast: true });
    }
  } catch (error) {
    // Reset flag if save fails
    setIsNavigatingAfterSave(false);
    isNavigatingAfterSaveRef.current = false;
    throw error; // Re-throw to let NavigateBlocker handle the error
  }
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

            // Switch to form builder tab after successful revert
            handleTabClick("form", "builder");
            // Mark form as changed so user can save
            setFormChangeState({ initial: true, changed: true });
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

            // Switch to form builder tab after successful revert
            handleTabClick('form', 'builder');
            // Mark form as changed so user can save
            setFormChangeState({ initial: true, changed: true });
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
      setInitialIsAnonymous(isAnonymous);
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

  // Helper function to check if savedFormVariables has changed
  const hasSavedFormVariablesChanged = useCallback(() => {
    const current = JSON.stringify(savedFormVariables);
    const initial = JSON.stringify(initialSavedFormVariablesRef.current);
    return current !== initial;
  }, [savedFormVariables]);

  useEffect(() => {
    // On create route, require form title to be updated (not empty and not the default "Untitled Form")
    // AND at least one change must be made (settings, workflow, form, or variables)
    if (isCreateRoute) {
  
      
      // Check if any changes have been made
      const hasVariablesChanged = hasSavedFormVariablesChanged();
      const hasAnyChanges = isFormSettingsChanged ||
        settingsChanged ||
        workflowIsChanged ||
        formChangeState?.changed ||
        hasVariablesChanged;
    // For create route, allow Save even if title is missing; naming will be enforced via modal.
    // Disable Save only when there are no changes.
    setSaveDisabled(!hasAnyChanges);
      return;
    }
    // On edit route, use existing logic - also check for savedFormVariables changes
    const hasVariablesChanged = hasSavedFormVariablesChanged();
    const shouldDisable = !(
      isFormSettingsChanged ||
      settingsChanged ||
      workflowIsChanged ||
      formChangeState?.changed ||
      hasVariablesChanged
    );
    setSaveDisabled(shouldDisable);
  }, [
    isFormSettingsChanged,
    settingsChanged,
    workflowIsChanged,
    formChangeState.changed,
    isCreateRoute,
    formDetails?.title,
    t,
    hasSavedFormVariablesChanged,
    savedFormVariables,
  ]);

  // saving the form variables to the state
  useEffect(() => {
    const updatedLabels = {};
    // Add taskVariables to updatedLabels
    formProcessList?.taskVariables?.forEach(({ key, label, type }) => {
      updatedLabels[key] = {
        key,
        altVariable: label, // Use label from taskVariables as altVariable
        labelOfComponent: label, // Set the same label for labelOfComponent
        type: type,
      };
    });
    setSavedFormVariables(updatedLabels);
    // Store initial state for change detection
    initialSavedFormVariablesRef.current = structuredClone(updatedLabels);
  }, [formProcessList]);

  const saveFormData = async ({ showToast = true }) => {
    try {
      // Reset any previous errors at the start of save
      dispatch(clearFormError("form"));
      
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
      newFormData.newVersion = false;
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
      
      // Convert savedFormVariables object to array format for taskVariables
      const taskVariables = Object.values(savedFormVariables).map((variable) => ({
        key: variable.key,
        label: variable.altVariable || variable.labelOfComponent || '',
        type: variable.type || 'hidden',
      }));

      const mapper = {
        id: processListData.id,
        formName: formDetails?.title,
        description: formDetails?.description,
        anonymous: isAnonymous,
        parentFormId: parentFormId,
        formId: form._id,
        formType: form.type,
        majorVersion: processListData.majorVersion,
        minorVersion: processListData.minorVersion,
        taskVariables: taskVariables,
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
    // After successful save, reset all change flags so Save button can disable
    setFormChangeState(prev => ({ ...prev, changed: false }));
    setWorkflowIsChanged(false);
    setSettingsChanged(false);
    setIsFormSettingsChanged(false);
    // Update initial savedFormVariables reference after successful save
    initialSavedFormVariablesRef.current = structuredClone(savedFormVariables);
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
    // Reset any previous errors at the start of save
    dispatch(clearFormError("form"));
    
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

    // Reset all change states to prevent unsaved changes modal on redirect
    setFormChangeState({ initial: false, changed: false });
    setWorkflowIsChanged(false);
    // Update initial savedFormVariables reference after successful save
    initialSavedFormVariablesRef.current = structuredClone(savedFormVariables);
    setSettingsChanged(false);
    setIsFormSettingsChanged(false);
    isNavigatingAfterSaveRef.current = true;
    setIsNavigatingAfterSave(true);

    // Navigate to edit page with the new form ID
    const formId = data.formData._id;
    toast.success(t("Form and workflow created successfully"));
    
    // If publishAfterSave is true, publish the form after creation
    if (publishAfterSave && data.mapper?.id) {
      try {
        await publish(data.mapper.id);
        setIsPublished(true);
      } catch (publishError) {
        console.error("Error publishing after save:", publishError);
        toast.error(t("Form created but failed to publish"));
      }
    }
    
    dispatch(push(`${redirectUrl}formflow/${formId}/edit?tab=form&sub=builder`));
  } catch (err) {
    const error = err.response?.data || err.message;
    toast.error(error?.message || t("Failed to create form and workflow"));
    dispatch(setFormFailureErrorData("form", error));
    isNavigatingAfterSaveRef.current = false;
    setIsNavigatingAfterSave(false);
  } finally {
    setFormSubmitted(false);
  }
  };

  const fetchFormHistory = (parentFormId) => {
    setFormHistoryLoading(true);
    const resolvedParentId =
      parentFormId && typeof parentFormId === "string"
        ? parentFormId
        : processListData?.parentFormId;

    getFormHistory(resolvedParentId)
      .then((res) => {
        dispatch(setFormHistories(res.data));
      })
      .catch(() => {
        setFormHistories([]);
      })
      .finally(() => {
        setFormHistoryLoading(false);
      });
  };

  const handleFormHistory = () => {
    dispatch(setFormHistories({ formHistory: [], totalCount: 0 }));
    if (processListData?.parentFormId) {
      fetchFormHistory(processListData?.parentFormId);
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
    fetchBpmnHistory(parentKey);
  };
  
  const fetchBpmnHistory = async (parentProcessKey) => {
    try {
      const response = await getProcessHistory({ parentProcessKey });
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
      
      // Switch to appropriate tab based on current context
      if (activeTab.primary === 'flow') {
        handleTabClick('flow', 'layout');
      } else if (activeTab.primary === 'bpmn') {
        handleTabClick('bpmn', 'editor');
      }
      
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
      const resetFormDetails = _cloneDeep(initialFormDetails);
      setFormDetails(resetFormDetails);
      // Also reset the ref so isFormSettingsChanged useEffect detects no change
      prevFormDetailsRef.current = resetFormDetails;
    }
    // Reset rolesState to initial state
    if (initialRolesState) {
      setRolesState(_cloneDeep(initialRolesState));
    }
    // Reset anonymous state to initial value
    if (initialIsAnonymous !== null) {
      setIsAnonymous(initialIsAnonymous);
    }
    setSettingsChanged(false);
    setIsFormSettingsChanged(false);
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

  const discardVariablesChanges = () => {
    // Reset savedFormVariables to initial state
    if (initialSavedFormVariablesRef.current) {
      setSavedFormVariables(structuredClone(initialSavedFormVariablesRef.current));
    }
    setShowConfirmModal(false);
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
    if (formBuilderInitializedRef.current) {
      captureFormChanges();
    }
    dispatchFormAction({ type: "formChange", value: newForm });
  };
 const saveBtnDisabled = isPublished || saveDisabled;
 const publishBtnDisabled =  isCreateRoute && (!formDetails?.title || formDetails.title.trim() === "" || formDetails.title.trim() === t("Untitled Form"));
                     


  const confirmPublishOrUnPublish = async () => {
    try {
      const actionFunction = isPublished ? unPublish : publish;
      const action = isPublished ? "Unpublishing" : "Publishing";
      const formTitle = formId || t("Untitled Form");
      
      closeModal();
      
      // Show alert with progress bar
      setPublishAlertMessage(`${action} ${formTitle}`);
      setShowPublishAlert(true);
      reset();
      
      // Start progress simulation
      start();

      await actionFunction(processListData.id);
      
      // Complete progress
      complete();
      
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
      
      // Auto-hide alert after 3 seconds
      setTimeout(() => {
        setShowPublishAlert(false);
        reset();
      }, 3000);
    } catch (err) {
      const error = err.response?.data || err.message;
      dispatch(setFormFailureErrorData("form", error));
      setShowPublishAlert(false);
      reset();
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
      reset();
      
      // Start progress simulation
      start();
      
      await unPublish(processListData.id); // Unpublish the process
      
      // Complete progress
      complete();
      
      // Update message to success
      setPublishAlertMessage(`${t("Unpublished")} ${formTitle}`);
      
      setTimeout(() => {
        setShowPublishAlert(false);
        reset();
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


  const saveAsNewVersion = async () => {
    try {
      setIsSavingNewVersion(true);
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
      
      // Reset all change states to prevent NavigateBlocker from blocking navigation
      setFormChangeState({ initial: false, changed: false });
      setWorkflowIsChanged(false);
      setSettingsChanged(false);
      setIsFormSettingsChanged(false);
      // Update initial savedFormVariables reference after successful save
      initialSavedFormVariablesRef.current = structuredClone(savedFormVariables);
      
      // Set navigation flags to prevent NavigateBlocker from blocking
      isNavigatingAfterSaveRef.current = true;
      setIsNavigatingAfterSave(true);
      
      setPromptNewVersion(false);
      dispatch(push(`${redirectUrl}formflow/${response._id}/edit`));
    } catch (err) {
      const error = err.response?.data || err.message;
      dispatch(setFormFailureErrorData("form", error));
      // Reset navigation flags if save fails
      isNavigatingAfterSaveRef.current = false;
      setIsNavigatingAfterSave(false);
    } finally {
      setIsSavingNewVersion(false);
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



  const getModalContent = () => {
    switch (modalType) {
      case "save":
        return {
          title: t("Save a new version"),
          message: t("You have made changes to a previously published form. Choose how this version should be saved to manage your submission history."),
          primaryBtnAction: saveAsNewVersion,
          secondaryBtnAction: saveFormData,
          primaryBtnText: `${t("Create a new version")} (${version.major})`,
          secondaryBtnText: `${t("Update current version")} (${version.minor})`, 
          buttonLoading : isSavingNewVersion,
          secondaryBtnLoading : formSubmitted, 
          primaryBtnDisable: formSubmitted,
          secondaryBtnDisable: isSavingNewVersion,
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
             t("Discarding changes is permanent and cannot be undone."),
             primaryBtnText: t("Discard Changes"),
             primaryBtnAction : () => {
             // Only discard changes from the currently active tab
             const hasVariablesChanged = hasSavedFormVariablesChanged();
             if (activeTab.primary === 'form' && activeTab.secondary === 'settings' && settingsChanged) {
               discardSettingsChanges();
             } else if (activeTab.primary === 'form' && formChangeState.changed) {
               discardChanges();
             } else if (activeTab.primary === 'bpmn' && activeTab.secondary === 'variables' && hasVariablesChanged) {
               discardVariablesChanges();
             } else if (activeTab.primary === 'bpmn' && workflowIsChanged) {
               // Handle workflow discard similar to FlowEdit.js
               handleWorkflowDiscard();
             }
             closeModal();
           },
           secondaryBtnText: t("Cancel"),
           secondaryBtnAction: closeModal,
           className: "discard-changes-modal",
           type: "info",
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
      dispatch(deleteForm("form", formId, () => {
        // Callback after form deletion;
        setIsDeletionLoading(false);
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
      importError={importError}
      importLoader={importLoader}
      formName={formTitle}
      description="Upload a new form definition to import."
      handleImport={handleImport}
      fileItems={fileItems}
      fileType=".json / .bpmn"
      primaryButtonText={primaryButtonText}
      headerText="Import Configuration"
      processVersion={null}
      cancelUpload={handleCancelUpload}
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
        fetchFormHistory(processListData.parentFormId);
        }
    }
    if ((activeTab.primary === 'flow' || activeTab.primary === 'bpmn') && activeTab.secondary === 'history') {
      if (processData?.parentProcessKey) {
        setFlowHistoryLoading(true);
        fetchBpmnHistory(processData.parentProcessKey);
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
              revertBtnAction={(formId) => revertFormBtnAction(formId)}
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
            <div className="custom-scroll">
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
            </div>
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
        // if (activeTab.secondary === 'history' && processData?.parentProcessKey) {
        //   return (
        //     <HistoryPage
        //       revertBtnText={t("Revert")}
        //       allHistory={bpmnHistoryData.processHistory}
        //       categoryType={CategoryType.WORKFLOW}
        //       revertBtnAction={(processId) => revertBpmnHistory(processId)}
        //       historyCount={bpmnHistoryData.totalCount}
        //       disableAllRevertButton={isPublished}
        //       refreshBtnAction={handleBpmnHistory}
        //       paginationModel={paginationModel}
        //       handlePaginationModelChange={handlePaginationModelChange}
        //       loading={flowHistoryLoading}
        //     />
        //   );
        // }
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
        if (activeTab.secondary === "variables") {
          return (
            <div className="d-flex flex-column gap-2">  
            <Alert
              message={t("Save your changes to access variables")}
              variant={AlertVariant.FOCUS}
              isShowing={formChangeState.changed}
            />
            <VariableSelection
              SystemVariables={SystemVariables}
              tabKey={activeTab.tertiary}
              form={form}
              savedFormVariables={savedFormVariables}
              onChange={(alternativeLabels) => {
                setSavedFormVariables(alternativeLabels);
              }}
              disabled={formChangeState.changed || isPublished}
            />
            </div>
            
          );
        }
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
          <div className="custom-scroll">
            <EditorActions 
            renderUpload={renderFileUpload}
            renderDeleteForm={renderDeleteForm}
            mapperId={processListData.id} 
            formTitle={form.title}
            />
          </div>
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
          // Disable history, preview, and variables buttons on create route
          const isDisabled = config.disabled || (isCreateRoute && (key === 'history' || key === 'preview' || key === 'variables')) || (isCreateRoute && (activeTab.primary === "actions"));
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
                    handleBpmnHistory();
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
              disabled={isCreateRoute}
            />
          ))}
        </div>
      );
    }
    return null;
  };

  // Determine if custom scroll should be applied to body section
  // Exclude scroll from history tabs and BPMN layout/editor tab
  const isHistoryTab = (activeTab.primary === 'form' && activeTab.secondary === 'history') ||
                       (activeTab.primary === 'bpmn' && activeTab.secondary === 'history');
  const isBpmnLayoutTab = activeTab.primary === 'bpmn' && activeTab.secondary === 'editor';
  const shouldShowCustomScroll = !isHistoryTab && !isBpmnLayoutTab;
  

  

  return (
    <div className="form-create-edit-layout">
      <NavigateBlocker
        isBlock={
          (formChangeState.changed || workflowIsChanged || settingsChanged) &&
          !isMigrationLoading &&
          !isDeletionLoading &&
          !isNavigatingAfterSave &&
          !isNavigatingAfterSaveRef.current
        }
        message={t("Discarding changes is permanent and cannot be undone.")}
        onSave={handleSaveFromBlocker}
      />

      <LoadingOverlay
        active={formSubmitted || loadingVersioning}
        spinner
        text={t("Loading...")}
      >
        {/* <Errors errors={errors} /> */}
        <Alert
          message={errors?.message}
          variant={AlertVariant.WARNING}
          isShowing={!!errors?.message}
          autoClose={true}
          displayTime={3000}
        />

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
                    { id: "forms", label: t("Forms"), href: getRoute(tenantKey).FORMFLOW },
                    { id: "create-new-form", label: t("Create New Form")},
                    { id: "edit", label: t("Edit") },
                  ]}
                  variant="minimized"
                  underline={false}
                  dataTestId="buildForm-breadcrumb"
                  ariaLabel={t("Build Form Breadcrumb")}
                  onBreadcrumbClick={(item) => {
                    if (item?.id === "forms") {
                      dispatch(push(item?.href));
                    } else if (item?.id === "create-new-form") {
                      navigateToDesignFormBuild(dispatch, tenantKey);
                    }
                  }}
                />
                <div className="d-flex align-items-center">
                  <div className="form-title-edit">
                    <CustomTextInput
                      ref={titleInputRef}
                      value={
                        formDetails?.title ||
                        formData?.title ||
                        processListData?.formName ||
                        ""
                      }
                      setValue={updateFormTitleAndPath}
                      placeholder={t("Untitled Form")}
                      ariaLabel={t("Form Name")}
                      dataTestId="header-form-title-input"
                      maxLength={200}
                    />
                  </div>
                  <div
                    className="form-edit-pencil-icon cursor-pointer"
                    onClick={() => {
                      titleInputRef.current?.focus();
                    }}
                  >
                    <EditPencilIcon />
                  </div>

                </div>
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
                      disabled={saveBtnDisabled}
                      label={t("Save")}
                      onClick={handleSaveButtonClick}
                      dataTestId="save-form-layout"
                      ariaLabel={t("Save Form Layout")}
                      variant={!saveBtnDisabled && "primary"}
                    />
                    <V8CustomButton
                      disabled={publishBtnDisabled}
                      label={t(publishText)}
                      onClick={handlePublishClick}
                      dataTestId="handle-publish-testid"
                      ariaLabel={`${t(publishText)} ${t("Button")}`}
                      // darkPrimary
                      variant={!publishBtnDisabled && saveBtnDisabled ? "primary" : "secondary"}
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
                          const defaultSecondary = key === 'form' ? 'builder' : key === 'bpmn' ? 'editor' : null;
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
                          : activeTab.primary === 'bpmn' && activeTab.secondary === 'variables'
                          ? !hasSavedFormVariablesChanged()
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
            <div
            //add class if tab is variables 
              className={`body-section formedit-layout  ${activeTab.secondary === "variables" ? "variables-tab" : ""} ${shouldShowCustomScroll ? "custom-scroll" : ""} ${isPublished ? "published-form-layout" : ""}`}
            >
              {renderTabContent()}
            </div>

            {/* BPMN History Section - Show when on BPMN history tab */}
            {/* {(activeTab.primary === 'bpmn' && activeTab.secondary === 'history') && (
              <div className="body-section"> */}
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
                {/* <HistoryPage
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
            )} */}
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
          fileType=".json / .bpmn"
        />
      )}

      <ExportModal
        showExportModal={selectedAction === ACTION_OPERATIONS.EXPORT}
        onClose={handleCloseSelectedAction}
        mapperId={processListData.id}
        formTitle={form.title}
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
          type="danger"
          buttonLoading={modalContent.buttonLoading}
          secondaryBtnLoading={modalContent.secondaryBtnLoading}
          primaryBtnDisable={modalContent.primaryBtnDisable}
          secondaryBtnDisable={modalContent.secondaryBtnDisable}
        />
      )}



        <PromptModal
        show={showDeleteModal}
        onClose={handleCloseDelete}
        title={t("Delete this form?")}
        message={t("Deleting a form is permanent and cannot be undone.")}
        type="danger"
        primaryBtnText="Delete Form"
        primaryBtnAction={handleDelete}
        buttonLoading={isDeletionLoading}
        secondaryBtnText="Cancel"
        secondaryBtnAction={handleCloseDelete}
        secondaryBtnDisable={isDeletionLoading}
      />  

      <Modal
        size="lg"
        show={showNameFormModal}
        onHide={() => {
          setShowNameFormModal(false);
        }}
        data-testid="name-form-modal"
        className="name-form-modal"
      >
       <Modal.Header className="d-flex justify-content-between align-items-center">
  <Modal.Title className="m-0">
    <p className="m-0">{t("Name form")}</p>
  </Modal.Title>

  <div
    className="icon-close d-flex align-items-center"
    onClick={() => setShowNameFormModal(false)}
  >
    <CloseIcon data-testid="name-form-modal-close-icon" />
  </div>
</Modal.Header>

        <Modal.Body>
          <div className="form-name-container">
            <p className="mb-1">{t("Form name*")}</p>
            <CustomTextInput
              value={formDetails?.title || ""}
              setValue={updateFormTitleAndPath}
              ariaLabel={t("Form Name")}
              dataTestId="name-form-modal-input"
              maxLength={200}
              required
            />
          </div>
        </Modal.Body>
        <Modal.Footer>
          <div className="d-flex justify-content-end gap-2 w-100">
            <V8CustomButton
              label={t("Cancel")}
              ariaLabel={t("Cancel")}
              dataTestId="name-form-modal-cancel"
              secondary
              onClick={() => {
                setShowNameFormModal(false);
              }}
            />
            <V8CustomButton
              label={t("Save")}
              ariaLabel={t("Save")}
              dataTestId="name-form-modal-save"
              disabled={!formDetails?.title?.trim()}
              onClick={() => {
                const trimmedTitle = formDetails?.title?.trim();
                if (!trimmedTitle) {
                  return;
                }
                setShowNameFormModal(false);
                if (isPublished) {
                  handleUnpublishAndSaveChanges();
                } else {
                  handleSaveLayout();
                }
              }}
            />
          </div>
        </Modal.Footer>
      </Modal>

    </div>
  );
};

export const Edit = React.memo(EditComponent);
