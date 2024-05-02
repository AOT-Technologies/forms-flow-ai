import React, { useState } from "react";
import { useTranslation } from "react-i18next";
const ViewAndEditTaskvariable = ({
  variable,
  selectVariable,
  editVariable,
}) => {
  const { t } = useTranslation();
  const [taskLabel, setTaskLabel] = useState(variable.label || "");
  const [enableEditTaskVariable, setEnableEditTaskVariable] = useState(false);
  const saveData = () => {
    const data = {
      key: variable.key,
      label: taskLabel,
    };
    editVariable(data);
    setEnableEditTaskVariable(false);
  };

  const handleSelectTaskVariable = () => {
    selectVariable(variable.key);
  };

  const cancelEdit = (label) =>{
    setTaskLabel(label);
    setEnableEditTaskVariable(false);
  };

  return (
    <>
      <tr>
        <td className="py-3">
          <div className="d-flex justify-content-between align-items-center">
            <div className="form-check me-2">
              <input
                className="form-check-input  cursor-pointer border-dark"
                type="checkbox"
                title={t("Select")}
                checked={variable.checked ? true : false}
                onChange={handleSelectTaskVariable}
                data-testid={`select-task-variable-${variable.key}`}
              />
            </div>
            <input
              type="text"
              disabled
              value={variable.key}
              className="form-control"
              title={t("Select form field")}
            />
          </div>
        </td>
        <td className="py-3">
          <input
            type="text"
            disabled={!enableEditTaskVariable}
            value={taskLabel}
            onChange={(e) => {
              setTaskLabel(e.target.value);
            }}
            className="form-control"
            aria-label="Task Label"
            data-testid="form-task-variable-edit-input"
            title={t("Add task label")}
          />
        </td>

        <td className="text-right py-3">
          {enableEditTaskVariable ? (
           <div className="d-flex align-items-center">
             <button
              disabled={!taskLabel?.trim()}
              className="btn btn-sm btn-primary me-2"
              onClick={saveData}
              aria-label="Save"
              type="button"
              data-testid="form-task-variable-edit-save-button"
            >
              {t("Save")}
            </button>
            <button
              className="btn btn-sm btn-link text-dark"
              onClick={()=>{cancelEdit(variable.label);}}
              aria-label="Save"
              type="button"
              data-testid="form-task-variable-edit-save-button"
            >
               {t("Cancel")}
            </button>
           </div>
          ) : (
            <button
              className="btn btn-primary btn-sm"
              type="button"
              data-testid="form-task-variable-edit-button"
              onClick={() => {
                setEnableEditTaskVariable(true);
              }}
            >
              {t("Edit Label")}<i aria-label="Edit" className="fa fa-edit ms-2"></i>
            </button>
          )}
        </td>
      </tr>
    </>
  );
};

export default ViewAndEditTaskvariable;
