import React, { useState } from "react";
import { Button } from "react-bootstrap";
import Select from "react-select";
import { useTranslation } from "react-i18next";
import { Row, Col } from "react-bootstrap";
import { Form } from 'react-bootstrap';

const TaskvariableCreate = ({ options, addTaskVariable }) => {
  const { t } = useTranslation();
  const [selectedValue, setSelectedValue] = useState("");
  const [taskLabel, setTaskLable] = useState("");
  const [showInList, setShowInList] = useState(false);

  const fomatOptionLabel = ({ label, value }, { context }) => {
    if (context === "value") {
      return <div>{value}</div>;
    } else if (context === "menu") {
      return <div className="p-2 click-element">{`${value} (${label})`}</div>;
    }
  };

  const selectTaskVariable = (data) => {
    setSelectedValue(data);
    setTaskLable(data.label);
  };

  const addTask = () => {
    const data = {
      key: selectedValue.value,
      defaultLabel: selectedValue.label,
      label: taskLabel,
      showInList: showInList,
    };
    if (selectedValue.value && taskLabel && selectedValue.label) {
      addTaskVariable(data);
    }
  };

  return (
    <>
      <Row className="my-4">
        <Col xs={12} md={3}>
          <label htmlFor="selectTaskVariable">{t("Form field")}</label>
          <Select
            searchable
            options={options}
            onChange={(item) => {
              selectTaskVariable(item);
            }}
            formatOptionLabel={fomatOptionLabel}
            placeholder={t("Select form field")}
            inputId="selectTaskVariable"
          />
        </Col>
        <Col xs={12} md={3}>
          <label>{t("Label")}</label>
          <input
            type="text"
            value={taskLabel}
            onChange={(e) => {
              setTaskLable(e.target.value);
            }}
            className="form-control"
            placeholder={t("Enter Label")}
          />
        </Col>
        <Col xs={12} md={3}>

          <Form.Group controlId="showInListCheckbox" style={{ marginTop: "34px" }}>
            <div className="d-flex align-items-center mt-3 mr-4">
              <Form.Label className="mr-2">{t("Show in list")}</Form.Label>
              <Form.Check
                type="checkbox"

                onChange={() => {
                  setShowInList(!showInList);
                }}
              />
            </div>
          </Form.Group>
        </Col>

        <Col xs={12} md={2}>
          <Button
            style={{ marginTop: "25px" }}
            variant="outline-primary"
            onClick={() => {
              addTask();
            }}
          >
            <i className="fa fa-check mr-2"></i> {t("Add")}
          </Button>
        </Col>
      </Row>
    </>
  );
};

export default TaskvariableCreate;
