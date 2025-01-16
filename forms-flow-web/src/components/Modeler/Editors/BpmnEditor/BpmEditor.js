import React, {
  useCallback,
  useEffect,
  useState,
  forwardRef,
  useImperativeHandle,
} from "react";
import PropTypes from "prop-types"; // Import PropTypes for validation
import "../Editor.scss";
import BpmnModeler from "bpmn-js/lib/Modeler";
import "bpmn-js/dist/assets/diagram-js.css";
import "bpmn-js/dist/assets/bpmn-font/css/bpmn-embedded.css";

import {
  BpmnPropertiesPanelModule,
  BpmnPropertiesProviderModule,
  CamundaPlatformPropertiesProviderModule,
} from "bpmn-js-properties-panel";
import camundaPlatformBehaviors from "camunda-bpmn-js-behaviors/lib/camunda-platform";
import camundaModdleDescriptors from "camunda-bpmn-moddle/resources/camunda";
import lintModule from "bpmn-js-bpmnlint";
import "bpmn-js-bpmnlint/dist/assets/css/bpmn-js-bpmnlint.css";
import linterConfig from "../../lint-rules/packed-config";

// External modeler configuration for reusability and readability
const modelerConfig = {
  container: "#canvas",
  propertiesPanel: { parent: "#js-properties-panel" },
  linting: { bpmnlint: linterConfig, active: true },
  additionalModules: [
    BpmnPropertiesPanelModule,
    BpmnPropertiesProviderModule,
    CamundaPlatformPropertiesProviderModule,
    camundaPlatformBehaviors,
    lintModule,
  ],
  moddleExtensions: { camunda: camundaModdleDescriptors },
};

const BpmnEditor = forwardRef(({ bpmnXml, setLintErrors, onChange = ()=>{} }, ref) => {
  const [bpmnModeler, setBpmnModeler] = useState(null);

  const initializeModeler = useCallback(() => {
    setBpmnModeler(new BpmnModeler(modelerConfig));
  }, []);

  const containerRef = useCallback((node) => {
    if (node !== null) initializeModeler();
  }, [initializeModeler]);

  useEffect(() => {
    if (bpmnModeler) {
      handleImport(bpmnXml);
      bpmnModeler.on('element.changed', onChange);
      return () => {
        // Cleanup event listener when component unmounts or bpmn changes
        bpmnModeler.off("element.changed", onChange);
      };
    }
  }, [bpmnXml, bpmnModeler]);

  const handleImport = (bpmnXml) => {
    if (bpmnXml && bpmnModeler) {
      bpmnModeler
        .importXML(bpmnXml)
        .then(({ warnings }) => {
          if (warnings.length) console.log("Warnings", warnings);
          bpmnModeler.on("linting.completed", (event) => setLintErrors(event.issues || []));
        })
        .catch((err) => handleError(err, "BPMN Import Error: "));
    }
  };

  useImperativeHandle(ref, () => ({
    getBpmnModeler: () => bpmnModeler,
    handleImport: (bpmnXml) => handleImport(bpmnXml),
  }));

  const handleError = (err, message = "An error occurred") => {
    console.error(message, err);
    document.getElementById("inputWorkflow").value = null;
  };

  const zoom = () => bpmnModeler?.get("zoomScroll")?.stepZoom(1);
  const zoomOut = () => bpmnModeler?.get("zoomScroll")?.stepZoom(-1);
  const zoomReset = () => bpmnModeler?.get("zoomScroll")?.reset();
  const undo = () => bpmnModeler?.get("commandStack")?.undo();
  const redo = () => bpmnModeler?.get("commandStack")?.redo();

  return (
    <div className="bpmn-main-container">
      <div className="bpmn-viewer-container">
        <div
          id="canvas"
          ref={containerRef}
          className="bpm-modeler-container grab-cursor border border-dark border-1"
        ></div>
 
        <div className="d-flex justify-content-end zoom-container">
          <div className="d-flex flex-column gap-3">
          <button
              className="btn-zoom cursor-pointer btn btn-sm btn-secondary"
              title="Undo"
              onClick={undo}
            >
              <i className="fa fa-undo" aria-hidden="true" />
            </button>
            <button
              className="btn btn-zoom cursor-pointer btn-sm btn-secondary"
              title="Redo"
              onClick={redo}
            >
              <i className="fas fa-redo" aria-hidden="true" />
            </button>
            <button
              className="btn-zoom cursor-pointer btn btn-sm btn-outline-primary"
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
  );
});

// Adding PropTypes validation for the props
BpmnEditor.propTypes = {
  bpmnXml: PropTypes.string,
  setLintErrors: PropTypes.func.isRequired,
  onChange: PropTypes.func,
};

export default React.memo(BpmnEditor);
