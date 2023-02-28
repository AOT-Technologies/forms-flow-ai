import React, { useEffect, useState } from "react";
import Modal from "react-bootstrap/Modal";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableContainer from "@material-ui/core/TableContainer";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import Checkbox from "@material-ui/core/Checkbox";
import Pagination from "react-js-pagination";
import { withStyles } from "@material-ui/core";

const SearchBar = () => {
  return (
    <>
      <div className="form-outline">
        <input
          //   style={{ color: `${!isSearchValid ? "red" : ''}` }}
          type="search"
          id="form1"
          //   ref={searchInputBox}
          //   onKeyPress={(e) => e.key === "Enter" && handleSearch()}
          //   onChange={(e) => {
          //     setShowClearButton(e.target.value);
          //     setSearchTextInput(e.target.value);
          //     e.target.value === "" && handleSearch();
          //   }}
          autoComplete="off"
          className="form-control"
          //   value={searchTextInput}
          placeholder={"Search..."}
        />
      </div>
      <button
        type="button"
        className="btn btn-outline-primary ml-2"
        //   onClick={() => onClear()}
      >
        <i className="fa fa-times"></i>
      </button>
      <button
        type="button"
        className={`btn btn-outline-primary ml-2`}
        name="search-button"
        // title={t(`${!isSearchValid ? "Kindly remove the special charactors...!" : "Click to search"}`)}
        // onClick={() => handleSearch()}
      >
        <i className="fa fa-search"></i>
      </button>
    </>
  );
};

const StyledTableCell = withStyles(() => ({
  head: {
    backgroundColor: "#4559b5",
    color: "white",
    fontSize: "1rem",
  },
  body: {
    fontSize: "1rem",
    padding:"5px"
  },
}))(TableCell);

const FormListModal = ({
  showModal,
  handleModalChange,
  formsAlreadySelected,
  submitFormSelect
}) => {
  const forms = [
    { id: "63b2729f65c3fc968d5e151a", formName: "hiii", type: "form" },
    { id: "63b272b265c3fc968d5e1534", formName: "sad", type: "form" },
    { id: "63b26a7d65c3fc968d5e1374", formName: "sd33", type: "form" },
    { id: "63b270b165c3fc968d5e1466", formName: "cccccccc", type: "resource" },
   
  ];
  const [seletedForms, setSelectedForms] = useState(formsAlreadySelected || []);
  const [seletedFormIds, setSelectedFormIds] = useState([]);
 

  useEffect(() => {
    if (formsAlreadySelected?.length) {
      const ids = formsAlreadySelected.map((form) => form.id);
      setSelectedFormIds(ids);
      
    }
  }, [formsAlreadySelected]);

  const handleFormSelect = (action, form) => {
    if (action === "select") {
      setSelectedFormIds((prev) => [...prev, form.id]);
      setSelectedForms((prev) => [...prev, form]);
    } else {
      setSelectedFormIds((prev) => prev.filter((item) => item !== form.id));
      setSelectedForms((prev) => prev.filter((item) => item.id !== form.id));
    }
  };

  return (
    <div>
      <Modal show={showModal} size="lg">
        <Modal.Header>
          <div className="d-flex justify-content-between align-items-center w-100">
            <h4>Select Form</h4>
            <span style={{ cursor: "pointer" }} onClick={handleModalChange}>
              <i className="fa fa-times" aria-hidden="true"></i>
            </span>
          </div>
        </Modal.Header>
        <Modal.Body>
          <div className="d-flex mb-2">{SearchBar()}</div>
          <TableContainer style={{ border: "1px solid #dbdbdb" }}>
            <Table aria-label="simple table">
              <TableHead>
                <TableRow>
                  <StyledTableCell></StyledTableCell>
                  <StyledTableCell>Form Name</StyledTableCell>
                  <StyledTableCell>Type</StyledTableCell>
                  <StyledTableCell >Action</StyledTableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {forms.map((form) => (
                  <>
                    <TableRow>
                      <StyledTableCell align="left">
                        <Checkbox
                          checked={seletedFormIds?.includes(form.id)}
                          onChange={(e) => {
                            handleFormSelect(
                              e.target.checked ? "select" : "unselect",
                              form
                            );
                          }}
                          inputProps={{ "aria-label": "primary checkbox" }}
                        />
                      </StyledTableCell>
                      <StyledTableCell>{form.formName}</StyledTableCell>
                      <StyledTableCell>{form.type}</StyledTableCell>
                      <StyledTableCell >
                        <button
                          className="btn btn-sm btn-outline-primary"
                          onClick={() =>
                            handleFormSelect(
                              seletedFormIds?.includes(form.id)
                                ? "unselect"
                                : "select",
                              form
                            )
                          }
                        >
                          {seletedFormIds?.includes(form.id)
                            ? "unselect"
                            : "select"}
                        </button>
                      </StyledTableCell>
                    </TableRow>
                  </>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Modal.Body>
        <Modal.Footer className="justify-content-between">
          <Pagination
            activePage={1}
            itemsCountPerPage={10}
            totalItemsCount={450}
            pageRangeDisplayed={5}
            itemClass="page-item"
            linkClass="page-link"
            //   onChange={this.handlePageChange.bind(this)}
          />
          <button className="btn btn-primary" onClick={()=>{submitFormSelect(seletedForms);}}>Submit</button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default FormListModal;
