import React, { useState } from "react";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
const ViewAndEditTaskvariable = ({
  item,
  // eslint-disable-next-line no-unused-vars
  index,
  deleteTaskVariable,
  editTaskVariable,
}) => {
  const [taskLabel, setTaskLabel] = useState(item.label);
  const [showInList, setShowInList] = useState(item.showInList);
  const [enableEditTaskVariable, setEnableEditTaskVariable] = useState(true);

  const saveData = (taskVariable) => {
    setEnableEditTaskVariable(true);
    const data = {
      key: taskVariable.key,
      defaultLabel: taskVariable.defaultLabel,
      label: taskLabel,
      showInList,
    };
    editTaskVariable(data);
  };
  return (
    <>
      <tr> 
        <td className="p-3">
          <input
            type="text"
            disabled
            value={item.key}
            className="form-control"
            title="Select form field"
          />
        </td>
        <td className="p-3">
          <input
            type="text"
            disabled={enableEditTaskVariable}
            value={taskLabel}
            onChange={(e) => {
              setTaskLabel(e.target.value);
            }}
            className="form-control"
            aria-labelledby="Task label"
          />
        </td>
        <td className="p-3">
          <Form.Check
            className="" 
            disabled={enableEditTaskVariable}
            checked={showInList}
            onChange={() => {
              setShowInList(!showInList);
            }}
            type="checkbox"
          />
        </td>
        <td className="text-right p-3" >
          {!enableEditTaskVariable ? (
            <Button
              variant="outline-primary"
              size="sm"
              onClick={() => {
                saveData(item);
              }}
            >
              <i className="fa fa-check"></i> Save
            </Button>
          ) : (
            <div>
              <i
                role="button"
                onClick={() => {
                  deleteTaskVariable(item);
                }}
                className="mr-3 btn btn-danger btn fa fa-times"
              ></i>

              <i
                role="button"
                onClick={() => {
                  setEnableEditTaskVariable(false);
                }}
                className="btn btn-primary fa fa-edit"
              ></i>
            </div>
          )}
        </td>
      </tr>
    </>
  );
};

export default ViewAndEditTaskvariable;
