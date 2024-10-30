import React, { useEffect, useState, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useParams } from "react-router-dom";
import { push } from "connected-react-router";
import {
  fetchDiagram,
  updateProcess,
  publish,
  unPublish,
  getProcessDetails,
  createSubflow
} from "../../apiManager/services/processServices";
import Loading from "../../containers/Loading";
import { MULTITENANCY_ENABLED } from "../../constants/constants";
import { useTranslation } from "react-i18next";
import { extractDataFromDiagram } from "../../components/Modeler/helpers/helper";
import {
  CustomButton,
  HistoryIcon,
  BackToPrevIcon,
  ConfirmModal,
} from "@formsflow/components";
import { Card } from "react-bootstrap";
import ActionModal from "../Modals/ActionModal";
import ExportDiagram from "../Modals/ExportDiagrams";
import { toast } from "react-toastify";
import {
  createXMLFromModeler,
  validateProcess,
  compareXML,
} from "../../helper/processHelper";
import BpmnEditor from "./Editors/BpmnEditor";
import { createNewProcess } from "./helpers/helper";
import { setProcessData } from "../../actions/processActions";

const EXPORT = "EXPORT";
const CategoryType = { FORM: "FORM", WORKFLOW: "WORKFLOW" };

const WorkflowEditor = () => {
  const tenantKey = useSelector((state) => state.tenants?.tenantId);
  const { processId } = useParams();
  const dispatch = useDispatch();
  //const diagramXML = useSelector((state) => state.process.processDiagramXML);
  const isPublicDiagram = useSelector((state) => state.process.isPublicDiagram);
  //const processStatus = useSelector((state) => state.process?.processData?.status);
  const [diagramLoading, setDiagramLoading] = useState(false);
  const [selectedAction, setSelectedAction] = useState(null);
  const [newActionModal, setNewActionModal] = useState(false);
  const [lintErrors, setLintErrors] = useState([]);
  const [deploymentName, setDeploymentName] = useState("");
  const [exportError, setExportError] = useState(null);
  const bpmnRef = useRef();
  const processData = useSelector((state) => state.process?.processData);
  const [savingFlow, setSavingFlow] = useState(false);
  //const [publishFlow, setPublishFlow] = useState(false);
  //const [showDiscardModal, setShowDiscardModal] = useState(false);
  const [historyModalShow, setHistoryModalShow] = useState(false);
  // handle history modal
  const handleHistoryModal = () => setHistoryModalShow(!historyModalShow);
  //const handleHanldeDisacardModal = () => setShowDiscardModal(!showDiscardModal);

  const redirectUrl = MULTITENANCY_ENABLED ? `/tenant/${tenantKey}/` : "/";
  const { t } = useTranslation();
  const [isPublished, setIsPublished] = useState( processData?.status == "Published" ? true : false  );
  useEffect(() => {
    processData.status === "Published" ? setIsPublished(true) : setIsPublished(false);
  }, [processData]);

  const publishText = isPublished ? "Unpublish" : "Publish";
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [modalType, setModalType] = useState("");
  const [isPublishLoading, setIsPublishLoading] = useState(false);
  const processList = useSelector((state) => state.process?.processList);
  const [isProcessDetailsLoading, setIsProcessDetailsLoading] = useState(false);
 
  useEffect(() => {
    if (processList.processKey) {
      setIsProcessDetailsLoading(true);
      getProcessDetails(processList.processKey).then((response) => {
        const { data } = response;
        setIsPublished(!isPublished);
        dispatch(setProcessData(data));
        setIsProcessDetailsLoading(false);
      });
    }
  }, [processList.processKey]);

  useEffect(() => {
    if (processData) {
      const extractedName = extractDataFromDiagram(
        processData?.processData
      ).name.replaceAll(" / ", "-");
      setDeploymentName(extractedName);
    }
  }, [processData]);

  useEffect(() => {
    if (processId) {
      setDiagramLoading(true);
      if (MULTITENANCY_ENABLED && isPublicDiagram === null) {
        dispatch(push(`${redirectUrl}subflow`));
      } else {
        const updatedTenantKey =
          MULTITENANCY_ENABLED && !isPublicDiagram ? null : tenantKey;
        dispatch(
          fetchDiagram(processId, updatedTenantKey, () =>
            setDiagramLoading(false)
          )
        );
      }
    } else {
      const newProcess = createNewProcess();
      dispatch(setProcessData(newProcess.defaultWorkflow.xml));
    }
  }, [processId, dispatch, tenantKey, isPublicDiagram]);

  const handleToggleConfirmModal = () => setShowConfirmModal(!showConfirmModal);
  const openConfirmModal = (type) => {
    setModalType(type);
    handleToggleConfirmModal();
  };

// Function to handle publish/unpublish with XML validation
// Function to handle publish/unpublish with XML validation
const confirmPublishOrUnPublish = async () => {
  try {
    const bpmnModeler = bpmnRef.current?.getBpmnModeler();
    const xml = await createXMLFromModeler(bpmnModeler);

    // Validate the XML before publishing/unpublishing
    if (!validateProcess(xml,lintErrors)) {
      return; // Stop if validation fails
    }

    const actionFunction = isPublished ? unPublish : publish;
    closeModal(); // Close confirmation modal
    setIsPublishLoading(true);

    // Perform the publish/unpublish action
    const response = await actionFunction({ id: processData.id, data: xml, type: "BPMN" });

    // Handle unpublish success by immediately fetching updated process details
    if (response?.status === 200 || response?.success) {
      if (isPublished) {
        // Fetch updated process details after unpublish
        const updatedProcessDetails = await getProcessDetails(processId);
        dispatch(setProcessData(updatedProcessDetails.data));
        setIsPublished(false); // Set to unpublished
      } else {
        // If publishing, update state as published
        setIsPublished(true);
      }
      toast.success(t(`${isPublished ? "Unpublished" : "Published"} successfully`));
      if (!isPublished) {
        dispatch(push(`${redirectUrl}subflow`)); // Redirect on publish
      }
    } else {
      toast.error(t(`Failed to ${isPublished ? "unpublish" : "publish"} the BPMN`));
    }
  } catch (error) {
    toast.error(t(`Failed to ${isPublished ? "unpublish" : "publish"} the BPMN`));
    console.error("Error in publish/unpublish:", error.message);
  } finally {
    setIsPublishLoading(false);
  }
};

  
  
  const closeModal = () => {
    setModalType("");
    handleToggleConfirmModal();
  };
  const handleExport = async () => {
    try {
      if (await validateProcess(processData?.processData)) {
        const element = document.createElement("a");
        const file = new Blob([processData?.processData], {
          type: "text/bpmn",
        });
        element.href = URL.createObjectURL(file);
        const deploymentName =
          extractDataFromDiagram(processData?.processData).name.replaceAll(
            " / ",
            "-"
          ) + ".bpmn";
        element.download = deploymentName.replaceAll(" ", "");
        document.body.appendChild(element);
        element.click();
        setExportError(null);
      } else {
        setExportError("Process validation failed.");
      }
    } catch (error) {
      setExportError(error.message || "Export failed due to an error.");
    }
  };


  const cancel = () => dispatch(push(`${redirectUrl}subflow`));

  const editorActions = () => setNewActionModal(true);

  const saveFlow = async () => {
    try {
      const bpmnModeler = bpmnRef.current?.getBpmnModeler();
      const xml = await createXMLFromModeler(bpmnModeler);
      
      if (!validateProcess(xml, lintErrors, t)) {
        return;
      }
  
      // If XML is the same as existing process data, no need to update
      const isEqual = await compareXML(processData?.processData, xml);
      if (isEqual) {
        toast.success(t("Process is already up to date"));
        return;
      }
  
      setSavingFlow(true);
  
      // Check if `processId` exists; if so, update the process, otherwise create a new subflow
      const response = processId
        ? await updateProcess({ type: "BPMN", id: processData.id, data: xml })
        : await createSubflow({ type: "BPMN", data: xml });
  
      dispatch(setProcessData(response.data));
      toast.success(t (processId ? "Process updated successfully" : "Subflow created successfully"));
      setSavingFlow(false);
  
    } catch (error) {
      setSavingFlow(false);
      toast.error(t("Failed to save process"));
    }
  };
  

  const handleDiscardConfirm = () => {
    if (bpmnRef.current) {
      //import the existing process data to bpmn
      //bpmnRef.current?.handleImport(processData?.processData);
      processId
        ? bpmnRef.current?.handleImport(processData?.processData)
        : bpmnRef.current?.handleImport(processData);
    }
  };
  
  if (diagramLoading) return <Loading />;
  

  const getModalContent = () => {
    switch (modalType) {
      case "publish":
        return {
          title: "Confirm Publish",
          message:
            "Publishing will lock the BPMN. To save changes on further edits, you will need to unpublish the BPMN first.",
          primaryBtnAction: confirmPublishOrUnPublish,
          secondayBtnAction: closeModal,
          primaryBtnText: "Publish This BPMN",
          secondaryBtnText: "Cancel",
        };
      case "unpublish":
        return {
          title: "Confirm Unpublish",
          message:
            "This BPMN is currently live. To save changes to BPMN edits, you need to unpublish it first.By unpublishing this BPMN, you will make it unavailable for new submission to those who currently have access to it. You can republish the BPMN after making your edits.",
          primaryBtnAction: confirmPublishOrUnPublish,
          secondayBtnAction: closeModal,
          primaryBtnText: "Unpublish and Edit This BPMN",
          secondaryBtnText: "Cancel, Keep This BPMN published",
        };
      default:
        return {};
    }
  };
  const modalContent = getModalContent();

  return (
    <div>
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
                {deploymentName}
              </div>
              <span className="d-flex align-items-center white-text mx-3">
                <div
                  className={`status-${isPublished ? "live" : "draft"}`}
                ></div>
                {isPublished ? t("Live") : t("Draft")}
              </span>
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
            <div
              className="d-flex justify-content-between align-items-center"
              style={{ width: "100%" }}
            >
              <div className="d-flex align-items-center">
                <div className="mx-2 builder-header-text">{t("Flow")}</div>
                <CustomButton
                  variant="secondary"
                  size="md"
                  icon={<HistoryIcon />}
                  onClick={handleHistoryModal}
                  label={t("History")}
                  dataTestid="bpmn-history-button-testid"
                  ariaLabel={t("BPMN History Button")}
                />
              </div>
              <div>
                <CustomButton
                  variant="primary"
                  size="md"
                  className="mx-2"
                  onClick={saveFlow}
                  label={t("Save BPMN")}
                  buttonLoading={savingFlow}
                  dataTestid="save-bpmn-layout"
                  ariaLabel={t("Save Bpmn Layout")}
                  disabled={isPublished}
                />
                <CustomButton
                  variant="secondary"
                  size="md"
                  onClick={handleDiscardConfirm}
                  label={t("Discard Changes")}
                  dataTestid="discard-bpmn-changes-testid"
                  ariaLabel={t("Discard BPMN Changes")}
                />
              </div>
            </div>
          </Card.Header>
        </div>
        <Card.Body>
          {isProcessDetailsLoading ? (
            <>loading...</>
          ) : (
            <BpmnEditor
              ref={bpmnRef}
              bpmnXml={processId ? processData?.processData : processData}
              setLintErrors={setLintErrors}
            />
          )}
        </Card.Body>
      </Card>
      <ActionModal
        newActionModal={newActionModal}
        onClose={() => setNewActionModal(false)}
        CategoryType={CategoryType.WORKFLOW}
        onAction={setSelectedAction}
      />
      <ExportDiagram
        showExportModal={selectedAction === EXPORT}
        onClose={() => setSelectedAction(null)}
        onExport={handleExport}
        fileName={deploymentName}
        modalTitle={t("Export BPMN")}
        successMessage={t("Export Successful")}
        errorMessage={exportError}
      />
    </div>
  );
};

export default WorkflowEditor;
