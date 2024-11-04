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
  createProcess,
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
  compareDmnXML,
  //validateDecisionNames,
  validateDecisionNames,
} from "../../helper/processHelper";
import DmnEditor from "./Editors/DmnEditor/index.js";
import {
  setProcessData,
  setProcessDiagramXML,
} from "../../actions/processActions";

const EXPORT = "EXPORT";
const CategoryType = { FORM: "FORM", WORKFLOW: "WORKFLOW" };

const DecitionEditor = () => {
  const { processKey, step } = useParams();
  const isCreate = step === "create";
  const dispatch = useDispatch();
  const dmnRef = useRef();
  const { t } = useTranslation();

  const tenantKey = useSelector((state) => state.tenants?.tenantId);
  const redirectUrl = MULTITENANCY_ENABLED ? `/tenant/${tenantKey}/` : "/";
  const processData = useSelector((state) => state.process?.processData);
  const [selectedAction, setSelectedAction] = useState(null);
  const [newActionModal, setNewActionModal] = useState(false);
  const [exportError, setExportError] = useState(null);
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
  // handle history modal
  const handleHistoryModal = () => setHistoryModalShow(!historyModalShow);
  const [isProcessDetailsLoading, setIsProcessDetailsLoading] = useState(false);
  //const [lintErrors, setLintErrors] = useState([]);
  //const [isXmlChanged, setIsXmlChanged] = useState(false);

  useEffect(() => {
    setIsPublished(processData.status === "Published");
  }, [processData]);

  const publishText = isPublished ? "Unpublish" : "Publish";

  // get process name to dispaly
  const processName = useMemo(() => {
    if (!processData.processData) return;
    return extractDataFromDiagram(processData?.processData, true).name;
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

  const saveFlow = async (isPublishing = false) => {
    try {
      const dmnModeler = dmnRef.current?.getDmnModeler();
      const xml = await createXMLFromModeler(dmnModeler);
      if (!validateDecisionNames(xml, t)) {
        return;
      }
      if (!isCreate) {
        // If XML is the same as existing process data, no need to update
        const isEqual = await compareDmnXML(processData?.processData, xml);
        if (isEqual) {
          !isPublishing && toast.success(t("Dmn is already up to date"));
          return;
        }
      }

      setSavingFlow(true);
      // Check if `processId` exists; if so, update the process, otherwise create a new DMN
      const response = isCreate
        ? await createProcess({ type: "DMN", data: xml })
        : await updateProcess({ type: "DMN", id: processData.id, data: xml });

      dispatch(setProcessData(response.data));
      !isPublishing &&
        toast.success(
          t(`DMN ${isCreate ? "created" : "updated"} successfully`)
        );
      if (isCreate && !isPublishing) {
        dispatch(
          push(`${redirectUrl}decision-table/edit/${response.data.processKey}`)
        );
      }
      return response.data;
    } catch (error) {
      toast.error(t("Failed to save process"));
    } finally {
      setSavingFlow(false);
    }
  };

  // Function to handle publish/unpublish with XML validation
  const confirmPublishOrUnPublish = async () => {
    try {
      const dmnModeler = dmnRef.current?.getDmnModeler();
      const xml = await createXMLFromModeler(dmnModeler);

      // Validate the XML before publishing

      if (!isPublished && !validateDecisionNames(xml, t)) {
        return;
      }
      const actionFunction = isPublished ? unPublish : publish;
      const response = !isPublished ? await saveFlow(!isPublished) : null;
      closeModal(); // Close confirmation modal
      //incase of create if no response no need to call api
      if (isCreate && !response) return;

      setIsPublishLoading(true);

      // Perform the publish/unpublish action
      await actionFunction({
        id: response?.id || processData.id,
        data: xml,
        type: "DMN",
      });

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
        dispatch(push(`${redirectUrl}decision-table`)); // Redirect on publish
      }
      setIsPublished(!isPublished);
    } catch (error) {
      toast.error(
        t(`Failed to ${isPublished ? "unpublish" : "publish"} the DMN`)
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
      const data = isCreate ? defaultDmnXmlData : processData?.processData;
      if (await validateDecisionNames(data)) {
        const element = document.createElement("a");
        const file = new Blob([data], {
          type: "text/dmn",
        });
        element.href = URL.createObjectURL(file);
        const processName =
          extractDataFromDiagram(data, true).name.replaceAll(" / ", "-") +
          ".dmn";
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

  const cancel = () => dispatch(push(`${redirectUrl}decision-table`));

  const editorActions = () => setNewActionModal(true);

  const handleDuplicateProcess = () => {
    handleToggleConfirmModal();
    dispatch(setProcessDiagramXML(processData.processData));
    dispatch(push(`${redirectUrl}decision-table/create`));
  };

  const handleDiscardConfirm = () => {
    if (dmnRef.current) {
      dmnRef.current?.handleImport(
        isCreate ? defaultDmnXmlData : processData.processData
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
            "Publishing will lock the DMN. To save changes on further edits, you will need to unpublish the DMN first.",
          primaryBtnAction: confirmPublishOrUnPublish,
          secondayBtnAction: closeModal,
          primaryBtnText: "Publish This DMN",
          secondaryBtnText: "Cancel",
        };
      case "unpublish":
        return {
          title: "Confirm Unpublish",
          message:
            "This DMN is currently live. To save changes to DMN edits, you need to unpublish it first.By unpublishing this DMN, you will make it unavailable for new submission to those who currently have access to it. You can republish the DMN after making your edits.",
          primaryBtnAction: confirmPublishOrUnPublish,
          secondayBtnAction: closeModal,
          primaryBtnText: "Unpublish and Edit This DMN",
          secondaryBtnText: "Cancel, Keep This DMN published",
        };
      case "discard":
        return {
          title: "Are you Sure you want to Discard DMN Changes",
          message:
            "Are you sure you want to discard all the changes to the DMN?",
          messageSecondary: "This action cannot be undone.",
          primaryBtnAction: handleDiscardConfirm,
          secondayBtnAction: closeModal,
          primaryBtnText: "Discard Changes",
          secondaryBtnText: "Cancel",
        };
      case "duplicate":
        return {
          title: "Create Duplicate",
          message: "Are you Sure want to Duplicate current DMN",
          primaryBtnAction: handleDuplicateProcess,
          secondayBtnAction: closeModal,
          primaryBtnText: "Yes, Duplicate This DMN",
          secondaryBtnText: "No, Do Not Duplicate This DMN",
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
                {isCreate ? t("Unsaved DMN") : processName}
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
                dataTestid="handle-publish-testid"
                disabled={isPublishLoading}
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
                    dataTestid="DMN-history-button-testid"
                    ariaLabel={t("DMN History Button")}
                  />
                )}
              </div>
              <div>
                <CustomButton
                  variant="primary"
                  size="md"
                  className="mx-2"
                  onClick={saveFlow}
                  label={t("Save DMN")}
                  buttonLoading={savingFlow}
                  dataTestid="save-DMN-layout"
                  ariaLabel={t("Save DMN Layout")}
                  disabled={savingFlow || isPublished}
                />
                <CustomButton
                  variant="secondary"
                  size="md"
                  onClick={() => {
                    openConfirmModal("discard");
                  }}
                  label={t("Discard Changes")}
                  dataTestid="discard-DMN-changes-testid"
                  ariaLabel={t("Discard DMN Changes")}
                />
              </div>
            </div>
          </Card.Header>
        </div>
        <Card.Body>
          {isProcessDetailsLoading ? (
            <>loading...</>
          ) : (
            <DmnEditor
              ref={dmnRef}
              dmnXml={isCreate ? defaultDmnXmlData : processData?.processData}
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
        fileName={processName || "filename"}
        modalTitle={t("Export DMN")}
        successMessage={t("Export Successful")}
        errorMessage={exportError}
      />
    </div>
  );
};

export default DecitionEditor;
