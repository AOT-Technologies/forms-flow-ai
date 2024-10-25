import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useParams } from "react-router-dom";
import { push } from "connected-react-router";
import { fetchDiagram } from "../../apiManager/services/processServices";
import Loading from "../../containers/Loading";
import {
  setIsPublicDiagram,
  setProcessDiagramXML,
} from "../../actions/processActions";
import { MULTITENANCY_ENABLED } from "../../constants/constants";
import { useTranslation } from "react-i18next";
import { extractDataFromDiagram } from "../../components/Modeler/helpers/helper";
import { CustomButton, HistoryIcon, BackToPrevIcon } from "@formsflow/components";
import { Card } from "react-bootstrap";
import ActionModal from "../Modals/ActionModal";
import ExportDiagram from "../Modals/ExportDiagrams";
import { ERROR_LINTING_CLASSNAME } from "../Modeler/constants/bpmnModelerConstants";
import { toast } from "react-toastify";
import { validateProcessNames } from "../../helper/processHelper";
import BpmnEditor from "./Editors/BpmnEditor";
import DmnEditor from "./Editors/DmnEditor";

const EXPORT = "EXPORT";
const CategoryType = { FORM: "FORM", WORKFLOW: "WORKFLOW" };

const EditWorkflow = () => {
  const tenantKey = useSelector((state) => state.tenants?.tenantId);
  const { processId } = useParams();
  const dispatch = useDispatch();
  const diagramXML = useSelector((state) => state.process.processDiagramXML);
  const isPublicDiagram = useSelector((state) => state.process.isPublicDiagram);
  const processStatus = useSelector((state) => state.process?.processData?.status);
  const processType = useSelector((state) => state.process?.processData?.processType);
  const [diagramLoading, setDiagramLoading] = useState(false);
  const [selectedAction, setSelectedAction] = useState(null);
  const [newActionModal, setNewActionModal] = useState(false);
  const [lintErrors, setLintErrors] = useState([]);
  const [deploymentName, setDeploymentName] = useState("");
  const [exportError, setExportError] = useState(null);

  const redirectUrl = MULTITENANCY_ENABLED ? `/tenant/${tenantKey}/` : "/";
  const { t } = useTranslation();

  useEffect(() => {
    if (diagramXML) {
      const extractedName = extractDataFromDiagram(diagramXML).name.replaceAll(" / ", "-");
      setDeploymentName(extractedName);
    }
  }, [diagramXML]);

  useEffect(() => {
    setDiagramLoading(true);
    if (MULTITENANCY_ENABLED && isPublicDiagram === null) {
      dispatch(push(`${redirectUrl}subflow`));
    } else {
      const updatedTenantKey = MULTITENANCY_ENABLED && !isPublicDiagram ? null : tenantKey;
      dispatch(fetchDiagram(processId, updatedTenantKey, () => setDiagramLoading(false)));
    }
  }, [processId]);

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
        let deploymentName = extractDataFromDiagram(diagramXML).name.replaceAll(" / ", "-") + ".bpmn";
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

  if (diagramLoading) return <Loading />;

  return (
    <div>
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
                  label={t("Save BPMN")}
                  dataTestid="save-bpmn-layout"
                  ariaLabel={t("Save Bpmn Layout")}
                />
                <CustomButton
                  variant="secondary"
                  size="md"
                  label={t("Discard Changes")}
                  dataTestid="discard-bpmn-changes-testid"
                  ariaLabel={t("Discard BPMN Changes")}
                />
              </div>
            </div>
          </Card.Header>
        </div>
        <Card.Body>
          {diagramXML && (processType === "BPMN" ? (
            <BpmnEditor
              bpmnXml={diagramXML}
              setLintErrors={setLintErrors}
            />
          ) : (
            <DmnEditor
              mode="Edit"
              processKey={processId}
              tenant={tenantKey}
              isNewDiagram={false}
            />
          ))}
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

export default EditWorkflow;
