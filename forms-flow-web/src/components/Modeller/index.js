import React, { useState, useEffect } from "react";
import Grid from "@material-ui/core/Grid";
import CardContent from "@material-ui/core/CardContent";
import Card from "@material-ui/core/Card";
import Select from "react-dropdown-select";
import EditModel from "./ModelEditorHook";
import { useSelector, useDispatch } from "react-redux";
import {
  setWorkflowAssociation,
  setProcessDiagramXML,
} from "../../actions/processActions";
import { useTranslation } from "react-i18next";
import {
  listDeployments,
  extractDataFromDiagram,
} from "./helpers/formatDeployments";
import "./Modeller.scss";

import { fetchAllBpmDeployments } from "../../apiManager/services/processServices";

import Button from "react-bootstrap/Button";

import { createNewProcess } from "./helpers/helper";

export default React.memo(() => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const deployments = useSelector((state) => state.process.deploymentList);
  const [deploymentList, setDeploymentList] = useState([]);
  const workflow = useSelector((state) => state.process.workflowAssociated);
  const [showModeller, setShowModeller] = useState(false);

  // Populate workflows in dropdown on page load
  useEffect(() => {
    setShowModeller(false);
    dispatch(setWorkflowAssociation(null));
    dispatch(fetchAllBpmDeployments());
  }, []);

  useEffect(() => {
    if (deployments) {
      setDeploymentList(listDeployments(deployments));
    }
  }, [deployments]);

  const handleListChange = (item) => {
    setShowModeller(true);
    dispatch(setWorkflowAssociation(item[0]));
    document.getElementById("inputWorkflow").value = null;
  };

  const handleFile = (e, fileName) => {
    const content = e.target.result;
    const xmlName = extractDataFromDiagram(content).name;
    const processId = extractDataFromDiagram(content).processId;
    const name = xmlName ? xmlName : fileName.slice(0, -5);
    const newWorkflow = {
      label: name,
      value: processId,
      xml: content,
    };
    dispatch(setProcessDiagramXML(content));
    dispatch(setWorkflowAssociation(newWorkflow));
  };

  const handleChangeFile = (file) => {
    let fileData = new FileReader();
    fileData.onloadend = (e) => {
      handleFile(e, file.name);
    };
    fileData.readAsText(file);
    setShowModeller(true);
  };

  const handleCreateNew = () => {
    const newProcess = createNewProcess();
    dispatch(setProcessDiagramXML(newProcess.defaultBlankProcessXML));
    dispatch(setWorkflowAssociation(newProcess.defaultWorkflow));
    document.getElementById("inputWorkflow").value = null;
    setShowModeller(true);
  };

  const handleHelp = () => {
    window.open("https://camunda.com/bpmn/");
  };

  return (
    <div className="container" id="main">
      <div className="flex-container">
        <div className="flex-item-left">
          <div style={{ display: "flex" }}>
            <h3 className="task-head" style={{ marginTop: "3px" }}>
              <i className="fa fa-cogs" aria-hidden="true" />
            </h3>
            <h3 className="task-head">
              {" "}
              <span className="forms-text" style={{ marginLeft: "1px" }}>
                {t("Processes")}
              </span>
            </h3>
          </div>
        </div>
      </div>

      <Grid
        container
        direction="row"
        justifyContent="flex-start"
        alignItems="baseline"
      >
        <Grid item xs={12} sm={12}>
          <Card variant="outlined" className="card-overflow">
            <CardContent>
              <Button
                variant="info"
                className="help-btn"
                onClick={() => handleHelp()}
              >
                Help
              </Button>
              <Grid item xs={12} sm={6}>
                <span className="fontsize-16">
                  {t("Please select an existing workflow.")}
                </span>
                <div className="select-style">
                  <Select
                    placeholder={t("Select...")}
                    dropdownHeight={showModeller ? "250px" : "100px"}
                    options={deploymentList}
                    onChange={handleListChange}
                    searchable={false}
                  />
                </div>
              </Grid>

              <div className="create-import-container">
                <span className="fontsize-16">
                  {t(
                    "Or create new workflow or import a workflow from a local directory."
                  )}
                </span>

                <div className="create-import-btns-container">
                  <Button
                    className="btn-create-new"
                    onClick={() => handleCreateNew()}
                  >
                    {t("Create New")}
                  </Button>

                  <span className="fontsize-16 or-txt">{t(" ")}</span>
                  <input
                    id="inputWorkflow"
                    type="file"
                    accept=".bpmn"
                    onChange={(e) => handleChangeFile(e.target.files[0])}
                  />
                </div>
              </div>

              {deploymentList.length && workflow?.value && showModeller ? (
                <div>
                  <EditModel
                    xml={workflow?.xml}
                    setShowModeller={setShowModeller}
                  />
                </div>
              ) : null}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </div>
  );
});
