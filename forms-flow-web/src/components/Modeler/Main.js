import React from "react";
import "./Modeler.scss";
import { Tab, Tabs } from "react-bootstrap";
import BpmnTable from "./constants/bpmnTable";
import DmnTable from "./constants/dmnTable";
import { useTranslation } from "react-i18next";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { push } from "connected-react-router";
import { extractDataFromDiagram } from "./helpers/helper";
import {
  setWorkflowAssociation,
  setProcessDiagramXML,
  setBpmnModel,
} from "../../actions/processActions";
import { MULTITENANCY_ENABLED } from "../../constants/constants";
export default React.memo(() => {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const [fileName, setFileName] = useState("");
  const isBpmnModel = useSelector((state) => state.process?.isBpmnModel);
  const tenantKey = useSelector((state) => state.tenants?.tenantId);
  const [selectedTab, setSelectedTab] = useState(isBpmnModel ? "bpmn" : "dmn");

  const handleChnageTab = (newValue) => {
    setSelectedTab(newValue);
    dispatch(setBpmnModel(newValue === "bpmn" ? true : false));
  };
  const redirectUrl = MULTITENANCY_ENABLED ? `/tenant/${tenantKey}/` : "/";

  const handleFile = (e, fileName) => {
    const content = e.target.result;
    let processId = "";
    let name = "";

    if (fileName.substr(fileName.length - 5) == ".bpmn") {
      dispatch(setBpmnModel(true));
      name = extractDataFromDiagram(content).name;
      processId = extractDataFromDiagram(content).processId;
    } else {
      dispatch(setBpmnModel(false));
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
    dispatch(push(`${redirectUrl}processes/create`));
  };

  const handleChangeFile = (file) => {
    setFileName(file.name);
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
  const handleError = (err, message = "") => {
    console.log(message, err);
    document.getElementById("inputWorkflow").value = null;
    dispatch(setWorkflowAssociation(null));
  };
  const handleCreateNew = () => {
    dispatch(push(`${redirectUrl}processes/create`));
  };

  return (
    <div>
      <div className="">
        <div className="canvas">
          <div className="card-container">
            <div className="cardprocess cursor-pointer d-flex align-items-center justify-content-center" onClick={() => handleCreateNew()}>
              <div className="d-flex flex-column">
                <h3>
                  <i className="fa fa-plus" aria-hidden="true"></i>
                </h3>
                <p>{t("Advanced Designer")}</p>
              </div>
            </div>
            <div className="cardprocess cursor-pointer">
              <div className="card-content">
                <img
                  className="card-img-top"
                  src={
                    require("./Assets/undraw_export_files_re_99ar.svg").default
                  }
                  width="100"
                  height="30"
                  alt="Card image cap"
                />
              </div>
              <input
                id="inputWorkflow"
                style={{ display: "none" }}
                type="file"
                name="upload"
                accept=".bpmn, .dmn"
                onChange={(e) => handleChangeFile(e.target.files[0])}
              />
              <label className="p-2" htmlFor="inputWorkflow">
                {fileName ? fileName : t("Choose File")}
              </label>
            </div>
          </div>
        </div>
      </div>
      <div className="pt-4">
        <Tabs
          defaultActiveKey="bpmn"
          activeKey={selectedTab}
          id="process-tab"
          mountOnEnter
          onSelect={handleChnageTab}
        >
          <Tab eventKey="bpmn" title={t("BPMN")}>
            <BpmnTable />
          </Tab>
          <Tab eventKey="dmn" title={t("DMN")}>
            <DmnTable />
          </Tab>
        </Tabs>
      </div>
    </div>
  );
});
