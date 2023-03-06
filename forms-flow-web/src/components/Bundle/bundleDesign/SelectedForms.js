import React from "react";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableContainer from "@material-ui/core/TableContainer";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import { withStyles } from "@material-ui/styles";
import { useSelector } from "react-redux";
import { MULTITENANCY_ENABLED } from "../../../constants/constants";

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
  const tenantKey = useSelector((state) => state.tenants?.tenantId);
  const redirectUrl = MULTITENANCY_ENABLED ? `/tenant/${tenantKey}/` : "/";

  const viewForm = (formId) => {
    window.open(`${redirectUrl}form/${formId}/preview`, "_blank");
  };

  return (
    <div>
      <TableContainer style={{ border: "1px solid #dbdbdb" }}>
        <Table aria-label="simple table">
          <TableHead>
            <TableRow>
              <StyledTableCell>No</StyledTableCell>
              <StyledTableCell align="left">Form Name</StyledTableCell>
              <StyledTableCell align="right">View</StyledTableCell>
              <StyledTableCell align="right">Action</StyledTableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {selectedForms?.map((form, index) => (
              <TableRow key={form.id}>
                <StyledTableCell>{index + 1}</StyledTableCell>
                <StyledTableCell>{form.formName}</StyledTableCell>
                <StyledTableCell align="right">
                  <button
                    className="btn btn-sm btn-outline-primary"
                    onClick={() => {
                      viewForm(form.path);
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
                      deleteForm(form.mapperId);
                    }}
                  >
                    <i className="fa fa-trash-o" aria-hidden="true"></i>
                  </button>
                </StyledTableCell>
              </TableRow>
            ))}
            {!selectedForms?.length ? (
              <TableRow>
                <TableCell align="center" colspan="5">
                  <h3>No forms launch together</h3>
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
                <button
                  className="btn btn-outline-primary"
                  onClick={handleModalChange}
                >
                  <i className="fa fa-plus mr-2"></i>
                  Add Form
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
