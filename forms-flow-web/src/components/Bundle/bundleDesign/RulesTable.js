import React from "react";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableContainer from "@material-ui/core/TableContainer";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import { withStyles } from "@material-ui/styles";
 
const StyledTableCell = withStyles(() => ({
  head: {
    backgroundColor: "#4559b5",
    color: "white",
    fontSize: "1rem",
  },
  body:{
    fontSize:"1rem",
  }
}))(TableCell);

const RulesTable = ({selectedForms = [],handleModalChange,
  selectRuleForEdit,deleteRule}) => {
  return (
    <TableContainer style={{ border: "1px solid #dbdbdb" }}>
    <Table aria-label="simple table">
      <TableHead>
        <TableRow> 
          <StyledTableCell align="left">Form Name</StyledTableCell>
          <StyledTableCell align="left">Criteria</StyledTableCell>
          {/* <StyledTableCell align="left">Rule Action</StyledTableCell> */}
          <StyledTableCell align="right">Action</StyledTableCell>
 
        </TableRow>
      </TableHead>
      <TableBody>
 
        {selectedForms?.map((form, index) => {
          return form.rules?.length > 0 ?  (
            <TableRow key={index}> 
            <StyledTableCell>{form.formName}</StyledTableCell>
            <StyledTableCell>{form.rules?.join(",")}</StyledTableCell>
            {/* <StyledTableCell>{form.action}</StyledTableCell> */}
            <StyledTableCell align="right">
              <button className="btn btn-sm btn-outline-primary mr-2" onClick={()=>{selectRuleForEdit(form);}}>
              <i className="fa fa-pencil " aria-hidden="true"></i>
              </button>
              <button className="btn btn-sm btn-outline-danger" onClick={()=>{deleteRule(form.parentFormId);}}>
                <i className="fa fa-trash-o" aria-hidden="true"></i>
              </button>
            </StyledTableCell>
 
          </TableRow>
          ) : "";
        })
        }
        {!selectedForms.some((i)=> i.rules?.length > 0) ? (
          <TableRow>
            <TableCell align="center" colSpan="8">
              <h3>No Rules</h3>
              <span>
                Form bundles can save your time by grouping together forms
                that you often launch together
              </span>
            </TableCell>
          </TableRow>
        ) : (
          ""
        )}
        <TableRow>
          <TableCell align="center" colspan="8">
            <button className="btn btn-outline-primary" onClick={handleModalChange}>
              <i className="fa fa-plus mr-2"></i>
              Create Rules
            </button>
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>
  </TableContainer>
  );
};

export default RulesTable;