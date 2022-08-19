import React, { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import "../Editor.scss";
import Button from "react-bootstrap/Button";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import { extractDataFromDiagram } from "../../helpers/helper";
import { MULTITENANCY_ENABLED } from "../../../../constants/constants";
import { deployBpmnDiagram } from "../../../../apiManager/services/bpmServices";

import { SUCCESS_MSG, ERROR_MSG } from "../../constants/bpmnModellerConstants";

import {
  fetchAllDmnProcesses,
  fetchDiagram,
} from "../../../../apiManager/services/processServices";

import {
  setProcessDiagramLoading,
  setProcessDiagramXML,
  setWorkflowAssociation,
} from "../../../../actions/processActions";

import DmnJS from "dmn-js/lib/Modeler";

import {
  DmnPropertiesPanelModule,
  DmnPropertiesProviderModule,
  CamundaPropertiesProviderModule,
} from "dmn-js-properties-panel";

// a descriptor that defines Camunda related DMN 1.1 XML extensions
import camundaModdleDescriptor from "camunda-dmn-moddle/resources/camunda";

export default React.memo(({ xml, processKey, tenant }) => {
  const { t } = useTranslation();

  const dispatch = useDispatch();
  const diagramXML = useSelector((state) => state.process.processDiagramXML);
  const [dmnModeller, setBpmnModeller] = useState(null);
  const tenantKey = useSelector((state) => state.tenants?.tenantId);
  const [applyAllTenants, setApplyAllTenants] = useState(false);

  const containerRef = useCallback((node) => {
    if (node !== null) {
      setBpmnModeller(
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
    }
  }, []);

  useEffect(() => {
    if (xml) {
      dispatch(setProcessDiagramLoading(true));
      dispatch(setProcessDiagramXML(xml));
    } else if (diagramXML) {
      dispatch(setProcessDiagramLoading(true));
      dispatch(setProcessDiagramXML(diagramXML));
    } else if (processKey) {
      dispatch(setProcessDiagramLoading(true));
      dispatch(fetchDiagram(processKey, null, true));
    } else {
      dispatch(setProcessDiagramLoading(false));
    }
    return () => {
      dispatch(setProcessDiagramLoading(true));
      dispatch(setProcessDiagramXML(""));
    };
  }, [processKey, tenant, dispatch]);

  useEffect(() => {
    if (diagramXML && dmnModeller) {
      dmnModeller
        .importXML(diagramXML)
        .then(({ warnings }) => {
          if (warnings.length) {
            console.log("Warnings", warnings);
          }
        })
        .catch((err) => {
          console.log("error", err);
        });

      dmnModeller.on("views.changed", () => {
        const propertiesPanel = dmnModeller
          .getActiveViewer()
          .get("propertiesPanel", false);

        // Remove the zoom and properties panel if not in DRD view
        if (!propertiesPanel) {
          document.getElementById("js-properties-panel").style.display = "none";
          document.getElementById("zoom-id").className = "";
        } else {
          document.getElementById("js-properties-panel").style.display =
            "block";
          document.getElementById("zoom-id").className =
            "d-flex justify-content-end zoom-container";
        }
      });
    }
  }, [diagramXML, dmnModeller]);

  const handleApplyAllTenants = () => {
    setApplyAllTenants(!applyAllTenants);
  };

  const deployProcess = async () => {
    try {
      // Convert diagram to xml
      let { xml } = await dmnModeller.saveXML();
      // Set isExecutable to true
      //xml = xml.replaceAll('isExecutable="false"', 'isExecutable="true"');

      // Deploy to Camunda
      deployXML(xml);
    } catch (err) {
      console.error(err);
    }
  };

  const createBpmnForm = (xml) => {
    const form = new FormData();

    const processId = extractDataFromDiagram(xml, true).processId;
    const deploymentName = extractDataFromDiagram(xml, true).name;

    // Deployment Name
    form.append("deployment-name", deploymentName);
    // Deployment Source
    form.append("deployment-source", "Camunda Modeler");
    // Tenant ID
    if (tenantKey && !applyAllTenants) {
      form.append("tenant-id", tenantKey);
    }
    // Make sure that we do not re-deploy already existing deployment
    form.append("enable-duplicate-filtering", "true");
    // Create 'bpmn file' using blob which includes the xml of the process
    const blob = new Blob([xml], { type: "text/dmn" });
    form.append("upload", blob, processId + ".dmn");

    return form;
  };

  const deployXML = (xml) => {
    const form = createBpmnForm(xml);

    deployBpmnDiagram(form)
      .then((res) => {
        if (res?.data) {
          toast.success(t(SUCCESS_MSG));
          // Reload the dropdown menu
          updateBpmProcesses(xml);
        } else {
          toast.error(t(ERROR_MSG));
        }
      })
      .catch((error) => {
        showCamundaHTTTPErrors(error);
      });
  };

  const showCamundaHTTTPErrors = (error) => {
    const errors = error.response.data.details;
    for (var key in errors) {
      var value = errors[key];
      value.errors.forEach((x) => {
        toast.error(t(x.message));
      });
      value.warnings.forEach((x) => {
        toast.warn(t(x.message));
      });
    }
  };

  const updateBpmProcesses = (xml) => {
    // Update drop down with all processes
    dispatch(fetchAllDmnProcesses());
    // Show the updated workflow as the current value in the dropdown
    const updatedWorkflow = {
      label: extractDataFromDiagram(xml, true).name,
      value: extractDataFromDiagram(xml, true).processId,
      xml: xml,
    };
    dispatch(setWorkflowAssociation(updatedWorkflow));
  };

  const zoom = () => {
    dmnModeller.getActiveViewer().get("zoomScroll").stepZoom(1);
  };

  const zoomOut = () => {
    dmnModeller.getActiveViewer().get("zoomScroll").stepZoom(-1);
  };
  const zoomReset = () => {
    dmnModeller.getActiveViewer().get("zoomScroll").reset();
  };

  return (
    <>
      <div className="bpmn-main-container">
        <div className="bpmn-viewer-container">
          <div
            id="canvas"
            ref={containerRef}
            className="bpm-modeller-container"
            style={{
              border: "1px solid #000000",
            }}
          ></div>
          <div
            className="d-flex justify-content-end zoom-container"
            id="zoom-id"
          >
            <div className="d-flex flex-column">
              <button
                className="mb-3 btn-zoom"
                title="Reset Zoom"
                onClick={() => zoomReset()}
              >
                <i className="fa fa-retweet" aria-hidden="true" />
              </button>
              <button
                className="btn-zoom"
                title="Zoom In"
                onClick={() => zoom()}
              >
                <i className="fa fa-search-plus" aria-hidden="true" />
              </button>
              <button
                className="btn-zoom"
                title="Zoom Out"
                onClick={() => zoomOut()}
              >
                <i className="fa fa-search-minus" aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>
        <div className="properties-panel-parent" id="js-properties-panel"></div>
      </div>

      <div>
        {MULTITENANCY_ENABLED ? (
          <label className="deploy-checkbox">
            <input type="checkbox" onClick={handleApplyAllTenants} /> Apply for
            all tenants
          </label>
        ) : null}
        <Button onClick={deployProcess}>Deploy</Button>
      </div>
    </>
  );
});
