import React, { useState, useRef } from "react";
import {
  InputGroup,
  FormControl,
  DropdownButton,
  Dropdown,
  Form,
} from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import Pagination from "react-js-pagination";
import {
  setBPMFormLimit,
  setBPMFormListPage,
  setBPMFormListSort,
  setBpmFormSearch,
  setBpmFormType,
} from "../../../actions/formActions";
import FormOperations from "../FormOperations/FormOperations";
import SelectFormForDownload from "../FileUpload/SelectFormForDownload";
import LoadingOverlay from "react-loading-overlay";
import { STAFF_DESIGNER } from "../../../constants/constants";

  

function FormTable() {
  const dispatch = useDispatch();
  const inputRef = useRef(null);
  const bpmForms = useSelector((state) => state.bpmForms);
  const formData = (() => bpmForms.forms)() || [];
  const userRoles = useSelector((state) => state.user.roles || []);
  const pageNo = useSelector((state) => state.bpmForms.page);
  const limit = useSelector((state) => state.bpmForms.limit);
  const totalForms = useSelector((state) => state.bpmForms.totalForms);
  const sortOrder = useSelector((state) => state.bpmForms.sortOrder);
  const formType = useSelector((state) => state.bpmForms.formType);
  const searchFormLoading = useSelector(state => state.formCheckList.searchFormLoading);
  const isDesigner = userRoles.includes(STAFF_DESIGNER);
  const [pageLimit, setPageLimit] = useState(5);
  const isAscending = sortOrder === "asc" ? true : false;

  const pageOptions = [
    {
      text: "5",
      value: 5,
    },
    {
      text: "25",
      value: 25,
    },
    {
      text: "50",
      value: 50,
    },
    {
      text: "100",
      value: 100,
    },
    {
      text: "All",
      value: totalForms,
    },
  ];

  const updateSort = () => {
    let updatedSort;
    // dispatch(setBpmFormLoading(false));
    if (sortOrder === "asc") {
      updatedSort = "desc";
      dispatch(setBPMFormListSort(updatedSort));
    } else {
      updatedSort = "asc";
      dispatch(setBPMFormListSort(updatedSort));
    }
    dispatch(setBPMFormListPage(1));
  };

  const handleTypeChange = (type) => {
    dispatch(setBPMFormListPage(1));
    dispatch(setBPMFormLimit(5));
    dispatch(setBpmFormType(type));
  };

  const handleSearch = () => {
    const searchText = inputRef.current.value;
    searchText
      ? dispatch(setBpmFormSearch(searchText))
      : dispatch(setBpmFormSearch(""));
    dispatch(setBPMFormListPage(1));
  };

  const handleClearSearch = () => {
    inputRef.current.value = "";
    dispatch(setBpmFormSearch(""));
  };

  const handlePageChange = (page) => {
    dispatch(setBPMFormListPage(page));
  };
  const onSizePerPageChange = (limit) => {
    setPageLimit(limit);
    dispatch(setBPMFormLimit(limit));
    dispatch(setBPMFormListPage(1));
  };

  const noDataFound = () => {
      return (
        <span >
          <div
            className="container"
            style={{
              maxWidth: "900px",
              margin: "auto",
              height: "50vh",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <h3>No forms found</h3>
            <p>Please change the selected filters to view Forms</p>
          </div>
        </span>
      );
    };
  return (
    <>
     <LoadingOverlay
    active={searchFormLoading}
    spinner
    text = "Loading..."
    >
            <table className="table table-header-color">
        <thead>
          <tr>
            <th colSpan="4">
              <InputGroup className="input-group">
                <InputGroup.Prepend>
                  <InputGroup.Text  style={{ backgroundColor: "#ffff" }}>
                    <div className="sort-icons" >
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
                  ref={inputRef}
                  placeholder="Search..."
                  style={{ backgroundColor: "#ffff" }}
                />
                {inputRef.current && inputRef.current.value && (
                  <InputGroup.Append  onClick={handleClearSearch}>
                    <InputGroup.Text  >
                      <i className="fa fa-times"></i>
                    </InputGroup.Text>
                  </InputGroup.Append>
                )}
                <InputGroup.Append  onClick={handleSearch}>
                  <InputGroup.Text style={{ backgroundColor: "#ffff" }}>
                    <i className="fa fa-search"></i>
                  </InputGroup.Text>
                </InputGroup.Append>

                {
                isDesigner &&
                (<Form.Control
                  className="ml-3"
                  onChange={(e) => {
                    handleTypeChange(e.target.value);
                  }}
                  as="select"
                  style={{ backgroundColor: "#ffff" }}
                >
                  <option selected={formType === "form"} value="form">
                    Form
                  </option>
                  <option selected={formType === "resource"} value="resource">
                    Resource
                  </option>
                </Form.Control>)}
              </InputGroup>
            </th>
          </tr>
          <tr className="table-header">
            <th scope="col">Form Name</th>
            <th scope="col">Operations</th>
            <th scope="col">
              <SelectFormForDownload type="all" />
            </th>
          </tr>
        </thead>
        <tbody >
        {
        formData?.length ? (
          formData?.map((e, index) => {
            return (
              <tr key={index}>
                <td>{e.title}</td>
                <td>
                  <FormOperations formData={e} />
                </td>
                <td>
                  <SelectFormForDownload form={e} />
                </td>
              </tr>
            );
          })
        ) : (<div className="no-data-found ml -4">
            {noDataFound()}
        </div>)
        }
        </tbody>
      </table>
      </LoadingOverlay>
      
      <div className="d-flex justify-content-between align-items-center">
        <div>
          <span>
            Rows per page
            <DropdownButton
              className="ml-2"
              drop="down"
              variant="secondary"
              title={pageLimit}
              style={{ display: "inline" }}
            >
              {pageOptions.map((option, index) => (
                <Dropdown.Item
                  key={{ index }}
                  type="button"
                  onClick={() => {
                    onSizePerPageChange(option.value);
                  }}
                >
                  {option.text}
                </Dropdown.Item>
              ))}
            </DropdownButton>
          </span>
          <span className="ml-2 mb-3">
            Showing {(limit * pageNo ) - (limit - 1)} to{" "}
                {limit * pageNo > totalForms ? totalForms : limit * pageNo} of{" "}
                {totalForms} entries
          </span>
        </div>
        <div className="d-flex align-items-center">
          <Pagination
            activePage={pageNo}
            itemsCountPerPage={limit}
            totalItemsCount={totalForms}
            pageRangeDisplayed={5}
            itemClass="page-item"
            linkClass="page-link"
            onChange={handlePageChange}
          />
        </div>
      </div>
    </>
  );
}

export default FormTable;
