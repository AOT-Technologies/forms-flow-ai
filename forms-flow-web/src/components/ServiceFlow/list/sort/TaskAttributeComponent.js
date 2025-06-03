import React, { useState } from "react";
import { Row, Col } from "react-bootstrap";
import Modal from "react-bootstrap/Modal";
import ModalTitle from "react-bootstrap/ModalTitle";
import Form from "react-bootstrap/Form";
import { Translation, useTranslation } from "react-i18next";

import {
  CloseIcon
} from "@formsflow/components";
 
function TaskAttributeComponent({
  show,
  selectedForm,
  onHide,
  selectedTaskAttrbutes,
  selectedTaskVariablesKeys,
  selectedTaskVariables,
  onSaveTaskAttribute,
  processLoading,
  taskVariableFromMapperTable,
  viewMode
  // showUndefinedVariable,
}) {
 
  const { t } = useTranslation();

  const [variables, setVariables] = useState(selectedTaskVariables);
  const [taskVariablesKeys, setTaskVariablesKeys] = useState(
    selectedTaskVariablesKeys
  );
  const [checkboxes, setCheckboxes] = useState(selectedTaskAttrbutes);
  // const [selectUndefinedVariable, setSelectUndefinedVariable] = useState(
  //   showUndefinedVariable
  // );

  // const UndefinedVaribaleCheckboxChange = (e) => {
  //   setSelectUndefinedVariable(e.target.checked);
  // };

  const handleCheckboxChange = (event) => {
    const { name, checked } = event.target;
    setCheckboxes({ ...checkboxes, [name]: checked });
  };

  /**
   * Handles changing the selected task variables.
   *
   * When a variable is checked, adds it to the variables array.
   * When a variable is unchecked, removes it from the variables array.
   * Also updates the taskVariablesKeys object with the checked state.
   */
  const handleChangeTaskVariables = (e, variable) => {
    const { checked } = e.target;
    if (checked) {
      setVariables((prev) => [
        ...prev,
        { name: variable.key, label: variable.label },
      ]);
    } else {
      setVariables((prev) => prev.filter((i) => i.name !== variable.key));
    }
    /**
     * Updates the taskVariablesKeys object with the checked state
     * of the variable. If checked is true, adds the variable key.
     * If checked is false, removes the variable key.
     */
    setTaskVariablesKeys((prev) => ({
      ...prev,
      [variable.key]: checked ? variable.key : null,
    }));
  };

  const handleSave = () => {
    onSaveTaskAttribute(
      taskVariablesKeys,
      variables,
      checkboxes,
      // selectUndefinedVariable
    );
    onHide();
  };

  return (
    <Modal
      show={show}
      onHide={onHide}
      disableenforcefocus={"true"}
      className="modal-overlay"
      keyboard={false}
      size="lg"
      backdrop="static"
    >
      <Modal.Header className="bg-light">
        <ModalTitle>
          <p><Translation>{(t) => t("Task Attribute")}</Translation></p>
        </ModalTitle>
        <div className="icon-close" onClick={onHide} aria-label="Close">
          <CloseIcon />
        </div>
      </Modal.Header>
      <Modal.Body className="p-4">
        <p>
          <Translation>
            {(t) =>
              t(
                "Select the predefined attributes and custom task variables created as part of form submission you wish to display in the task list"
              )
            }
          </Translation>{" "}
        </p>

        <Form>
          <Row>
            <Col xs={6}>
              <Form.Check
                disabled={viewMode}
                type="checkbox"
                label={t("Submission Id")}
                name="applicationId"
                checked={checkboxes.applicationId}
                onChange={handleCheckboxChange}
                className="m-2"
              />
              <Form.Check
                disabled={viewMode}
                type="checkbox"
                label={t("Assignee")}
                name="assignee"
                checked={checkboxes.assignee}
                onChange={handleCheckboxChange}
                className="m-2"
              />
              <Form.Check
                disabled={viewMode}
                type="checkbox"
                label={t("Created Date")}
                name="createdDate"
                checked={checkboxes.createdDate}
                onChange={handleCheckboxChange}
                className="m-2"
              />
            </Col>
            <Col xs={6}>
              <Form.Check
                disabled={viewMode}
                type="checkbox"
                label={t("Due Date")}
                name="dueDate"
                checked={checkboxes.dueDate}
                onChange={handleCheckboxChange}
                className="m-2"
              />
              <Form.Check
                disabled={viewMode}
                type="checkbox"
                label={t("Follow up Date")}
                name="followUp"
                checked={checkboxes.followUp}
                onChange={handleCheckboxChange}
                className="m-2"
              />
              <Form.Check
                disabled={viewMode}
                type="checkbox"
                label={t("Priority")}
                name="priority"
                checked={checkboxes.priority}
                onChange={handleCheckboxChange}
                className="m-2"
              />
            </Col>
          </Row>
        </Form>
        <hr />
        <Form className="mt-2 ps-1">
          <h5 className="fw-bold fs-18">
            <Translation>{(t) => t("Task variables")}</Translation>
            <i
              title={t("You can define variables shown in the list")}
              className="ms-1 fa fa-info-circle text-primary"
            ></i>
          </h5>
          {/* <Form.Check
            type="checkbox"
            label={t("Show undefined variables")}
            checked={showUndefinedVariable}
            onChange={UndefinedVaribaleCheckboxChange}
          /> */}
          <div className="d-flex mt-3 px-2 flex-wrap">
            {selectedForm ? (
              taskVariableFromMapperTable?.length > 0 ? (
                taskVariableFromMapperTable.map((variable) =>
                  variable.key !== "applicationId" ? (
                    <Col xs={12} md={6} key={variable.key}>
                      <Form.Check
                        disabled={viewMode}
                        type="checkbox"
                        label={variable.label}
                        name={variable.key}
                        checked={
                          taskVariablesKeys[variable.key] == variable.key
                        }
                        onChange={(e) => {
                          handleChangeTaskVariables(e, variable);
                        }}
                      />
                    </Col>
                  ) : null
                )
              ) : (
                !processLoading && (
                  <div
                    className="alert alert-primary text-center w-100"
                    role="alert"
                  >
                    {t("No task variables found")}
                  </div>
                )
              )
            ) : (
              <div
                className="alert alert-primary text-center w-100"
                role="alert"
              >
                {t(
                  "To display task variables, select a form as part of the filter"
                )}
              </div>
            )}
          </div>
        </Form>
      </Modal.Body>
      { !viewMode &&
        <Modal.Footer>
          <div className="buttons-row">
            <button className="btn btn-link text-dark " onClick={onHide}>
              {t("Cancel")}
            </button>
            <button className="btn btn-primary" onClick={handleSave}>
              {t("Save")}
            </button>
          </div>
        </Modal.Footer>
      }
      
    </Modal>
  );
}

export default TaskAttributeComponent;
