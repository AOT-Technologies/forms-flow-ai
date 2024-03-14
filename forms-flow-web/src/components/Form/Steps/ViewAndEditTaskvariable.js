import React, { useState } from "react";
import Button from "react-bootstrap/Button";
const ViewAndEditTaskvariable = ({
  item,
  // eslint-disable-next-line no-unused-vars
  index,
  deleteTaskVariable,
  editTaskVariable,
}) => {
  const [taskLabel, setTaskLabel] = useState(item.label);
  const [enableEditTaskVariable, setEnableEditTaskVariable] = useState(true);
   const saveData = (taskVariable) => {
    setEnableEditTaskVariable(true);
    const data = {
      key: taskVariable.key,
      defaultLabel: taskVariable.defaultLabel,
      label: taskLabel
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
            aria-label="Task Label"
            data-testid="form-task-variable-edit-input"
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
              aria-label="Save"
              data-testid="form-task-variable-edit-save-button"
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
                aria-label="Delete"
                className="me-3 btn btn-danger btn fa fa-times"
                data-testid="form-task-variable-delete-button"
              ></i>

              <i
                role="button"
                onClick={() => {
                  setEnableEditTaskVariable(false);
                }}
                aria-label="Edit"
                className="btn btn-primary fa fa-edit"
                data-testid="form-task-variable-edit-button"
              ></i>
            </div>
          )}
        </td>
      </tr>
    </>
  );
};

export default ViewAndEditTaskvariable;
