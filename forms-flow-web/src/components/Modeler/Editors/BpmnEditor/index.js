import React, { useCallback, useEffect, useState, forwardRef, useImperativeHandle } from "react";
import { useDispatch, useSelector } from "react-redux";
import BpmnModeler from "bpmn-js/lib/Modeler";
import "bpmn-js/dist/assets/diagram-js.css";
import "bpmn-js/dist/assets/bpmn-font/css/bpmn-embedded.css";
import { MULTITENANCY_ENABLED } from "../../../../constants/constants";
import {
  BpmnPropertiesPanelModule,
  BpmnPropertiesProviderModule,
  CamundaPlatformPropertiesProviderModule,
} from "bpmn-js-properties-panel";
import camundaPlatformBehaviors from 'camunda-bpmn-js-behaviors/lib/camunda-platform';
//import CamundaExtensionModule from "camunda-bpmn-moddle/lib";
import camundaModdleDescriptors from "camunda-bpmn-moddle/resources/camunda";
import Button from "react-bootstrap/Button";
import lintModule from "bpmn-js-bpmnlint";
import "bpmn-js-bpmnlint/dist/assets/css/bpmn-js-bpmnlint.css";
import linterConfig from "../../lint-rules/packed-config";
import { useTranslation } from "react-i18next";
import { push } from "connected-react-router";
import { extractDataFromDiagram } from "../../helpers/helper";
import {
  ERROR_LINTING_CLASSNAME,
} from "../../constants/bpmnModelerConstants";
import { createXML } from "../../helpers/deploy";
import { toast } from "react-toastify";
import ExportDiagram from "../../../../components/Modals/ExportDiagrams"; 


