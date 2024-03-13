import React from "react";
import { Row, Col } from "react-bootstrap";
import Modal from "react-bootstrap/Modal";
import ModalTitle from "react-bootstrap/ModalTitle";
import Form from "react-bootstrap/Form";
import {Translation, useTranslation } from "react-i18next";
import { useSelector } from "react-redux";

function TaskAttributeComponent({
  show,
  onHide,
  setCheckboxes,
  checkboxes,
  showUndefinedVariable,
  setShowUndefinedVariable,
  handleChangeTaskVariables,
  selectedTaskVariables,
  selectedForm
}) {

  const taskVariables = useSelector(state => state.process?.formProcessList?.taskVariable || []);
  const { t } = useTranslation();
  const handleCheckboxChange = (event) => {
    const { name, checked } = event.target;
    setCheckboxes({ ...checkboxes, [name]: checked });
  };
 
  
  const UndefinedVaribaleCheckboxChange = (e) => {
    setShowUndefinedVariable(e.target.checked);
  };
  return (
    <Modal
      show={show}
      onHide={onHide}
      disableEnforceFocus={true}
      className="modal-overlay"
      keyboard={false}
      size="lg"
      backdrop="static"
    >
      <Modal.Header className="bg-light">
        <ModalTitle as={"h3"}><Translation>{(t) => t("Task Attribute")}</Translation></ModalTitle>
        <button type="button" className="btn-close" aria-label="Close" onClick={onHide}></button>
      </Modal.Header>
      <Modal.Body className="p-4">
        <p><Translation>{(t) => t("Only selected task attributes will be available on task list view")}</Translation> </p>

        <Form>
          <Row>
            <Col xs={6}>
              <Form.Check
                type="checkbox"
                label={t("Submission ID")}
                name="applicationId"
                checked={checkboxes.applicationId}
                onChange={handleCheckboxChange}
                className="m-2"
              />
              <Form.Check
                type="checkbox"
                label={t("Assignee")}
                name="assignee"
                checked={checkboxes.assignee}
                onChange={handleCheckboxChange}
                className="m-2"
              />
              <Form.Check
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
                type="checkbox"
                label={t("Due Date")}
                name="dueDate"
                checked={checkboxes.dueDate}
                onChange={handleCheckboxChange}
                className="m-2"
              />
              <Form.Check
                type="checkbox"
                label={t("Follow up Date")}
                name="followUp"
                checked={checkboxes.followUp}
                onChange={handleCheckboxChange}
                className="m-2"
              />
              <Form.Check
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
          <h5 className="fw-bold fs-18"
          >
            <Translation>{(t) => t("Task variables")}</Translation>
            <i title={t("You can define variables shown in the list")} className="ms-1 fa fa-info-circle text-primary"></i>
          </h5>
          <Form.Check
              type="checkbox"
              label={ t("Show undefined variables")}
              checked={showUndefinedVariable}
              onChange={UndefinedVaribaleCheckboxChange}
            />
          <Row  className="mt-3">
          {selectedForm ? 
            taskVariables.map(variable=>(
              variable.key !== 'applicationId' ?
              <Col xs={6} key={variable.key}>
            <Form.Check
              type="checkbox"
              label={variable.label}
              name={variable.key}
              checked={selectedTaskVariables[variable.key] == variable.key}
              onChange={(e)=>{handleChangeTaskVariables(e,variable);}}
            />
            </Col> : null
            )) : <div className="alert alert-primary text-center w-100" role="alert">
           {t("To display task variables, select a form as part of the filter")}
          </div>
          }
          </Row>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <button className="btn btn-secondary" onClick={onHide}>
          {t("Cancel")}
        </button>
        <button className="btn btn-primary" onClick={onHide}>
          {t("Save")}
        </button>
      </Modal.Footer>
    </Modal>
  );
}

export default TaskAttributeComponent;
