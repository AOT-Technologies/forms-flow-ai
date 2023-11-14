
import React, { useState, useEffect } from "react";
import {
  InputGroup,
  FormControl,
  Dropdown,
} from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import { push } from "connected-react-router";
import Pagination from "react-js-pagination";
import {
  setBPMFormLimit,
  setBPMFormListPage,
  setBPMFormListSort,
  setBpmFormSearch,
  setFormDeleteStatus, 
} from "../../../actions/formActions";
import SelectFormForDownload from "../FileUpload/SelectFormForDownload";
import LoadingOverlay from "react-loading-overlay";
import {
  CLIENT,
  MULTITENANCY_ENABLED,
  STAFF_DESIGNER,
  STAFF_REVIEWER,
} from "../../../constants/constants";
import { useTranslation } from "react-i18next";
import { Translation } from "react-i18next";
import { getAllApplicationCount, getFormProcesses, resetFormProcessData } from "../../../apiManager/services/processServices";
import { setIsApplicationCountLoading } from "../../../actions/processActions";
import { HelperServices } from "@formsflow/service";
import _ from "lodash";

function FormTable() {
  const tenantKey = useSelector((state) => state.tenants?.tenantId);
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const bpmForms = useSelector((state) => state.bpmForms);
  const formData = (() => bpmForms.forms)() || [];
  const userRoles = useSelector((state) => state.user.roles || []);
  const pageNo = useSelector((state) => state.bpmForms.page);
  const limit = useSelector((state) => state.bpmForms.limit);
  const totalForms = useSelector((state) => state.bpmForms.totalForms);
  const sortOrder = useSelector((state) => state.bpmForms.sortOrder);
  const searchFormLoading = useSelector(
    (state) => state.formCheckList.searchFormLoading
  );
  const isDesigner = userRoles.includes(STAFF_DESIGNER);
  const [pageLimit, setPageLimit] = useState(5);
  const isAscending = sortOrder === "asc" ? true : false;
  const searchText = useSelector((state) => state.bpmForms.searchText);
  const [search, setSearch] = useState(searchText || "");
  const redirectUrl = MULTITENANCY_ENABLED ? `/tenant/${tenantKey}/` : "/";
  const isApplicationCountLoading = useSelector((state) => state.process.isApplicationCountLoading);

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

  const updateSort = (updatedSort) => {
    dispatch(setBPMFormListSort(updatedSort));
    dispatch(setBPMFormListPage(1));
  };
 

  useEffect(() => {
    setSearch(searchText);
  }, [searchText]);

  useEffect(() => {
    if (!search?.trim()) {
      dispatch(setBpmFormSearch(""));
    }
  }, [search]);

  const handleSearch = () => {
    dispatch(setBpmFormSearch(search));
    dispatch(setBPMFormListPage(1));
  };

  const viewOrEditForm = (formId) => {
    dispatch(resetFormProcessData());
    dispatch(push(`${redirectUrl}formflow/${formId}/view-edit`));
  };

  const submitNewForm = (formId)=>{
    dispatch(push(`${redirectUrl}form/${formId}`));
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

  const viewOrEdit = (formData) => (
    <button
      className="btn btn-link mt-2"
      onClick={() => viewOrEditForm(formData._id)}
    >
      <Translation>{(t) => t("View Details")}</Translation>{" "}
    </button>
  );

 

  const deleteForms = (formData) => {
    dispatch(setIsApplicationCountLoading(true));
    dispatch(
      getFormProcesses(formData._id, (err, data) => {
        const formDetails = {
          modalOpen: true,
          formId: formData._id,
          formName: formData.title,
          path: formData.path,
        };
        if (data) {
          dispatch(
            // eslint-disable-next-line no-unused-vars
              getAllApplicationCount(formData._id,(err, res) => {
              dispatch(setIsApplicationCountLoading(false));
              dispatch(setFormDeleteStatus(formDetails));
            })
          );
        } else {
          dispatch(setIsApplicationCountLoading(false));
          dispatch(setFormDeleteStatus(formDetails));
        }
      })
    );
  };

  const CustomToggle = React.forwardRef(({ children, onClick }, ref) => (
    <button
      className="btn btn-link text-dark"
      ref={ref}
      onClick={(e) => {
        e.preventDefault();
        onClick(e);
      }}
    >
      {children}
    </button>
  ));


  
  const noDataFound = () => {
    return (
      <tbody>
        <tr>
          <td colSpan="10">
            <div
              className="d-flex align-items-center justify-content-center flex-column w-100"
              style={{ minHeight: "300px" }}
            >
              <h3>{t("No forms found")}</h3>
              <p>{t("Please change the selected filters to view Forms")}</p>
            </div>
          </td>
        </tr>
      </tbody>
    );
  };
  return (
    <>
      <LoadingOverlay active={searchFormLoading || isApplicationCountLoading} spinner text={t("Loading...")}>
        <div style={{ minHeight: "400px" }}>
          <table className="table custom-table table-responsive-sm">
            <thead>
              <tr >
                <th >
                  <div className="d-flex align-items-center">
                    {isDesigner && <SelectFormForDownload type="all" />}
                    <span className="ml-4 mt-1">{t("Form Title")}</span>
                    <span>
                      {isAscending ? (
                        <i
                          className="fa fa-sort-alpha-asc ml-2 mt-1"
                          onClick={() => {
                            updateSort("desc");
                          }}
                          data-toggle="tooltip"
                          title={t("Descending")}
                          style={{
                            cursor: "pointer",
                            fontSize: "16px",
                          }}
                        ></i>
                      ) : (
                        <i
                          className="fa fa-sort-alpha-desc"
                          onClick={() => {
                            updateSort("asc");
                          }}
                          data-toggle="tooltip"
                          title={t("Ascending")}
                          style={{
                            cursor: "pointer",
                            fontSize: "16px",
                          }}
                        ></i>
                      )}
                    </span>
                  </div>
                </th>
                <th scope="col">{t("Created Date")}</th>
                <th scope="col">{t("Type")}</th>
                <th scope="col">{t("Visibility")}</th>
                <th scope="col">{t("Status")}</th>
                <th colSpan="4">
                  <InputGroup className="input-group p-0">
                    <FormControl
                      value={search}
                      onChange={(e) => {
                        setSearch(e.target.value);
                      }}
                      onKeyDown={(e) => (e.keyCode == 13 ? handleSearch() : "")}
                      placeholder={t("Search by form title")}
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
                      disabled={!search?.trim()}
                      style={{ cursor: "pointer" }}
                    >
                      <InputGroup.Text style={{ backgroundColor: "#ffff" }}>
                        <i className="fa fa-search"></i>
                      </InputGroup.Text>
                    </InputGroup.Append>
                  </InputGroup>
                </th>
              </tr>
            </thead>

            {formData?.length ? (
              <tbody>
                {formData?.map((e, index) => {
                  return (
                    <tr key={index}>
                      {isDesigner && (
                        <td>
                          <div
                            style={{ display: "flex", alignItems: "center" }}
                          >
                            <span className="mb-3">
                              <SelectFormForDownload form={e} />
                            </span>
                            <span className="ml-4 mt-2">{e.title}</span>
                          </div>
                        </td>
                      )}
                      <td>{HelperServices?.getLocaldate(e.created)}</td>
                      <td>{_.capitalize(e.formType)}</td>
                      <td>{e.anonymous ? t("Public") : t("Private")}</td>
                      <td>
                        {" "}
                        <span 
                          className={`badge rounded-pill px-3 py-2 ${e.status === 'active' ? 'published-forms-label' : 'unpublished-forms-label'}`}
                        >
                          {e.status === 'active' ? t("Published") : t("Unpublished")}
                        </span>
                      </td>

                      <td>
                        <span> {viewOrEdit(e)}</span>
                      </td>
                       
                      <td>
                    
                            <Dropdown  >
                          <Dropdown.Toggle
                            as={CustomToggle} 
                            id="dropdown-basic"
                          >
                            <i className="fa-solid fa-ellipsis"></i>
                          </Dropdown.Toggle>
                          <Dropdown.Menu className="shadow  bg-white">
                            {userRoles.includes(STAFF_REVIEWER) ||
                            userRoles.includes(CLIENT) ? (
                              <Dropdown.Item
                                onClick={() => {
                                  submitNewForm(e?._id);
                                }}
                              >
                                <i className="fa fa-pencil mr-2 text-primary" />
                                {t("Submit New")}
                              </Dropdown.Item>
                            ) : null}
                            <Dropdown.Item onClick={() => deleteForms(e)}>
                              <i className="fa fa-trash mr-2 text-danger" />
                              {t("Delete")}
                            </Dropdown.Item>
                          </Dropdown.Menu>
                        </Dropdown>
                      </td>
                    </tr>
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
        <div className="d-flex justify-content-between align-items-center flex-column flex-md-row">
          <div className="d-flex align-items-center">
          <span className="mr-2"> {t("Rows per page")}</span>
          <Dropdown>
                <Dropdown.Toggle variant="light" id="dropdown-basic">
                  {pageLimit}
                </Dropdown.Toggle>

                <Dropdown.Menu>
                
                    {pageOptions.map((option, index) => (
                  <Dropdown.Item
                    key={index}
                    type="button"
                    onClick={() => {
                      onSizePerPageChange(option.value);
                    }}
                  >
                    {option.text}
                  </Dropdown.Item>
                ))}
                </Dropdown.Menu>
              </Dropdown>
            <span className="ml-2">
              {t("Showing")} {(limit * pageNo) - (limit - 1)} {t("to")}{" "}
              {limit * pageNo > totalForms ? totalForms : limit * pageNo}{" "}
              {t("of")} {totalForms} {t("results")}
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
