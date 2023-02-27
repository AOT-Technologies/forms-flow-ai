import React from "react";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableContainer from "@material-ui/core/TableContainer";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import moment from "moment";
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
const RulesTable = ({createdRules = [],handleModalChange}) => {
  return (
    <TableContainer style={{ border: "1px solid #dbdbdb" }}>
    <Table aria-label="simple table">
      <TableHead>
        <TableRow>
          <StyledTableCell>No</StyledTableCell>
          <StyledTableCell align="left">Form Name</StyledTableCell>
          <StyledTableCell align="left">Criteria</StyledTableCell>
          <StyledTableCell align="right">Actions</StyledTableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {createdRules?.map((row, index) => (
          <TableRow key={row.id}>
            <StyledTableCell>{index + 1}</StyledTableCell>
            <StyledTableCell>{row.formName}</StyledTableCell>
            <StyledTableCell>{moment(row.created).format()}</StyledTableCell>
            <StyledTableCell align="right">
              <button className="btn btn-sm btn-outline-primary">
                <i
                  className="fa fa-external-link mr-2"
                  aria-hidden="true"
                ></i>
                View Form
              </button>
            </StyledTableCell>
            <StyledTableCell align="right">
              <button className="btn btn-sm btn-outline-danger">
                <i className="fa fa-trash-o" aria-hidden="true"></i>
              </button>
            </StyledTableCell>
          </TableRow>
        ))}
        {!createdRules?.length ? (
          <TableRow>
            <TableCell align="center" colspan="5">
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
          <TableCell align="center" colspan="5">
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