import React, { useEffect, useState, useRef , useCallback} from "react";
import { useSelector, useDispatch } from "react-redux";
import { useParams, useLocation } from "react-router-dom";
import { push } from "connected-react-router";
import PropTypes from "prop-types";
import {
  updateProcess,
  publish,
  unPublish,
  getProcessDetails,
  createProcess,
  getProcessHistory,
  fetchRevertingProcessData,
} from "../../../apiManager/services/processServices";
import Loading from "../../../containers/Loading";
import { MULTITENANCY_ENABLED, getRoute } from "../../../constants/constants";
import { useTranslation } from "react-i18next";
import {
  createNewProcess,
  createNewDecision,
} from "../../../components/Modeler/helpers/helper";
import {
  PromptModal,
  HistoryPage,
  V8CustomButton,
  FormStatusIcon,
  FileUploadArea,
  BreadCrumbs,
  Alert,
  AlertVariant,
  CustomProgressBar,
  useProgressBar,
} from "@formsflow/components";
import ProcessActionsTab from "./ProcessActionsTab";
import ExportDiagram from "../../../components/Modals/ExportDiagrams";
import {
  createXMLFromModeler,
  validateProcess,
  compareXML,
  compareDmnXML,
  validateDecisionNames
} from "../../../helper/processHelper";
import BpmnEditor from "../../../components/Modeler/Editors/BpmnEditor/BpmEditor.js";
import DmnEditor from "../../../components/Modeler/Editors/DmnEditor/DmnEditor.js";
import {
  setProcessData,
  setProcessDiagramXML,
  setDescisionDiagramXML,
} from "../../../actions/processActions";
import { useMutation, useQuery } from "react-query";
import LoadingOverlay from "react-loading-overlay-ts";
// import ImportProcess from "../../../components/Modals/ImportProcess";
import NavigateBlocker from "../../../components/CustomComponents/NavigateBlocker.jsx";
import FileService from "../../../services/FileService";


const EXPORT = "EXPORT";
// Constants
const UPLOAD_PROGRESS_INCREMENT = 5;
const UPLOAD_PROGRESS_INTERVAL = 300;
const INITIAL_UPLOAD_PROGRESS = 10;

