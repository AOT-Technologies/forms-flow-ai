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
import { MULTITENANCY_ENABLED } from "../../../constants/constants";
import { useTranslation } from "react-i18next";
import {
  createNewProcess,
  createNewDecision,
} from "../../../components/Modeler/helpers/helper";
import {
  ConfirmModal,
  ErrorModal,
  // HistoryModal,
  V8CustomButton,
  FormStatusIcon,
  FileUploadArea,
} from "@formsflow/components";
import ProcessActionsTab from "./ProcessActionsTab";
import ExportDiagram from "../../../components/Modals/ExportDiagrams";
import { toast } from "react-toastify";
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
const COMPLETE_PROGRESS = 100;

const ProcessCreateEdit = ({ type }) => {
  const { processKey, step } = useParams();
  const location = useLocation();
  const isCreate = step === "create";
  const isBPMN = type === "BPMN";
  const Process = isBPMN
    ? {
      name: "Subflow",
      type: "BPMN",
      route: "subflow",
      extension: ".bpmn",
      fileType: "text/bpmn",
    }
    : {
      name: "Decision Table",
      type: "DMN",
      route: "decision-table",
      extension: ".dmn",
      fileType: "text/dmn",
    };

  const diagramType = Process.type;
  const dispatch = useDispatch();
  const bpmnRef = useRef();
  const dmnRef = useRef();
  const uploadTimerRef = useRef(null);
  const { t } = useTranslation();
  const tenantKey = useSelector((state) => state.tenants?.tenantId);
  const redirectUrl = MULTITENANCY_ENABLED ? `/tenant/${tenantKey}/` : "/";
  const processData = useSelector((state) => state.process?.processData);
  const [selectedAction, setSelectedAction] = useState(null);
  const [lintErrors, setLintErrors] = useState([]);
  const [exportError, setExportError] = useState(null);
  const [importError, setImportError] = useState(null);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [activeTab, setActiveTab] = useState({ primary: 'layout', secondary: null, tertiary: null });
  
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
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState(null);
  const isDataFetched = useRef();

  const tabConfig = {
    primary: {
      layout: {
        label: "Layout",
        query: "?tab=layout",
        secondary: {
          history: {
            label: "History",
            query: "?tab=layout&sub=history"
          }
        }
      },
      actions: {
        label: "Actions",
        query: "?tab=actions"
      }
  
    } 
  };
    /**
   * Manages simulated upload progress while awaiting server response
   */
    useEffect(() => {
      if (importLoader) {
        // clearUploadTimer();
  
        uploadTimerRef.current = setInterval(() => {
          setUploadProgress((prevProgress) => {
            const nextProgress = prevProgress + UPLOAD_PROGRESS_INCREMENT;
            return Math.min(nextProgress, COMPLETE_PROGRESS);
          });
        }, UPLOAD_PROGRESS_INTERVAL);
      } 
      // else {
      //   clearUploadTimer();
      // }
  
      // return () => {
      //   clearUploadTimer();
      // };
    }, [importLoader]);
  useEffect(() => {
    setIsPublished(processData.status === "Published");
  }, [processData]);

  const handleTabClick = (primary, secondary = null, tertiary = null) => {
    if (isCreate && primary !== 'layout') {
      return;
    }
    
    const newTab = { primary, secondary, tertiary };
    setActiveTab(newTab);
    
    const queryParams = new URLSearchParams();
    queryParams.set("tab", primary);
    if (secondary) queryParams.set("sub", secondary);
    if (tertiary) queryParams.set("subsub", tertiary);
    
    dispatch(
        push({
          pathname: location.pathname,
          search: `?${queryParams.toString()}`,
        })
    );
  };

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const tab = isCreate ? "layout" : (queryParams.get("tab") || "layout");
    const sub = queryParams.get("sub");
    const subsub = queryParams.get("subsub");
    
    setActiveTab({
      primary: tab,
      secondary: sub,
      tertiary: subsub
    });
  }, [location.search, isCreate]);

  
  const publishText = isPublished ? t("Unpublish") : t("Publish");
  const processName = processData.name;
  const fileName = (processName + Process.extension).replaceAll(" ", "");
  
  // fetching process data
  const { isLoading: isProcessDetailsLoading } = useQuery(
    ["processDetails", processKey],
    () => getProcessDetails({processKey}),
    {
      cacheTime: 0, // Disable caching if not disabled the previous data will be cached
      staleTime: 0, // Data is always treated as stale
      enabled: !!processKey && !isDataFetched.current, // Run only if processKey exists and data hasn't been fetched
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
      getProcessHistory({ parentProcessKey, page, limit }) // this is api calling function and mutate function accepting some parameter and passing to the apicalling function
  );

  useEffect(() => {
    if (activeTab.secondary === 'history') {
        fetchAllHistories({
            parentProcessKey: processData.parentProcessKey,
            page: 1,
            limit: 4,
        });
    }
}, [activeTab]);

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
    },
  });

  const processDataXML = isReverted
    ? historyData?.processData
    : processData?.processData;

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
      const modeler = getModeler(isBPMN);
      const xml = await createXMLFromModeler(modeler);

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

  const handleAlreadyUpToDate = (isPublished) => {
    if (!isPublished) {
      toast.success(t(`${Process.name} is already up to date`));
    }
  };

  const loadMoreBtnAction = () => {
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

  const handleSaveSuccess = (response, isCreate, isPublished) => {
    const processType = Process.type; // Uses Process.type directly
    const actionMessage = isCreate ? t("created") : t("updated");
    const processName = response.data?.name || response.data?.processKey;

    if (!isPublished) {
      toast.success(
        t(
          `${processType} ${processName} has been ${actionMessage} successfully`
        )
      );
    }

    if (isCreate) {
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
      const modeler = getModeler(isBPMN);
      const xml = await createXMLFromModeler(modeler);

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

      toast.success(
        t(`${isPublished ? "Unpublished" : "Published"} successfully`)
      );

      if (!isPublished) {
        redirectToFlow();
      }

      setIsPublished(!isPublished);
    } catch (error) {
      handlePublishError(isPublished, type);
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

  const handlePublishError = (isPublished, type) => {
    toast.error(
      t(`Failed to ${isPublished ? "unpublish" : "publish"} the ${type}`)
    );
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
    setUploadProgress(INITIAL_UPLOAD_PROGRESS);
    setSelectedFile(file); // Set file first so error state can be displayed
    
    try {
      // Validate file type
      if (!isValidFileType(file)) {
        setImportError(
          t(`The file format is invalid. Please import a ${Process.extension} file.`)
        );
        setImportLoader(false);
        setUploadProgress(0);
        return;
      }

      // Read file content
      const fileContent = await file.text();

      // Validate XML content
      if (!fileContent || fileContent.trim() === '') {
        setImportError(t('The file is empty. Please import a valid file.'));
        setImportLoader(false);
        setUploadProgress(0);
        return;
      }

      // Validate XML structure
      if (!isValidXMLContent(fileContent)) {
        setImportError(
          t(`The file content is invalid. Please import a valid ${Process.type} file.`)
        );
        setImportLoader(false);
        setUploadProgress(0);
        return;
      }
      
      setUploadProgress(COMPLETE_PROGRESS);
      // Import to editor
      const ref = isBPMN ? bpmnRef : dmnRef;
      if (ref.current) {
        ref.current?.handleImport(fileContent);
        enableWorkflowChange();
        // toast.success(t(`${Process.type} imported successfully`));
      }
    } catch (error) {
      console.error('Import failed:', error);
      setImportError(
        t(error.message || 'An error occurred during import. Please try again.')
      );
      setUploadProgress(0);
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
    setUploadProgress(0);
    setSelectedFile(null);

  }, []);
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
      if (processId) {
        // Update an existing process
        const response = await updateProcess({
          id: processId,
          data: xml,
          type: fileType === ".bpmn" ? "bpmn" : "dmn",
        });
        dispatch(setProcessData(response?.data));
        handleImportData(xml);
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
        if (response) {
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
      setImportError(
        error?.response?.data?.message || "An error occurred during import."
      );
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
      />
    );
  };

    // const cancel = () => {
  //   dispatch(push(`${redirectUrl}${Process.route}`));
  // };

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

  if (isProcessDetailsLoading) return <Loading />;

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


  const handleImportData = (xml) => {
    const ref = isBPMN ? bpmnRef : dmnRef;
    if (ref.current) {
      ref.current?.handleImport(xml);
    }
  };
  
  

  const renderSecondaryControls = () => {
    const currentTab = tabConfig.primary[activeTab.primary];
    if (!currentTab?.secondary) return null;
    return (
      <div className="d-flex gap-2">
        {Object.entries(currentTab.secondary).map(([key, config]) => {
            const isDisabled = isCreate && key === 'history';
            return (
                <V8CustomButton
                    key={key}
                    label={t(config.label)}
                    onClick={() => !isDisabled && handleTabClick(activeTab.primary, key)}
                    selected={activeTab.secondary === key}
                    disabled={isDisabled}
                />
            );
        })}
      </div>
    );
  };

  const renderTabContent = () => {
    if (activeTab.primary === 'layout') {
        return (
            <LoadingOverlay active={historyLoading} spinner text={t("Loading...")}>
                {isBPMN ? (
                  <BpmnEditor
                    onChange={enableWorkflowChange}
                    ref={bpmnRef}
                    bpmnXml={isCreate ? defaultProcessXmlData : processDataXML}
                    setLintErrors={setLintErrors}
                  />
                ) : (
                  <DmnEditor
                    onChange={enableWorkflowChange}
                    ref={dmnRef}
                    dmnXml={isCreate ? defaultDmnXmlData : processDataXML}
                  />
                )}
            </LoadingOverlay>
        );
    }
    return null;
  };

  console.log(historiesData,'historiesData');
  console.log(fetchHistoryData,'fetchHistoryData');
  console.log(loadMoreBtnAction,'loadMoreBtnAction'); 
  return (
    <div>
      <NavigateBlocker isBlock={isWorkflowChanged} message={"You have made changes that are not saved yet"}  />
      <ConfirmModal
        show={showConfirmModal}
        title={modalContent.title}
        message={modalContent.message}
        messageSecondary={modalContent.messageSecondary || ""}
        primaryBtnAction={modalContent.primaryBtnAction}
        onClose={closeModal}
        secondaryBtnAction={modalContent.secondaryBtnAction}
        primaryBtnText={modalContent.primaryBtnText}
        secondaryBtnText={modalContent.secondaryBtnText}
        size="md"
      />

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
                    isPublished
                            ? openConfirmModal("unpublish")
                            : openConfirmModal("publish");
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
                {Object.entries(tabConfig.primary).map(([key, config]) => {
                    const isDisabled = isCreate && key !== 'layout';
                    return (
                        <V8CustomButton
                            key={key}
                            label={t(config.label)}
                            onClick={() => !isDisabled && handleTabClick(key)}
                            selected={activeTab.primary === key}
                            disabled={isDisabled}
                        />
                    );
                })}
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
        <div className="body-section bpmn-dmn-edit-layout">
          {renderTabContent()}
        </div>

      
       <ProcessActionsTab
         newActionModal={activeTab.primary === 'actions'}
         diagramType={diagramType}
         renderUpload={renderUploadArea}
         onExport={handleExport}
       />

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
        <ErrorModal
          show={showErrorModal}
          onClose={handleCloseErrorModal}
          title={t("Error(s)")}
          message={errorMessage}
          primaryBtnAction={handleCloseErrorModal}
          primaryBtnText={t("Dismiss")}
        />
      )}
      {/* <HistoryModal
        show={activeTab.secondary === 'history'}
        onClose={() => handleTabClick('layout')}
        title={t("History")}
        loadMoreBtnText={t("Load More")}
        revertBtnText={t("Revert To This")}
        allHistory={historiesData?.processHistory || []}
        loadMoreBtnAction={loadMoreBtnAction}
        categoryType={CategoryType.WORKFLOW}
        revertBtnAction={fetchHistoryData}
        historyCount={historiesData?.totalCount || 0}
        currentVersionId={processData.id}
        disableAllRevertButton={isPublished}
      /> */}
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
  );
};

ProcessCreateEdit.propTypes = {
  type: PropTypes.string.isRequired,
};

export default ProcessCreateEdit;