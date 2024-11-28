import React, { useEffect, useState, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useParams } from "react-router-dom";
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
} from "../../apiManager/services/processServices";
import Loading from "../../containers/Loading";
import { MULTITENANCY_ENABLED } from "../../constants/constants";
import { useTranslation } from "react-i18next";
import {
  createNewProcess,
  createNewDecision,
} from "../../components/Modeler/helpers/helper";
import {
  CustomButton,
  HistoryIcon,
  BackToPrevIcon,
  ConfirmModal,
  ErrorModal,
  HistoryModal,
} from "@formsflow/components";
import { Card } from "react-bootstrap";
import ActionModal from "../Modals/ActionModal";
import ExportDiagram from "../Modals/ExportDiagrams";
import { toast } from "react-toastify";
import {
  createXMLFromModeler,
  validateProcess,
  compareXML,
  compareDmnXML,
  validateDecisionNames
} from "../../helper/processHelper";
import BpmnEditor from "./Editors/BpmnEditor/BpmEditor.js";
import DmnEditor from "./Editors/DmnEditor/DmnEditor.js";
import {
  setProcessData,
  setProcessDiagramXML,
  setDescisionDiagramXML,
} from "../../actions/processActions";
import { useMutation, useQuery } from "react-query";
import LoadingOverlay from "react-loading-overlay-ts";
import ImportProcess from "../Modals/ImportProcess";
import NavigateBlocker from "../CustomComponents/NavigateBlocker.jsx";

const EXPORT = "EXPORT";
const IMPORT = "IMPORT";
const CategoryType = { FORM: "FORM", WORKFLOW: "WORKFLOW" };