const CategoryType = { FORM: "FORM", WORKFLOW: "WORKFLOW" };
const ProcessCreateEdit = ({ type }) => {
  const { processKey, step } = useParams();
  const location = useLocation();
  const isCreate = step === "create";
  const isBPMN = type === "BPMN";
  const Process = {
    BPMN: {
      name: "Subflow",
      type: "BPMN",
      route: "subflow",
      extension: ".bpmn",
      fileType: "text/bpmn",
    },
    DMN: {
      name: "Decision Table",
      type: "DMN",
      route: "decision-table",
      extension: ".dmn",
      fileType: "text/dmn",
    }
  }[isBPMN ? 'BPMN' : 'DMN'];

  const diagramType = Process.type;
  const dispatch = useDispatch();
  const bpmnRef = useRef();
  const dmnRef = useRef();
  const { t } = useTranslation();
  const tenantKey = useSelector((state) => state.tenants?.tenantId);
  
  // Helper function to get redirect URL
  const getRedirectUrl = () => {
    return MULTITENANCY_ENABLED ? `/tenant/${tenantKey}/` : "/";
  };
  const redirectUrl = getRedirectUrl();
  const processData = useSelector((state) => state.process?.processData);
  const [selectedAction, setSelectedAction] = useState(null);
  const [lintErrors, setLintErrors] = useState([]);
  const [exportError, setExportError] = useState(null);
  const [importError, setImportError] = useState(null);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [showEditor, setShowEditor] = useState(true);
  
  const defaultProcessXmlData = useSelector(
    (state) => state.process.defaultProcessXmlData
  );
  const defaultDmnXmlData = useSelector(
    (state) => state.process.defaultDmnXmlData
  );
  const [savingFlow, setSavingFlow] = useState(false);
  const [isPublished, setIsPublished] = useState(
    processData?.status === "Published"
  );

  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [modalType, setModalType] = useState("");
  const [isPublishLoading, setIsPublishLoading] = useState(false);
  const [isReverted, setIsReverted] = useState(false);
  const [isWorkflowChanged, setIsWorkflowChanged] = useState(false);
  const [importLoader, setImportLoader] = useState(false);
  const [processHistoryLoading, setProcessHistoryLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [showImportAlert, setShowImportAlert] = useState(false);
  const [importAlertMessage, setImportAlertMessage] = useState("");
  
  // Use progress bar hook for upload progress
  const {
    progress: uploadProgress,
    start: startUpload,
    stop: stopUpload,
    complete: completeUpload,
    reset: resetUpload,
  } = useProgressBar({
    increment: UPLOAD_PROGRESS_INCREMENT,
    interval: UPLOAD_PROGRESS_INTERVAL,
    useCap: false,
    initialProgress: INITIAL_UPLOAD_PROGRESS,
  });
  
  // Use progress bar hook for import progress
  const {
    progress: importProgress,
    start: startImport,
    complete: completeImport,
    reset: resetImport,
  } = useProgressBar({
    increment: 10,
    interval: 150,
    useCap: true,
    capProgress: 90,
  });
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [successAlertMessage, setSuccessAlertMessage] = useState("");
  const [showErrorAlert, setShowErrorAlert] = useState(false);
  const [errorAlertMessage, setErrorAlertMessage] = useState("");
  const isDataFetched = useRef();
   const [activeTab, setActiveTab] = useState({
      primary: 'layout',
      secondary: null,
      tertiary: null
    });
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 10 });

  const tabConfig = {
  primary: {
    layout: {
      label: "Layout",
      query: "?tab=layout",
      secondary: {
         history: {
          label: "History",
          query: "?tab=form&sub=history"
        },
      }
    }, 
    // actions: {
    //   label: "Actions",
    //   query: "?tab=actions"
    // }
  }
};
  // Parse URL parameters for tab state
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const tab = queryParams.get("tab") || "layout";
    const sub = queryParams.get("sub");
    
    setActiveTab({
      primary: tab,
      secondary: sub || null,
      tertiary: null
    });
    
    // Show editor when switching to layout tab
    if (tab === "layout") {
      setShowEditor(true);
    } else if (tab === "actions") {
      setShowEditor(false);
    }
  }, [location.search, location.pathname]);

  // Update history list whenever History tab becomes active
  useEffect(() => {
    if (activeTab.primary === "layout" && activeTab.secondary === "history") {
      // Only fetch history if processData is loaded and has parentProcessKey
      // This handles both tab switching and page refresh scenarios
      if (processData?.parentProcessKey) {
        handleProcessHistory();
      }
    }
  }, [
    activeTab.primary,
    activeTab.secondary,
    paginationModel.pageSize,
    processData?.parentProcessKey,
  ]);

  const handleTabClick = (primary, secondary = null, tertiary = null) => {
    setActiveTab({ primary, secondary, tertiary });
    
    // Show editor when switching to layout tab
    if (primary === 'layout') {
      setShowEditor(true);
    } else if (primary === 'actions') {
      setShowEditor(false);
    }
    
    // Update URL with new tab parameters
    const queryParams = new URLSearchParams();
    queryParams.set("tab", primary);
    if (secondary) queryParams.set("sub", secondary);
    if (tertiary) queryParams.set("subsub", tertiary);
    
    if (isCreate || !processKey) {
      // On create route (no processKey yet), preserve current pathname and only change search
      dispatch(
        push({
          pathname: location.pathname,
          search: `?${queryParams.toString()}`,
        })
      );
    } else {
      // On edit route, update URL with tab parameters
      const newUrl = `${redirectUrl}${Process.route}/edit/${processKey}?${queryParams.toString()}`;
      dispatch(push(newUrl));
    }
  };
    /**
   * Manages simulated upload progress while awaiting server response
   */
    useEffect(() => {
      if (importLoader) {
        resetUpload();
        startUpload();
      } else {
        stopUpload();
      }
      
      return () => {
        stopUpload();
      };
    }, [importLoader, startUpload, stopUpload, resetUpload]);

  const renderSecondaryControls = () => {
      const currentTab = tabConfig.primary[activeTab.primary];
      if (!currentTab?.secondary) return null;
  
      return (
        <div className="secondary-controls d-flex gap-2">
          {Object.entries(currentTab.secondary).map(([key, config]) => {
            // Disable history on create route
            const isDisabled = config.disabled || (isCreate && key === 'history');
            return (
              <V8CustomButton
                key={key}
                label={t(config.label)}
                onClick={() => {
                  if (isDisabled) return; // Don't execute if disabled
                  if (key === 'history') {
                    handleTabClick('layout', 'history');
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
  useEffect(() => {
    setIsPublished(processData.status === "Published");
  }, [processData]);

  
  // Helper function to get publish text
  const getPublishText = () => {
    return isPublished ? t("Unpublish") : t("Publish");
  };
  const publishText = getPublishText();
  
  const processName = processData.name;
  const fileName = (processName + Process.extension).replaceAll(" ", "");
  
  // fetching process data
  const { isLoading: isProcessDetailsLoading } = useQuery(
    ["processDetails", processKey],
    () => getProcessDetails({processKey}),
    {
      cacheTime: 0, // Disable caching if not disabled the previous data will be cached
      staleTime: 0, // Data is always treated as stale
      enabled: Boolean(processKey) && !isDataFetched.current, // Run only if processKey exists and data hasn't been fetched
      onSuccess: ({ data }) => {
        isDataFetched.current = true;
        setIsPublished(data.status === "Published");
        dispatch(setProcessData(data));
      },
      onError: (error) => {
        console.error(error);
      },
    }
  );

  /* --------- fetching all process history when click history button --------- */
  const {
    data: { data: historiesData } = {}, // response data destructured
    mutate: fetchAllHistories, // mutate function used to call the api function and here mutate renamed to fetch histories
    // isLoading: historiesLoading,
    // isError: historiesError,
  } = useMutation(
    ({ parentProcessKey, page, limit }) =>
      getProcessHistory({ parentProcessKey, page, limit }), // this is api calling function and mutate function accepting some parameter and passing to the apicalling function
    {
      onSuccess: () => {
        setProcessHistoryLoading(false);
      },
      onError: () => {
        setProcessHistoryLoading(false);
      },
    }
  );

  /* --------- fetch a perticular history when click the revert button -------- */
  const {
    data: { data: historyData } = {},
    mutate: fetchHistoryData,
    isLoading: historyLoading,
    // isError: historyDataError,
  } = useMutation((processId) => fetchRevertingProcessData(processId), {
    onSuccess: () => {
      setIsReverted(true);
      enableWorkflowChange();
      // Redirect to layout tab after successful revert
      if (processKey) {
        handleTabClick('layout', null, null);
      }
    },
  });

  // Helper function to get process data XML
  const getProcessDataXML = () => {
    return isReverted ? historyData?.processData : processData?.processData;
  };
  const processDataXML = getProcessDataXML();
  // handle history modal
  // const handleToggleHistoryModal = () => setHistoryModalShow(!historyModalShow);

  const enableWorkflowChange = ()=>{
    setIsWorkflowChanged(true);
  };

  const disableWorkflowChange = ()=>{
    setIsWorkflowChanged(false);
  };

  useEffect(() => {
    if (isCreate) {
      dispatch(setProcessData({}));
    }

    return () => {
      // Check if it's BPMN or DMN and reset the respective data
      if (isCreate) {
        const newProcessXml = isBPMN
          ? createNewProcess().defaultWorkflow.xml
          : createNewDecision().defaultWorkflow.xml;
        const action = isBPMN ? setProcessDiagramXML : setDescisionDiagramXML;
        dispatch(action(newProcessXml));
      }
    };
  }, [isCreate, isBPMN]);

  const handleToggleConfirmModal = () => setShowConfirmModal(!showConfirmModal);
  const openConfirmModal = (type) => {
    setModalType(type);
    handleToggleConfirmModal();
  };
  const saveFlow = async ({
    isPublishing = false,
    isCreateMode = isCreate,
  }) => {
    try {
      // Use getProcessXML() instead of directly getting from modeler
      // This handles cases when on history tab where modeler might not be available
      const xml = await getProcessXML();

      const isValid = validateXml(xml, isBPMN);
      if (!isValid) return;

      const isEqual = await checkIfEqual(isCreate, xml);
      if (!isReverted && !isCreateMode && isEqual){
        disableWorkflowChange();
        return handleAlreadyUpToDate(isPublishing);
      }

      setSavingFlow(true);

      const response = await saveProcess(isCreateMode, xml);
      disableWorkflowChange();
      dispatch(setProcessData(response.data));
      isReverted && setIsReverted(!isReverted); //if it already reverted the need to make it false
      handleSaveSuccess(response, isCreateMode, isPublishing);
      return response.data;
    } catch (error) {
      handleError();
    } finally {
      setSavingFlow(false);
    }
  };

  // Helper Functions
  const getModeler = (isBPMN) => {
    return isBPMN
      ? bpmnRef.current?.getBpmnModeler()
      : dmnRef.current?.getDmnModeler();
  };

  // Helper function to get XML safely - tries modeler first, falls back to saved data
  const getProcessXML = async () => {
    const modeler = getModeler(isBPMN);
    
    // If modeler is available, get XML from it (includes any unsaved changes)
    if (modeler) {
      try {
        return await createXMLFromModeler(modeler);
      } catch (error) {
        console.error("Error getting XML from modeler:", error);
        // Fall through to use saved data
      }
    }
    
    // Fallback to saved process data (e.g., when on History tab)
    const savedXml = getProcessDataXML();
    if (savedXml) {
      return savedXml;
    }
    
    // If no saved data and no modeler, throw error
    throw new Error(t("Unable to get process XML. Please ensure the process is saved or the editor is available."));
  };

  const validateXml = (xml, isBPMN) => {
    return isBPMN
      ? validateProcess(xml, lintErrors, t)
      : validateDecisionNames(xml, t);
  };

  const checkIfEqual = async (isCreate, xml) => {
    if (isCreate) return false; // Skip comparison if creating
    const comparisonFunc = isBPMN ? compareXML : compareDmnXML;
    return await comparisonFunc(processData?.processData, xml);
  };

  const handleAlreadyUpToDate = (isPublishing) => {
    // Only show alert if not publishing (when publishing, we allow it to proceed)
    if (!isPublishing) {
      const message = t(`${Process.name} is already up to date`);
      setSuccessAlertMessage(message);
      setShowSuccessAlert(true);
      setTimeout(() => {
        setShowSuccessAlert(false);
      }, 3000);
      return; // Return undefined to block save when not publishing
    }
    // When publishing, return processData so publish can proceed
    return processData;
  };

  const handleProcessHistory = () => {
    // Only fetch if parentProcessKey exists
    if (!processData?.parentProcessKey) {
      setProcessHistoryLoading(false);
      return;
    }
    setProcessHistoryLoading(true);
    fetchAllHistories({
      parentProcessKey: processData.parentProcessKey,
      page: 1,
      limit: paginationModel.pageSize,
    });
  };

  const handlePaginationModelChange = (model) => {
    setPaginationModel(model);
    // Only fetch if parentProcessKey exists
    if (!processData?.parentProcessKey) {
      return;
    }
    setProcessHistoryLoading(true);
    fetchAllHistories({
      parentProcessKey: processData.parentProcessKey,
      page: (model?.page || 0) + 1,
      limit: model?.pageSize || paginationModel.pageSize,
    });
  };

  const loadMoreBtnAction = () => {
    // Only fetch if parentProcessKey exists
    if (!processData?.parentProcessKey) {
      return;
    }
    fetchAllHistories({ parentProcessKey: processData.parentProcessKey });
  };

  const saveProcess = async (isCreate, xml) => {
    const processType = Process.type; // Using centralized Process.type
    const payload = {
      type: processType,
      data: xml,
    };

    return isCreate
      ? await createProcess(payload)
      : await updateProcess({
        ...payload,
        id: processData.id, // ID needed only for update
      });
  };

  const handleSaveSuccess = (response, isCreate, isPublishing) => {
    const processType = Process.type;
    const actionMessage = isCreate ? t("created") : t("updated");
    const processName = response.data?.name || response.data?.processKey;

    if (!isPublishing) {
      const message = t(
        `${processType} ${processName} has been ${actionMessage} successfully`
      );
      setSuccessAlertMessage(message);
      setShowSuccessAlert(true);
      setTimeout(() => {
        setShowSuccessAlert(false);
      }, 3000);
    }

    // Only redirect if creating and NOT publishing (when publishing, we'll handle redirect after publish)
    if (isCreate && !isPublishing) {
      const editPath = Process.route; // Uses Process.route for the edit path
      dispatch(
        push(`${redirectUrl}${editPath}/edit/${response.data.processKey}`)
      );
    }
  };

  const handleError = () => {
    setErrorMessage(
      t(`The ${Process.type} name already exists. It must be unique. 
        Please make changes through the General section within this ${Process.type}.`)
    );
    setShowErrorModal(true);
  };

  const confirmPublishOrUnPublish = async () => {
    try {
      const xml = await getProcessXML();

      const isValid = validateXml(xml, isBPMN);
      if (!isPublished && !isValid) return;

      const actionFunction = isPublished ? unPublish : publish;
      let response = null;

      if (!isPublished) {
        response = await saveFlow({
          isPublishing: !isPublished
        });
      }

      closeModal();

      if (isCreate && !response) return;

      await performAction(actionFunction, xml, response);

      // Show success message with process name
      const processName = response?.name || response?.processKey || processData?.name || processData?.processKey || "";
      const message = isPublished 
        ? t(`${Process.type} ${processName} has been unpublished successfully`)
        : isCreate 
          ? t(`${Process.type} ${processName} has been created and published successfully`)
          : t(`${Process.type} ${processName} has been published successfully`);
      
      setSuccessAlertMessage(message);
      setShowSuccessAlert(true);
      setTimeout(() => {
        setShowSuccessAlert(false);
      }, 3000);

      if (!isPublished) {
        // If creating and publishing, redirect to edit page; otherwise redirect to list
        if (isCreate) {
          const editPath = Process.route;
          setTimeout(() => {
            dispatch(
              push(`${redirectUrl}${editPath}/edit/${response.processKey}`)
            );
          }, 3000); // Redirect after alert is shown
        } else {
          // Delay redirect to allow alert to be shown first
          setTimeout(() => {
            redirectToFlow();
          }, 3000); // Redirect after alert is shown
        }
      }

      setIsPublished(!isPublished);
    } catch (error) {
      console.error("Error during publish/unpublish:", error);
      const errorMsg = t(`Failed to ${isPublished ? "unpublish" : "publish"} the ${Process.type}. Please try again.`);
      setErrorAlertMessage(errorMsg);
      setShowErrorAlert(true);
      setTimeout(() => {
        setShowErrorAlert(false);
      }, 5000);
    } finally {
      setIsPublishLoading(false);
    }
  };

  // Helper Functions

  const performAction = async (actionFunction, xml, response) => {
    setIsPublishLoading(true);

    await actionFunction({
      id: response?.id || processData.id,
      data: xml,
      type,
    });

    if (isPublished) {
      await updateProcessDetails();
    }
  };

  const updateProcessDetails = async () => {
    const updatedProcessDetails = await getProcessDetails(
      {processKey:processData.processKey}
    );
    dispatch(setProcessData(updatedProcessDetails.data));
    setIsPublished(false); // Resetting publish state after unpublishing
  };

  const redirectToFlow = () => {
    dispatch(push(`${redirectUrl}${Process.route}`));
  };

 
  const closeModal = () => {
    setModalType("");
    handleToggleConfirmModal();
  };


  // IMPORT FUNCTIONS


  // Validate file type
  const isValidFileType = (file) => {
    return file?.name?.endsWith(Process.extension);
  };

  // Validate XML content structure
  const isValidXMLContent = (xmlContent) => {
    try {
      // Check if the content contains the expected root element
      const expectedElement = isBPMN ? 'bpmn:definitions' : 'definitions';
      return xmlContent.includes(expectedElement);
    } catch (error) {
      return false;
    }
  };

  const handleImport = async (file) => {
    setImportLoader(true);
    setImportError(null);
    resetUpload();
    setSelectedFile(file); // Set file first so error state can be displayed
    
    try {
      // Validate file type
      if (!isValidFileType(file)) {
        setImportError(
          t(`The file format is invalid. Please import a ${Process.extension} file.`)
        );
        setImportLoader(false);
        resetUpload();
        return;
      }

      // Read file content
      const fileContent = await file.text();

      // Validate XML content
      if (!fileContent || fileContent.trim() === '') {
        setImportError(t('The file is empty. Please import a valid file.'));
        setImportLoader(false);
        resetUpload();
        return;
      }

      // Validate XML structure
      if (!isValidXMLContent(fileContent)) {
        setImportError(
          t(`The file content is invalid. Please import a valid ${Process.type} file.`)
        );
        setImportLoader(false);
        resetUpload();
        return;
      }
      
      completeUpload();
      // Import to editor
      const ref = isBPMN ? bpmnRef : dmnRef;
      if (ref.current) {
        ref.current?.handleImport(fileContent);
        enableWorkflowChange();
      }
    } catch (error) {
      console.error('Import failed:', error);
      setImportError(
        t(error.message || 'An error occurred during import. Please try again.')
      );
      resetUpload();
    } finally {
      setImportLoader(false);
    }
  };
  const handleExport = async () => {
    try {
      let data = "";
      if (isCreate) {
        const modeler = getModeler(isBPMN);
        data = await createXMLFromModeler(modeler);
      } else {
        data = processData?.processData;
      }

      const isValid = isBPMN
        ? await validateProcess(data, lintErrors)
        : await validateDecisionNames(data);

      if (isValid) {
        const element = document.createElement("a");
        const file = new Blob([data], { type: Process.fileType });
        element.href = URL.createObjectURL(file);

        element.download = fileName;
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element); // Cleanup after download
        setExportError(null);
      } else {
        setExportError(t("Process validation failed."));
      }
    } catch (error) {
      setExportError(t(error.message || "Export failed due to an error."));
    }
  };
  const resetUploadState = useCallback(() => {
    setImportLoader(false);
    setImportError(null);
    resetUpload();
    setSelectedFile(null);

  }, [resetUpload]);
  const handleFileInputChange = useCallback(
    (eventOrFile) => {
      // Handle both event object and direct file
      const file = eventOrFile?.target?.files?.[0] || eventOrFile;
      if (file) {
        handleImport(file);
      }
    },
    [handleImport]
  );
  // Handle importing process and dispatching upon success
  const processImport = async (fileContent) => {
    try {
      const { xml } = await extractFileDetails(fileContent);
      if (!xml) return;
      const processId = processData.id;
      const fileType = Process.extension;
      
      // Show import progress alert
      setImportAlertMessage(t(`Importing ${Process.type}...`));
      setShowImportAlert(true);
      resetImport();
      
      // Start progress simulation
      startImport();
      
      if (processId) {
        // Update an existing process
        const response = await updateProcess({
          id: processId,
          data: xml,
          type: fileType === ".bpmn" ? "bpmn" : "dmn",
        });
        
        // Complete progress
        completeImport();
        
        dispatch(setProcessData(response?.data));
        handleImportData(xml);
        
        // Show success message
        const successMessage = t(`${Process.type} imported successfully`);
        setImportAlertMessage(successMessage);
        
        // Auto-hide alert after 3 seconds
        setTimeout(() => {
          setShowImportAlert(false);
          resetImport();
        }, 3000);
        
        // Redirect to layout page
        dispatch(
          push(
            `${redirectUrl}${Process.route}/edit/${response.data.processKey}?tab=layout`
          )
        );
      } else {
        // Create a new process and redirect
        const response = await createProcess({
          data: xml,
          type: fileType === ".bpmn" ? "bpmn" : "dmn",
        });
        
        // Complete progress
        completeImport();
        
        if (response) {
          // Show success message
          const successMessage = t(`${Process.type} imported successfully`);
          setImportAlertMessage(successMessage);
          
          // Auto-hide alert after 3 seconds
          setTimeout(() => {
            setShowImportAlert(false);
            resetImport();
          }, 3000);
          
          dispatch(
            push(
              `${redirectUrl}${Process.route}/edit/${response.data.processKey}?tab=layout`
            )
          );
        }
      }
      resetUploadState();
    } catch (error) {
      console.error("Error during import:", error);
      const errorMessage = error?.response?.data?.message || t("An error occurred during import.");
      setImportError(errorMessage);
      
      // Hide alert on error
      setShowImportAlert(false);
      resetImport();
      // Error message shown via importError state in FileUploadArea
    }
  };

  // Extract file details asynchronously
  const extractFileDetails = async (fileContent) => {
    const extractedXml = await FileService.extractFileDetails(fileContent);
    return extractedXml;
  };
  const renderUploadArea = () => {
    return (
      <FileUploadArea
        onCancel={resetUploadState}
        onRetry={resetUploadState}
        onDone={() => processImport(selectedFile)}
        file={selectedFile}
        progress={uploadProgress}
        error={importError}
        className="grid-item"
        fileType={Process.fileType}
        primaryButtonText={
          importError ? t("Try Again") : t("Confirm and Replace")
        }
        dataTestId={`upload-${Process.type}-area`}
        onFileSelect={handleFileInputChange}
        ariaLabel={t(
          `Drag and drop a ${Process.extension} file or click to browse for ${Process.type}`
        )}
        disabled={isPublished}
      />
    );
  };

  // const cancel = () => {
  //   dispatch(push(`${redirectUrl}${Process.route}`));
  // };

  const editorActions = () => {
    handleTabClick('actions', null, null);
  };

  const handleDuplicateProcess = () => {
    handleToggleConfirmModal();
    if (isBPMN) {
      dispatch(setProcessDiagramXML(processData.processData));
    } else {
      dispatch(setDescisionDiagramXML(processData.processData));
    }
    const route = `${Process.route}/create`; // Uses Process.route for the creation path
    dispatch(push(`${redirectUrl}${route}`));
  };

  const handleDiscardConfirm = () => {
    // Check which editor is currently being used and import the appropriate data
    const editorRef = isBPMN ? bpmnRef.current : dmnRef.current;
    // Determine the XML data based on the creation mode and editor type
    let xmlData;
    if (isCreate) {
      xmlData = isBPMN ? defaultProcessXmlData : defaultDmnXmlData;
    } else {
      xmlData = processData.processData;
    }

    if (editorRef) {
      editorRef.handleImport(xmlData);
    }
    isReverted && setIsReverted(!isReverted); //once it reverted then need to make it false
    handleToggleConfirmModal();
    disableWorkflowChange();
  };
  const handleCloseErrorModal = () => setShowErrorModal(false);

  // Helper function to render loading state
  const renderLoadingState = () => {
    if (isProcessDetailsLoading) {
      return <Loading />;
    }
    return null;
  };

  const loadingComponent = renderLoadingState();
  if (loadingComponent) {
    return loadingComponent;
  }

  const getModalContent = () => {
    const getModalConfig = (
      title,
      message,
      primaryBtnText,
      secondaryBtnText,
      primaryAction,
      secondaryAction
    ) => {
      return {
        title,
        message,
        primaryBtnText,
        secondaryBtnText,
        primaryBtnAction: primaryAction,
        secondaryBtnAction: secondaryAction,
      };
    };
    
    switch (modalType) {
      case "publish":
        return getModalConfig(
          t("Confirm Publish"),
          t("Publishing will lock the {{type}}. To save changes on further edits, you will need to unpublish the {{type}} first.", {
            type: Process.type,
          }),
          t(`Publish This ${Process.type}`),
          t("Cancel"),
          confirmPublishOrUnPublish,
          closeModal
        );
      case "unpublish":
        return getModalConfig(
          t("Confirm Unpublish"),
          t("This {{type}} is currently live. To save changes to {{type}} edits, you need to unpublish it first.",{
            type: Process.type
    }),
          t(`Unpublish and Edit This ${Process.type}`),
          t(`Cancel, Keep This ${Process.type} published`),
          confirmPublishOrUnPublish,
          closeModal
        );
      case "discard":
        return getModalConfig(
          t(`Are you sure want to discard ${Process.type} changes?`),
          t(
            `Are you sure want to discard all the changes to the ${Process.type}?`
          ),
          t("Discard Changes"),
          t("Cancel"),
          handleDiscardConfirm,
          closeModal
        );
      case "duplicate":
        return getModalConfig(
          t("Create Duplicate"),
          t(`Are you sure you want to duplicate the current ${Process.type}?`),
          t(`Yes, Duplicate This ${Process.type}`),
          t(`No, Do Not Duplicate This ${Process.type}`),
          handleDuplicateProcess,
          closeModal
        );
      default:
        return {};
    }
  };

  const modalContent = getModalContent();


  
  // Helper function to get editor reference
  const getEditorRef = () => {
    return isBPMN ? bpmnRef : dmnRef;
  };
  
  const handleImportData = (xml) => {
    const ref = getEditorRef();
    if (ref.current) {
      ref.current?.handleImport(xml);
    }
  };
  
  

  // Helper function to render editor component
  const renderEditor = () => {
    if (isBPMN) {
      return (
        <BpmnEditor
          onChange={enableWorkflowChange}
          ref={bpmnRef}
          bpmnXml={isCreate ? defaultProcessXmlData : processDataXML}
          setLintErrors={setLintErrors}
        />
      );
    }
    return (
      <DmnEditor
        onChange={enableWorkflowChange}
        ref={dmnRef}
        dmnXml={isCreate ? defaultDmnXmlData : processDataXML}
      />
    );
  };


  return (
    <div>
      <NavigateBlocker isBlock={isWorkflowChanged} message={"You have made changes that are not saved yet"}  />
      <PromptModal
        show={showConfirmModal}
        title={modalContent.title}
        message={modalContent.message}
        primaryBtnAction={modalContent.primaryBtnAction}
        onClose={closeModal}
        secondaryBtnAction={modalContent.secondaryBtnAction}
        primaryBtnText={modalContent.primaryBtnText}
        secondaryBtnText={modalContent.secondaryBtnText}
        type="warning"
        size={modalType === "unpublish" ? "lg" : "md"}
        primaryBtndataTestid="confirm-primary-button"
        secondoryBtndataTestid="confirm-secondary-button"
        primaryBtnariaLabel={modalContent.primaryBtnText}
        secondoryBtnariaLabel={modalContent.secondaryBtnText}
      />

            <BreadCrumbs
              items={[
                { 
                  id: isBPMN ? "subflows" : "decision-tables",
                  label: isBPMN ? t("Subflows") : t("Decision Tables"), 
                  href: getRoute(tenantKey)[isBPMN ? "SUBFLOW" : "DECISIONTABLE"]
                },
                { 
                  id: "create-new",
                  label: isBPMN ? t("Create a New Subflow") : t("Create a New Decision Table")
                },
                { 
                  id: "edit",
                  label: t("Edit")
                },
              ]}
              variant="minimized"
              underlined={true}
              dataTestId={`${diagramType.toLowerCase()}-breadcrumb`}
              ariaLabel={t(`${diagramType} Breadcrumb`)}
              onBreadcrumbClick={(item) => {
                if (item?.id === "subflows" || item?.id === "decision-tables") {
                  dispatch(push(getRoute(tenantKey)[isBPMN ? "SUBFLOW" : "DECISIONTABLE"]));
                }
              }}
            />
          <div className="toast-section">
              <Alert
                message={importAlertMessage}
                variant={AlertVariant.FOCUS}
                isShowing={showImportAlert}
                rightContent={<CustomProgressBar progress={importProgress} />}
              />
              <Alert
                message={successAlertMessage}
                variant={AlertVariant.SUCCESS}
                isShowing={showSuccessAlert}
              />
              <Alert
                message={errorAlertMessage}
                variant={AlertVariant.ERROR}
                isShowing={showErrorAlert}
              />
            </div>
            <div className="header-section-1">
              <div className="section-seperation-left">
                 <p className="form-title">
                     {isCreate ? t(`Unsaved ${diagramType}`) : processName}
                 </p>
              </div>
              <div className="section-seperation-right">
                 <div
                   className="form-status"
                   data-testid={`process-status-${processData?.id || 'new'}`}
                  >
                  <FormStatusIcon color={isPublished ? "#00C49A" : "#DAD9DA"} />
                  <span className="status-text">
                    {isPublished ? t("Published") : t("Unpublished")}
                  </span>
                </div>
                  <>
                  <V8CustomButton
                    onClick={saveFlow}
                    label={t(`Save ${diagramType}`)}
                    loading={savingFlow}
                    disabled={savingFlow || isPublished || !isWorkflowChanged}
                    dataTestId={`save-${diagramType.toLowerCase()}-layout`}
                    ariaLabel={t(`Save ${diagramType} Layout`)}
                  />
                  <V8CustomButton
                    onClick={() => {
                      if (isPublished) {
                        openConfirmModal("unpublish");
                      } else {
                        openConfirmModal("publish");
                      }
                    }}
                    label={t(publishText)}
                    aria-label={`${t(publishText)} ${t("Button")}`}
                    data-testid={isPublished ? "handle-unpublish-testid" : "handle-publish-testid"}
                    disabled={isPublishLoading}
                  />
                  </>
              </div>
            </div>

            <div className="header-section-2">
                <div className="section-seperation-left">
                    <V8CustomButton
                        label={t("Layout")}
                        onClick={() => handleTabClick('layout', null, null)}
                        selected={activeTab.primary === 'layout'}
                        dataTestId="designer-layout-testid"
                        ariaLabel={t("Designer Layout Button")}
                      />  
                    <V8CustomButton
                        label={t("Actions")}
                        onClick={editorActions}
                        selected={activeTab.primary === 'actions'}
                        dataTestId="designer-action-testid"
                        ariaLabel={t("Designer Actions Button")}
                      />                
                </div>
            </div>  

            { activeTab.primary === 'layout' && <div className="header-section-3">
                <div className="section-seperation-left">
                  {renderSecondaryControls()}
                </div>
                <div className="section-seperation-right">   
                  <V8CustomButton
                    label={t("Discard Changes")}
                    onClick={() => openConfirmModal("discard")}
                    disabled={!isWorkflowChanged}
                    dataTestId={`discard-${diagramType.toLowerCase()}-changes-testid`}
                    ariaLabel={t(`Discard ${diagramType} Changes`)}
                  />
                </div>
             </div> }   
        <div className="body-section processedit-layout">
          {/* {renderTabContent()} */}

      
       { activeTab.primary === 'actions' && <ProcessActionsTab
         newActionModal={activeTab.primary === 'actions'}
         diagramType={diagramType}
         renderUpload={renderUploadArea}
         onExport={handleExport}
       />}


       {activeTab.secondary === 'history' ? (
          <HistoryPage
            title={t("History")}
            loadMoreBtnText={t("Load More")}
            revertBtnText={t("Revert To This")}
            allHistory={historiesData?.processHistory || []}
            loadMoreBtnAction={loadMoreBtnAction}
            categoryType={CategoryType.WORKFLOW}
            revertBtnAction={fetchHistoryData}
            historyCount={historiesData?.totalCount || 0}
            currentVersionId={processData.id}
            refreshBtnAction={handleProcessHistory}
            loading={processHistoryLoading}
            disableAllRevertButton={isPublished}
            paginationModel={paginationModel}
            handlePaginationModelChange={handlePaginationModelChange}
          />
        ) : (
          showEditor && (
            <LoadingOverlay
              active={historyLoading}
              spinner
              text={t("Loading...")}
            >
              {renderEditor()}
            </LoadingOverlay>
          )
        )}
      <ExportDiagram
        showExportModal={selectedAction === EXPORT}
        onClose={() => setSelectedAction(null)}
        onExport={handleExport}
        fileName={fileName}
        modalTitle={t(`Export ${diagramType}`)}
        successMessage={t("Export Successful")}
        errorMessage={exportError}
      />
      {showErrorModal && (
        <PromptModal
          show={showErrorModal}
          onClose={handleCloseErrorModal}
          title={t("Error(s)")}
          message={errorMessage}
          primaryBtnAction={handleCloseErrorModal}
          primaryBtnText={t("Dismiss")}
          size="lg"
          type="error"
          primaryBtndataTestid="error-dismiss-button"
          primaryBtnariaLabel={t("Dismiss")}
        />
      )}
      {/* {selectedAction === IMPORT && <ImportProcess
        showModal={selectedAction === IMPORT}
        closeImport={() => setSelectedAction(null)}
        processId={processData.id}
        processVersion={{
          type: Process.type,
          majorVersion: processData?.majorVersion,
          minorVersion: processData?.minorVersion
        }}
        setImportXml={handleImportData}
        fileType={Process.extension}
      />} */}
              </div>
    </div>
  );
};

ProcessCreateEdit.propTypes = {
  type: PropTypes.string.isRequired,
};

export default ProcessCreateEdit;