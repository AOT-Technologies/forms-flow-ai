import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import BpmnEditor from "./Editors/BpmnEditor";
import { useParams } from "react-router-dom";
import DmnEditor from "./Editors/DmnEditor";
import { useDispatch } from "react-redux";
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
import {
  CustomButton,
  HistoryIcon,
  BackToPrevIcon,
} from "@formsflow/components";
import { Card } from "react-bootstrap";
import ActionModal from "../Modals/ActionModal";
import ExportDiagram from "../Modals/ExportDiagrams";
import { ERROR_LINTING_CLASSNAME } from "../Modeler/constants/bpmnModelerConstants";
import { toast } from "react-toastify";
import { validateProcessNames } from "../../helper/processHelper";
//import {setProcessData} from "../../actions/processActions";

const EXPORT = "EXPORT";

const EditWorkflow = () => {
  //select typeOf workflow form useSelector / redux
  const tenantKey = useSelector((state) => state.tenants?.tenantId);
  const { processId } = useParams();
  const dispatch = useDispatch();
  const [diagramLoading, setDiagramLoading] = useState(false);
  const diagramXML = useSelector((state) => state.process.processDiagramXML);
  const isPublicDiagram = useSelector((state) => state.process.isPublicDiagram);
  const redirectUrl = MULTITENANCY_ENABLED ? `/tenant/${tenantKey}/` : "/";
  const [selectedAction, setSelectedAction] = useState(null);
  const [newActionModal, setNewActionModal] = useState(false);
  const [lintErrors, setLintErrors] = useState([]);
  const [deploymentName, setDeploymentName] = useState("");
  const [exportError, setExportError] = useState(null);
  const onCloseActionModal = () => setNewActionModal(false);
  //const bpmnRef = useRef();
  const processStatus = useSelector((state) => state.process?.processData?.status);
  const processType = useSelector((state) => state.process?.processData?.processType);

  const { t } = useTranslation();
  useEffect(() => {
    if (diagramXML) {
      const extractedName = extractDataFromDiagram(diagramXML).name;
      const formattedName = extractedName.replaceAll(" / ", "-"); // Ensure valid formatting
      setDeploymentName(formattedName);
    }
  }, [diagramXML]);

  const CategoryType = {
    FORM: "FORM",
    WORKFLOW: "WORKFLOW",
  };
  useEffect(() => {
    setDiagramLoading(true);
    if (MULTITENANCY_ENABLED && isPublicDiagram === null) {
      dispatch(push(`${redirectUrl}subflow`));
    } else {
      const updatedTenantKey =
        MULTITENANCY_ENABLED && !isPublicDiagram ? null : tenantKey;
      dispatch(
        fetchDiagram(
          processId,
          updatedTenantKey,
          () => {
            setDiagramLoading(false);
          }
        )
      );
    }
  }, [processId]);

  useEffect(() => {
    return () => {
      dispatch(setProcessDiagramXML(""));
      dispatch(setIsPublicDiagram(null));
    };
  }, []);

  const handleCloseSelectedAction = () => {
    setSelectedAction(null);
  };

  if (diagramLoading) {
    return <Loading />;
  }

  const validateBpmnLintErrors = () => {
    // only return false if there are errors, warnings are ok
    let hasErrors = false;

    for (const key in lintErrors) {
      const err = lintErrors[key];
      err.forEach((x) => {
        // Only toast errors, not warnings
        if (x.category === "error") {
          hasErrors = true;
          toast.error(t(x.message));
        }
      });
    }
    return hasErrors ? false : true;
  };

  // validate the xml data and any erros in bpmn lint
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
      let isValidated = await validateProcess(diagramXML);
      if (isValidated) {
        const element = document.createElement("a");
        const file = new Blob([diagramXML], { type: "text/bpmn" });
        element.href = URL.createObjectURL(file);
        let deploymentName = extractDataFromDiagram(diagramXML).name;
        deploymentName = deploymentName.replaceAll(" / ", "-") + ".bpmn";
        setDeploymentName(deploymentName);
        element.download = deploymentName.replaceAll(" ", "");
        document.body.appendChild(element);
        element.click();
        setExportError(null); // No error
      } else {
        console.error("Process validation failed.");
        setExportError("Process validation failed.");
      }
    } catch (error) {
      console.error("Export failed:", error);
      setExportError(error.message || "Export failed due to an error.");
    }
  };

  const cancel = () => {
    dispatch(push(`${redirectUrl}subflow`));
  };
  const editorActions = () => {
    setNewActionModal(true);
  };
  // const saveFlow = async () => {
  //   const bpmnModeler = bpmnRef.current?.getBpmnModeler();
  //   const xml = await createXMLFromModeler(bpmnModeler);

  //   //if xml is same as existing process data, no need to update
  //   const isEqual = await compareXML(processData?.processData, xml);
  //   if (isEqual) {
  //     toast.success(t("Process updated successfully"));
  //     return;
  //   }
  //   if (!validateProcess(xml)) {
  //     return;
  //   }
    
  //   updateProcess({ type:"BPMN", id: processData.id, data:xml }).then((response) => {
  //     dispatch(setProcessData(response.data));
  //     toast.success(t("Process updated successfully"));
  //   });
  // };

  return (
    <div>
      <div>
        <Card className="editor-header">
          <Card.Body>
            <div className="d-flex justify-content-between align-items-center">
              <div className="d-flex align-items-center justify-content-between">
                <BackToPrevIcon onClick={cancel} />
                <div className="mx-4 editor-header-text">{deploymentName}</div>
                {/*need to write logic later for the draft and live based on process status*/}
                <span
                  data-testid={`process-status-${processId}`}
                  className="d-flex align-items-center white-text mx-3"
                >
                  {processStatus === 'Live' ? (
                    <>
                      <div className="status-live"></div>
                    </>
                  ) : (
                    <div className="status-draft"></div>
                  )}
                  {processStatus === 'Live' ? t("Live") : t("Draft")}
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
                  ariaLabel={(t) => t("Designer Actions Button")}
                />
                <CustomButton
                  variant="light"
                  size="md"
                  label={t("publish")}
                  //buttonLoading={isPublishLoading ? true : false}
                  //onClick={handlePublish}
                  dataTestid="handle-publish-testid"
                  //ariaLabel={`${t(publishText)} ${t("Button")}`}
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
                <div className="d-flex align-items-center justify-content-between">
                  <div className="mx-2 builder-header-text">Flow</div>
                  <div>
                    <CustomButton
                      variant="secondary"
                      size="md"
                      icon={<HistoryIcon />}
                      label={t("History")}
                      //onClick={handleHistoryModal}
                      dataTestid="bpmn-history-button-testid"
                      ariaLabel={t("BPMN History Button")}
                    />
                  </div>
                </div>
                <div>
                  <CustomButton
                    variant="primary"
                    size="md"
                    className="mx-2"
                    label={t("Save BPMN")}
                    //onClick={saveFlow}
                    dataTestid="save-bpmn-layout"
                    ariaLabel={t("Save Bpmn Layout")}
                  />
                  <CustomButton
                    variant="secondary"
                    size="md"
                    label={t("Discard Changes")}
                    //onClick={handleDiscard}
                    dataTestid="discard-bpmn-changes-testid"
                    ariaLabel={t("Discard bpmn Changes")}
                  />
                </div>
              </div>
            </Card.Header>
          </div>
          <Card.Body>
          {processType === "BPMN" ? (
            diagramXML ?
            <BpmnEditor
              mode="Edit"
              processKey={processId}
              tenant={tenantKey}
              isNewDiagram={false}
              bpmnXml={diagramXML}
              setLintErrors={setLintErrors}
            /> :  null
          ) : (
            diagramXML ?
            <DmnEditor
              mode="Edit"
              processKey={processId}
              tenant={tenantKey}
              isNewDiagram={false}
            /> : null
          )}
          </Card.Body>
        </Card>
      </div>
      <ActionModal
        newActionModal={newActionModal}
        onClose={onCloseActionModal}
        CategoryType={CategoryType.WORKFLOW}
        onAction={setSelectedAction}
      />
      <ExportDiagram
        showExportModal={selectedAction === EXPORT}
        onClose={handleCloseSelectedAction}
        onExport={handleExport}
        fileName={deploymentName}
        modalTitle="Export BPMN"
        successMessage="Export Successful"
        errorMessage={exportError}
      />
    </div>
  );
};

export default EditWorkflow;
