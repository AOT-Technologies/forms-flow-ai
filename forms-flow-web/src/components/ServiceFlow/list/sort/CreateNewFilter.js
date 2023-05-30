import React, { useState } from "react";
import { useSelector } from "react-redux";
import clsx from "clsx";
import { makeStyles } from "@material-ui/core/styles";
import Drawer from "@material-ui/core/Drawer";
import Button from "@material-ui/core/Button";
import List from "@material-ui/core/List";
import Divider from "@material-ui/core/Divider";
import "../../ServiceFlow.scss";
import { saveFilters } from "../../../../apiManager/services/bpmTaskServices";

const useStyles = makeStyles({
  list: {
    width: 380,
  },
  fullList: {
    width: "auto",
  },
});

export default function MyComponent() {
  const [filterName, setFilterName] = useState("");
  const [showUndefinedVaribale, setShowUndefinedVaribale] = useState(false);
  const [inputVisibility, setInputVisibility] = useState({});
  const [definitionKeyId, setDefinitionKeyId] = useState("");
  const [candidateGroup, setCandidateGroup] = useState([]);
  const [taskName, setTaskName] = useState([]);
  const [includeAssignedTasks, setIncludeAssignedTasks] = useState(false);
  const [rows, setRows] = useState([]);
  const [newRow, setNewRow] = useState({ variableName: "", labelName: "" });
  const [permissions, setPermissions] = useState("");
  const [identifierId, setIdentifierId] = useState("");
  const [selectedIcon, setSelectedIcon] = useState("");
  const [specificUserGroup, setSpecificUserGroup] = useState("");
  const userName = useSelector((state) => state.user?.userDetail?.name);

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
      variables: rows.map((row) => ({
        name: row.variableName,
        label: row.labelName,
      })),

      users: [userName],
      roles: [selectedIcon],
      identifierId: identifierId,
    };
    saveFilters(data).then(toggleDrawer("left", false)).catch((error) => {
      console.error("error" , error);
    });
    console.log(data);


    //clearing the input feild after submission
    setFilterName("");
    setShowUndefinedVaribale("");
    setInputVisibility("");
    setDefinitionKeyId("");
    setCandidateGroup("");
    setTaskName("");
    setIncludeAssignedTasks("");
    setPermissions("");
    setIdentifierId("");
    setSelectedIcon("");
    setSpecificUserGroup("");
    setRows([]);
    setNewRow({ variableName: "", labelName: "" });
  };

  // Function for setting visibility of input feild in criteria part
  const handleSpanClick = (spanId) => {
    setInputVisibility((prevVisibility) => ({
      ...prevVisibility,
      [spanId]: !prevVisibility[spanId],
    }));
  };

  function uniqueId() {
    const timestamp = Date.now().toString(36); // Convert current timestamp to base 36
    const randomNum = Math.random().toString(36).substr(2, 5); // Generate a random number and convert to base 36
    return timestamp + randomNum;
  }

  //Function for taking values form checkbox from permission part
  const handleRadioChange = (event) => {
    setPermissions(event.target.value);
  };

  //Function For checking  UndefinedVaribaleCheckbox is checked or not
  const UndefinedVaribaleCheckboxChange = (e) => {
    setShowUndefinedVaribale(e.target.checked);
  };

  //Function For checking  includeAssignedTasksCheckbox is checked or not
  const includeAssignedTasksCheckboxChange = (e) => {
    setIncludeAssignedTasks(e.target.checked);
  };

  //Function to checking which icon is selected
  const handleIconClick = (iconName) => {
    setSelectedIcon(iconName);
  };

  //function for taking the value from the radio button Specific User/ Group
  const handleSpecificUserGroup = (e) => {
    setSpecificUserGroup(e.target.value);
  };

  //Function for taking the values from name input feild
  const handleVariableNameChange = (value, index) => {
    setRows((prevRows) => {
      const updatedRows = [...prevRows];
      updatedRows[index].variableName = value;
      return updatedRows;
    });
  };

  //Function for taking the values from label input feild
  const handleLabelNameChange = (value, index) => {
    setRows((prevRows) => {
      const updatedRows = [...prevRows];
      updatedRows[index].labelName = value;
      return updatedRows;
    });
  };

  //Function for taking the new values from new name input feild
  const handleNewVariableNameChange = (value) => {
    setNewRow((prevNewRow) => ({ ...prevNewRow, variableName: value }));
  };

  //Function for taking the new values from new label input feild
  const handleNewLabelNameChange = (value) => {
    setNewRow((prevNewRow) => ({ ...prevNewRow, labelName: value }));
  };

  //Function for adding rows for new inputs
  const handleAddRow = () => {
    setRows((prevRows) => [...prevRows, { id: uniqueId(), ...newRow }]);
    setNewRow({ variableName: "", labelName: "" });
  };

  //Function for delecting a row
  const handleRemoveRow = (id) => {
    setRows((prevRows) => prevRows.filter((row) => row.id !== id));
  };

  //bootstrap drawer
  const classes = useStyles();
  const [state, setState] = React.useState({
    top: false,
    left: false,
    bottom: false,
    right: false,
  });

  const toggleDrawer = (anchor, open) => (event) => {
    if (
      event.type === "keydown" &&
      (event.key === "Tab" || event.key === "Shift")
    ) {
      return;
    }

    setState({ ...state, [anchor]: open });
  };

  const list = (anchor) => (
    <div
      style={{ marginTop: "45px" }}
      className={clsx(classes.list, {
        [classes.fullList]: anchor === "top" || anchor === "bottom",
      })}
      role="presentation"
    >
      <List>
        <div
          className="newFilterTaskContainer-header noPadding"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <h5 style={{ fontWeight: "bold", fontSize: "16px" }}>
            Create new filter
          </h5>
          <span
            style={{ cursor: "pointer", fontSize: "14px" }}
            onClick={toggleDrawer("left", false)}
          >
            Close
          </span>
        </div>
      </List>
      <List>
        <h5 style={{ fontWeight: "bold", fontSize: "18px" }}>Filter Name</h5>
        <input
          type="text"
          placeholder="Enter your text here"
          style={{
            width: "90%",
            height: "44px",
            padding: "3%",
            border: "3px solid #C8C6C4",
            fontSize: "18px",
          }}
          value={filterName}
          onChange={(e) => setFilterName(e.target.value)}
        />
      </List>
      <Divider />
      <List>
        <h5 style={{ fontWeight: "bold", fontSize: "18px" }}>
          Criteria <i className="fa fa-info-circle"></i>{" "}
        </h5>
        <h5 style={{ fontSize: "18px" }}>Definition Key</h5>
        <span
          style={{
            textDecoration: "underline",
            fontSize: "14px",
            cursor: "pointer",
          }}
          onClick={() => handleSpanClick(1)}
          className="px-1 py-1"
        >
          <i className="fa fa-plus-circle" style={{ marginRight: "6px" }} />
          Add Value
        </span>
        {inputVisibility[1] && (
          <input
            type="text"
            style={{
              width: "80%",
              height: "40px",
              padding: "3%",
              border: "3px solid #C8C6C4",
            }}
            value={definitionKeyId}
            onChange={(e) => setDefinitionKeyId(e.target.value)}
          />
        )}
        <h5>Candidate Group</h5>
        <span
          style={{
            textDecoration: "underline",
            fontSize: "14px",
            cursor: "pointer",
          }}
          onClick={() => handleSpanClick(2)}
          className="px-1 py-1"
        >
          <i className="fa fa-plus-circle" style={{ marginRight: "6px" }} />
          Add Value
        </span>
        {inputVisibility[2] && (
          <input
            type="text"
            style={{
              width: "80%",
              height: "40px",
              padding: "3%",
              border: "3px solid #C8C6C4",
            }}
            value={candidateGroup}
            onChange={(e) => setCandidateGroup(e.target.value)}
          />
        )}
        <h5>Asignee</h5>
        <span
          style={{
            textDecoration: "underline",
            fontSize: "14px",
            cursor: "pointer",
          }}
          onClick={() => handleSpanClick(3)}
          className="px-1 py-1"
        >
          <i className="fa fa-plus-circle" style={{ marginRight: "6px" }} />
          Add Value
        </span>
        {inputVisibility[3] && (
          <input
            type="text"
            style={{
              width: "80%",
              height: "40px",
              padding: "3%",
              border: "3px solid #C8C6C4",
            }}
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
            Include Assigned Task
          </h5>
        </div>
        <Divider />
        <List>
          <h5 style={{ fontWeight: "bold", fontSize: "18px" }}>
            Variable <i className="fa fa-info-circle"></i>
          </h5>

          <div style={{ display: "flex", alignItems: "center" }}>
            <input
              type="checkbox"
              id="my-checkbox"
              checked={showUndefinedVaribale}
              onChange={UndefinedVaribaleCheckboxChange}
              style={{ marginRight: "6px" }}
            />
            <h5 style={{ fontSize: "18px", marginBottom: "3px" }}>
              Show undefined variables
            </h5>
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-end",
              flexDirection: "column",
            }}
          >
            {rows.map((row, index) => (
              <div
                key={row.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  marginTop: "10px",
                  fontSize: "14px",
                }}
              >
                <div>
                  <label>Name</label> <br />
                  <input
                    type="text"
                    placeholder="Name of variable"
                    style={{
                      width: "90%",
                      height: "35px",
                      border: "3px solid #C8C6C4",
                    }}
                    value={row.variableName}
                    onChange={(e) =>
                      handleVariableNameChange(e.target.value, index)
                    }
                  />
                </div>
                <div>
                  <label>Label</label> <br />
                  <input
                    type="text"
                    placeholder="Readable name"
                    style={{
                      width: "90%",
                      height: "35px",
                      border: "3px solid #C8C6C4",
                    }}
                    value={row.labelName}
                    onChange={(e) =>
                      handleLabelNameChange(e.target.value, index)
                    }
                  />
                </div>
                <i
                  className="fa fa-minus-circle"
                  style={{
                    cursor: "pointer",
                    fontSize: "36px",
                    marginTop: "30px",
                    marginRight: "10px",
                    color: "red",
                  }}
                  onClick={() => handleRemoveRow(row.id)}
                ></i>
              </div>
            ))}

            <div
              style={{
                display: "flex",
                alignItems: "flex-end",
                marginTop: "10px",
                fontSize: "14px",
              }}
            >
              <div>
                <label>Name</label> <br />
                <input
                  type="text"
                  placeholder="Name of variable"
                  style={{
                    width: "90%",
                    height: "35px",
                    fontSize: "14px",
                    border: "3px solid #C8C6C4",
                  }}
                  value={newRow.variableName}
                  onChange={(e) => handleNewVariableNameChange(e.target.value)}
                />
              </div>
              <div>
                <label>Label</label> <br />
                <input
                  type="text"
                  placeholder="Readable name"
                  style={{
                    width: "90%",
                    height: "35px",
                    fontSize: "14px",
                    border: "3px solid #C8C6C4",
                  }}
                  value={newRow.labelName}
                  onChange={(e) => handleNewLabelNameChange(e.target.value)}
                />
              </div>
              <button
                style={{
                  height: "40px",
                  background: "rgb(77, 97, 252)",
                  border: "none",
                  borderRadius: "5px",
                  color: "white",
                  fontSize: "14px",
                }}
                onClick={handleAddRow}
              >
                Add
              </button>
            </div>
          </div>
        </List>
        <Divider />
        <div className="child-container-two">
          <h5 style={{ fontWeight: "bold" }}>
            Permission <i className="fa fa-info-circle"></i>
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
            Accessible for all users
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
          <label style={{ fontSize: "18px" }}>Private (Only You)</label>
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
          <label style={{ fontSize: "18px" }}>Specific User/ Group</label>{" "}
          <br />
          {specificUserGroup === "Specific User/ Group" && (
            <div className="inside-child-container-two d-flex">
              <div className="user-group-divisions d-flex">
                <div style={{ fontSize: "14px" }}>
                  User
                  <i
                    className={`fa fa-user ${
                      selectedIcon === "user" ? "highlight" : ""
                    }`}
                    style={{ fontSize: "30px", cursor: "pointer" }}
                    onClick={() => handleIconClick("user")}
                  />
                </div>
                <div style={{ fontSize: "14px" }}>
                  Group
                  <i
                    className={`fa fa-users ${
                      selectedIcon === "group" ? "highlight" : ""
                    }`}
                    style={{ fontSize: "30px", cursor: "pointer" }}
                    onClick={() => handleIconClick("group")}
                  />
                </div>
              </div>
              <div>
                <label style={{ fontSize: "16px" }}>Identifier</label>
                <input
                  type="text"
                  placeholder="Enter role ID"
                  style={{ width: "100%", height: "35px" }}
                  value={identifierId}
                  onChange={(e) => setIdentifierId(e.target.value)}
                />
              </div>
            </div>
          )}
        </div>
      </List>
      <Divider />
      <List>
        <div
          className="newFilterTaskContainer-footer"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-end",
          }}
        >
          <span
            style={{ cursor: "pointer" }}
            onClick={toggleDrawer("left", false)}
          >
            Cancel
          </span>
          <button
            style={{
              marginLeft: "20px",
              background: "rgb(77, 97, 252)",
              color: "white",
              border: "none",
              borderRadius: "5px",
            }}
            onClick={() => {
              handleSubmit();            
            }}
          >
            Create Filter
          </button>
        </div>
      </List>
    </div>
  );

  return (
    <div>
      <React.Fragment key="left">
        <Button
          onClick={toggleDrawer("left", true)}
          style={{
            textDecoration: "underline",
            cursor: "pointer",
            textTransform: "capitalize",
          }}
        >
          Create new filter
        </Button>
        <Drawer
          anchor="left"
          open={state.left}
          onClose={toggleDrawer("left", false)}
          PaperProps={{
            style: {
              padding: "2%",
              overflowY: "auto",
              overflowX: "hidden",
              zIndex: "1500",
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
