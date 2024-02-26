
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
import LoadingOverlay from "react-loading-overlay-ts";
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

  const viewOrEditForm = (formId,path) => {
    dispatch(resetFormProcessData());
    dispatch(push(`${redirectUrl}formflow/${formId}/${path}`));
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
      aria-label="CustomToggle"
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
              className="d-flex align-items-center justify-content-center clientForm-table-col flex-column w-100"
              
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
        <div className="min-height-400" >
          <table className="table custom-table table-responsive-sm">
            <thead>
              <tr >
                <th >
                  <div className="d-flex align-items-center">
                    {isDesigner && <SelectFormForDownload type="all" />}
                    <span className="ms-4 mt-1">{t("Form Title")}</span>
                    <span>
                      {isAscending ? (
                        <i
                          data-testid="form-desc-sort-icon"
                          className="fa fa-sort-alpha-asc cursor-pointer fs-16 ms-2 mt-1"
                          onClick={() => {
                            updateSort("desc");
                          }}
                          data-toggle="tooltip"
                          title={t("Ascending")}>

                          </i>
                      ) : (
                        <i
                          data-testid="form-asc-sort-icon"
                          className="fa fa-sort-alpha-desc cursor-pointer fs-16 ms-2 mt-1"
                          onClick={() => {
                            updateSort("asc");
                          }}
                          data-toggle="tooltip"
                          title={t("Descending")}></i>
                      )}
                    </span>
                  </div>
                </th>
                <th scope="col">{t("Created Date")}</th>
                <th scope="col">{t("Type")}</th>
                <th scope="col">{t("Visibility")}</th>
                <th scope="col">{t("Status")}</th>
                <th colSpan="4" aria-label="Search Forms by form title">
                  <InputGroup className="input-group p-0">
                    <FormControl
                    className="bg-white"
                      value={search}
                      onChange={(e) => {
                        setSearch(e.target.value);
                      }}
                      onKeyDown={(e) => (e.keyCode == 13 ? handleSearch() : "")}
                      placeholder={t("Search by form title")}
                      title={t("Search by form title")}
                      data-testid="form-search-input-box"
                    />
                    {search && (
                      <InputGroup.Append onClick={handleClearSearch} data-testid="form-search-clear-button">
                        <InputGroup.Text className="h-100">
                          <i className="fa fa-times"></i>
                        </InputGroup.Text>
                      </InputGroup.Append>
                    )}
                    <InputGroup.Append
                      onClick={handleSearch}
                      data-testid="form-search-click-button"
                      disabled={!search?.trim()}
                      className="cursor-pointer"
                    >
                      <InputGroup.Text className="h-100 bg-white">
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
                          <div className="d-flex"
                          >
                            <span className="">
                              <SelectFormForDownload form={e} />
                            </span>
                            <span className="ms-4">{e.title}</span>
                          </div>
                        </td>
                      )}
                      <td>{HelperServices?.getLocaldate(e.created)}</td>
                      <td>{_.capitalize(e.formType)}</td>
                      <td>{e.anonymous ? t("Public") : t("Private")}</td>
                      <td>
                        <span
                          data-testid={`form-status-${e._id}`}
                          className={`badge rounded-pill px-3 py-2 ${
                            e.status === "active"
                              ? "published-forms-label"
                              : "unpublished-forms-label"
                          }`}
                        >
                          {e.status === "active"
                            ? t("Published")
                            : t("Unpublished")}
                        </span>
                      </td>

                      <td>
                        <button
                          data-testid={`form-edit-button-${e._id}`}
                          className="btn btn-link text-primary mt-2"
                          onClick={() => viewOrEditForm(e._id,'edit')}
                        >
                          <Translation>{(t) => t("Edit Form")}</Translation>{" "}
                        </button>
                      </td>
                      <td>
                        <Dropdown data-testid={`designer-form-option-${e._id}`}>
                          <Dropdown.Toggle
                            data-testid={`designer-form-option-toggle-${e._id}`}
                            as={CustomToggle}
                            id="dropdown-basic"
                            title={t("More options")}
                            aria-describedby="More-options"
                          >
                            <i className="fa-solid fa-ellipsis"></i>
                          </Dropdown.Toggle>
                          <Dropdown.Menu className="shadow  bg-white">
                          <Dropdown.Item
                                onClick={() => {
                                  viewOrEditForm(e?._id,'view-edit');
                                }}
                                data-testid={`designer-form-option-${e._id}-view-details`}
                              > 
                                <i className="fa-solid me-2 fa-arrow-up-right-from-square text-primary"></i>
                                {t("View Details")}
                              </Dropdown.Item>

                            {userRoles.includes(STAFF_REVIEWER) ||
                            userRoles.includes(CLIENT) ? (
                              <Dropdown.Item
                                onClick={() => {
                                  submitNewForm(e?._id);
                                }}
                                data-testid={`designer-form-option-${e._id}-submit`}
                              >
                                <i className="fa fa-pencil me-2 text-primary" />
                                {t("Submit New")}
                              </Dropdown.Item>
                            ) : null}


                            <Dropdown.Item onClick={() => deleteForms(e)}
                             data-testid={`designer-form-option-${e._id}-delete`}>
                              <i className="fa fa-trash me-2 text-danger" />
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
              null
            )}
          </table>
        </div>
      </LoadingOverlay>

      {formData.length ? (
        <div className="d-flex justify-content-between align-items-center flex-column flex-md-row">
          <div className="d-flex align-items-center">
          <span className="me-2"> {t("Rows per page")}</span>
          <Dropdown data-testid="page-limit-dropdown">
                <Dropdown.Toggle variant="light" id="dropdown-basic" data-testid="page-limit-dropdown-toggle">
                  {pageLimit}
                </Dropdown.Toggle>

                <Dropdown.Menu>
                    {pageOptions.map((option, index) => (
                  <Dropdown.Item
                    key={index}
                    type="button"
                    data-testid={`page-limit-dropdown-item-${option.value}`}
                    onClick={() => {
                      onSizePerPageChange(option.value);
                    }}
                  >
                    {option.text}
                  </Dropdown.Item>
                ))}
                </Dropdown.Menu>
              </Dropdown>
            <span className="ms-2">
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
