import React, {
  useCallback,
  useEffect,
  useState,
  forwardRef,
  useImperativeHandle,
} from "react";
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
//import CamundaExtensionModule from "camunda-bpmn-moddle/lib";
import camundaModdleDescriptors from "camunda-bpmn-moddle/resources/camunda";

import lintModule from "bpmn-js-bpmnlint";
import "bpmn-js-bpmnlint/dist/assets/css/bpmn-js-bpmnlint.css";
import linterConfig from "../../lint-rules/packed-config";

const BpmnEditor = forwardRef(({ bpmnXml, setLintErrors }, ref) => {
  const [bpmnModeler, setBpmnModeler] = useState(null);

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

  return (
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
  );
});

export default React.memo(BpmnEditor);
