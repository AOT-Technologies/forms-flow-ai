import React, { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import BpmnModeler from "bpmn-js/lib/Modeler";
import "bpmn-js/dist/assets/diagram-js.css";
import "bpmn-js/dist/assets/bpmn-font/css/bpmn-embedded.css";
import "./Modeller.scss";
import Button from "react-bootstrap/Button";
import Col from "react-bootstrap/Col";
import Form from "react-bootstrap/Form";
import Row from "react-bootstrap/Row";

import { fetchAllBpmDeployments } from "../../apiManager/services/processServices";

import {
  setProcessDiagramLoading,
  setProcessDiagramXML,
  setWorkflowAssociation,
} from "../../actions/processActions";

import { deployBpmnDiagram } from "../../apiManager/services/bpmServices";

import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";

import {
  BpmnPropertiesPanelModule,
  BpmnPropertiesProviderModule,
  CamundaPlatformPropertiesProviderModule,
} from "bpmn-js-properties-panel";

import CamundaExtensionModule from "camunda-bpmn-moddle/lib";
import camundaModdleDescriptors from "camunda-bpmn-moddle/resources/camunda";
import { is } from "bpmn-js/lib/util/ModelUtil";

import {
  SUCCESS_MSG,
  ERROR_MSG,
  ERROR_CLASSNAME,
  ERROR_LINTING_CLASSNAME,
} from "./constants/bpmnModellerConstants";

import { MULTITENANCY_ENABLED } from "../../constants/constants";

import { getRootElement } from "./helpers/helper";

import lintModule from "bpmn-js-bpmnlint";
import "bpmn-js-bpmnlint/dist/assets/css/bpmn-js-bpmnlint.css";
import linterConfig from "./lint-rules/packed-config";

const EditModel = React.memo(({ xml, defaultProcessInfo, name }) => {
  const { t } = useTranslation();

  const dispatch = useDispatch();
  const diagramXML = useSelector((state) => state.process.processDiagramXML);
  const [bpmnModeller, setBpmnModeller] = useState(null);
  const tenantKey = useSelector((state) => state.tenants?.tenantId);
  const [applyAllTenants, setApplyAllTenants] = useState(false);
  const [lintErrors, setLintErrors] = useState([]);
  const [deploymentName, setDeploymentName] = useState(name);

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
            //active: true
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
    if (bpmnModeller) {
      bpmnModeller.on("import.done", (event) => {
        const { error } = event;
        if (error) {
          console.log("bpmnViewer error >", error);
        }
      });
    }
    return () => {
      bpmnModeller && bpmnModeller.destroy();
    };
  }, [bpmnModeller]);

  useEffect(() => {
    setDeploymentName(name);
    if (xml) {
      dispatch(setProcessDiagramLoading(true));
      dispatch(setProcessDiagramXML(xml));
    } else {
      dispatch(setProcessDiagramLoading(false));
    }
    return () => {
      dispatch(setProcessDiagramLoading(true));
      dispatch(setProcessDiagramXML(""));
    };
  }, [xml, dispatch]);

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
        });
    }
  }, [diagramXML, bpmnModeller]);

  const handleApplyAllTenants = () => {
    setApplyAllTenants(!applyAllTenants);
  };

  async function deployProcess() {
    try {
      const isValidated = await validateProcess();
      if (!isValidated) {
        toast.error(t(ERROR_MSG));
      } else {
        // Update diagram with deployment name from input box
        const rootElement = getRootElement(bpmnModeller);
        var modeling = bpmnModeller.get("modeling");
        modeling.updateProperties(rootElement, {
          name: deploymentName,
        });
        // Convert diagram to xml
        const { xml } = await bpmnModeller.saveXML();
        // Deploy to Camunda
        deployXML(xml);
      }
    } catch (err) {
      console.error(err);
    }
  }

  const validateProcess = async () => {
    // If the BPMN Linting is active then check for linting errors, else check for Camunda API errors
    // Check for linting errors in the modeller view
    if (document.getElementsByClassName(ERROR_LINTING_CLASSNAME).length > 0) {
      validateBpmnLintErrors();
      return false;
    }
    // Check for input errors in the Process Panel
    else if (document.getElementsByClassName(ERROR_CLASSNAME).length > 0) {
      return false;
    }

    // Check for blank deployment name
    if (!deploymentName) {
      toast.error(t("Please enter a deployment name"));
      return false;
    }

    return true;
  };

  const createBpmnForm = (xml) => {
    const form = new FormData();

    const processId = getPropertyPanelInfo().processID;

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

  const getPropertyPanelInfo = () => {
    // Default names
    let processID = defaultProcessInfo.processID;
    let isExecutable = defaultProcessInfo.isExecutable;

    // Get elements from process panel, find the root element which contains the deployment name and process ID
    // Use the names assigned in the bpmn-js-properties-panel, otherwise keep the default names
    const rootElement = getRootElement(bpmnModeller);

    if (
      rootElement &&
      is(rootElement, "bpmn:Process") &&
      rootElement.businessObject
    ) {
      if (rootElement.businessObject.id) {
        processID = rootElement.businessObject.id;
        isExecutable = rootElement.businessObject.isExecutable;
      }
    } else {
      if (
        rootElement &&
        is(rootElement, "bpmn:Collaboration") &&
        rootElement.businessObject.participants
      ) {
        if (rootElement.businessObject.participants[0].processRef.id) {
          processID = rootElement.businessObject.participants[0].processRef.id;
          isExecutable =
            rootElement.businessObject.participants[0].processRef.isExecutable;
        }
      }
    }

    return {
      processID: processID,
      isExecutable: isExecutable,
    };
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

  const updateBpmProcesses = (xml) => {
    // Update drop down with all processes
    dispatch(fetchAllBpmDeployments());
    // Show the updated workflow as the current value in the dropdown
    const updatedWorkflow = {
      label: deploymentName,
      value: getPropertyPanelInfo().processID,
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

      <Form>
        <Row className="deploy-container">
          <Col className="deploy-btn">
            <Button onClick={deployProcess}>Deploy</Button>
          </Col>
          <Col className="pl-0">
            <Form.Control
              className="deploy-name"
              placeholder="Deployment Name"
              value={deploymentName}
              onChange={(e) => setDeploymentName(e.target.value)}
            />
          </Col>
        </Row>
        <Row className="mt-2">
          <Col>
            {MULTITENANCY_ENABLED ? (
              <Form.Check
                type="checkbox"
                onClick={handleApplyAllTenants}
                label="Apply for all tenants"
              />
            ) : null}
          </Col>
        </Row>
      </Form>
    </>
  );
});

export default EditModel;
