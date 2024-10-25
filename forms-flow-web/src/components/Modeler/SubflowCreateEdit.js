import React, { useEffect, useState,useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useParams } from "react-router-dom";
import { push } from "connected-react-router";
import { fetchDiagram,updateProcess } from "../../apiManager/services/processServices";
import Loading from "../../containers/Loading";
import {
  setIsPublicDiagram,
  setProcessDiagramXML,
} from "../../actions/processActions";
import { MULTITENANCY_ENABLED } from "../../constants/constants";
import { useTranslation } from "react-i18next";
import { extractDataFromDiagram } from "../../components/Modeler/helpers/helper";
import { CustomButton, HistoryIcon, BackToPrevIcon, ConfirmModal } from "@formsflow/components";
import { Card } from "react-bootstrap";
import ActionModal from "../Modals/ActionModal";
import ExportDiagram from "../Modals/ExportDiagrams";
import { ERROR_LINTING_CLASSNAME } from "../Modeler/constants/bpmnModelerConstants";
import { toast } from "react-toastify";
import { createXMLFromModeler, validateProcessNames, compareXML } from "../../helper/processHelper";
import BpmnEditor from "./Editors/BpmnEditor";
import { createNewProcess } from "./helpers/helper";
import { setProcessData } from '../../actions/processActions';

const EXPORT = "EXPORT";
const CategoryType = { FORM: "FORM", WORKFLOW: "WORKFLOW" };

