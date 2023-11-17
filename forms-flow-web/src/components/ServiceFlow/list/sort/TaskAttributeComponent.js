import React from "react";
import { Row, Col } from "react-bootstrap";
import Modal from "react-bootstrap/Modal";
import ModalTitle from "react-bootstrap/ModalTitle";
import Form from "react-bootstrap/Form";
import {Translation, useTranslation } from "react-i18next";

function TaskAttributeComponent({
  show,
  onHide,
  setCheckboxes,
  checkboxes,
  inputValues,
  setInputValues,
  showUndefinedVariable,
  setShowUndefinedVariable,
}) {
  const { t } = useTranslation();
  const handleCheckboxChange = (event) => {
    const { name, checked } = event.target;
    setCheckboxes({ ...checkboxes, [name]: checked });
  };

  const handleVariableInputChange = (index, field, value) => {
    setInputValues((prevInputValues) => {
      const updatedValues = [...prevInputValues];
      updatedValues[index][field] = value;
      return updatedValues;
    });
  };

  const handleAddClick = () => {
    setInputValues([...inputValues, { name: "", label: "" }]);
  };

  const handleRowDelete = (index) => {
    setInputValues((prevInputValues) => {
      const updatedValues = prevInputValues.filter((e, i) => i !== index);
      return updatedValues;
    });
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
      <Modal.Header closeButton className="bg-light">
        <ModalTitle as={"h3"}><Translation>{(t) => t("Task Attribute")}</Translation></ModalTitle>
      </Modal.Header>
      <Modal.Body className="p-4">
        <p><Translation>{(t) => t("Only selected task attributes will be available on task list view")}</Translation> </p>

        <Form>
          <Row>
            <Col xs={6}>
              <Form.Check
                type="checkbox"
                label="Application ID"
                name="applicationId"
                checked={checkboxes.applicationId}
                onChange={handleCheckboxChange}
                className="m-2"
              />
              <Form.Check
                type="checkbox"
                label="Assignee"
                name="assignee"
                checked={checkboxes.assignee}
                onChange={handleCheckboxChange}
                className="m-2"
              />
              <Form.Check
                type="checkbox"
                label="Task Title"
                name="taskTitle"
                checked={checkboxes.taskTitle}
                onChange={handleCheckboxChange}
                className="m-2"
              />
              <Form.Check
                type="checkbox"
                label="Created Date"
                name="createdDate"
                checked={checkboxes.createdDate}
                onChange={handleCheckboxChange}
                className="m-2"
              />
            </Col>
            <Col xs={6}>
              <Form.Check
                type="checkbox"
                label="Due date"
                name="dueDate"
                checked={checkboxes.dueDate}
                onChange={handleCheckboxChange}
                className="m-2"
              />
              <Form.Check
                type="checkbox"
                label="Follow-up date"
                name="followUp"
                checked={checkboxes.followUp}
                onChange={handleCheckboxChange}
                className="m-2"
              />
              <Form.Check
                type="checkbox"
                label="Priority"
                name="priority"
                checked={checkboxes.priority}
                onChange={handleCheckboxChange}
                className="m-2"
              />
              <Form.Check
                type="checkbox"
                label="Groups"
                name="groups"
                checked={checkboxes.groups}
                onChange={handleCheckboxChange}
                className="m-2"
              />
            </Col>
          </Row>
        </Form>
        <hr />
        <Form className="mt-2 pl-1">
          <h5 style={{ fontWeight: "bold", fontSize: "18px" }}>
            <Translation>{(t) => t("Variables")}</Translation>{" "}
            <i title={t("You can define variables shown in the list")} className="fa fa-info-circle"></i>{" "}
          </h5>

          <div className="d-flex align-items-center mt-2">
            <input
              type="checkbox"
              id="my-checkbox"
              checked={showUndefinedVariable}
              onChange={UndefinedVaribaleCheckboxChange}
              style={{ marginRight: "6px" }}
            />
            <h5 style={{ fontSize: "18px", marginBottom: "3px" }}>
              <Translation>{(t) => t("Show undefined variables")}</Translation>
            </h5>
          </div>

          {inputValues?.map((input, index) => {
            return (
              <Row key={index} className="align-items-center mt-1">
                <Col>
                  <Form.Group>
                    <Form.Label>{t("Name")}</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Enter name"
                      value={input.name}
                      onChange={(e) =>
                        handleVariableInputChange(index, "name", e.target.value)
                      }
                    />
                  </Form.Group>
                </Col>
                <Col>
                  <Form.Group>
                    <Form.Label>{t("Label")}</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Enter label"
                      value={input.label}
                      onChange={(e) =>
                        handleVariableInputChange(
                          index,
                          "label",
                          e.target.value
                        )
                      }
                    />
                  </Form.Group>
                </Col>
                <Col xs="auto mt-3 mr-2">
                  {index === 0 ? (
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={() => handleAddClick()}
                    >
                      {t("Add")}
                    </button>
                  ) : (
                    <i
                      className="fa fa-minus-circle fa-lg"
                      aria-hidden="true"
                      onClick={() => handleRowDelete(index)}
                    />
                  )}
                </Col>
              </Row>
            );
          })}
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <button className="btn btn-secondary" onClick={() => onHide()}>
          {t("Cancel")}
        </button>
        <button className="btn btn-primary" onClick={onHide}>
          {t("Insert")}
        </button>
      </Modal.Footer>
    </Modal>
  );
}

export default TaskAttributeComponent;
