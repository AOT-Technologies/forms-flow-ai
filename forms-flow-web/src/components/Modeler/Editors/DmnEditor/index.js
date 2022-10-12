import React, { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import "../Editor.scss";
import Button from "react-bootstrap/Button";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import { extractDataFromDiagram } from "../../helpers/helper";
import { createXML } from "../../helpers/deploy";
import { MULTITENANCY_ENABLED } from "../../../../constants/constants";
import { deployBpmnDiagram } from "../../../../apiManager/services/bpmServices";
import Loading from "../../../../containers/Loading";

import { SUCCESS_MSG, ERROR_MSG } from "../../constants/bpmnModelerConstants";

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

export default React.memo(
  ({ setShowModeler, processKey, tenant, isNewDiagram }) => {
    const { t } = useTranslation();

    const dispatch = useDispatch();
    const diagramXML = useSelector((state) => state.process.processDiagramXML);
    const [dmnModeler, setBpmnModeler] = useState(null);
    const tenantKey = useSelector((state) => state.tenants?.tenantId);
    const [applyAllTenants, setApplyAllTenants] = useState(false);
    const [deploymentLoading, setDeploymentLoading] = useState(false);

    const containerRef = useCallback((node) => {
      if (node !== null) {
        initializeModeler();
      }
    }, []);

    const initializeModeler = () => {
      setBpmnModeler(
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
      tenant === null ? setApplyAllTenants(true) : setApplyAllTenants(false);
      if (diagramXML) {
        dispatch(setProcessDiagramLoading(true));
        dispatch(setProcessDiagramXML(diagramXML));
      } else if (processKey && !isNewDiagram) {
        dispatch(setProcessDiagramLoading(true));
        dispatch(fetchDiagram(processKey, tenant, true));
      } else {
        dispatch(setProcessDiagramLoading(false));
      }
      return () => {
        dispatch(setProcessDiagramLoading(true));
        dispatch(setProcessDiagramXML(""));
      };
    }, [processKey, tenant, dispatch]);

    useEffect(() => {
      if (diagramXML && dmnModeler) {
        dmnModeler
          .importXML(diagramXML)
          .then(({ warnings }) => {
            if (warnings.length) {
              console.log("Warnings", warnings);
            }

            try {
              dmnModeler.on("views.changed", () => {
                const propertiesPanel = dmnModeler
                  .getActiveViewer()
                  .get("propertiesPanel", false);

                // Remove the zoom and properties panel if not in DRD view
                if (!propertiesPanel) {
                  document.getElementById("js-properties-panel").style.display =
                    "none";
                  document.getElementById("zoom-id").className = "";
                } else {
                  document.getElementById("js-properties-panel").style.display =
                    "block";
                  document.getElementById("zoom-id").className =
                    "d-flex justify-content-end zoom-container";
                }
              });
              setShowModeler(true);
            } catch (err) {
              handleError(err, "DMN Properties Panel Error: ");
            }
          })
          .catch((err) => {
            handleError(err, "DMN Import Error: ");
          });
      }
    }, [diagramXML, dmnModeler]);

    const handleApplyAllTenants = () => {
      setApplyAllTenants(!applyAllTenants);
    };
    const deployProcess = async () => {
      let xml = await createXML(dmnModeler);
      // Deploy to Camunda
      deployXML(xml);
    };

    const createForm = (xml) => {
      const form = new FormData();

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
      // TODO: How to name the file
      let filename = deploymentName.replaceAll(" ", "-");
      filename = filename.replaceAll("/", "");
      form.append("upload", blob, filename + ".dmn");

      return form;
    };

    const deployXML = (xml) => {
      const form = createForm(xml);

      deployBpmnDiagram(form)
        .then((res) => {
          if (res?.data) {
            toast.success(t(SUCCESS_MSG));
            // Reload the dropdown menu
            updateDmnProcesses(xml, res.data.deployedDecisionDefinitions);
            refreshModeller();
          } else {
            toast.error(t(ERROR_MSG));
          }
        })
        .catch((error) => {
          showCamundaHTTTPErrors(error);
        });
    };

    const refreshModeller = () => {
      dmnModeler.destroy();
      setDeploymentLoading(true);
      initializeModeler();
      setDeploymentLoading(false);
    };

    const showCamundaHTTTPErrors = (error) => {
      let errors = error.response.data.details;
      for (var key in errors) {
        var value = errors[key];
        value.errors.forEach((x) => {
          toast.error(t(x.message));
        });
        value.warnings.forEach((x) => {
          toast.warn(t(x.message));
        });
      }

      if (!errors && error.response.data.message) {
        toast.error(t(error.response.data.message));
      }
    };

    const updateDmnProcesses = (xml, deployedDecisionDefinitions) => {
      // Update drop down with all processes
      dispatch(fetchAllDmnProcesses(tenantKey));
      // Show the updated workflow as the current value in the dropdown
      const updatedWorkflow = {
        label: extractDataFromDiagram(xml, true).name,
        value: extractDataFromDiagram(xml, true).processId,
        xml: xml,
        deployedDefinitions: deployedDecisionDefinitions
      };
      dispatch(setWorkflowAssociation(updatedWorkflow));
    };

    const validateDecisionNames = (xml) => {
      let isValidated = true;
      // Check for undefined process names
      if (
        !extractDataFromDiagram(xml, true).name ||
        extractDataFromDiagram(xml, true).name.includes("undefined")
      ) {
        toast.error(t("Process name(s) must not be empty"));
        isValidated = false;
      }
      return isValidated;
    };

    const handleExport = async () => {
      let xml = await createXML(dmnModeler);

      const isValidated = validateDecisionNames(xml);
      if (isValidated) {
        const element = document.createElement("a");
        const file = new Blob([xml], { type: "text/dmn" });
        element.href = URL.createObjectURL(file);
        let deploymentName = extractDataFromDiagram(xml, true).name;
        deploymentName = deploymentName.replaceAll(" ", "_") + ".dmn";
        element.download = deploymentName.replaceAll(" ", "");
        document.body.appendChild(element);
        element.click();
      }
    };

    const handleError = () => {
      document.getElementById("inputWorkflow").value = null;
      dispatch(setWorkflowAssociation(null));
      setShowModeler(false);
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
      <>
        <div className="bpmn-main-container">
          <div className="bpmn-viewer-container">
            <div
              id="canvas"
              ref={containerRef}
              className="bpm-modeler-container"
              style={{
                border: "1px solid #000000",
              }}
            >
              {!deploymentLoading ? null : <Loading />}
            </div>
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
          <div
            className="properties-panel-parent"
            id="js-properties-panel"
          ></div>
        </div>

        <div>
          {MULTITENANCY_ENABLED ? (
            <label className="deploy-checkbox">
              <input type="checkbox" checked={applyAllTenants ? true : false} onClick={handleApplyAllTenants} /> Apply
              for all tenants
            </label>
          ) : null}
          <Button onClick={deployProcess}>Deploy</Button>
          <Button className="ml-3" onClick={handleExport}>
            Export
          </Button>
        </div>
      </>
    );
  }
);