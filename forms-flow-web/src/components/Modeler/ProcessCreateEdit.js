import React, { useEffect, useState, useRef, useMemo } from "react";
import "./Modeler.scss";
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
} from "../../apiManager/services/processServices";
import Loading from "../../containers/Loading";
import { MULTITENANCY_ENABLED } from "../../constants/constants";
import { useTranslation } from "react-i18next";
import {
  //createNewProcess,
  //createNewDecision,
  extractDataFromDiagram,
} from "../../components/Modeler/helpers/helper";
import {
  CustomButton,
  HistoryIcon,
  BackToPrevIcon,
  ConfirmModal,
  ErrorModal,
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
  validateDecisionNames,
} from "../../helper/processHelper";
import BpmnEditor from "./Editors/BpmnEditor/BpmEditor.js";
import DmnEditor from "./Editors/DmnEditor/DmnEditor.js";
import {
  setProcessData,
  setProcessDiagramXML,
} from "../../actions/processActions";

const EXPORT = "EXPORT";
const CategoryType = { FORM: "FORM", WORKFLOW: "WORKFLOW" };

const ProcessCreateEdit = ({ type }) => {
  const { processKey, step } = useParams();
  const isCreate = step === "create";
  const isBPMN = type === "BPMN";
  const isDmn = type === "DMN";
  const diagramType = isDmn ? "DMN" : "BPMN";
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
  // handle history modal
  const handleHistoryModal = () => setHistoryModalShow(!historyModalShow);
  const [isProcessDetailsLoading, setIsProcessDetailsLoading] = useState(false);

  useEffect(() => {
    setIsPublished(processData.status === "Published");
  }, [processData]);

  const publishText = isPublished ? t("Unpublish") : t("Publish");

  const processName = useMemo(() => {
    if (!processData.processData) {
      return;
    }
    return extractDataFromDiagram(processData?.processData, isDmn).name;
  }, [processData, isDmn]);

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

  // useEffect(() => {
  //   if (isCreate) {
  //     dispatch(setProcessData({}));
  //   }

  //   return () => {
  //     // Check if it's BPMN or DMN and reset the respective data
  //     if (isCreate) {
  //       const newProcessXml = isDmn
  //         ? createNewDecision().defaultWorkflow.xml
  //         : createNewProcess().defaultWorkflow.xml;
  //       dispatch(setProcessDiagramXML(newProcessXml));
  //     }
  //   };
  // }, [isCreate,isDmn]);

  const handleToggleConfirmModal = () => setShowConfirmModal(!showConfirmModal);
  const openConfirmModal = (type) => {
    setModalType(type);
    handleToggleConfirmModal();
  };
  const saveFlow = async (isPublished = false, isCreateMode = isCreate) => {
    try {
      const modeler = getModeler(isBPMN);
      const xml = await createXMLFromModeler(modeler);

      const isValid = validateXml(xml, isBPMN);
      if (!isValid) return;

      const isEqual = await checkIfEqual(isCreate, xml);
      if (isEqual && !isCreateMode) return handleAlreadyUpToDate(isPublished, isBPMN);

      setSavingFlow(true);

      const response = await saveProcess(isCreateMode, xml);
      dispatch(setProcessData(response.data));

      handleSaveSuccess(response, isCreateMode, isBPMN, isPublished);

      return response.data;
    } catch (error) {
      handleError(isBPMN);
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

  const handleAlreadyUpToDate = (isPublished, isBPMN) => {
    if (!isPublished) {
      toast.success(t(`${isBPMN ? "BPMN" : "DMN"} is already up to date`));
    }
  };

  const saveProcess = async (isCreate, xml) => {
    const processType = isBPMN ? "BPMN" : "DMN";
    return isCreate
      ? await createProcess({ type: processType, data: xml })
      : await updateProcess({
          type: processType,
          id: processData.id,
          data: xml,
        });
  };

  const handleSaveSuccess = (response, isCreate, isBPMN, isPublished) => {
    const processType = isBPMN ? "BPMN" : "DMN";
    const actionMessage = isCreate ? t("created") : t("updated");
    const processName =
      response.data?.name || response.data?.processKey ;

    if (!isPublished) {
      toast.success(
        t(
          `${processType} ${processName} has been ${actionMessage} successfully`
        )
      );
    }

    if (isCreate) {
      const editPath = isBPMN ? "subflow" : "decision-table";
      dispatch(
        push(`${redirectUrl}${editPath}/edit/${response.data.processKey}`)
      );
    }
  };

  const handleError = (isBPMN) => {
    setErrorMessage(
      isBPMN
        ? t("The BPMN name already exists. It must be unique. Please make changes through the General section within this BPMN.")
        : t("The DMN name already exists. It must be unique. Please make changes through the General section within this DMN.")
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
        response = await saveFlow(!isPublished, isCreate);
      }

      closeModal();

      if (isCreate && !response) return;

      await performAction(actionFunction, xml, response);

      toast.success(
        t(`${isPublished ? "Unpublished" : "Published"} successfully`)
      );

      if (!isPublished) {
        redirectToFlow(isBPMN);
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

  const redirectToFlow = (isBPMN) => {
    const redirectPath = isBPMN ? "subflow" : "decision-table";
    dispatch(push(`${redirectUrl}${redirectPath}`));
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
      // Select default data based on type and creation status
      let data;
      if (isCreate) {
        data = isBPMN ? defaultProcessXmlData : defaultDmnXmlData;
      } else {
        data = processData?.processData;
      }
  
      // Validate the data based on type
      const isValid = isBPMN
        ? await validateProcess(data)
        : await validateDecisionNames(data);
  
      if (isValid) {
        const fileType = isBPMN ? "text/bpmn" : "text/dmn";
        const extension = isBPMN ? ".bpmn" : ".dmn";
  
        // Create a Blob for the file
        const file = new Blob([data], { type: fileType });
  
        // Create a download link
        const element = document.createElement("a");
        element.href = URL.createObjectURL(file);
  
        // Set the file name based on the type and clean up for download
        const processName =
          extractDataFromDiagram(data, !isBPMN).name.replaceAll(" / ", "-") +
          extension;
        element.download = processName.replaceAll(" ", "");
  
        // Trigger the download
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element); // Cleanup
  
        setExportError(null);
      } else {
        setExportError(t("Process validation failed."));
      }
    } catch (error) {
      setExportError(
        t(error.message || "Export failed due to an error.")
      );
    }
  };
  

  const cancel = () => {
    const route = isBPMN ? "subflow" : "decision-table";
    dispatch(push(`${redirectUrl}${route}`));
  };

  const editorActions = () => setNewActionModal(true);

  const handleDuplicateProcess = () => {
    handleToggleConfirmModal();
    dispatch(setProcessDiagramXML(processData.processData));
    const route = isDmn ? "decision-table/create" : "subflow/create"; // Check for isDmn
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

    handleToggleConfirmModal();
  };
  const handleCloseErrorModal = () => setShowErrorModal(false);

  if (isProcessDetailsLoading) return <Loading />;

  const getModalContent = (type) => {
    const isBPMN = type === "BPMN";
    const contentType = isBPMN ? "BPMN" : "DMN";
  
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
          t(`Publishing will lock the ${contentType}. To save changes on further edits, 
              you will need to unpublish the ${contentType} first.`),
          t(`Publish This ${contentType}`),
          t("Cancel"),
          confirmPublishOrUnPublish,
          closeModal
        );
  
      case "unpublish":
        return getModalConfig(
          t("Confirm Unpublish"),
          t(`This ${contentType} is currently live. To save changes to ${contentType} edits, 
              you need to unpublish it first. By unpublishing this ${contentType},
              you will make it unavailable for new submissions to those who currently 
              have access to it. 
              You can republish the ${contentType} after making your edits.`),
          t(`Unpublish and Edit This ${contentType}`),
          t(`Cancel, Keep This ${contentType} published`),
          confirmPublishOrUnPublish,
          closeModal
        );
  
      case "discard":
        return getModalConfig(
          t(`Are you sure you want to discard ${contentType} changes?`),
          t(`Are you sure you want to discard all the changes to the ${contentType}?`),
          t("Discard Changes"),
          t("Cancel"),
          handleDiscardConfirm,
          closeModal
        );
  
      case "duplicate":
        return getModalConfig(
          t("Create Duplicate"),
          t(`Are you sure you want to duplicate the current ${contentType}?`),
          t(`Yes, Duplicate This ${contentType}`),
          t(`No, Do Not Duplicate This ${contentType}`),
          handleDuplicateProcess,
          closeModal
        );
  
      default:
        return {};
    }
  };
  

  const modalContent = getModalContent(type);

  // Define the editor content based on conditions
  let editorContent;

  if (isProcessDetailsLoading) {
    editorContent = <>loading...</>;
  } else if (isBPMN) {
    editorContent = (
      <BpmnEditor
        ref={bpmnRef}
        bpmnXml={isCreate ? defaultProcessXmlData : processData?.processData}
        setLintErrors={setLintErrors}
      />
    );
  } else {
    editorContent = (
      <DmnEditor
        ref={dmnRef}
        dmnXml={isCreate ? defaultDmnXmlData : processData?.processData}
      />
    );
  }

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
                    onClick={handleHistoryModal}
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
                  onClick={() => saveFlow()}
                  label={t(`Save ${diagramType}`)}
                  buttonLoading={savingFlow}
                  disabled={savingFlow || isPublished}
                  dataTestid={`save-${diagramType.toLowerCase()}-layout`}
                  ariaLabel={t(`Save ${diagramType} Layout`)}
                />
                <CustomButton
                  variant="secondary"
                  size="md"
                  onClick={() => openConfirmModal("discard")}
                  label={t("Discard Changes")}
                  dataTestid={`discard-${diagramType.toLowerCase()}-changes-testid`}
                  ariaLabel={t(`Discard ${diagramType} Changes`)}
                />
              </div>
            </div>
          </Card.Header>
        </div>
        <Card.Body>{editorContent}</Card.Body>
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
    </div>
  );
};
ProcessCreateEdit.propTypes = {
  type: PropTypes.string.isRequired,
};

export default ProcessCreateEdit;