const WorkflowEditor = () => {
  const tenantKey = useSelector((state) => state.tenants?.tenantId);
  const { processId } = useParams();
  const dispatch = useDispatch();
  const diagramXML = useSelector((state) => state.process.processDiagramXML);
  const isPublicDiagram = useSelector((state) => state.process.isPublicDiagram);
  const processStatus = useSelector((state) => state.process?.processData?.status);
  //const processType = useSelector((state) => state.process?.processData?.processType);
  //const isBpmnModel = useSelector((state) => state.process.isBpmnModel);
  
  const [diagramLoading, setDiagramLoading] = useState(false);
  const [selectedAction, setSelectedAction] = useState(null);
  const [newActionModal, setNewActionModal] = useState(false);
  const [lintErrors, setLintErrors] = useState([]);
  const [deploymentName, setDeploymentName] = useState("");
  const [exportError, setExportError] = useState(null);
  const bpmnRef = useRef();
  const processData = useSelector((state) => state.process?.processData);
  const [savingFlow, setSavingFlow] = useState(false);
  const [showDiscardModal, setShowDiscardModal] = useState(false);
  const [historyModalShow, setHistoryModalShow] = useState(false);
  // handle history modal
  const handleHistoryModal = () => setHistoryModalShow(!historyModalShow);
  const handleHanldeDisacardModal = () => setShowDiscardModal(!showDiscardModal);

  const redirectUrl = MULTITENANCY_ENABLED ? `/tenant/${tenantKey}/` : "/";
  const { t } = useTranslation();

  useEffect(() => {
    if (diagramXML) {
      const extractedName = extractDataFromDiagram(diagramXML).name.replaceAll(" / ", "-");
      setDeploymentName(extractedName);
    }
  }, [diagramXML]);

  useEffect(() => {
    if (processId) {
      setDiagramLoading(true);
      if (MULTITENANCY_ENABLED && isPublicDiagram === null) {
        dispatch(push(`${redirectUrl}subflow`));
      } else {
        const updatedTenantKey = MULTITENANCY_ENABLED && !isPublicDiagram ? null : tenantKey;
        dispatch(fetchDiagram(processId, updatedTenantKey, () => setDiagramLoading(false)));
      }
    } else {
      const newProcess = createNewProcess();
      dispatch(setProcessDiagramXML(newProcess.defaultWorkflow.xml));
    }
  }, [processId, dispatch, tenantKey, isPublicDiagram]);

  useEffect(() => {
    return () => {
      dispatch(setProcessDiagramXML(""));
      dispatch(setIsPublicDiagram(null));
    };
  }, [dispatch]);

  const validateBpmnLintErrors = () => {
    let hasErrors = false;
    lintErrors.forEach((err) => {
      err.forEach((x) => {
        if (x.category === "error") {
          hasErrors = true;
          toast.error(t(x.message));
        }
      });
    });
    return !hasErrors;
  };

  const validateProcess = (xml) => {
    if (document.getElementsByClassName(ERROR_LINTING_CLASSNAME).length > 0) {
      return validateBpmnLintErrors();
    }
    if (!validateProcessNames(xml)) {
      toast.error(t("Process name(s) must not be empty"));
      return false;
    }
    return true;
  };

  const handleExport = async () => {
    try {
      if (await validateProcess(diagramXML)) {
        const element = document.createElement("a");
        const file = new Blob([diagramXML], { type: "text/bpmn" });
        element.href = URL.createObjectURL(file);
        const deploymentName = extractDataFromDiagram(diagramXML).name.replaceAll(" / ", "-") + ".bpmn";
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
    try{
      const bpmnModeler = bpmnRef.current?.getBpmnModeler();
      const xml = await createXMLFromModeler(bpmnModeler);
  
      //if xml is same as existing process data, no need to update
      const isEqual = await compareXML(processData?.processData, xml);
      if (isEqual) {
        toast.success(t("Process updated successfully"));
        return;
      }
      if (!validateProcess(xml)) {
        return;
      }
      setSavingFlow(true);
      const response = await updateProcess({ type:"BPMN", id: processData.id, data:xml });
      dispatch(setProcessData(response.data));
      toast.success(t("Process updated successfully"));
      setSavingFlow(false);
    }catch(error){
      setSavingFlow(false);
      toast.error(t("Failed to update process"));
    }
  };
 const handleDiscardConfirm = ()=>{
    if(bpmnRef.current){
        console.log("hit here");
      //import the existing process data to bpmn
      bpmnRef.current?.handleImport(processData?.processData);
      handleHanldeDisacardModal();
    }
};
  if (diagramLoading) return <Loading />;

  return (
    <div>
        <ConfirmModal
        show={showDiscardModal}
        title={t(`Are you Sure you want to Discard Flow Changes`) }
        message={t("Are you sure you want to discard all the changes of the Flow?")}
        messageSecondary={t("This action cannot be undone.")}
        primaryBtnAction={handleDiscardConfirm}
        onClose={handleHanldeDisacardModal}
        primaryBtnText={t("Discard Changes")}
        secondaryBtnText={t("Cancel")}
        secondayBtnAction={handleHanldeDisacardModal}
        size="sm"
      />
      <Card className="editor-header">
        <Card.Body>
          <div className="d-flex justify-content-between align-items-center">
            <div className="d-flex align-items-center">
              <BackToPrevIcon onClick={cancel} data-testid="back-to-prev-icon-testid" aria-label={t("Back to Previous")} />
              <div className="mx-4 editor-header-text" data-testid="deployment-name">{deploymentName}</div>
              <span className="d-flex align-items-center white-text mx-3">
                <div className={processStatus === 'Live' ? "status-live" : "status-draft"}></div>
                {t(processStatus === 'Live' ? "Live" : "Draft")}
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
                label={t("publish")}
                dataTestid="handle-publish-testid"
                ariaLabel={t("Publish Button")}
              />
            </div>
          </div>
        </Card.Body>
      </Card>

      <Card>
        <div className="wraper">
          <Card.Header>
            <div className="d-flex justify-content-between align-items-center" style={{ width: "100%" }}>
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
                />
                <CustomButton
                  variant="secondary"
                  size="md"
                  onClick={handleHanldeDisacardModal}
                  label={t("Discard Changes")}
                  dataTestid="discard-bpmn-changes-testid"
                  ariaLabel={t("Discard BPMN Changes")}
                />
              </div>
            </div>
          </Card.Header>
        </div>
        <Card.Body>
          {diagramXML && (
            <BpmnEditor
              ref={bpmnRef}
              bpmnXml={diagramXML}
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
