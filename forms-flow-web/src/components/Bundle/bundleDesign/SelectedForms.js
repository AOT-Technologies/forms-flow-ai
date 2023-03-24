import React from "react";
import  Table  from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableContainer from "@material-ui/core/TableContainer";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import { withStyles } from "@material-ui/styles";
import { useDispatch, useSelector } from "react-redux";
import { MULTITENANCY_ENABLED } from "../../../constants/constants";
import _capitalize from "lodash/capitalize";
import { setBundleSelectedForms } from "../../../actions/bundleActions";
const StyledTableCell = withStyles(() => ({
  head: {
    backgroundColor: "#4559b5",
    color: "white",
    fontSize: "1rem",
  },
  body: {
    fontSize: "1rem",
  },
}))(TableCell);

const SelectedForms = ({ handleModalChange, selectedForms, deleteForm }) => {
  const dispatch = useDispatch(); 
  const tenantKey = useSelector((state) => state.tenants?.tenantId);
  const redirectUrl = MULTITENANCY_ENABLED ? `/tenant/${tenantKey}/` : "/";
 

  const viewForm = (formId) => {
    window.open(`${redirectUrl}formflow/${formId}/preview`, "_blank");
  };
  const onDragStart = (e, index) => {
    e.dataTransfer.setData("index", index);
    };
    
    const onDragOver = (e) => {
    e.preventDefault();
    };

    
    const onDrop = (e, index) => {
    const oldIndex = e.dataTransfer.getData("index");
    if( index != oldIndex){
      const newArray = [...selectedForms];
      const draggedItem = newArray[oldIndex];
      newArray.splice(oldIndex, 1);
      newArray.splice(index, 0, draggedItem);
      newArray.forEach((item, index) => item.formOrder = index + 1);
      dispatch(setBundleSelectedForms(newArray));
    }

    };
  return (
    <div>
      <TableContainer style={{ border: "1px solid #dbdbdb" }} striped bordered hover>
        <Table aria-label="simple table">
          <TableHead>
            <TableRow>
            <StyledTableCell align="left"></StyledTableCell>
              <StyledTableCell align="left">Form Order</StyledTableCell>
              <StyledTableCell align="left">Form Name</StyledTableCell>
              <StyledTableCell align="left">Form Type</StyledTableCell>
              <StyledTableCell align="right">View</StyledTableCell>
              <StyledTableCell align="right">Action</StyledTableCell>
            </TableRow>
          </TableHead>
          <TableBody style={{cursor:'move'}}>
            {selectedForms?.map((form, index) => (
              <TableRow
                key={form.id}
                draggable
                onDragStart={(e) => onDragStart(e, index)}
                onDragOver={onDragOver}
                onDrop={(e) => onDrop(e, index)}
              >
                <StyledTableCell><span className="font-weight-bold">:::</span></StyledTableCell>
                <StyledTableCell>{form.formOrder}</StyledTableCell>
                <StyledTableCell>{form.formName}</StyledTableCell>
                <StyledTableCell>{_capitalize(form.formType)}</StyledTableCell>
                <StyledTableCell align="right">
                  <button
                    className="btn btn-sm btn-outline-primary"
                    onClick={() => {
                      viewForm(form.formId);
                    }}
                  >
                    <i
                      className="fa fa-external-link mr-2"
                      aria-hidden="true"
                    ></i>
                    View Form
                  </button>
                </StyledTableCell>
                <StyledTableCell align="right">
                  <button
                    className="btn btn-sm btn-outline-danger"
                    onClick={() => {
                      deleteForm(form.parentFormId);
                    }}
                  >
                    <i className="fa fa-trash-o" aria-hidden="true"></i>
                  </button>
                </StyledTableCell>
              </TableRow>
            ))}
            {!selectedForms?.length ? (
              <TableRow>
                <TableCell align="center" colSpan="8">
                  <h4>Add Forms Launch together</h4>
                  <h6>
                    Form bundles can save your time by grouping forms together
                  </h6>
                </TableCell>
              </TableRow>
            ) : (
              ""
            )}
            <TableRow>
              <TableCell align="center" colSpan="8">
                <button
                  className="btn btn-outline-primary"
                  onClick={handleModalChange}
                >
                  <i className="fa fa-plus mr-2"></i>
                  Add Forms
                </button>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
};

export default SelectedForms;
