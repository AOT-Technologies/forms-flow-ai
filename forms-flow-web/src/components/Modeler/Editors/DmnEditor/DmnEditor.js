import React, {
  useCallback,
  useEffect,
  useState,
  forwardRef,
  useImperativeHandle,
} from "react";
import PropTypes from "prop-types"; // Import PropTypes for validation
import "../Editor.scss";
import DmnJS from "dmn-js/lib/Modeler";
import "dmn-js/dist/assets/diagram-js.css";
import "dmn-js/dist/assets/dmn-font/css/dmn-embedded.css";
import {
  DmnPropertiesPanelModule,
  DmnPropertiesProviderModule,
  CamundaPropertiesProviderModule,
} from "dmn-js-properties-panel";
import camundaModdleDescriptor from "camunda-dmn-moddle/resources/camunda";
import { useTranslation } from "react-i18next";

const DmnEditor = forwardRef(({ dmnXml, onChange = ()=>{} }, ref) => {
  const [dmnModeler, setDmnModeler] = useState(null);
  const { t } = useTranslation();

  // Initialize modeler when container node mounts
  const initializeModeler = useCallback(() => {
    setDmnModeler(
      new DmnJS({
        container: "#canvas",
        drd: {
          propertiesPanel: {
            parent: "#js-properties-panel",
          },
          additionalModules: [
            DmnPropertiesPanelModule,
            DmnPropertiesProviderModule,
            CamundaPropertiesProviderModule,
          ],
        },
        moddleExtensions: {
          camunda: camundaModdleDescriptor,
        },
      })
    );
  }, []);

  const containerRef = useCallback((node) => {
    if (node !== null) initializeModeler();
  }, [initializeModeler]);

  useEffect(() => {
    if (dmnModeler) {
      handleImport(dmnXml);
    }
  }, [dmnXml, dmnModeler]);

  const handleImport = (dmnXml) => {
    if (dmnXml && dmnModeler) {
      dmnModeler
        .importXML(dmnXml)
        .then(({ warnings }) => {
          if (warnings.length) {
            console.warn("Import Warnings:", warnings);
          }
         const eventBus = dmnModeler?.getActiveViewer()?.get("eventBus");
         eventBus.off("element.changed",onChange);
         eventBus.on("element.changed", onChange);
        })
        .catch((err) => {
          handleError(err, "DMN Import Error: ");
        });
    }
  };

  useImperativeHandle(ref, () => ({
    getDmnModeler: () => dmnModeler,
    handleImport: (dmnXml) => handleImport(dmnXml),
  }));

  const handleError = (error, message) => {
    console.error(message, error);
    const inputElement = document.getElementById("inputWorkflow");
    if (inputElement) {
      inputElement.value = null;
    } else {
      console.warn("Element with ID 'inputWorkflow' not found.");
    }
  };

  const zoom = () => dmnModeler?.getActiveViewer()?.get("zoomScroll")?.stepZoom(1);
  const zoomOut = () => dmnModeler?.getActiveViewer()?.get("zoomScroll")?.stepZoom(-1);
  const zoomReset = () => dmnModeler?.getActiveViewer()?.get("zoomScroll")?.reset();
  const undo = () => dmnModeler?.getActiveViewer().get("commandStack")?.undo();
  const redo = () => dmnModeler?.getActiveViewer().get("commandStack")?.redo(); 

  return (
    <div className="bpmn-main-container">
      <div className="bpmn-viewer-container">
        <div
          id="canvas"
          ref={containerRef}
          className="bpm-modeler-container border border-dark border-1"
        ></div>
        <div className="d-flex justify-content-end zoom-container" id="zoom-id">
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
              className="btn btn-sm  btn-outline-primary btn-zoom"
              title={t("Reset Zoom")}
              onClick={zoomReset}
              data-testid="process-dmneditor-zoomreset-button"
            >
              <i className="fa fa-retweet" aria-hidden="true" />
            </button>
            <button
              className="btn btn-sm  btn-outline-primary btn-zoom"
              title={t("Zoom In")}
              onClick={zoom}
              data-testid="process-dmneditor-zoom-button"
            >
              <i className="fa fa-search-plus" aria-hidden="true" />
            </button>
            <button
              className="btn btn-sm btn-outline-primary btn-zoom"
              title={t("Zoom Out")}
              onClick={zoomOut}
              data-testid="process-dmneditor-zoomout-button"
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
DmnEditor.propTypes = {
  dmnXml: PropTypes.string.isRequired,
  onChange: PropTypes.func,
};

export default React.memo(DmnEditor);