const ProcessCreateEdit = ({ type }) => {
  const { processKey, step } = useParams();
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
  const { t } = useTranslation();
  const tenantKey = useSelector((state) => state.tenants?.tenantId);
  const redirectUrl = MULTITENANCY_ENABLED ? `/tenant/${tenantKey}/` : "/";
  const processData = useSelector((state) => state.process?.processData);
  const [selectedAction, setSelectedAction] = useState(null);
  const [newActionModal, setNewActionModal] = useState(false);
  const [lintErrors, setLintErrors] = useState([]);
  const [exportError, setExportError] = useState(null);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const defaultProcessXmlData = useSelector(
    (state) => state.process.defaultProcessXmlData
  );
  const defaultDmnXmlData = useSelector(
    (state) => state.process.defaultDmnXmlData
  );
  const [savingFlow, setSavingFlow] = useState(false);
  const [historyModalShow, setHistoryModalShow] = useState(false);
  const [isPublished, setIsPublished] = useState(
    processData?.status === "Published"
  );

  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [modalType, setModalType] = useState("");
  const [isPublishLoading, setIsPublishLoading] = useState(false);
  const [isReverted, setIsReverted] = useState(false);
  const [isWorkflowChanged, setIsWorkflowChanged] = useState(false);
  
  const isDataFetched = useRef();
  useEffect(() => {
    setIsPublished(processData.status === "Published");
  }, [processData]);

  
  const publishText = isPublished ? t("Unpublish") : t("Publish");
  const processName = processData.name;
  const fileName = (processName + Process.extension).replaceAll(" ", "");

  // fetching process data
  const { isLoading: isProcessDetailsLoading } = useQuery(
    ["processDetails", processKey],
    () => getProcessDetails(processKey),
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
  // handle history modal
  const handleToggleHistoryModal = () => setHistoryModalShow(!historyModalShow);

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
      if (!isReverted && !isCreateMode && isEqual)
        return handleAlreadyUpToDate(isPublishing);

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

  const handleProcessHistory = () => {
    handleToggleHistoryModal();
    fetchAllHistories({
      parentProcessKey: processData.parentProcessKey, // passing process key to get histories data
      page: 1,
      limit: 4,
    });
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
      processData.processKey
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

  const cancel = () => {
    dispatch(push(`${redirectUrl}${Process.route}`));
  };

  const editorActions = () => setNewActionModal(true);

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
        secondayBtnAction: secondaryAction,
      };
    };

    switch (modalType) {
      case "publish":
        return getModalConfig(
          t("Confirm Publish"),
          t(
            `Publishing will lock the ${Process.type}. To save changes on further edits,
             you will need to unpublish the ${Process.type} first.`
          ),
          t(`Publish This ${Process.type}`),
          t("Cancel"),
          confirmPublishOrUnPublish,
          closeModal
        );
      case "unpublish":
        return getModalConfig(
          t("Confirm Unpublish"),
          t(
            `This ${Process.type} is currently live. To save changes to ${Process.type} edits, 
            you need to unpublish it first.`
          ),
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
        secondayBtnAction={modalContent.secondayBtnAction}
        primaryBtnText={modalContent.primaryBtnText}
        secondaryBtnText={modalContent.secondaryBtnText}
        size="md"
      />
      <Card className="editor-header">
        <Card.Body>
          <div className="d-flex justify-content-between align-items-center">
            <div className="d-flex align-items-center">
              <BackToPrevIcon
                onClick={cancel}
                data-testid="back-to-prev-icon-testid"
                aria-label={t("Back to Previous")}
              />
              <div
                className="mx-4 editor-header-text"
                data-testid="deployment-name"
              >
                {isCreate ? t(`Unsaved ${diagramType}`) : processName}
              </div>
              {!isCreate && (
                <span className="d-flex align-items-center white-text mx-3">
                  <div
                    className={`status-${isPublished ? "live" : "draft"}`}
                  ></div>
                  {isPublished ? t("Live") : t("Draft")}
                </span>
              )}
            </div>
            <div>
              <CustomButton
                variant="dark"
                size="md"
                className="mx-2"
                label={t("Actions")}
                onClick={editorActions}
                dataTestid="designer-action-testid"
                ariaLabel={t("Designer Actions Button")}
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
                disabled={isPublishLoading}
                dataTestid="handle-publish-testid"
                ariaLabel={`${t(publishText)} ${t("Button")}`}
              />
            </div>
          </div>
        </Card.Body>
      </Card>

      <Card>
        <div className="wraper">
          <Card.Header>
            <div className="d-flex justify-content-between align-items-center w-100">
              <div className="d-flex align-items-center">
                <div className="mx-2 builder-header-text">{t("Flow")}</div>
                {!isCreate && (
                  <CustomButton
                    variant="secondary"
                    size="md"
                    icon={<HistoryIcon />}
                    onClick={handleProcessHistory}
                    label={t("History")}
                    dataTestid={`${diagramType.toLowerCase()}-history-button-testid`}
                    ariaLabel={t(`${diagramType} History Button`)}
                  />
                )}
              </div>
              <div>
                <CustomButton
                  variant="primary"
                  size="md"
                  className="mx-2"
                  onClick={saveFlow}
                  label={t(`Save ${diagramType}`)}
                  buttonLoading={savingFlow}
                  disabled={savingFlow || isPublished || !isWorkflowChanged}
                  dataTestid={`save-${diagramType.toLowerCase()}-layout`}
                  ariaLabel={t(`Save ${diagramType} Layout`)}
                />
                <CustomButton
                  variant="secondary"
                  size="md"
                  onClick={() => openConfirmModal("discard")}
                  label={t("Discard Changes")}
                  disabled={!isWorkflowChanged}
                  dataTestid={`discard-${diagramType.toLowerCase()}-changes-testid`}
                  ariaLabel={t(`Discard ${diagramType} Changes`)}
                />
              </div>
            </div>
          </Card.Header>
        </div>
        <Card.Body>
          <LoadingOverlay
            active={historyLoading}
            spinner
            text={t("Loading...")}
          >
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
        </Card.Body>
      </Card>

      <ActionModal
        newActionModal={newActionModal}
        onClose={() => setNewActionModal(false)}
        CategoryType={CategoryType.WORKFLOW}
        onAction={(action) => {
          if (action === "DUPLICATE") {
            openConfirmModal("duplicate");
          }
          setSelectedAction(action);
        }}
        isCreate={isCreate}
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
      <HistoryModal
        show={historyModalShow}
        onClose={handleToggleHistoryModal}
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
      />
      {selectedAction === IMPORT && <ImportProcess
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
      />}
    </div>
  );
};
ProcessCreateEdit.propTypes = {
  type: PropTypes.string.isRequired,
};

export default ProcessCreateEdit;