import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import Grid from "@material-ui/core/Grid";
import CardContent from "@material-ui/core/CardContent";
import Card from "@material-ui/core/Card";
import Select from "react-select";
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
import "./Modeler.scss";

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
  const [showModeler, setShowModeler] = useState(false);
  const [isBpmnModel, setIsBpmnModel] = useState(true);
  const [isNewDiagram, setIsNewDiagram] = useState(false);
  const tenantKey = useSelector((state) => state.tenants?.tenantId);

  useEffect(() => {
    setIsNewDiagram(false);
    setShowModeler(false);
    dispatch(setWorkflowAssociation(null));
    dispatch(fetchAllBpmProcesses(tenantKey));
  }, []);

  useEffect(() => {
    isBpmnModel
      ? setProcessList(listProcess(process))
      : setProcessList(listProcess(dmn));
  }, [process, dmn]);

  useEffect(() => {
    isBpmnModel
      ? dispatch(fetchAllBpmProcesses(tenantKey))
      : dispatch(fetchAllDmnProcesses(tenantKey));
  }, [isBpmnModel]);

  const handleListChange = (item) => {
    setIsNewDiagram(false);
    setShowModeler(true);
    dispatch(setWorkflowAssociation(item));
    dispatch(setProcessDiagramXML(null));
    showChosenFileName(item);
  };

  const showChosenFileName = (item) => {
    const filePath = document.getElementById("inputWorkflow").value;
    var n = filePath.lastIndexOf("\\");
    let fileName = filePath.substring(n + 1);

    let isBpmnFile = true;

    if (fileName.substr(fileName.length - 5) == ".bpmn") {
      fileName = fileName.slice(0, -5);
    } else if (fileName.substr(fileName.length - 4) == ".dmn") {
      fileName = fileName.slice(0, -4);
      isBpmnFile = false;
    }

    if (
      (isBpmnFile && fileName !== item?.fileName?.slice(0, -5)) ||
      (!isBpmnFile && fileName !== item?.fileName?.slice(0, -4))
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
      fileName: fileName,
      xml: content,
    };
    dispatch(setWorkflowAssociation(newWorkflow));
    dispatch(setProcessDiagramXML(newWorkflow.xml));
    setShowModeler(true);
  };

  const handleChangeFile = (file) => {
    setShowModeler(false);
    setIsNewDiagram(true);
    let fileData = new FileReader();
    try {
      fileData.onloadend = (e) => {
        handleFile(e, file.name);
      };
      fileData.readAsText(file);
    } catch (err) {
      handleError(err, "File Import Error: ");
    }
  };

  const handleCreateNew = () => {
    setIsNewDiagram(true);
    const newProcess = isBpmnModel ? createNewProcess() : createNewDecision();
    dispatch(setWorkflowAssociation(newProcess.defaultWorkflow));
    dispatch(setProcessDiagramXML(newProcess.defaultWorkflow.xml));
    setShowModeler(true);
    document.getElementById("inputWorkflow").value = null;
  };

  const handleToggle = () => {
    setIsNewDiagram(false);
    setShowModeler(false);
    dispatch(setWorkflowAssociation(null));
    setIsBpmnModel((toggle) => !toggle);
    document.getElementById("inputWorkflow").value = null;
  };

  const handleError = (err, message = "") => {
    console.log(message, err);
    document.getElementById("inputWorkflow").value = null;
    dispatch(setWorkflowAssociation(null));
    setShowModeler(false);
  };

  const handleHelp = () => {
    window.open("https://camunda.com/bpmn/");
  };

  const customDropdownStyles = {
    menuList: base => ({
      ...base,
      maxHeight: "170px",
    })
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
                    placeholder={t("Select ...")}
                    options={processList}
                    onChange={handleListChange}
                    value={
                      processList.length && workflow?.value ? workflow : ""
                    }
                    styles={customDropdownStyles}
                  />
                </div>
                <div className="mt-2 toggle-bpm">
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
              <div className="mt-2">
                <span className="fontsize-16">
                  {t(
                    "Or create new workflow or import a workflow from a local directory."
                  )}
                </span>

                <div className="create-import-btns-container mt-2 mb-4">
                  <Button
                    className="btn-create-new mr-3"
                    onClick={() => handleCreateNew()}
                  >
                    {t("Create New")}
                  </Button>

                  <input
                    id="inputWorkflow"
                    type="file"
                    accept=".bpmn, .dmn"
                    onChange={(e) => handleChangeFile(e.target.files[0])}
                  />
                </div>
              </div>

              {processList.length && workflow?.value && showModeler ? (
                <div>
                  {isBpmnModel ? (
                    <BpmnEditor
                      setShowModeler={setShowModeler}
                      processKey={workflow?.value}
                      tenant={workflow?.tenant}
                      isNewDiagram={isNewDiagram}
                    />
                  ) : (
                    <DmnEditor
                      setShowModeler={setShowModeler}
                      processKey={workflow?.value}
                      tenant={workflow?.tenant}
                      isNewDiagram={isNewDiagram}
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
