import React, { useState } from "react";
import TableCell from "@material-ui/core/TableCell";
import TableRow from "@material-ui/core/TableRow";
import Checkbox from "@material-ui/core/Checkbox";
import Button from "@material-ui/core/Button";
 const ViewAndEditTaskvariable = ({
  item,
  index,
  deleteTaskVariable,
  editTaskVariable,
}) => {
  const [taskLabel, setTaskLable] = useState(item.label);
  const [showInList, setShowInList] = useState(item.showInList);
  const [enableEditTaskVariable, setEnableEditTaskVariable] = useState(true);

  const saveData =(taskVariable)=>{
    setEnableEditTaskVariable(true)
   const data = {key:taskVariable.key,  defaultLabel:taskVariable.defaultLabel,label:taskLabel,showInList}
   editTaskVariable(data);
  }
  return (
    <>
      <TableRow>
        <TableCell scope="row"><input
            type="text"
            disabled
            value={item.key}
            className="form-control"
          /></TableCell>
        <TableCell align="left">
          <input
            type="text"
            disabled={enableEditTaskVariable}
            value={taskLabel}
            onChange={(e) => {
              setTaskLable(e.target.value);
            }}
            className="form-control"
          />
        </TableCell>
        <TableCell align="left">
          <Checkbox
            disabled={enableEditTaskVariable}
            checked={showInList}
            onChange={() => {
              setShowInList(!showInList);
            }}
            color="primary"
          />
        </TableCell>
        <TableCell align="right">
          {!enableEditTaskVariable ? (
           <Button
            variant="outlined"
            color="primary"
            size="small"
            onClick={()=>{saveData(item)}}
            startIcon={<i className="fa fa-check"></i>}
          >Save</Button>
          ) : (
            <div>
              <i
                role="button"
                onClick={() => {
                  deleteTaskVariable(item);
                }}
                className="mr-3 btn btn-danger btn fa fa-times"
              ></i>
 
              <i role="button" onClick={()=>{setEnableEditTaskVariable(false)}} class=" btn btn-primary fa fa-edit"></i>
            </div>
          )}
        </TableCell>
      </TableRow>
    </>
  );
};

export default ViewAndEditTaskvariable;