const BpmnEditor = forwardRef(({ bpmnXml }, ref) => {
  const [bpmnModeler, setBpmnModeler] = useState(null);
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const redirectUrl = MULTITENANCY_ENABLED ? `/tenant/${tenantKey}/` : "/";
  const tenantKey = useSelector((state) => state.tenants?.tenantId);
  const [lintErrors, setLintErrors] = useState([]);
  const [showExportModal, setShowExportModal] = useState(false);
  const [deploymentName, setDeploymentName] = useState("");
  const [exportError, setExportError] = useState(null); 

  const containerRef = useCallback((node) => {
    if (node !== null) {
      initializeModeler();
    }
  }, []);

  const initializeModeler = () => {
    setBpmnModeler(
      new BpmnModeler({
        container: "#canvas",
        propertiesPanel: {
          parent: "#js-properties-panel",
        },
        linting: {
          bpmnlint: linterConfig,
          active: true,
        },
        additionalModules: [
          BpmnPropertiesPanelModule,
          BpmnPropertiesProviderModule,
          CamundaPlatformPropertiesProviderModule,
          camundaPlatformBehaviors,
          lintModule,
         ],
        moddleExtensions: {
          camunda: camundaModdleDescriptors,
         },
      })
    );
  };

  useEffect(() => {
    handleImport(bpmnXml);
  }, [bpmnXml, bpmnModeler]);


  const handleImport = (bpmnXml) => {
    if (bpmnXml && bpmnModeler) {
      bpmnModeler
        .importXML(bpmnXml)
        .then(({ warnings }) => {
          if (warnings.length) {
            console.log("Warnings", warnings);
          }
          // Add event listeners for bpmn linting
          bpmnModeler.on("linting.completed", function (event) {
            setLintErrors(event.issues || []);
          });
        })
        .catch((err) => {
          handleError(err, "BPMN Import Error: ");
        });
    }
  };

  useImperativeHandle(ref, () => ({
    getBpmnModeler: () => bpmnModeler,
    handleImport: (bpmnXml) => handleImport(bpmnXml),
  }));

  
 
  const validateProcess = async (xml) => {
    // If the BPMN Linting is active then check for linting errors, else check for Camunda API errors
    // Check for linting errors in the modeler view
    if (document.getElementsByClassName(ERROR_LINTING_CLASSNAME).length > 0) {
      validateBpmnLintErrors();
      return false;
    }

    // Check for undefined process names
    if (!validateProcessNames(xml)) return false;

    return true;
  };
  const cancel = () => {
    dispatch(push(`${redirectUrl}processes`));
  };
  

  const validateBpmnLintErrors = () => {
    // only return false if there are errors, warnings are ok
    let hasErrors = false;

    for (var key in lintErrors) {
      var err = lintErrors[key];
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

  const validateProcessNames = (xml) => {
    let isValidated = true;
    // Check for undefined process names
    if (
      !extractDataFromDiagram(xml).name ||
      extractDataFromDiagram(xml).name.includes("undefined")
    ) {
      toast.error(t("Process name(s) must not be empty"));
      isValidated = false;
    }

    return isValidated;
  };
  const handleError = () => {
    document.getElementById("inputWorkflow").value = null;
  };

  const zoom = () => {
    bpmnModeler.get("zoomScroll").stepZoom(1);
  };

  const zoomOut = () => {
    bpmnModeler.get("zoomScroll").stepZoom(-1);
  };

  const zoomReset = () => {
    bpmnModeler.get("zoomScroll").reset();
  };
  const handleExport = async () => {
    try {
      let xml = await createXML(bpmnModeler);
      let isValidated = await validateProcess(xml);
      if (isValidated) {
        const element = document.createElement("a");
        const file = new Blob([xml], { type: "text/bpmn" });
        element.href = URL.createObjectURL(file);
        let deploymentName = extractDataFromDiagram(xml).name;
        deploymentName = deploymentName.replaceAll(" / ", "-") + ".bpmn";
        setDeploymentName(deploymentName);
        element.download = deploymentName.replaceAll(" ", "");
        document.body.appendChild(element);
        element.click();
        setExportError(null); // No error
      }
      else{
        console.error("Process validation failed.");
        setExportError("Process validation failed.");
      }
    } catch (error) {
      console.error("Export failed:", error);
      setExportError(error.message || "Export failed due to an error."); 
    }
  };

  const closeExportModal = () => setShowExportModal(false);

  return (
    <>
    <div className="d-flex align-items-center justify-content-between">
          <div>
            <h3 className="d-flex align-items-center fw-bold">
              <i className="fa fa-cogs me-2" aria-hidden="true" />
              <span>{t(`Process`)}</span>
            </h3>
          </div>

          <div className="task-head d-flex justify-content-end mb-2">
            <button
              data-testid="prcosses-bpmneditor-cancel-button"
              type="button"
              className="btn btn-link text-dark"
              onClick={cancel}>
              {t("Cancel")}
            </button>
            <Button
              data-testid="prcosses-bpmneditor-export-button"
              variant="outline-dark"
              className="ms-3"
              onClick={() => setShowExportModal(true)}
            >
              {t("Export")}
            </Button>
            <ExportDiagram
            showExportModal={showExportModal}
            onClose={closeExportModal}
            onExport={handleExport}
            fileName={deploymentName}
            modalTitle="Export BPMN"
            successMessage="Export Successful"
            errorMessage={exportError}
          />

          </div>
        </div>
    <div className="bpmn-main-container">
      <div className="bpmn-viewer-container">
        <div
          id="canvas"
          ref={containerRef}
          className="bpm-modeler-container grab-cursor border border-dark border-1"
        ></div>

        <div className="d-flex justify-content-end zoom-container">
          <div className="d-flex flex-column">
            <button
              className="mb-3 btn-zoom cursor-pointer btn btn-sm btn-secondary"
              title="Reset Zoom"
              onClick={zoomReset}
              data-testid="prcosses-bpmneditor-zoomreset-button"
            >
              <i className="fa fa-retweet" aria-hidden="true" />
            </button>
            <button
              className="btn btn-zoom cursor-pointer btn-sm btn-outline-primary"
              title="Zoom In"
              onClick={zoom}
              data-testid="prcosses-bpmneditor-zoom-button"
            >
              <i className="fa fa-search-plus" aria-hidden="true" />
            </button>
            <button
              className="btn btn-zoom cursor-pointer btn-sm btn-outline-primary"
              title="Zoom Out"
              onClick={zoomOut}
              data-testid="prcosses-bpmneditor-zoomout-button"
            >
              <i className="fa fa-search-minus" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
      <div className="properties-panel-parent" id="js-properties-panel"></div>
    </div>
    </>
  );
});

export default React.memo(BpmnEditor);
