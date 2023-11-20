import React, { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import "../Editor.scss";
import Button from "react-bootstrap/Button";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import { extractDataFromDiagram } from "../../helpers/helper";
import { createXML } from "../../helpers/deploy";
import { MULTITENANCY_ENABLED, PUBLIC_WORKFLOW_ENABLED } from "../../../../constants/constants";
import { deployBpmnDiagram } from "../../../../apiManager/services/bpmServices";
import Loading from "../../../../containers/Loading";
import { push } from "connected-react-router";
import {
  SUCCESS_MSG,
  ERROR_MSG,
  ERROR_LINTING_CLASSNAME,
} from "../../constants/bpmnModelerConstants";

import {
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

export default React.memo(
  ({ processKey, tenant, isNewDiagram,bpmnXml, mode }) => {
    const { t } = useTranslation();
    const dispatch = useDispatch();
    const diagramXML = useSelector((state) => state.process.processDiagramXML);
    const [bpmnModeler, setBpmnModeler] = useState(null);
    const tenantKey = useSelector((state) => state.tenants?.tenantId);
    const [applyAllTenants, setApplyAllTenants] = useState(false);
    const [lintErrors, setLintErrors] = useState([]);
    const [deploymentLoading, setDeploymentLoading] = useState(false);
    const redirectUrl = MULTITENANCY_ENABLED ? `/tenant/${tenantKey}/` : "/";
    // const [processName,setProcessName] = useState(true);
    // const bpmPropertyInput = document.getElementById("bio-properties-panel-name")?.value;

    const containerRef = useCallback((node) => {
      if (node !== null) {
        initializeModeler();
      }
    }, []);

  //   useEffect(() => {
  //     if (bpmPropertyInput) {
  //       setProcessName(false);
  //     }
  // }, [!bpmPropertyInput]);

    const cancel = () => {
      dispatch(push(`${redirectUrl}processes`));
    };

    const handleHelp = () => {
      window.open("https://camunda.com/bpmn/");
    };
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
            CamundaExtensionModule,
            lintModule,
          ],
          moddleExtensions: {
            camunda: camundaModdleDescriptors,
          },
        })
      );
    };
    useEffect(() => {
      if (PUBLIC_WORKFLOW_ENABLED) {
        tenant === null || tenant === undefined ? setApplyAllTenants(true)
          : setApplyAllTenants(false);
      }
      if (diagramXML) {
        dispatch(setProcessDiagramLoading(true));
        dispatch(setProcessDiagramXML(diagramXML));
      } else if (processKey && !isNewDiagram && !bpmnXml) {
        dispatch(setProcessDiagramLoading(true));
        dispatch(fetchDiagram(processKey, tenant));
      } else {
        dispatch(setProcessDiagramLoading(false));
      }
      // return () => {
      //   dispatch(setProcessDiagramLoading(true));
      //   dispatch(setProcessDiagramXML(""));
      // };
    }, [processKey, tenant, dispatch]);

    useEffect(() => {
      if (bpmnXml && bpmnModeler) {
        bpmnModeler
          .importXML(bpmnXml)
          .then(({ warnings }) => {
            if (warnings.length) {
              console.log("Warnings", warnings);
            }
            // Add event listeners for bpmn linting
            bpmnModeler.on("linting.completed", function (event) {
              setLintErrors(event.issues);
            });
          })
          .catch((err) => {
            handleError(err, "BPMN Import Error: ");
          });
      }
    }, [diagramXML, bpmnModeler, bpmnXml]);

    const handleApplyAllTenants = () => {
      setApplyAllTenants(!applyAllTenants);
    };

    const deployProcess = async () => {
      let xml = await createXML(bpmnModeler);

      const isValidated = await validateProcess(xml);
      if (!isValidated) {
        toast.error(t(ERROR_MSG));
      } else {
        // Deploy to Camunda
        deployXML(xml);
      }
    };
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

    const createBpmnForm = (xml) => {
      const form = new FormData();

      const deploymentName = extractDataFromDiagram(xml).name;

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
      const blob = new Blob([xml], { type: "text/bpmn" });
      // TODO: How to name the file
      let filename = deploymentName.replaceAll(" / ", "-");
      //filename = filename.replaceAll(' / ', '');

      form.append("upload", blob, filename + ".bpmn");

      return form;
    };

    const deployXML = (xml) => {
      const form = createBpmnForm(xml);
      setDeploymentLoading(true);
      deployBpmnDiagram(form)
        .then((res) => {
          if (res?.data) {
            toast.success(t(SUCCESS_MSG)); 
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

      return isValidated;
    };



    const handleExport = async () => {
      let xml = await createXML(bpmnModeler);

      const isValidated = await validateProcess(xml);
      if (isValidated) {
        const element = document.createElement("a");
        const file = new Blob([xml], { type: "text/bpmn" });
        element.href = URL.createObjectURL(file);
        let deploymentName = extractDataFromDiagram(xml).name;
        deploymentName = deploymentName.replaceAll(" / ", "-") + ".bpmn";
        element.download = deploymentName.replaceAll(" ", "");
        document.body.appendChild(element);
        element.click();
      }
    };

    const handleError = () => {
      document.getElementById("inputWorkflow").value = null;
      dispatch(setWorkflowAssociation(null));
      //setShowModeler(false);
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
      <>
        <div className="d-flex align-items-center justify-content-between">
          <div>
            <h3 className="d-flex align-items-center font-weight-bold">
              <i className="fa fa-cogs mr-2" aria-hidden="true" />
              <span>{t(`${mode} Process`)}</span>
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
                {t("Apply for all tenants")}
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
              // disabled={processName || !bpmPropertyInput}
            >
              {t("Export")}
            </Button>
            <Button
              className="ml-3"
              onClick={deployProcess}
              // disabled={processName || !bpmPropertyInput}
            >
              {t("Deploy")}
            </Button>
          </div>
        </div>
        <div className="bpmn-main-container">
          <div className="bpmn-viewer-container">
            <div
              id="canvas"
              ref={containerRef}
              className="bpm-modeler-container grab-cursor"
              style={{
                border: "1px solid #000000",
              }}
            >
              {!deploymentLoading ? null : <Loading />}
            </div>

            <div className="d-flex justify-content-end zoom-container">
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
          <div
            className="properties-panel-parent"
            id="js-properties-panel"
          ></div>
        </div>
        <div className="d-flex justify-content-end">
          <Button variant="info" className=" mr-2" onClick={handleHelp}>
            {t("Help")}
          </Button>
        </div>
      </>
    );
  }
);