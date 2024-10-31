import React, { useEffect, useState, useRef, useMemo } from "react";
import "./Modeler.scss";
import { useSelector, useDispatch } from "react-redux";
import { useParams } from "react-router-dom";
import { push } from "connected-react-router";
import {
  updateProcess,
  publish,
  unPublish,
  getProcessDetails,
  createSubflow,
} from "../../apiManager/services/processServices";
import Loading from "../../containers/Loading";
import { MULTITENANCY_ENABLED } from "../../constants/constants";
import { useTranslation } from "react-i18next";
import {
  createNewProcess,
  extractDataFromDiagram,
} from "../../components/Modeler/helpers/helper";
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
import {
  setProcessData,
  setProcessDiagramXML,
} from "../../actions/processActions";

const EXPORT = "EXPORT";
const CategoryType = { FORM: "FORM", WORKFLOW: "WORKFLOW" };

const WorkflowEditor = () => {
  const { processKey, step } = useParams();
  const isCreate = step === "create"; 
  const dispatch = useDispatch();
  const bpmnRef = useRef();
  const { t } = useTranslation();

  const tenantKey = useSelector((state) => state.tenants?.tenantId);
  const redirectUrl = MULTITENANCY_ENABLED ? `/tenant/${tenantKey}/` : "/";
  const processData = useSelector((state) => state.process?.processData);
  const [selectedAction, setSelectedAction] = useState(null);
  const [newActionModal, setNewActionModal] = useState(false);
  const [lintErrors, setLintErrors] = useState([]);
  const [exportError, setExportError] = useState(null);
  const defaultProcessXmlData = useSelector(
    (state) => state.process.defaultProcessXmlData
  );
  const [savingFlow, setSavingFlow] = useState(false);
  const [historyModalShow, setHistoryModalShow] = useState(false);
  const [isPublished, setIsPublished] = useState(
    processData?.status === "Published"
  );
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [modalType, setModalType] = useState("");
  const [isPublishLoading, setIsPublishLoading] = useState(false);
  // handle history modal
  const handleHistoryModal = () => setHistoryModalShow(!historyModalShow);
  const [isProcessDetailsLoading, setIsProcessDetailsLoading] = useState(false);


  useEffect(() => {
    setIsPublished(processData.status === "Published");
  }, [processData]);

  const publishText = isPublished ? "Unpublish" : "Publish";

  // get process name to dispaly 
  const processName = useMemo(() => {
    if (!processData.processData) return;
    return extractDataFromDiagram(processData?.processData).name;
  }, [processData]);

  //fetch process details using processkey
  useEffect(async () => {
    if (processKey) {
      try {
        setIsProcessDetailsLoading(true);
        const { data } = await getProcessDetails(processKey);
        setIsPublished(!isPublished);
        dispatch(setProcessData(data));
      } catch (error) {
        console.error(error);
      } finally {
        setIsProcessDetailsLoading(false);
      }
    }
  }, [processKey]);

  //reset the data 
  useEffect(() => {
    if (isCreate) {
      dispatch(setProcessData({}));
    }
    return () => {
      //if we click duplicate the the data will exist on the redux, so need to reset
      isCreate &&
        dispatch(setProcessDiagramXML(createNewProcess().defaultWorkflow.xml));
    };
  }, [isCreate]);


  const handleToggleConfirmModal = () => setShowConfirmModal(!showConfirmModal);
  const openConfirmModal = (type) => {
    setModalType(type);
    handleToggleConfirmModal();
  };


  const saveFlow = async () => {
    try {
      const bpmnModeler = bpmnRef.current?.getBpmnModeler();
      const xml = await createXMLFromModeler(bpmnModeler);

      if (!validateProcess(xml, lintErrors, t)) {
        return;
      }
      if (!isCreate) {
        // If XML is the same as existing process data, no need to update
        const isEqual = await compareXML(processData?.processData, xml);
        if (isEqual) {
          toast.success(t("Process is already up to date"));
          return;
        }
      }

      setSavingFlow(true);
      // Check if `processId` exists; if so, update the process, otherwise create a new subflow
      const response = isCreate
        ? await createSubflow({ type: "BPMN", data: xml })
        : await updateProcess({ type: "BPMN", id: processData.id, data: xml });

      dispatch(setProcessData(response.data));
      toast.success(
        t(`Subflow ${isCreate ? "created" : "updated"} successfully`)
      );
      if (isCreate) {
        dispatch(
          push(`${redirectUrl}subflow/edit/${response.data.processKey}`)
        );
      }
    } catch (error) {
      toast.error(t("Failed to save process"));
    } finally {
      setSavingFlow(false);
    }
  };

  // Function to handle publish/unpublish with XML validation
  const confirmPublishOrUnPublish = async () => {
    try {
      const bpmnModeler = bpmnRef.current?.getBpmnModeler();
      const xml = await createXMLFromModeler(bpmnModeler);

      // Validate the XML before publishing/unpublishing
      if (!validateProcess(xml, lintErrors)) {
        return; // Stop if validation fails
      }

      const actionFunction = isPublished ? unPublish : publish;
      closeModal(); // Close confirmation modal
      setIsPublishLoading(true);

      // Perform the publish/unpublish action
      await actionFunction({ id: processData.id, data: xml, type: "BPMN" });
      if (isPublished) {
        // Fetch updated process details after unpublish
        const updatedProcessDetails = await getProcessDetails(
          processData.processKey
        );
        dispatch(setProcessData(updatedProcessDetails.data));
        setIsPublished(false); // Set to unpublished
      }
      toast.success(
        t(`${isPublished ? "Unpublished" : "Published"} successfully`)
      );
      // Handle unpublish success by immediately fetching updated process details
      if (!isPublished) {
        dispatch(push(`${redirectUrl}subflow`)); // Redirect on publish
      }
      setIsPublished(!isPublished);
    } catch (error) {
      toast.error(
        t(`Failed to ${isPublished ? "unpublish" : "publish"} the BPMN`)
      );
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
        const processName =
          extractDataFromDiagram(processData?.processData).name.replaceAll(
            " / ",
            "-"
          ) + ".bpmn";
        element.download = processName.replaceAll(" ", "");
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

  const handleDuplicateProcess = () => {
    dispatch(setProcessDiagramXML(processData.processData));
    dispatch(push(`${redirectUrl}subflow/create`));
  };

  const handleDiscardConfirm = () => {
    if (bpmnRef.current) {
      bpmnRef.current?.handleImport(
        isCreate ? defaultProcessXmlData : processData.processData
      );
    }
    handleToggleConfirmModal();
  };

  if (isProcessDetailsLoading) return <Loading />;

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
        case "discard":
        return {
          title: "Are you Sure you want to Discard Subflow Changes",
          message:
            "Are you sure you want to discard all the changes to the subflow?",
          messageSecondary: "This action cannot be undone.",
          primaryBtnAction: handleDiscardConfirm,
          secondayBtnAction: closeModal,
          primaryBtnText: "Discard Changes",
          secondaryBtnText: "Cancel",
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
              {!isCreate && (
                <>
                  <div
                    className="mx-4 editor-header-text"
                    data-testid="deployment-name"
                  >
                    {processName}
                  </div>
                  <span className="d-flex align-items-center white-text mx-3">
                    <div
                      className={`status-${isPublished ? "live" : "draft"}`}
                    ></div>
                    {isPublished ? t("Live") : t("Draft")}
                  </span>
                </>
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
                {!isCreate && (
                  <CustomButton
                    variant="secondary"
                    size="md"
                    icon={<HistoryIcon />}
                    onClick={handleHistoryModal}
                    label={t("History")}
                    dataTestid="bpmn-history-button-testid"
                    ariaLabel={t("BPMN History Button")}
                  />
                )}
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
                  onClick={() => {
                    openConfirmModal("discard");
                  }}
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
              bpmnXml={
                isCreate ? defaultProcessXmlData : processData?.processData
              }
              setLintErrors={setLintErrors}
            />
          )}
        </Card.Body>
      </Card>
      <ActionModal
        newActionModal={newActionModal}
        onClose={() => setNewActionModal(false)}
        CategoryType={CategoryType.WORKFLOW}
        onAction={(action) => {
          if (action === "DUPLICATE") {
            handleDuplicateProcess();
          }
          setSelectedAction(action);
        }}
      />
      <ExportDiagram
        showExportModal={selectedAction === EXPORT}
        onClose={() => setSelectedAction(null)}
        onExport={handleExport}
        fileName={processName}
        modalTitle={t("Export BPMN")}
        successMessage={t("Export Successful")}
        errorMessage={exportError}
      />
    </div>
  );
};

export default WorkflowEditor;
