import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import Grid from "@material-ui/core/Grid";
import CardContent from "@material-ui/core/CardContent";
import Card from "@material-ui/core/Card";
import Select from "react-dropdown-select";
import BpmnEditor from "./Editors/BpmnEditor";
import DmnEditor from "./Editors/DmnEditor";
import Button from "react-bootstrap/Button";
import { useTranslation } from "react-i18next";
import { listProcess } from "../../apiManager/services/formatterService";
import {
  createNewDecision,
  createNewProcess,
  extractDataFromDiagram,
} from "./helpers/helper";
import "./Modeller.scss";

import {
  fetchAllBpmProcesses,
  fetchAllDmnProcesses,
} from "../../apiManager/services/processServices";

import {
  setWorkflowAssociation,
  setProcessDiagramXML,
} from "../../actions/processActions";

export default React.memo(() => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const process = useSelector((state) => state.process.processList);
  const dmn = useSelector((state) => state.process.dmnProcessList);
  const [processList, setProcessList] = useState(listProcess(process));
  const workflow = useSelector((state) => state.process.workflowAssociated);
  const [showModeller, setShowModeller] = useState(false);
  const [xml, setXml] = useState(null);
  const [isBpmnModel, setIsBpmnModel] = useState(true);

  useEffect(() => {
    setShowModeller(false);
    dispatch(setWorkflowAssociation(null));
    dispatch(fetchAllBpmProcesses());
  }, []);

  useEffect(() => {
    isBpmnModel
      ? setProcessList(listProcess(process))
      : setProcessList(listProcess(dmn));
  }, [process, dmn]);

  useEffect(() => {
    isBpmnModel
      ? dispatch(fetchAllBpmProcesses())
      : dispatch(fetchAllDmnProcesses());
  }, [isBpmnModel]);

  const handleListChange = (item) => {
    setShowModeller(true);
    dispatch(setWorkflowAssociation(item[0]));
    dispatch(setProcessDiagramXML(null));
    setXml(null);
    showChosenFileName(item);
  };

  const showChosenFileName = (item) => {
    const filePath = document.getElementById("inputWorkflow").value;
    var n = filePath.lastIndexOf("\\");
    let fileName = filePath.substring(n + 1);

    if (fileName.substr(fileName.length - 5) == ".bpmn") {
      fileName = fileName.slice(0, -5);
    } else {
      fileName = fileName.slice(0, -4);
    }
    if (
      fileName !==
      (item[0]?.fileName?.slice(0, -5) || item[0]?.fileName?.slice(0, -4))
    ) {
      document.getElementById("inputWorkflow").value = null;
    }
  };

  const handleFile = (e, fileName) => {
    const content = e.target.result;
    let processId = "";
    let name = "";

    if (fileName.substr(fileName.length - 5) == ".bpmn") {
      setIsBpmnModel(true);
      name = extractDataFromDiagram(content).name;
      processId = extractDataFromDiagram(content).processId;
    } else {
      setIsBpmnModel(false);
      name = extractDataFromDiagram(content, true).name;
      processId = extractDataFromDiagram(content, true).processId;
    }

    const newWorkflow = {
      label: name,
      value: processId,
      xml: content,
      fileName: fileName,
    };
    setXml(content);
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
    const newProcess = isBpmnModel ? createNewProcess() : createNewDecision();
    dispatch(setWorkflowAssociation(newProcess.defaultWorkflow));
    dispatch(setProcessDiagramXML(newProcess.defaultWorkflow.xml));
    setXml(newProcess.defaultWorkflow.xml);
    setShowModeller(true);
    document.getElementById("inputWorkflow").value = null;
  };

  const handleToggle = () => {
    setShowModeller(false);
    dispatch(setWorkflowAssociation(null));
    setIsBpmnModel((toggle) => !toggle);
    document.getElementById("inputWorkflow").value = null;
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
                {t("Help")}
              </Button>
              <Grid item xs={12} sm={6}>
                <span className="fontsize-16">
                  {t("Please select an existing workflow.")}
                </span>
                <div className="select-style">
                  <Select
                    placeholder={t("Select...")}
                    dropdownHeight={"135px"}
                    options={processList}
                    onChange={handleListChange}
                    values={
                      processList.length && workflow?.value ? [workflow] : []
                    }
                  />
                </div>
                <div className="mt-2">
                  <label className="switch">
                    <input
                      type="checkbox"
                      checked={isBpmnModel}
                      onChange={handleToggle}
                    />
                    <span className="slider round"></span>
                    <span
                      className="labels"
                      data-on="BPMN"
                      data-off="DMN"
                    ></span>
                  </label>
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
                    accept=".bpmn, .dmn"
                    onChange={(e) => handleChangeFile(e.target.files[0])}
                  />
                </div>
              </div>

              {processList.length && workflow?.value && showModeller ? (
                <div>
                  {isBpmnModel ? (
                    <BpmnEditor
                      xml={xml ? xml : workflow?.xml}
                      setShowModeller={setShowModeller}
                      processKey={workflow?.value}
                      tenant={workflow?.tenant}
                    />
                  ) : (
                    <DmnEditor
                      xml={xml ? xml : workflow?.xml}
                      processKey={workflow?.value}
                      tenant={workflow?.tenant}
                    />
                  )}
                </div>
              ) : null}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </div>
  );
});
