import React, { useEffect, useState } from "react";
import utils from "formiojs/utils";
import { Button, Col, Row, Card, Table } from "react-bootstrap";
// import {
//   Card,
//   Col,
//   Row,
//   Table,
//   Button,
//   Form,
//   Container,
// } from 'react-bootstrap';
// import FormLabel from "@material-ui/core/FormLabel";
// import Grid from "@material-ui/core/Grid";
// import CardContent from "@material-ui/core/CardContent";
// import Card from "@material-ui/core/Card";
// import Tabs from "@material-ui/core/Tabs";
// import Tab from "@material-ui/core/Tab";
import Select from "react-select";
import SaveNext from "./SaveNext";
import ProcessDiagram from "../../BPMN/ProcessDiagramHook";
import TaskvariableCreate from "./TaskvariableCreate";
import { useSelector, useDispatch } from "react-redux";
// import Table from "@material-ui/core/Table";
// import TableBody from "@material-ui/core/TableBody";
// import TableCell from "@material-ui/core/TableCell";
// import TableContainer from "@material-ui/core/TableContainer";
// import TableHead from "@material-ui/core/TableHead";
// import TableRow from "@material-ui/core/TableRow";
// import Paper from "@material-ui/core/Paper";
import {
  setFormProcessesData,
  setWorkflowAssociation,
} from "../../../actions/processActions";
import ViewAndEditTaskvariable from "./ViewAndEditTaskvariable";
// import Button from "react-bootstrap/Button";
import { useTranslation } from "react-i18next";
import { listProcess } from "../../../apiManager/services/formatterService";
import { DEFAULT_WORKFLOW } from "../../../constants/taskConstants";

