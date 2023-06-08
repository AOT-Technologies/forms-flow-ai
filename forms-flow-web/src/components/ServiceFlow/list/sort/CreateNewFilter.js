import React, { useState } from "react";
import { useSelector } from "react-redux";
import Drawer from "@material-ui/core/Drawer";
import Button from "@material-ui/core/Button";
import List from "@material-ui/core/List";
import Divider from "@material-ui/core/Divider";
import { saveFilters } from "../../../../apiManager/services/bpmTaskServices";
import { Translation } from "react-i18next";
import { useTranslation } from "react-i18next";

export default function CreateNewFilterDrawer() {
  const [openDrawer, setOpenDrawer] = useState(false);
  const [filterName, setFilterName] = useState("");
  const [showUndefinedVariable, setShowUndefinedVariable] = useState(false);
  const [inputVisibility, setInputVisibility] = useState({});
  const [definitionKeyId, setDefinitionKeyId] = useState("");
  const [candidateGroup, setCandidateGroup] = useState([]);
  const [taskName, setTaskName] = useState("");
  const [includeAssignedTasks, setIncludeAssignedTasks] = useState(false);
  const defaultRow = { id: "", name: "", label: "", add: true, delete: false };
  const [rows, setRows] = useState([defaultRow]);
  const [newRow, setNewRow] = useState([]);
  const [permissions, setPermissions] = useState("");
  const [identifierId, setIdentifierId] = useState("");
  const [selectUserGroupIcon, setSelectUserGroupIcon] = useState("");
  const [specificUserGroup, setSpecificUserGroup] = useState("");
  const userName = useSelector((state) => state.user?.userDetail?.name);
  const { t } = useTranslation();

  //Function for collecting the input data
  const handleSubmit = () => {
    const data = {
      name: filterName,
      criteria: {
        processDefinitionKey: definitionKeyId,
        candidateGroup: candidateGroup,
        assignee: taskName,
        includeAssignedTasks: false,
      },
      variables: [
        ...rows.map((row) => ({
          name: row.name,
          label: row.label,
        })),
      ],
      users: [userName],
      roles: [selectUserGroupIcon],
      identifierId: identifierId,
    };
    saveFilters(data)
      .then(() => {
        toggleDrawer(false);
        // Clearing the input fields after submission
        setFilterName("");
        setShowUndefinedVariable("");
        setInputVisibility("");
        setDefinitionKeyId("");
        setCandidateGroup("");
        setTaskName("");
        setIncludeAssignedTasks("");
        setPermissions("");
        setIdentifierId("");
        setSelectUserGroupIcon("");
        setSpecificUserGroup("");
        setRows([defaultRow]);
      })
      .catch((error) => {
        console.error("error", error);
      });
  };

  // Function for setting visibility of input feild in criteria part
  const handleSpanClick = (spanId) => {
    setInputVisibility((prevVisibility) => ({
      ...prevVisibility,
      [spanId]: !prevVisibility[spanId],
    }));
  };

  //Function for taking values form checkbox from permission part
  const handleRadioChange = (e) => {
    setPermissions(e.target.value);
    setSpecificUserGroup("");
    setSelectUserGroupIcon("");
    setIdentifierId("");
  };

  //Function For checking  UndefinedVaribaleCheckbox is checked or not
  const UndefinedVaribaleCheckboxChange = (e) => {
    setShowUndefinedVariable(e.target.checked);
  };

  //Function For checking  includeAssignedTasksCheckbox is checked or not
  const includeAssignedTasksCheckboxChange = (e) => {
    setIncludeAssignedTasks(e.target.checked);
  };

  //Function to checking which icon is selected
  const handleClickUserGroupIcon = (icon) => {
    setSelectUserGroupIcon(icon);
  };

  //function for taking the value from the radio button Specific User/ Group
  const handleSpecificUserGroup = (e) => {
    if (e.target.value === "Specific User/ Group") {
      setSpecificUserGroup(e.target.value);
    } else {
      setSpecificUserGroup("");
      setSelectUserGroupIcon("");
      setIdentifierId("");
    }
  };

  // Function for taking the values from the name input field
  const handleVariableNameChange = (value, index) => {
    setRows((prevRows) => {
      const updatedRows = [...prevRows];
      updatedRows[index].name = value;
      return updatedRows;
    });
  };

  // Function for taking the values from the label input field
  const handleLabelNameChange = (value, index) => {
    setRows((prevRows) => {
      const updatedRows = [...prevRows];
      updatedRows[index].label = value;
      return updatedRows;
    });
  };

  //Function for adding rows for new inputs
  const handleAddRow = (index) => {
    setRows((prevRows) => [
      { id: index, ...newRow, delete: true },
      ...prevRows,
    ]);
    setNewRow({ name: "", label: "", delete: true });
  };

  //Function for delecting a row
  const handleRemoveRow = (id) => {
    setRows((prevRows) => prevRows.filter((row) => row.id !== id));
  };

  const toggleDrawer = () => setOpenDrawer(!openDrawer);

  const list = () => (
    <div style={{ marginTop: "45px" }} role="presentation">
      <List>
        <div className="newFilterTaskContainer-header p-0 d-flex align-items-center justify-content-between">
          <h5 style={{ fontWeight: "bold", fontSize: "16px" }}>
            <Translation>{(t) => t("Create new filter")}</Translation>
          </h5>
          <span
            className="cursor-pointer"
            style={{ fontSize: "14px" }}
            onClick={() => toggleDrawer()}
          >
            <Translation>{(t) => t("Close")}</Translation>
          </span>
        </div>
      </List>
      <List>
        <h5 style={{ fontWeight: "bold", fontSize: "18px" }}>
          <Translation>{(t) => t("Filter Name")}</Translation>
        </h5>
        <input
          type="text"
          placeholder={t("Enter your text here")}
          className="filter-name-textfeild"
          value={filterName}
          onChange={(e) => setFilterName(e.target.value)}
        />
      </List>
      <Divider />
      <List>
        <h5 style={{ fontWeight: "bold", fontSize: "18px" }}>
          <Translation>{(t) => t("Criteria")}</Translation>{" "}
          <i className="fa fa-info-circle"></i>{" "}
        </h5>
        <h5 style={{ fontSize: "18px" }}>
          <Translation>{(t) => t("Definition Key")}</Translation>
        </h5>
        <span
          style={{
            textDecoration: "underline",
            fontSize: "14px",
          }}
          onClick={() => handleSpanClick(1)}
          className="px-1 py-1 cursor-pointer"
        >
          <i className="fa fa-plus-circle" style={{ marginRight: "6px" }} />
          <Translation>{(t) => t("Add Value")}</Translation>
        </span>
        {inputVisibility[1] && (
          <input
            type="text"
            className="criteria-add-value-inputbox"
            value={definitionKeyId}
            onChange={(e) => setDefinitionKeyId(e.target.value)}
          />
        )}
        <h5>
          <Translation>{(t) => t("Candidate Group")}</Translation>
        </h5>
        <span
          style={{
            textDecoration: "underline",
            fontSize: "14px",
          }}
          onClick={() => handleSpanClick(2)}
          className="px-1 py-1 cursor-pointer"
        >
          <i className="fa fa-plus-circle" style={{ marginRight: "6px" }} />
          <Translation>{(t) => t("Add Value")}</Translation>
        </span>
        {inputVisibility[2] && (
          <input
            type="text"
            className="criteria-add-value-inputbox"
            value={candidateGroup}
            onChange={(e) => setCandidateGroup(e.target.value)}
          />
        )}
        <h5>
          <Translation>{(t) => t("Asignee")}</Translation>
        </h5>
        <span
          style={{
            textDecoration: "underline",
            fontSize: "14px",
          }}
          onClick={() => handleSpanClick(3)}
          className="px-1 py-1 cursor-pointer"
        >
          <i className="fa fa-plus-circle" style={{ marginRight: "6px" }} />
          <Translation>{(t) => t("Add Value")}</Translation>
        </span>
        {inputVisibility[3] && (
          <input
            type="text"
            className="criteria-add-value-inputbox"
            value={taskName}
            onChange={(e) => setTaskName(e.target.value)}
          />
        )}

        <div
          style={{ display: "flex", alignItems: "center", marginTop: "10px" }}
        >
          <input
            type="checkbox"
            id="assignedTask-checkbox"
            checked={includeAssignedTasks}
            onChange={includeAssignedTasksCheckboxChange}
            style={{ marginRight: "6px" }}
          />
          <h5 style={{ fontSize: "18px", marginBottom: "3px" }}>
            <Translation>{(t) => t("Include Assigned Task")}</Translation>
          </h5>
        </div>
        <Divider />
        <List>
          <h5 style={{ fontWeight: "bold", fontSize: "18px" }}>
            <Translation>{(t) => t("Variable")}</Translation>{" "}
            <i className="fa fa-info-circle"></i>
          </h5>

          <div style={{ display: "flex", alignItems: "center" }}>
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

          <div>
            {rows.map((row, index) => (
              <div key={row.id} className="row-container">
                <div className="input-container">
                  <label>
                    <Translation>{(t) => t("Name")}</Translation>
                  </label>
                  <input
                    type="text"
                    placeholder={t("Name of variable")}
                    className="varible-input-boxes"
                    value={row.name}
                    onChange={(e) =>
                      handleVariableNameChange(e.target.value, index)
                    }
                  />
                </div>
                <div className="input-container">
                  <label>
                    <Translation>{(t) => t("Label")}</Translation>
                  </label>
                  <input
                    type="text"
                    placeholder={t("Readable name")}
                    className="varible-input-boxes"
                    value={row.label}
                    onChange={(e) =>
                      handleLabelNameChange(e.target.value, index)
                    }
                  />
                </div>
                {row.delete ? (
                  <i
                    className="fa fa-minus-circle"
                    onClick={() => handleRemoveRow(row.id)}
                  ></i>
                ) : (
                  <></>
                )}

                {row.add ? (
                  <button
                    className="btn btn-primary"
                    onClick={() => handleAddRow(index)}
                  >
                    <Translation>{(t) => t("Add")}</Translation>
                  </button>
                ) : (
                  <></>
                )}
              </div>
            ))}
          </div>
        </List>
        <Divider />
        <div className="child-container-two">
          <h5 style={{ fontWeight: "bold" }}>
            <Translation>{(t) => t("Permission")}</Translation>{" "}
            <i className="fa fa-info-circle"></i>
          </h5>
          <input
            style={{ marginRight: "4px" }}
            type="radio"
            id="my-radio"
            name="my-radio"
            value={"Accessible for all users"}
            checked={permissions === "Accessible for all users"}
            onChange={handleRadioChange}
          />
          <label style={{ marginRight: "3px", fontSize: "18px" }}>
            <Translation>{(t) => t("Accessible for all users")}</Translation>
          </label>{" "}
          <br />
          <input
            style={{ marginRight: "4px" }}
            type="radio"
            id="my-radio"
            name="my-radio"
            value={"Private (Only You)"}
            checked={permissions === "Private (Only You)"}
            onChange={handleRadioChange}
          />
          <label style={{ fontSize: "18px" }}>
            {" "}
            <Translation>{(t) => t("Private (Only You)")}</Translation>
          </label>
          <br />
          <input
            style={{ marginRight: "4px" }}
            type="radio"
            id="my-radio"
            name="my-radio"
            value={"Specific User/ Group"}
            checked={specificUserGroup === "Specific User/ Group"}
            onChange={handleSpecificUserGroup}
          />
          <label style={{ fontSize: "18px" }}>
            <Translation>{(t) => t("Specific User/ Group")}</Translation>
          </label>{" "}
          <br />
          {specificUserGroup === "Specific User/ Group" ? (
            <div className="inside-child-container-two d-flex">
              <div className="user-group-divisions d-flex">
                <div style={{ fontSize: "14px" }}>
                  <Translation>{(t) => t("User")}</Translation>
                  <i
                    className={`fa fa-user ${
                      selectUserGroupIcon === "user" ? "highlight" : ""
                    } cursor-pointer`}
                    style={{ fontSize: "30px" }}
                    onClick={() => handleClickUserGroupIcon("user")}
                  />
                </div>
                <div style={{ fontSize: "14px" }}>
                  <Translation>{(t) => t("Group")}</Translation>
                  <i
                    className={`fa fa-users ${
                      selectUserGroupIcon === "group" ? "highlight" : ""
                    } cursor-pointer`}
                    style={{ fontSize: "30px" }}
                    onClick={() => handleClickUserGroupIcon("group")}
                  />
                </div>
              </div>
              <div>
                <label style={{ fontSize: "16px" }}>
                  {" "}
                  <Translation>{(t) => t("Identifier")}</Translation>
                </label>
                <input
                  type="text"
                  placeholder={t("Enter role ID")}
                  style={{ width: "100%", height: "35px" }}
                  value={identifierId}
                  onChange={(e) => setIdentifierId(e.target.value)}
                />
              </div>
            </div>
          ) : null}
        </div>
      </List>
      <Divider />
      <List>
        <div className="newFilterTaskContainer-footer d-flex align-items-center justify-content-end">
          <span className="cursor-pointer" onClick={() => toggleDrawer(false)}>
            <Translation>{(t) => t("Cancel")}</Translation>
          </span>
          <button
            className="btn btn-primary ml-3 submitButton"
            onClick={() => {
              handleSubmit();
            }}
          >
            <Translation>{(t) => t("Create Filter")}</Translation>
          </button>
        </div>
      </List>
    </div>
  );
  return (
    <div>
      <React.Fragment key="left">
        <Button
          onClick={() => toggleDrawer(true)}
          style={{
            textDecoration: "underline",
            cursor: "pointer",
            textTransform: "capitalize",
          }}
        >
          <Translation>{(t) => t("Create new filter")}</Translation>
        </Button>
        <Drawer
          anchor="left"
          open={openDrawer}
          onClose={() => toggleDrawer(false)}
          PaperProps={{
            style: {
              width: "400px",
              padding: "2%",
              overflowY: "auto",
              overflowX: "hidden",
              backdropFilter: " none !important",
            },
          }}
          sx={{
            width: 100,
          }}
        >
          {list("left")}
        </Drawer>
      </React.Fragment>
    </div>
  );
}
