import React, {
  useCallback,
  useEffect,
  useState,
  forwardRef,
  useImperativeHandle,
} from "react";
import "../Editor.scss";
import DmnJS from "dmn-js/lib/Modeler";
import "dmn-js/dist/assets/diagram-js.css";
import "dmn-js/dist/assets/dmn-font/css/dmn-embedded.css";
import "../Editor.scss";
import {
  DmnPropertiesPanelModule,
  DmnPropertiesProviderModule,
  CamundaPropertiesProviderModule,
} from "dmn-js-properties-panel";
import camundaModdleDescriptor from "camunda-dmn-moddle/resources/camunda";
import { useTranslation } from "react-i18next";

const DmnEditor = forwardRef(({ dmnXml }, ref) => {
  const [dmnModeler, setDmnModeler] = useState(null);
  const { t } = useTranslation();
  const containerRef = useCallback((node) => {
    if (node !== null) {
      initializeModeler();
    }
  }, []);

  const initializeModeler = () => {
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
  };

  useEffect(() => {
    handleImport(dmnXml);
  }, [dmnXml, dmnModeler]);

  
  const handleImport = (dmnXml) => {
    if (dmnXml && dmnModeler) {
      dmnModeler
        .importXML(dmnXml)
        .then(({ warnings }) => {
          if (warnings.length) {
            console.log("Warnings", warnings);
          }
          //setImportErrors(warnings || []);
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


  const zoom = () => {
    dmnModeler.getActiveViewer().get("zoomScroll").stepZoom(1);
  };

  const zoomOut = () => {
    dmnModeler.getActiveViewer().get("zoomScroll").stepZoom(-1);
  };
  const zoomReset = () => {
    dmnModeler.getActiveViewer().get("zoomScroll").reset();
  };

  return (
    <div className="bpmn-main-container">
    <div className="bpmn-viewer-container">
      <div
        id="canvas"
        ref={containerRef}
        className="bpm-modeler-container border border-dark border-1"
      >
      </div>
      <div
        className="d-flex justify-content-end zoom-container"
        id="zoom-id"
      >
        <div className="d-flex flex-column">
          <button
            className="mb-3 btn-zoom"
            title={t("Reset Zoom")}
            onClick={() => zoomReset()}
            data-testid="prcosses-dmneditor-zoomreset-button"
          >
            <i className="fa fa-retweet" aria-hidden="true" />
          </button>
          <button
            className="btn-zoom"
            title={t("Zoom In")}
            onClick={() => zoom()}
            data-testid="prcosses-dmneditor-zoom-button"
          >
            <i className="fa fa-search-plus" aria-hidden="true" />
          </button>
          <button
            className="btn-zoom"
            title={t("Zoom Out")}
            onClick={() => zoomOut()}
            data-testid="prcosses-dmneditor-zoomout-button"
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

export default React.memo(DmnEditor);

