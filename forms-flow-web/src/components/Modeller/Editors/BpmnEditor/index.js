import React, { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import "../Editor.scss";
import Button from "react-bootstrap/Button";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import { extractDataFromDiagram } from "../../helpers/helper";
import { MULTITENANCY_ENABLED } from "../../../../constants/constants";
import { deployBpmnDiagram } from "../../../../apiManager/services/bpmServices";

import {
  SUCCESS_MSG,
  ERROR_MSG,
  ERROR_LINTING_CLASSNAME,
} from "../../constants/bpmnModellerConstants";

import {
  fetchAllBpmProcesses,
  fetchDiagram,
} from "../../../../apiManager/services/processServices";

import {
  setProcessDiagramLoading,
  setProcessDiagramXML,
  setWorkflowAssociation,
} from "../../../../actions/processActions";

import BpmnModeler from "bpmn-js/lib/Modeler";
import "bpmn-js/dist/assets/diagram-js.css";
import "bpmn-js/dist/assets/bpmn-font/css/bpmn-embedded.css";

import {
  BpmnPropertiesPanelModule,
  BpmnPropertiesProviderModule,
  CamundaPlatformPropertiesProviderModule,
} from "bpmn-js-properties-panel";

import CamundaExtensionModule from "camunda-bpmn-moddle/lib";
import camundaModdleDescriptors from "camunda-bpmn-moddle/resources/camunda";

import lintModule from "bpmn-js-bpmnlint";
import "bpmn-js-bpmnlint/dist/assets/css/bpmn-js-bpmnlint.css";
import linterConfig from "../../lint-rules/packed-config";

export default React.memo(({ xml, setShowModeller, processKey, tenant }) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const diagramXML = useSelector((state) => state.process.processDiagramXML);
  const [bpmnModeller, setBpmnModeller] = useState(null);
  const tenantKey = useSelector((state) => state.tenants?.tenantId);
  const [applyAllTenants, setApplyAllTenants] = useState(false);
  const [lintErrors, setLintErrors] = useState([]);

  const containerRef = useCallback((node) => {
    if (node !== null) {
      setBpmnModeller(
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
            CamundaExtensionModule,
            lintModule,
          ],
          moddleExtensions: {
            camunda: camundaModdleDescriptors,
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
      dispatch(fetchDiagram(processKey, tenant));
    } else {
      dispatch(setProcessDiagramLoading(false));
    }
    return () => {
      dispatch(setProcessDiagramLoading(true));
      dispatch(setProcessDiagramXML(""));
    };
  }, [xml, processKey, tenant, dispatch]);

  useEffect(() => {
    if (diagramXML && bpmnModeller) {
      bpmnModeller
        .importXML(diagramXML)
        .then(({ warnings }) => {
          if (warnings.length) {
            console.log("Warnings", warnings);
          }
          // Add event listeners for bpmn linting
          bpmnModeller.on("linting.completed", function (event) {
            setLintErrors(event.issues);
          });
        })
        .catch((err) => {
          console.log("error", err);
          setShowModeller(false);
        });
    }
  }, [diagramXML, bpmnModeller]);

  const handleApplyAllTenants = () => {
    setApplyAllTenants(!applyAllTenants);
  };

  const deployProcess = async () => {
    try {
      // Convert diagram to xml
      let { xml } = await bpmnModeller.saveXML();
      // Set isExecutable to true
      xml = xml.replaceAll('isExecutable="false"', 'isExecutable="true"');

      const isValidated = await validateProcess(xml);
      if (!isValidated) {
        toast.error(t(ERROR_MSG));
      } else {
        // Deploy to Camunda
        deployXML(xml);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const validateProcess = async (xml) => {
    // If the BPMN Linting is active then check for linting errors, else check for Camunda API errors
    // Check for linting errors in the modeller view
    if (document.getElementsByClassName(ERROR_LINTING_CLASSNAME).length > 0) {
      validateBpmnLintErrors();
      return false;
    }

    // Check for undefined process names
    if (!validateProcessNames(xml)) return false;

    return true;
  };

  const createBpmnForm = (xml) => {
    const form = new FormData();

    const processId = extractDataFromDiagram(xml).processId;
    const deploymentName = extractDataFromDiagram(xml).name;

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
    const blob = new Blob([xml], { type: "text/bpmn" });
    form.append("upload", blob, processId + ".bpmn");

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

    /*
    // Show errors in properties panel
    if (!isValidated){

    }
    */
   
    return isValidated;
  };

  const updateBpmProcesses = (xml) => {
    // Update drop down with all processes
    dispatch(fetchAllBpmProcesses());
    // Show the updated workflow as the current value in the dropdown
    const updatedWorkflow = {
      label: extractDataFromDiagram(xml).name,
      value: extractDataFromDiagram(xml).processId,
      xml: xml,
    };
    dispatch(setWorkflowAssociation(updatedWorkflow));
  };

  const zoom = () => {
    bpmnModeller.get("zoomScroll").stepZoom(1);
  };

  const zoomOut = () => {
    bpmnModeller.get("zoomScroll").stepZoom(-1);
  };
  const zoomReset = () => {
    bpmnModeller.get("zoomScroll").reset();
  };

  return (
    <>
      <div className="bpmn-main-container">
        <div className="bpmn-viewer-container">
          <div
            id="canvas"
            ref={containerRef}
            className="bpm-modeller-container grab-cursor"
            style={{
              border: "1px solid #000000",
            }}
          ></div>

          <div className="d-flex justify-content-end zoom-container">
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
