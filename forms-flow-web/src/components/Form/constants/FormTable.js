import React, { useState, useEffect } from "react";
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
import { getBundle } from "../../../apiManager/services/bundleServices";

function FormTable() {
  const dispatch = useDispatch();
  const bpmForms = useSelector((state) => state.bpmForms);
  const formData = (() => bpmForms.forms)() || [];
  const userRoles = useSelector((state) => state.user.roles || []);
  const pageNo = useSelector((state) => state.bpmForms.page);
  const limit = useSelector((state) => state.bpmForms.limit);
  const totalForms = useSelector((state) => state.bpmForms.totalForms);
  const sortOrder = useSelector((state) => state.bpmForms.sortOrder);
  const formType = useSelector((state) => state.bpmForms.formType);
  const searchFormLoading = useSelector(
    (state) => state.formCheckList.searchFormLoading
  );
  const isDesigner = userRoles.includes(STAFF_DESIGNER);
  const [pageLimit, setPageLimit] = useState(5);
  const isAscending = sortOrder === "asc" ? true : false;
  const searchText = useSelector((state) => state.bpmForms.searchText);
  // const [openRows, setOpenRows] = useState([]);
  // const [show,setShow] = useState(false);
  // const [expand,setExpand] = useState(false);
  const [search, setSearch] = useState(searchText || "");
  const [bundleData, setBundleData] = useState([]);
  const [selectedRow, setSelectedRow] = useState(null);

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

  useEffect(() => {
    setSearch(searchText);
  }, [searchText]);

  useEffect(() => {
    if (!search.trim()) {
      dispatch(setBpmFormSearch(""));
    }
  }, [search]);

  useEffect(() => {
    setSelectedRow(null);
  }, [pageNo]);

  const handleSearch = () => {
    dispatch(setBpmFormSearch(search));
    dispatch(setBPMFormListPage(1));
  };

  const handleClearSearch = () => {
    setSearch("");
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

  const handleRowExpansion = (mapperId, index) => {
    setSelectedRow(index === selectedRow ? null : index);
    getBundle(mapperId)
      .then((res) => {
        setBundleData(res.data);
      })
      .catch((err) => {
        console.error("error", err);
      });
  };

  const bundleFormsData = (data) => {
    return (
      <tr>
        <td colSpan={12}>
          <div style={{display: 'flex'}}>
            <div style={{flex: 1, minWidth: '600px', padding: '20px', borderRight: '1px solid black'}}>
              <h4 className="font-weight-bold">Description</h4>
              <p>{data}</p>
            </div>
            <div style={{flex: 2, padding: '20px'}} className="ml-5">
            <div className="d-flex justify-content-between align-items-center mb-3">
      <h4 className="font-weight-bold">Forms included under the package</h4>
    </div>
              <table className="table" style={{minWidth: '600px'}}>
                <thead>
                  <tr>
                    <th>Form Order</th>
                    <th>Form Name</th>
                  </tr>
                </thead>
                <tbody>
                  {bundleData?.map((e, index) => (
                    <tr key={index}>
                      <td>{e.formOrder}</td>
                      <td>{e.formName}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </td>
      </tr>
    );
  };

  const noDataFound = () => {
    return (
      <tbody>
        <tr>
          <td colSpan="10">
            <div
              className="d-flex align-items-center justify-content-center flex-column w-100"
              style={{ minHeight: "300px" }}
            >
              <h3>No forms found</h3>
              <p>Please change the selected filters to view Forms</p>
            </div>
          </td>
        </tr>
      </tbody>
    );
  };
  return (
    <>
      <LoadingOverlay active={searchFormLoading} spinner text="Loading...">
        <div style={{ minHeight: "400px" }}>
          <table className="table table-header-color ">
            <thead>
              <tr>
                <th colSpan="4">
                  <InputGroup className="input-group">
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
                      onChange={(e) => {
                        setSearch(e.target.value);
                      }}
                      placeholder="Search..."
                      style={{ backgroundColor: "#ffff" }}
                    />
                    {search && (
                      <InputGroup.Append onClick={handleClearSearch}>
                        <InputGroup.Text>
                          <i className="fa fa-times"></i>
                        </InputGroup.Text>
                      </InputGroup.Append>
                    )}
                    <InputGroup.Append
                      onClick={handleSearch}
                      disabled={!search.trim()}
                    >
                      <InputGroup.Text style={{ backgroundColor: "#ffff" }}>
                        <i className="fa fa-search"></i>
                      </InputGroup.Text>
                    </InputGroup.Append>

                    {isDesigner && (
                      <Form.Control
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
                        <option
                          selected={formType === "resource"}
                          value="resource"
                        >
                          Resource
                        </option>
                      </Form.Control>
                    )}
                  </InputGroup>
                </th>
              </tr>
              <tr className="table-header table-bordered">
                <th scope="col">Form Name</th>
                <th scope="col">Operations</th>
                {isDesigner && (
                  <th scope="col">
                    <SelectFormForDownload type="all" />
                  </th>
                )}
                {!isDesigner && (
                  <td>
                  </td>
                )}
              </tr>
            </thead>

            {formData?.length ? (
              <tbody className="table-bordered">
                {formData?.map((e, index) => {
                  return (
                    <>
                      <tr key={index}>
                        <td>{e.title}</td>
                        <td>
                          <FormOperations formData={e} />
                        </td>
                        {isDesigner && (
                          <td>
                            <SelectFormForDownload form={e} />
                          </td>
                        )}
                        {!isDesigner && (
                          <td
                            onClick={() =>
                              handleRowExpansion(e.mapperId, index)
                            }
                            style={{cursor:'pointer'}}
                          >
                            {e.formType === "bundle" && (
                              <i
                                className={`fa fa-chevron-${
                                  selectedRow === index ? "up" : "down"
                                }`}
                              ></i>
                            )}
                          </td>
                        )}
                      </tr>
                      {selectedRow === index && <>{bundleFormsData(e.description)}</>}
                    </>
                  );
                })}
              </tbody>
            ) : !searchFormLoading ? (
              noDataFound()
            ) : (
              ""
            )}
          </table>
        </div>
      </LoadingOverlay>

      {formData.length ? (
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
      ) : (
        ""
      )}
    </>
  );
}

export default FormTable;
