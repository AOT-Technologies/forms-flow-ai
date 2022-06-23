import React, { useState } from "react";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Grid from "@material-ui/core/Grid";
import Button from "@material-ui/core/Button";

import Select from "react-select";
import Checkbox from "@material-ui/core/Checkbox";
import { useTranslation } from "react-i18next";
const TaskvariableCreate = ({ options, addTaskVariable }) => {
  const { t } = useTranslation();
  const [selectedValue, setSelectedValue] = useState("");
  const [taskLabel, setTaskLable] = useState("");
  const [showInList, setShowInList] = useState(false);
  //   this is for formatting label on select
  const fomatOptionLabel = ({ label, value }, { context }) => {
    if (context === "value") {
      return <div>{value}</div>;
    } else if (context === "menu") {
      return <div className="p-2 click-element">{`${value} (${label})`}</div>;
    }
  };

  // this function will work on select the task varibale
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
      <Grid
        container
        spacing={2}
        style={{ alignItems: "center" }}
        className="my-4"
      >
        <Grid item xs={12} md={3}>
          <label>{t("Form field")}</label>
          <Select
            searchable
            options={options}
            onChange={(item) => {
              selectTaskVariable(item);
            }}
            formatOptionLabel={fomatOptionLabel}
            placeholder={t("Select form field")}
          />
        </Grid>
        <Grid item xs={12} md={2}>
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
        </Grid>
        <Grid item xs={12} md={2}>
          <FormControlLabel
            value="start"
            control={
              <Checkbox
                onChange={() => {
                  setShowInList(!showInList);
                }}
                color="primary"
              />
            }
            labelPlacement="start"
            label={t("Show in list")}
            style={{ marginTop: "30px" }}
          />
        </Grid>

        <Grid item xs={12} md={1}>
          <Button
            style={{ marginTop: "20px" }}
            variant="outlined"
            color="primary"
            size="small"
            onClick={() => {
              addTask();
            }}
            startIcon={<i className="fa fa-check"></i>}
          >
            {t("Add")}
          </Button>
        </Grid>
      </Grid>
    </>
  );
};

export default TaskvariableCreate;
