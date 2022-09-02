import React, { useEffect, useState } from "react";
import utils from "formiojs/utils";
import FormLabel from "@material-ui/core/FormLabel";
import Grid from "@material-ui/core/Grid";
import CardContent from "@material-ui/core/CardContent";
import Card from "@material-ui/core/Card";
import Tabs from "@material-ui/core/Tabs";
import Tab from "@material-ui/core/Tab";
import Select from "react-select";
import SaveNext from "./SaveNext";
import ProcessDiagram from "../../BPMN/ProcessDiagramHook";
import TaskvariableCreate from "./TaskvariableCreate";
import { useSelector, useDispatch } from "react-redux";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableContainer from "@material-ui/core/TableContainer";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import Paper from "@material-ui/core/Paper";
import {
  setFormProcessesData,
  setWorkflowAssociation,
} from "../../../actions/processActions";
import ViewAndEditTaskvariable from "./ViewAndEditTaskvariable";
import Button from "react-bootstrap/Button";
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
    const handleChange = (event, newValue) => {
      setTabValue(newValue);
    };
    const handleListChange = (item) => {
      setModified(true);
      dispatch(setWorkflowAssociation(item));
    };

    return (
      <Grid
        container
        direction="row"
        justify="flex-start"
        alignItems="baseline"
      >
        {/* <FormControl component="fieldset"> */}

        <Grid item xs={12} sm={1} spacing={3}>
          <Button variant="primary" onClick={handleEditAssociation}>
            {t("Edit")}
          </Button>
        </Grid>
        <Grid item xs={12} sm={8} spacing={3} />
        <Grid item xs={12} sm={3} className="next-btn">
          <SaveNext
            handleBack={handleBack}
            handleNext={handleNext}
            activeStep={activeStep}
            steps={steps}
            modified={modified}
          />
        </Grid>
        <Grid item xs={12} sm={12} spacing={3}>
          <br />
        </Grid>
        <Tabs
          value={tabValue}
          indicatorColor="primary"
          textColor="primary"
          onChange={handleChange}
        >
          <Tab label={t("Workflow Associate")} />
          <Tab label={t("Task variable")} />
        </Tabs>

        <Grid
          item
          xs={12}
          sm={12}
          spacing={3}
          disabled={disableWorkflowAssociation}
        >
          {tabValue === 0 ? (
            <Card variant="outlined" className="card-overflow">
              <CardContent>
                <Grid item xs={12} sm={6} spacing={3}>
                  <span className="fontsize-16">
                    {t("Please select from one of the following workflows.")}
                  </span>
                  <Select
                    options={processList}
                    onChange={handleListChange}
                    value={
                      processList.length && workflow?.value ? workflow : ""
                    }
                    disabled={disableWorkflowAssociation}
                  />
                </Grid>
                <Grid item xs={12} sm={6} spacing={3} />
                <br />
                {processList.length && workflow?.value ? (
                  <Grid item xs={12} spacing={3}>
                    <ProcessDiagram
                      processKey={workflow?.value}
                      tenant={workflow?.tenant}
                    />
                  </Grid>
                ) : null}
                {/* </FormControl> */}
              </CardContent>
            </Card>
          ) : (
            <>
              <Card variant="outlined" className="card-overflow">
                <CardContent>
                  <p> {t("Add form fields to display in task list")} </p>
                  {selectedTaskVariable.length !== 0 ? (
                    <Grid item xs={12} md={12} className="mb-2">
                      <TableContainer
                        component={Paper}
                        style={{ maxHeight: "250px" }}
                      >
                        <Table stickyHeader aria-label="simple table">
                          <TableHead>
                            <TableRow>
                              <TableCell className="font-weight-bold">
                                {t("Form field")}
                              </TableCell>
                              <TableCell
                                className="font-weight-bold"
                                align="left"
                              >
                                {t("Label")}
                              </TableCell>
                              <TableCell
                                className="font-weight-bold"
                                align="left"
                              >
                                {t("Show in list")}
                              </TableCell>
                              <TableCell
                                className="font-weight-bold"
                                align="right"
                              >
                                {t("Action")}
                              </TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {selectedTaskVariable.map((item, index) => (
                              <ViewAndEditTaskvariable
                                key={index}
                                item={item}
                                deleteTaskVariable={deleteTaskVariable}
                                editTaskVariable={editTaskVariable}
                              />
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </Grid>
                  ) : (
                    <div className="border p-2 mb-2">
                      <FormLabel>{t("No Task variable selected")}</FormLabel>
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
                    >
                      {showTaskVaribleCrete ? t("Cancel") : t("Add")}
                    </Button>
                  )}
                </CardContent>
              </Card>
            </>
          )}
        </Grid>
      </Grid>
    );
  }
);
export default WorkFlow;
