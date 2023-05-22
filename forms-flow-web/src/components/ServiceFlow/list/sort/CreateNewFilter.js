import React, { useState } from "react";
import clsx from "clsx";
import { makeStyles } from "@material-ui/core/styles";
import Drawer from "@material-ui/core/Drawer";
import Button from "@material-ui/core/Button";
import List from "@material-ui/core/List";
import Divider from "@material-ui/core/Divider";
import "../../ServiceFlow.scss";

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
  const [showUndefinedVaribale, setShowUndefinedVaribale] = useState(true);
  const [variableName, setVariableName] = useState("");
  const [labelName, setLabelName] = useState("");
  const [newfilterArray, setNewFilterArray] = useState([]);
  const [inputVisibility, setInputVisibility] = useState({});
  const [definitionKeyId, setDefinitionKeyId] = useState("");
  const [roleValue, setRoleValue] = useState("");
  const [userValue, setUserValue] = useState("");
  const [rows, setRows] = useState([{ id: 1 }]);
  const [selectedOption, setSelectedOption] = useState("");
  const [identifierId, setIdentifierId] = useState("");
  const [selectedIcon, setSelectedIcon] = useState("");
  const [specificUserGroup, setSpecificUserGroup] = useState("");

  const handleSubmit = () => {
    const newFilter = {
      filterName: filterName,
      showUndefinedVaribale: showUndefinedVaribale,
      variableName: variableName,
      labelName: labelName,
      definitionKeyId: definitionKeyId,
      roleValue: roleValue,
      userValue: userValue,
      selectedOption: selectedOption,
      identifierId: identifierId,
      selectedIcon: selectedIcon,
    };
    setNewFilterArray([...newfilterArray, newFilter]);
    console.log(newFilter);
  };


  const handleSpanClick = (spanId) => {
    setInputVisibility((prevVisibility) => ({
      ...prevVisibility,
      [spanId]: !prevVisibility[spanId],
    }));
  };

  const handleAddRow = () => {
    const newRow = { id: rows.length + 1 };
    setRows((prevRows) => [...prevRows, newRow]);
  };

  const handleRadioChange = (event) => {
    setSelectedOption(event.target.value);
  };

  const handleCheckboxChange = (e) => {
    setShowUndefinedVaribale(e.target.checked);
  };

  const handleIconClick = (iconName) => {
    setSelectedIcon(iconName);
  };

  const handleSpecificUserGroup = (e) => {
    setSpecificUserGroup(e.target.value);
  };

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
    <div style={{ marginTop : "45px"}}
      className={clsx(classes.list, {
        [classes.fullList]: anchor === "top" || anchor === "bottom",
      })}
      role="presentation"
      //   onClick={toggleDrawer(anchor, false)}
      //   onKeyDown={toggleDrawer(anchor, false)}
    >
      <List>
        <div
          className="newFilterTaskContainer-header noPadding"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            background: "rgb(248, 248, 248)",
          }}
        >
          <h5 style={{ fontWeight: "bold" }}>Create new filter</h5>
          <span
            style={{ cursor: "pointer" }}
            onClick={toggleDrawer("left", false)}
          >
            Close
          </span>
        </div>
      </List>
      <List>
        <h5 style={{ fontWeight: "bold" }}>Filter Name</h5>
        <input
          type="text"
          placeholder="Enter your text here"
          style={{ width: "90%", padding: "3%" }}
          value={filterName}
          onChange={(e) => setFilterName(e.target.value)}
        />
      </List>
      <Divider />
      <List>
        <h5 style={{ fontWeight: "bold" }}>
          Criteria <i className="fa fa-info-circle"></i>{" "}
        </h5>
        <h5>Definition Key Id</h5>
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
            style={{ width: "80%", height: "40px", padding: "3%" }}
            value={definitionKeyId}
            onChange={(e) => setDefinitionKeyId(e.target.value)}
          />
        )}
        <h5>Role</h5>
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
            style={{ width: "80%", height: "40px", padding: "3%" }}
            value={roleValue}
            onChange={(e) => setRoleValue(e.target.value)}
          />
        )}
        <h5>User</h5>
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
            style={{ width: "80%", height: "40px", padding: "3%" }}
            value={userValue}
            onChange={(e) => setUserValue(e.target.value)}
          />
        )}
      </List>
      <Divider />
      <List>
        <h5 style={{ fontWeight: "bold" }}>
          Variable <i className="fa fa-info-circle"></i>
        </h5>
        <div style={{ display: "flex", alignItems: "center" }}>
          <input
            type="checkbox"
            id="my-checkbox"
            checked={showUndefinedVaribale}
            onChange={handleCheckboxChange}
            style={{ marginRight: "6px" }}
          />
          <h5>Show undefined variables</h5>
        </div>

        <div style={{ display : "flex" , justifyContent : "space-between" , alignItems : "flex-end" }}>    
          {rows.map((row) => (
            <div
              key={row.id}
              style={{ display: "flex", alignItems: "flex-end", gap: "10px" }}
            >
              <div style={{ flex: "1" }}>
                <label>Name</label> <br />
                <input
                  type="text"
                  placeholder="Name of variable"
                  style={{ width: "90%", height: "35px" }}
                  value={variableName}
                  onChange={(e) => setVariableName(e.target.value)}
                />
              </div>
              <div style={{ flex: "1" }}>
                <label>Label</label>
                <input
                  type="text"
                  placeholder="Readable name"
                  style={{ width: "90%", height: "35px" }}
                  value={labelName}
                  onChange={(e) => setLabelName(e.target.value)}
                />
              </div>
            </div>
          ))}
          <div style={{ display: "flex", alignItems: "flex-end", gap: "10px" }}>
            <div>
              <button
                style={{
                  width: "90%",
                  height: "40px",
                  background: "rgb(77, 97, 252)",
                  border: "none",
                  borderRadius: "5px",
                  color: "white",
                }}
                onClick={handleAddRow}
              >
                Add
              </button>
            </div>
          </div>
        </div>
      </List>
      <Divider />
      <List>
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
            checked={selectedOption === "Accessible for all users"}
            onChange={handleRadioChange}
          />
          <label style={{ marginRight: "3px" }}>Accessible for all users</label>{" "}
          <br />
          <input
            style={{ marginRight: "4px" }}
            type="radio"
            id="my-radio"
            name="my-radio"
            value={"Private (Only You)"}
            checked={selectedOption === "Private (Only You)"}
            onChange={handleRadioChange}
          />
          <label>Private (Only You)</label>
          <br />
          <input
            style={{ marginRight: "4px" }}
            type="radio"
            id="my-radio"
            name="my-radio"
            value={"Specific User/ Group"}
            // checked = {selectedOption === "Specific User/ Group"}
            // onChange={handleRadioChange}
            checked={specificUserGroup === "Specific User/ Group"}
            onChange={handleSpecificUserGroup}
          />
          <label>Specific User/ Group</label> <br />
          {specificUserGroup === "Specific User/ Group" && (
            <div className="inside-child-container-two d-flex">
              <div className="user-group-divisions d-flex">
                <div >
                  User
                  <i
                    className={`fa fa-user ${
                      selectedIcon === "user" ? "highlight" : ""
                    }`}
                    style={{ fontSize: "30px", cursor: "pointer" }}
                    onClick={() => handleIconClick("user")}
                  />
                </div>
                <div >
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
                <label>Identifier</label>
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
            onClick={toggleDrawer('left', false)}
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
            onClick={() => handleSubmit()}
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
          style={{ textDecoration: "underline", cursor: "pointer" , textTransform: "capitalize"  }}
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
              backdropFilter:" none !important"
            },
          }}
          sx = {{
            width : 100
          }}
        >
          {list("left")}
        </Drawer>
      </React.Fragment>
    </div>
  );
}
