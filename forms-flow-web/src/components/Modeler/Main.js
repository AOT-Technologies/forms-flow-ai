import React, { useRef } from "react";
import "./Modeler.scss";
import BpmnTable from "./constants/bpmnTable";
import DmnTable from "./constants/dmnTable";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import { push } from "connected-react-router";
import { extractDataFromDiagram } from "./helpers/helper";
import {
  setWorkflowAssociation,
  setProcessDiagramXML,
  setBpmnModel,
} from "../../actions/processActions";
import { MULTITENANCY_ENABLED } from "../../constants/constants";
import Head from "../../containers/Head";
export default React.memo(() => {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const uploadFormNode = useRef();
  const isBpmnModel = useSelector((state) => state.process?.isBpmnModel);
  const tenantKey = useSelector((state) => state.tenants?.tenantId);

  const handleChnageTab = (newValue) => {
    dispatch(setBpmnModel(newValue === "BPMN" ? true : false));
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
    // setFileName(file.name);
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

  const uploadClick = (e) => {
    e.preventDefault();
    uploadFormNode.current?.click();
    return false;
  };

  const headOptions = [
    {
      name: "BPMN",
      icon: "fa-solid fa-gears mr-2",
      onClick: () => {
        handleChnageTab("BPMN");
      },
    },
    {
      name: "DMN",
      icon: "fa-solid fa-gears mr-2",
      onClick: () => {
        handleChnageTab("DMN");
      },
    },
  ];

  return (
    <div>
      <div className="d-flex pb-2">
        <button
          onClick={handleCreateNew}
          className="btn btn-primary"
          style={{ whiteSpace: "nowrap" }}
        >
          <i className="fa fa-plus mr-2" />
          {t("Create Workflow")}
        </button>
        <button
          className="btn btn-outline-primary  ml-4"
          onClick={uploadClick}
          title={t("Upload Workflow")}
          style={{ whiteSpace: "nowrap" }}
        >
          <i className="fa fa-upload mr-2" aria-hidden="true" />
          {t("Upload Workflow")}
        </button>
        <input
          ref={uploadFormNode}
          id="inputWorkflow"
          className="d-none"
          type="file"
          name="upload"
          accept=".bpmn, .dmn"
          onChange={(e) => handleChangeFile(e.target.files[0])}
          title={t("Upload Workflow")}
        />
      </div>

      <div className="mt-4">
        <Head items={headOptions} page={isBpmnModel ? "BPMN" : "DMN"} />
      </div>

      {isBpmnModel ? <BpmnTable /> : <DmnTable />}
    </div>
  );
});