const WorkFlow = React.memo(
  ({
    handleNext,
    handleBack,
    handleEditAssociation,
    activeStep,
    steps,
    disableWorkflowAssociation,
  }) => {
    const { t } = useTranslation();
    const [modified, setModified] = useState(false);
    const [tabValue, setTabValue] = useState(0);
    const [showTaskVaribleCrete, setShowTaskVaribleCrete] = useState(false);
    const { form } = useSelector((state) => state.form);
    const process = useSelector((state) => state.process.processList);
    const processList = listProcess(process);
    const formProcessList = useSelector(
      (state) => state.process.formProcessList
    );
    const workflow = useSelector((state) => state.process.workflowAssociated);
    const componentLabel = [];
    const ignoredTypes = [
      "button",
      "columns",
      "panel",
      "well",
      "container",
      "htmlelement",
    ];
    const flattedComponent = Object.values(
      utils.flattenComponents(form.components, true)
    );

    flattedComponent.forEach((component) => {
      if (!ignoredTypes.includes(component.type)) {
        componentLabel.push({ label: component.label, value: component.key });
      }
    });

    const dispatch = useDispatch();
    const [selectedTaskVariable, setSelectedTaskVariable] = useState(
      formProcessList.taskVariable ? formProcessList.taskVariable : []
    );
    const [keyOfVariable, setKeyOfVariable] = useState(
      componentLabel.filter(
        (item) =>
          !selectedTaskVariable.find((variable) => item.value === variable.key)
      )
    );

    useEffect(() => {
      console.log(showTaskVaribleCrete);
      if (!workflow) {
        setModified(true);
        dispatch(setWorkflowAssociation(DEFAULT_WORKFLOW));
      }
    }, [workflow, dispatch]);

    const addTaskVariable = (data) => {
      setSelectedTaskVariable((prev) => {
        return [...prev, data];
      });

      setKeyOfVariable((prev) => {
        return prev.filter(
          (item) =>
            !selectedTaskVariable.find(
              (variable) => variable.key === item.value
            ) && item.value !== data.key
        );
      });
      setShowTaskVaribleCrete(false);
      dispatch(
        setFormProcessesData({
          ...formProcessList,
          processKey: workflow.value,
          processName: workflow.label,
          taskVariable: [...selectedTaskVariable, data],
        })
      );
    };

    const deleteTaskVariable = (data) => {
      setSelectedTaskVariable((prev) =>
        prev.filter((item) => item.key !== data.key)
      );
      setKeyOfVariable([
        ...keyOfVariable,
        { label: data.defaultLabel, value: data.key },
      ]);

      dispatch(
        setFormProcessesData({
          ...formProcessList,
          processKey: workflow.value,
          processName: workflow.label,
          taskVariable: selectedTaskVariable.filter(
            (item) => item.key !== data.key
          ),
        })
      );
    };

    const editTaskVariable = (data) => {
      setSelectedTaskVariable((prev) => {
        return prev.map((item) => (item.key === data.key ? { ...data } : item));
      });
      dispatch(
        setFormProcessesData({
          ...formProcessList,
          processKey: workflow.value,
          processName: workflow.label,
          taskVariable: selectedTaskVariable.map((variable) =>
            variable.key === data.key ? { ...data } : variable
          ),
        })
      );
    };
    const handleChange = (tabNumber) => {
      console.log(tabNumber);
      setTabValue(tabNumber);
    };
    const handleListChange = (item) => {
      console.log("handle-item", item);
      setModified(true);
      dispatch(setWorkflowAssociation(item));
    };

    return (
      <>
        <div className="container">
          <Row className="mt-3">
            <Col xs={12} sm={1}>
              <Button variant="primary" onClick={handleEditAssociation}>
                {t("Edit")}
              </Button>
            </Col>
            <Col xs={12} sm={8} />
            <Col xs={12} sm={3} className="next-btn">
              <SaveNext
                handleBack={handleBack}
                handleNext={handleNext}
                activeStep={activeStep}
                steps={steps}
                modified={modified}
              />
            </Col>
          </Row>

          <Row className="mt-3">
            <Col xs={12} sm={12}>
              <br />
            </Col>
          </Row>

          <Row className="mt-3">
            <Col xs={12} sm={12}>
              <ul className="nav nav-tabs">
                <li className="nav-item ">
                  <a
                    className={`nav-link ${tabValue === 0 ? "active workflow-taskVariable" : ""}`}
                    onClick={() => handleChange(0)}
                    href="#"
                  >
                    {t("WORKFLOW ASSOCIATE")} 
                  </a>
                </li>
                <li className="nav-item">
                  <a
                    className={`nav-link ${tabValue === 1 ? "active workflow-taskVariable" : ""}`}
                    onClick={() => handleChange(1)}
                    href="#"
                  >
                    {t("TASK VARIABLE")} 
                  </a>
                </li>
              </ul>
            </Col>
          </Row>
        </div>
        {tabValue === 0 ? (
          <Card className="border-1">
            <Card.Body>
              <div className="fontsize-16  col-md-6">
                {t("Please select from one of the following workflows.")}
              </div>
              <Select
                className="mb-3 col-md-6"
                options={processList}
                value={
                  processList.length && workflow?.value
                    ? processList.find(
                        (process) => process.value === workflow.value
                      )
                    : null
                }
                onChange={(selectedOption) =>
                  handleListChange(selectedOption)
                }
                isDisabled={disableWorkflowAssociation}
              />
              {processList.length && workflow?.value ? (
                <div className="mt-3">
                  <ProcessDiagram
                    processKey={workflow?.value}
                    tenant={workflow?.tenant}
                  />
                </div>
              ) : null}
            </Card.Body>
          </Card>
        ) : (
          <>
            <Card className="mb-3">
              <Card.Body >
                <p >{t("Add form fields to display in task list")}</p>
                {selectedTaskVariable.length !== 0 ? (
                  <div className="mb-2">
                    <Table responsive striped bordered hover>
                      <thead>
                        <tr>
                          <th className="font-weight-bold">
                            {t("Form field")}
                          </th>
                          <th className="font-weight-bold" align="left">
                            {t("Label")}
                          </th>
                          <th className="font-weight-bold" align="left">
                            {t("Show in list")}
                          </th>
                          <th className="font-weight-bold" align="right">
                            {t("Action")}
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedTaskVariable.map((item, index) => (
                          <ViewAndEditTaskvariable
                            key={index}
                            item={item}
                            deleteTaskVariable={deleteTaskVariable}
                            editTaskVariable={editTaskVariable}
                          />
                        ))}
                      </tbody>
                    </Table>
                  </div>
                ) : (
                  <div className="border p-2 mb-2">
                    <span>{t("No task variable selected")}</span>
                  </div>
                )}

                {showTaskVaribleCrete && (
                  <TaskvariableCreate
                    options={keyOfVariable}
                    addTaskVariable={addTaskVariable}
                  />
                )}

                {keyOfVariable.length !== 0 && (
                  <Button
                    onClick={() =>
                      setShowTaskVaribleCrete(!showTaskVaribleCrete)
                    }
                    variant={showTaskVaribleCrete ? "secondary" : "primary"}
                    disabled={disableWorkflowAssociation}
                  >
                    {showTaskVaribleCrete ? t("Cancel") : t("Add")}
                  </Button>
                )}
              </Card.Body>
            </Card>
          </>
        )}
      </>
    );
  }
);
export default WorkFlow;
