import React, { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import "../Editor.scss";
import Button from "react-bootstrap/Button";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import { extractDataFromDiagram } from "../../helpers/helper";
import { createXML } from "../../helpers/deploy";
import {
  MULTITENANCY_ENABLED,
  PUBLIC_WORKFLOW_ENABLED,
} from "../../../../constants/constants";
import { deployBpmnDiagram } from "../../../../apiManager/services/bpmServices";
import Loading from "../../../../containers/Loading";
import {
  SUCCESS_MSG_DMN,
  ERROR_MSG,
} from "../../constants/bpmnModelerConstants";

import {
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
import { push } from "connected-react-router";
export default React.memo(({ processKey, tenant, isNewDiagram, mode}) => {
  const { t } = useTranslation();

  const dispatch = useDispatch();
  const diagramXML = useSelector((state) => state.process.processDiagramXML);
  const [dmnModeler, setBpmnModeler] = useState(null);
  const tenantKey = useSelector((state) => state.tenants?.tenantId);
  const [applyAllTenants, setApplyAllTenants] = useState(false);
  const [deploymentLoading, setDeploymentLoading] = useState(false);
  const redirectUrl = MULTITENANCY_ENABLED ? `/tenant/${tenantKey}/` : "/";
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
    if (PUBLIC_WORKFLOW_ENABLED) {
      tenant === null || tenant === undefined
        ? setApplyAllTenants(true)
        : setApplyAllTenants(false);
    }
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
    if (tenantKey && !applyAllTenants && PUBLIC_WORKFLOW_ENABLED) {
      form.append("tenant-id", tenantKey);
    }
    //If the env value is false,and Multitenancy is enabled, then by default it will create a tenant based workflow.
    if (MULTITENANCY_ENABLED && !PUBLIC_WORKFLOW_ENABLED) {
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
    setDeploymentLoading(true);
    deployBpmnDiagram(form)
      .then((res) => {
        if (res?.data) {
          toast.success(t(SUCCESS_MSG_DMN));
           setDeploymentLoading(false);
          dispatch(push(`${redirectUrl}processes`));
        } else {
          setDeploymentLoading(false);
          toast.error(t(ERROR_MSG));
        }
      })
      .catch((error) => {
        setDeploymentLoading(false);
        showCamundaHTTTPErrors(error);
      });
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
  const cancel = () => {
    dispatch(push(`${redirectUrl}processes`));
  };

  const handleHelp = () => {
    window.open("https://camunda.com/dmn/");
  };
  return (
    <>
      <div className="d-flex align-items-center justify-content-between">
        <div>
          <h3 className="d-flex align-items-center font-weight-bold">
            <i className="fa fa-cogs mr-2" aria-hidden="true" />
            <span>{t(`${mode} Processes`)}</span>
          </h3>
        </div>
        <div className="task-head d-flex justify-content-end mb-2">
          {MULTITENANCY_ENABLED && PUBLIC_WORKFLOW_ENABLED ? (
            <label className="deploy-checkbox">
              <input
                type="checkbox"
                checked={applyAllTenants}
                onClick={handleApplyAllTenants}
              />{" "}
              Apply for all tenants
            </label>
          ) : null}
          <button type="button"
            className="btn btn-link text-dark" onClick={cancel}>
            {t("Cancel")}
          </button>
          <Button
            variant="outline-dark"
            className="ml-3"
            onClick={handleExport}
          >
            {t("Export")}
          </Button>
          <Button className="ml-3" onClick={deployProcess}>
            {t("Deploy")}
          </Button>
        </div>
      </div>
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
                title={t("Reset Zoom")}
                onClick={() => zoomReset()}
              >
                <i className="fa fa-retweet" aria-hidden="true" />
              </button>
              <button
                className="btn-zoom"
                title={t("Zoom In")}
                onClick={() => zoom()}
              >
                <i className="fa fa-search-plus" aria-hidden="true" />
              </button>
              <button
                className="btn-zoom"
                title={t("Zoom Out")}
                onClick={() => zoomOut()}
              >
                <i className="fa fa-search-minus" aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>
        <div className="properties-panel-parent" id="js-properties-panel"></div>
      </div>
      <div className="d-flex justify-content-end">
        <Button variant="info" className=" mr-2" onClick={handleHelp}>
          {t("Help")}
        </Button>
      </div>
    </>
  );
});
