import React, { useEffect, useState } from "react";
import utils from "formiojs/utils";
import { Button, Card, Table } from "react-bootstrap";
import Select from "react-select";
import SaveNext from "./SaveNext";
import ProcessDiagram from "../../BPMN/ProcessDiagramHook";
import TaskvariableCreate from "./TaskvariableCreate";
import { useSelector, useDispatch } from "react-redux";
import {
  setFormProcessesData,
  setWorkflowAssociation,
} from "../../../actions/processActions";
import ViewAndEditTaskvariable from "./ViewAndEditTaskvariable";
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
    const dispatch = useDispatch();
    const [modified, setModified] = useState(false);
    const [tabValue, setTabValue] = useState(0);
    const [showTaskVaribleCrete, setShowTaskVaribleCrete] = useState(false);
    const { form } = useSelector((state) => state.form);
    const process = useSelector((state) => state.process.processList);

    const processList = listProcess(process);
    const formProcessList = useSelector(
      (state) => state.process.formProcessList
    );
    const previousFormProcessList = useSelector(
      (state) => state.process.formPreviousData
    );

    // select all fields form a form
    const [selectAllFormFields, setSelecttAllFormFields] = useState(
      formProcessList?.selectedAllField || false
    );

    const workflow = useSelector((state) => state.process.workflowAssociated);

    //all form component labels and keys
    const [componentLabel, setComponentLabel] = useState([]);

    //selected task variable
    const [selectedTaskVariable, setSelectedTaskVariable] = useState(
      formProcessList.taskVariable ||  []
    );

    // keyofVariabl is using for balance form component for select on task variable
    const [keyOfVariable, setKeyOfVariable] = useState([]);

    useEffect(() => {
      const ignoredTypes = [
        "button",
        "columns",
        "panel",
        "well",
        "container",
        "htmlelement",
      ];
      const flattedComponent = Object.values(
        utils.flattenComponents(form.components)
      );
      const components = [];

      flattedComponent.forEach((component) => {
        if (!ignoredTypes.includes(component.type)) {
          components.push({ label: component.label, value: component.key });
        }
      });
      setComponentLabel(components);
      setKeyOfVariable(
        components.filter(
          (item) =>
            !selectedTaskVariable.find(
              (variable) => item.value === variable.key
            )
        )
      );
    }, [form]);

    useEffect(() => {
      if (!workflow) {
        setModified(true);
        dispatch(setWorkflowAssociation(DEFAULT_WORKFLOW));
      }
    }, [workflow, dispatch]);

    useEffect(() => {
      if (selectAllFormFields) {
        const selectedFields = componentLabel?.map((component) => ({
          key: component.value,
          defaultLabel: component.label,
          label: component.label,
        }));
        setSelectedTaskVariable(selectedFields);
        setKeyOfVariable([]);
        dispatch(
          setFormProcessesData({
            ...formProcessList,
            selectedAllField: true,
            processKey: workflow.value,
            processName: workflow.label,
            taskVariable: selectedFields,
          })
        );
      }
    }, [
      selectAllFormFields,
      componentLabel,
      formProcessList?.selectedAllField,
    ]);

    // resetting component keys after select a component opertaion
    const resetKeys = (selectedData = []) => {
      setKeyOfVariable(() =>
        componentLabel.filter(
          (item) =>
            !selectedData.find((variable) => item.value === variable.key)
        )
      );
    };

    const toggleSelectAllFormField = (checked) => {
      setSelecttAllFormFields(checked);
      if (!checked) {
        setSelectedTaskVariable(previousFormProcessList?.taskVariable || []);
        resetKeys(previousFormProcessList?.taskVariable);
        dispatch(
          setFormProcessesData({
            ...formProcessList,
            selectedAllField: false,
            processKey: workflow.value,
            processName: workflow.label,
            taskVariable: previousFormProcessList?.taskVariable,
          })
        );
      }
    };

    const addTaskVariable = (data) => {
      setSelectedTaskVariable((prev) => {
        return [...prev, data];
      });
      resetKeys([...selectedTaskVariable, data]);
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

    // delete task variable
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
      setTabValue(tabNumber);
    };

    const handleListChange = (item) => {
      setModified(true);
      dispatch(setWorkflowAssociation(item));
    };

    return (
      <>
        <div className="mt-3">
          <div className="d-flex align-items-center justify-content-between">
            <Button
              data-testid="form-workflow-edit-button"
              variant="primary"
              onClick={handleEditAssociation}
            >
              {t("Edit")}
            </Button>
            <div>
              <SaveNext
                handleBack={handleBack}
                handleNext={handleNext}
                activeStep={activeStep}
                steps={steps}
                modified={modified}
              />
            </div>
          </div>

          <div className="mt-3">
            <div>
              <ul className="nav nav-tabs">
                <li className="nav-item ">
                  <a
                    className={`nav-link ${
                      tabValue === 0 ? "active workflow-taskVariable" : ""
                    }`}
                    onClick={() => handleChange(0)}
                    href="#"
                    data-testid="form-workflow-tab"
                  >
                    {t("Associate Workflow")}
                  </a>
                </li>
                <li className="nav-item">
                  <a
                    className={`nav-link ${
                      tabValue === 1 ? "active workflow-taskVariable" : ""
                    }`}
                    onClick={() => handleChange(1)}
                    href="#"
                    data-testid="form-task-variables-tab"
                  >
                    {t("Task Variables")}
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
        {tabValue === 0 ? (
          <Card className="border-1">
            <Card.Body>
              <label
                htmlFor="select-workflow"
                className="fontsize-16  col-md-6"
              >
                {t("Please select from one of the following workflows.")}
              </label>
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
                onChange={(selectedOption) => handleListChange(selectedOption)}
                isDisabled={disableWorkflowAssociation}
                inputId="select-workflow"
                getOptionLabel={(option) => (
                  <span data-testid={`form-workflow-option-${option.value}`}>
                    {option.label}
                  </span>
                )}
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
              <Card.Body disabled={disableWorkflowAssociation}>
                <p>{t("Add form fields to display in task list")}</p>

                <div className="my-2">
                  <label>
                    <div className="d-flex align-items-center me-4 form-group form-check form-switch ps-0 gap-5">
                      <label className=" me-2 fw-bold">
                        {t("Select all fields")}
                      </label>
                      <input
                        checked={selectAllFormFields}
                        className="form-check-input mb-1 cursor-pointer"
                        type="checkbox"
                        role="switch"
                        id="selectAllFormFeild"
                        color="primary"
                        onChange={(e) => {
                          toggleSelectAllFormField(e.target.checked);
                        }}
                        name="check box for select all form fields "
                        data-testid="select-all-form-field-for-task-variable"
                      ></input>
                    </div>
                  </label>
                </div>

                {!selectAllFormFields && selectedTaskVariable.length !== 0 ? (
                  <div className="mb-2">
                    <Table responsive striped bordered hover>
                      <thead>
                        <tr>
                          <th className="fw-bold">{t("Form field")}</th>
                          <th className="fw-bold" align="left">
                            {t("Label")}
                          </th>
                          <th className="fw-bold" align="right">
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
                ) : selectAllFormFields ? (
                  <div className="alert alert-warning" role="alert">
                    <i className="fa-solid fa-triangle-exclamation me-2"></i>{" "}
                    {t(`Enabling this feature may affect performance. For the best
                    performance, just pick the form fields you really need.
                    Also, keep in mind that if you add, remove, or change
                    anything in the form, it'll affect the task details too`)}
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

                {!selectAllFormFields && keyOfVariable.length !== 0 && (
                  <Button
                    onClick={() =>
                      setShowTaskVaribleCrete(!showTaskVaribleCrete)
                    }
                    variant={showTaskVaribleCrete ? "secondary" : "primary"}
                    data-testid="form-task-variables-add-cancel-button"
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
