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
import { listProcess } from "../../apiManager/services/formatterService";
import "./Modeller.scss";

import {
  fetchAllBpmProcesses,
} from "../../apiManager/services/processServices";

import { DEFAULT_WORKFLOW, BLANK_PROCESS_XML } from "./constants/bpmnModellerConstants";
import Button from "react-bootstrap/Button";

export default React.memo(() => {
    const { t } = useTranslation();
    const dispatch = useDispatch();
    const process = useSelector((state) => state.process.processList);
    const processList = listProcess(process);
    const workflow = useSelector((state) => state.process.workflowAssociated);

    const [showModeller, setShowModeller] = useState(false);
    
    // Populate workflows in dropdown on page load
    useEffect(() => {
      dispatch(fetchAllBpmProcesses());
    }, []);

    const handleListChange = (item) => {
      dispatch(setWorkflowAssociation(item[0]));
      // Clear the filename after the "Choose File" input button
      if (item[0] !== DEFAULT_WORKFLOW){
        document.getElementById("inputWorkflow").value = "";
      }
    };

    const handleFile = (e) => {
      const content = e.target.result;
      dispatch(setProcessDiagramXML(content));
      dispatch(setWorkflowAssociation(DEFAULT_WORKFLOW));
      setShowModeller(true);
    };
    
    const handleChangeFile = (file) => {
      let fileData = new FileReader();
      fileData.onloadend = handleFile;
      fileData.readAsText(file);
    };
    
    const handleCreateNew = () => {
      dispatch(setProcessDiagramXML(BLANK_PROCESS_XML));
      dispatch(setWorkflowAssociation(DEFAULT_WORKFLOW));
      document.getElementById("inputWorkflow").value = "";
      setShowModeller(true);
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
          justify="flex-start"
          alignItems="baseline"
        >
          <Grid item xs={12} sm={12}>
            <Card variant="outlined" className="card-overflow">
              <CardContent>
                <Grid item xs={12} sm={6}>
                  <span className="fontsize-16">
                    {t("Please select an existing workflow.")}
                  </span>
                  <Select
                    dropdownHeight="135px"
                    options={processList}
                    onChange={handleListChange}
                    values={
                      processList.length && workflow?.value ? [workflow] : []
                    }
                  />
                </Grid>

                <Button className="btn-create-new" onClick={() => handleCreateNew()}>Create New</Button>
                
                <div className="import-container">
                  <span className="fontsize-16">
                    {t("Or import a workflow from a local directory.")}
                  </span>
                  <br/>
                  <input 
                    id="inputWorkflow"
                    type="file" 
                    accept=".bpmn" 
                    onChange={e => handleChangeFile(e.target.files[0])} 
                  />
                </div>

                {(processList.length && workflow?.value) || showModeller ? (
                  <div>
                    <EditModel
                      processKey={workflow?.value}
                      tenant={workflow?.tenant}
                    />
                  </div>
                ) : null}
              </CardContent>
            </Card>
          </Grid>
        </Grid >
      </div>
    );
  }
);

