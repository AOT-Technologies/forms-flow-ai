import React, { useEffect, useState } from "react";
import utils from "@arun-s-aot/formiojs/lib/utils";
import { Button, Card } from "react-bootstrap";
import Select from "react-select";
import _ from "lodash";
import SaveNext from "./SaveNext";
import ProcessDiagram from "../../BPMN/ProcessDiagramHook";
import { useSelector, useDispatch } from "react-redux";
import {
  setFormProcessesData,
  setWorkflowAssociation,
} from "../../../actions/processActions";
import ViewAndEditTaskvariable from "./ViewAndEditTaskvariable";
import { useTranslation } from "react-i18next";
import { listProcess } from "../../../apiManager/services/formatterService";
import { DEFAULT_WORKFLOW } from "../../../constants/taskConstants";
import { filterSelectOptionByLabel } from "../../../helper/helper";
import { fetchAllBpmProcesses } from "../../../apiManager/services/processServices";
import  userRoles  from "../../../constants/permissions";
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

    const { form } = useSelector((state) => state.form);
    const process = useSelector((state) => state.process.processList);
    const processList = listProcess(process);
    const formProcessList = useSelector(
      (state) => state.process.formProcessList
    );

    const workflow = useSelector((state) => state.process.workflowAssociated);
    const { createDesigns } = userRoles();


    // handle add new task variable
    const [formFields, setFormFields] = useState({});
    const [taskVariables, setTaskVariables] = useState([]);
    const [selectedVariablekeys, setSelectedVariableKeys] = useState([]);
    const tenantKey = useSelector((state) => state.tenants?.tenantId);
    const selectedAllFields = Object.keys(formFields).every((i) =>
      selectedVariablekeys.includes(i)
    );

    useEffect(() => {
      const formComponents = Object.values(
        utils.flattenComponents(form.components)
      );
      const ignoredTypes = new Set([
        "button",
        "columns",
        "panel",
        "well",
        "container",
        "htmlelement",
      ]);
      const ignoredKeys = new Set(["applicationId"]);
      const components = {};
      formComponents.forEach((component) => {
        if (
          !ignoredTypes.has(component.type) &&
          !ignoredKeys.has(component.key)
        ) {
          components[component.key] = {
            key: component.key,
            label: component.label,
          };
        }
      });
      setFormFields(_.cloneDeep(components));
      const taskvariable = [];
      const keys = [];
      formProcessList?.taskVariable.forEach((i) => {
        if (components[i.key]) {
          delete components[i.key];
        }
        //if ignore types already exist in db need to avoid that
        if (!ignoredKeys.has(i.key)) {
          taskvariable.push({ ...i, checked: true });
          keys.push(i.key);
        }
      });
      setSelectedVariableKeys(keys);
      taskvariable.push(...Object.values(components));
      setTaskVariables(taskvariable);
      dispatch(fetchAllBpmProcesses({ tenant_key: tenantKey, excludeInternal: true }));
    }, []);

    const updateTaskvariableToProcessData = (updatedData) => {
      const selectedVariables = updatedData.reduce((filteredData, variable) => {
        if (variable.checked) {
          filteredData.push({ key: variable.key, label: variable.label });
        }
        return filteredData;
      }, []);

      dispatch(
        setFormProcessesData({
          ...formProcessList,
          processKey: workflow.value,
          processName: workflow.label,
          taskVariable: selectedVariables,
        })
      );
    };

    const selectAllFormFeildToTaskVariable = (e) => {
      const updatedData = taskVariables.map((variable) => ({
        ...variable,
        checked: e.target.checked,
      }));
      setSelectedVariableKeys(
        e.target.checked ? taskVariables.map((i) => i.key) : []
      );
      setTaskVariables(updatedData);
      updateTaskvariableToProcessData(updatedData);
    };

    const handleCheckAndUncheckTaskVariable = (selectedVariableKey) => {
      const updatedData = taskVariables.map((variable) => {
        if (variable.key == selectedVariableKey) {
          if (!variable.checked) {
            setSelectedVariableKeys((prev) => [...prev, variable.key]);
          } else {
            setSelectedVariableKeys((prev) =>
              prev.filter((key) => key !== variable.key)
            );
          }
          return { ...variable, checked: !variable.checked };
        }
        return variable;
      });
      setTaskVariables(updatedData);
      updateTaskvariableToProcessData(updatedData);
    };

    const editLableOfTaskVariable = (data) => {
      const updatedData = taskVariables.map((variable) =>
        variable.key == data.key
          ? { checked: variable.checked, ...data }
          : variable
      );
      setTaskVariables(updatedData);
      updateTaskvariableToProcessData(updatedData);
    };

    useEffect(() => {
      if (!workflow) {
        setModified(true);
        dispatch(setWorkflowAssociation(DEFAULT_WORKFLOW));
      }
    }, [workflow, dispatch]);

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
            {createDesigns && 
            <Button
              data-testid="form-workflow-edit-button"
              variant="primary"
              onClick={handleEditAssociation}
            >
              {t("Edit")}
            </Button>
            }
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
                filterOption={filterSelectOptionByLabel}
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
                <span className="p-3">
                  {t("Select form fields to display in task list")}
                </span>

                {selectedVariablekeys?.length > 10 ? (
                  <div className="alert taskvariable-alert mt-3" role="alert">
                    <i className="fa-solid fa-triangle-exclamation me-2"></i>{" "}
                    {t(
                      "Selecting all form fields may affect performance. For the best performance, just pick the form fields you really need."
                    )}
                  </div>
                ) : null}

                <div className="mb-2 scrollable-table">
                  <table className="table ">
                    <thead>
                      <tr>
                        <th className="fw-bold" align="left">
                          <div className="d-flex align-items-center">
                            <div className="form-check">
                              <input
                                className="form-check-input border cursor-pointer border-dark"
                                type="checkbox"
                                checked={selectedAllFields}
                                onChange={selectAllFormFeildToTaskVariable}
                                title={t("Select all fields")}
                              />
                            </div>
                            <span className="ms-2"> {t("Form field")}</span>
                          </div>
                        </th>

                        <th className="fw-bold" align="left">
                          {t("Label")}
                        </th>
                        <th className="fw-bold col-3" align="right">
                          {t("Action")}
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {taskVariables.map((item, index) => (
                        <ViewAndEditTaskvariable
                          key={index}
                          variable={item}
                          selectVariable={handleCheckAndUncheckTaskVariable}
                          editVariable={editLableOfTaskVariable}
                        />
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card.Body>
            </Card>
          </>
        )}
      </>
    );
  }
);
export default WorkFlow;
