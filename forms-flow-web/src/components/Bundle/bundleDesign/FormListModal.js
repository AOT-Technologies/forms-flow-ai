import React, { useEffect, useState } from "react";
import Modal from "react-bootstrap/Modal";
import {
  InputGroup,
  FormControl
} from "react-bootstrap";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableContainer from "@material-ui/core/TableContainer";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import Checkbox from "@material-ui/core/Checkbox";
import Pagination from "react-js-pagination";
import { withStyles } from "@material-ui/core"; 
import _capitalize from "lodash/capitalize";
import {
  fetchBPMFormList,
} from "../../../apiManager/services/bpmFormServices";
import { useDispatch, useSelector } from "react-redux";
import LoadingOverlay from "react-loading-overlay";
import {
  setBundleFormListLoading,
  setBundleFormListPage,
  setBundleFormListSort,
  setBundleFormSearch,
} from "../../../actions/bundleActions";
import Loading from "../../../containers/Loading";

const StyledTableCell = withStyles(() => ({
  head: {
    backgroundColor: "#4559b5",
    color: "white",
    fontSize: "1rem",
  },
  body: {
    fontSize: "1rem",
    padding: "5px",
  },
}))(TableCell);

const FormListModal = React.memo(
  ({ showModal, handleModalChange, submitFormSelect }) => {
    const dispatch = useDispatch();
    const formsAlreadySelected = useSelector(
      (state) => state.bundle?.selectedForms || []
    );
    const [seletedForms, setSelectedForms] = useState(
      formsAlreadySelected || []
    );
    const [seletedFormIds, setSelectedFormIds] = useState([]);
    const [search, setSearch] = useState(searchText || "");


    const forms = useSelector((state) => state.bundle?.bundleForms.forms);

    const pageNo = useSelector((state) => state.bundle?.bundleForms.page);
    const limit = useSelector((state) => state.bundle?.bundleForms.limit);
    const totalForms = useSelector(
      (state) => state.bundle?.bundleForms.totalForms
    );
    const sortBy = useSelector((state) => state.bundle?.bundleForms.sortBy);
    const sortOrder = useSelector(
      (state) => state.bundle?.bundleForms.sortOrder
    );
    const searchText = useSelector(
      (state) => state.bundle?.bundleForms.searchText
    );
    const isAscending = sortOrder === "asc" ? true : false;
 

    const seachFormLoading = useSelector(
      (state) => state.bundle?.bundleForms.bundleFormLoading
    );
    const [loadingForms, setLoadingForms] = useState(false);

    const fetchFormList = () => {
      const canBudle = true;
      const formType = "";
      let filters = [
        pageNo,
        limit,
        sortBy,
        sortOrder,
        searchText,
        formType,
        canBudle,
      ];
      dispatch(setBundleFormListLoading(true));
      dispatch(
        fetchBPMFormList(...filters, () => {
          setLoadingForms(false);
          dispatch(setBundleFormListLoading(false));
        })
      );
    };
    useEffect(() => {
      if (showModal) {
        setLoadingForms(true);
        fetchFormList();
      } else { 
        setSearch("");
        dispatch(setBundleFormSearch(""));
        dispatch(setBundleFormListPage(1));
        setSelectedForms([]);
        setSelectedFormIds([]);
      }
    }, [pageNo, showModal, searchText,sortOrder]);

    useEffect(() => {
      if (formsAlreadySelected?.length) {
        const ids = formsAlreadySelected.map((form) => form.parentFormId);
        setSelectedFormIds(ids);
        setSelectedForms(formsAlreadySelected);
      }else{
        setSelectedForms([]);
        setSelectedFormIds([]);
      }
    }, [formsAlreadySelected,showModal]);

    const updateSort = () => {
      let updatedSort;
      if (sortOrder === "asc") {
        updatedSort = "desc";
        dispatch(setBundleFormListSort(updatedSort));
      } else {
        updatedSort = "asc";
        dispatch(setBundleFormListSort(updatedSort));
      }
      dispatch(setBundleFormListPage(1));
    };

    const handleClearSearch = () => {
      setSearch("");
      dispatch(setBundleFormSearch(""));
    };

    const handleFormSelect = (action, form) => {
  
      if (action === "Select") {
        setSelectedFormIds((prev) => [...prev, form.parentFormId]);
            setSelectedForms((prev) => [
              ...prev,
              {
                formName: form.formName,
                rules:[],
                parentFormId: form.parentFormId,
                formId: form.formId,
                formType: form.formType,
                formOrder : prev.length + 1
              },
            ]);
          
      } else {
        setSelectedFormIds((prev) =>
          prev.filter((item) => item !== form.parentFormId)
        );
        setSelectedForms((prev) =>
          prev.filter((item) => item.parentFormId !== form.parentFormId)
        );
      }
    };

    const handleSearch = () => {
      dispatch(setBundleFormSearch(search));
      dispatch(setBundleFormListPage(1));
    };

    const handlePageChange = (page) => {
      dispatch(setBundleFormListPage(page.page));
    };

    useEffect(()=>{
      if(!search.trim()){
        dispatch(setBundleFormSearch(""));
      }
    },[search]);

    return (
      <div>
        <Modal show={showModal} size="lg" >
          
          <Modal.Header>
            <div className="d-flex justify-content-between align-items-center w-100">
              <h4>Select Forms</h4>
              <span style={{ cursor: "pointer" }} onClick={handleModalChange}>
                <i className="fa fa-times" aria-hidden="true"></i> Close
              </span>
            </div>
          </Modal.Header>
          <Modal.Body>
            {loadingForms ? (
              <Loading />
            ) : (
              <> 
                <InputGroup className="input-group mb-2">
                <InputGroup.Prepend>
                  <InputGroup.Text style={{ backgroundColor: "#ffff" }}>
                    <div className="sort-icons">
                      <i
                        className="fa fa-sort-up"
                        onClick={updateSort}
                        style={{
                          cursor: "pointer",
                          opacity: `${isAscending ? 1 : 0.5}`,
                        }}
                      ></i>
                      <i
                        className="fa fa-sort-down"
                        onClick={updateSort}
                        style={{
                          marginTop: "-8px",
                          cursor: "pointer",
                          opacity: `${!isAscending ? 1 : 0.5}`,
                        }}
                      ></i>
                    </div>
                  </InputGroup.Text>
                </InputGroup.Prepend>
                <FormControl 
                  value={search}
                  onChange={(e)=>{setSearch(e.target.value);}}
                  placeholder="Search..."
                  onKeyDown={(e)=> e.keyCode == 13 ? handleSearch() : ""}
                  style={{ backgroundColor: "#ffff" }}
                />
                {search && (
                  <InputGroup.Append onClick={handleClearSearch}>
                    <InputGroup.Text style={{ backgroundColor: "#ffff" }}>
                      <i className="fa fa-times"></i>
                    </InputGroup.Text>
                  </InputGroup.Append>
                )}
                <InputGroup.Append  onClick={handleSearch} disabled={!search?.trim()}>
                  <InputGroup.Text style={{ backgroundColor: "#ffff" }}>
                    <i className="fa fa-search"></i>
                  </InputGroup.Text>
                </InputGroup.Append>
              </InputGroup>
                {forms.length > 0 && !seachFormLoading ? (
                  <LoadingOverlay
                    active={seachFormLoading}
                    spinner
                    text={"Loading..."}
                  >
                    <TableContainer style={{ border: "1px solid #dbdbdb" }}>
                      <Table aria-label="simple table">
                        <TableHead>
                          <TableRow>
                            <StyledTableCell></StyledTableCell>
                            <StyledTableCell>Form Name</StyledTableCell>
                            <StyledTableCell>Type</StyledTableCell>
                            <StyledTableCell>Action</StyledTableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {forms.map((form) => (
                            <>
                              <TableRow>
                                <StyledTableCell align="left">
                                  <Checkbox
                                    checked={seletedFormIds?.includes(
                                      form.parentFormId
                                    )}
                                    onChange={(e) => {
                                      handleFormSelect(
                                        e.target.checked
                                          ? "Select"
                                          : "Unselect",
                                        form
                                      );
                                    }}
                                    inputProps={{
                                      "aria-label": "primary checkbox",
                                    }}
                                  />
                                </StyledTableCell>
                                <StyledTableCell>
                                  {form.formName}
                                </StyledTableCell>
                                <StyledTableCell>
                                  {_capitalize(form.formType)}
                                </StyledTableCell>
                                <StyledTableCell>
                                  <button
                                    className="btn btn-sm btn-outline-primary"
                                    onClick={() =>
                                      handleFormSelect(
                                        seletedFormIds?.includes(form.parentFormId)
                                          ? "Unselect"
                                          : "Select",
                                        form
                                      )
                                    }
                                  >
                                    {seletedFormIds?.includes(form.parentFormId)
                                      ? "Unselect"
                                      : "Select"}
                                  </button>
                                </StyledTableCell>
                              </TableRow>
                            </>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </LoadingOverlay>
                ) : (
                  <div className="w-100  d-flex align-items-center justify-content-center" style={{height:"200px"}}> 
                    <h3> No forms found</h3>
                  </div>
                )}
              </>
            )}
 
          </Modal.Body>
          {
            forms.length > 0 && !seachFormLoading ? (
              <Modal.Footer className="justify-content-between">
            <div className="d-flex align-items-center">
              <Pagination
                activePage={pageNo}
                itemsCountPerPage={limit}
                totalItemsCount={totalForms}
                pageRangeDisplayed={5}
                itemClass="page-item"
                linkClass="page-link"
                onChange={(page) => {
                  handlePageChange({ page });
                }}
              />
              <span className="ml-2 mb-3">
                Showing {(limit * pageNo ) - (limit - 1)} to{" "}
                {limit * pageNo > totalForms ? totalForms : limit * pageNo} of{" "}
                {totalForms}
              </span>
            </div>
              <div>
              <button
              className="btn btn-secondary mr-2"
              onClick={handleModalChange}
            >
              Cancel
            </button>
            <button
              className="btn btn-primary"
              disabled={!seletedForms.length}
              onClick={() => {
                submitFormSelect(seletedForms);
              }}
            >
              Insert
            </button>
              </div>
          </Modal.Footer>
            ) : ""
          }
       
        </Modal>
      </div>
    );
  }
);

export default FormListModal;
