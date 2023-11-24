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
} from "../../../actions/formActions";
import LoadingOverlay from "react-loading-overlay";
import {
  MULTITENANCY_ENABLED,
  STAFF_DESIGNER,
} from "../../../constants/constants";
import { useTranslation } from "react-i18next";
import { Translation } from "react-i18next";
import { sanitize } from "dompurify";

function ClientTable() {
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
  const [openIndex, setOpenIndex] = useState(null);

  const pageOptions = [
    { text: "5", value: 5 },
    { text: "25", value: 25 },
    { text: "50", value: 50 },
    { text: "100", value: 100 },
    { text: "All", value: totalForms },
  ];

  const updateSort = (updatedSort) => {
    resetIndex();
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
    resetIndex();
    dispatch(setBpmFormSearch(search));
    dispatch(setBPMFormListPage(1));
  };

  const submitNewForm = (formId) => {

    dispatch(push(`${redirectUrl}form/${formId}`));
  };

  const resetIndex = () => {
    if (openIndex !== null) setOpenIndex(null);
  };

  const handleClearSearch = () => {
    resetIndex();
    setSearch("");
    dispatch(setBpmFormSearch(""));
  };

  const handlePageChange = (page) => {
    resetIndex();
    dispatch(setBPMFormListPage(page));
  };

  const onSizePerPageChange = (limit) => {
    setPageLimit(limit);
    dispatch(setBPMFormLimit(limit));
    dispatch(setBPMFormListPage(1));
  };

  const noDataFound = () => {
    return (
      <tbody>
        <tr>
          <td colSpan="3">
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

  const extractContent = (htmlContent) => {
    const sanitizedHtml = sanitize(htmlContent);

    const tempElement = document.createElement("div");
    tempElement.innerHTML = sanitizedHtml;

    // Get the text content from the sanitized HTML
    const textContent = tempElement.textContent || tempElement.innerText || "";
    return textContent;
  };

 



  const handleToggle = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };
  return (
    <>
      <LoadingOverlay active={searchFormLoading} spinner text={t("Loading...")}>
        <div style={{ minHeight: "400px"}}>
          <table className="table custom-table table-responsive-sm">
            <thead>
              <tr>
                <th>
                  <div className="d-flex align-items-center">
                    <span>{t("Form Title")}</span>
                    <span>
                      {isAscending ? (
                        <i
                          className="fa fa-sort-alpha-asc ml-2"
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
                          className="fa fa-sort-alpha-desc ml-2"
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
                <th>{t("Form Description")}</th>
                <th colSpan="4">
                  <InputGroup className="input-group p-0 w-100">
                    <FormControl
                      value={search}
                      onChange={(e) => {
                        setSearch(e.target.value);
                      }}
                      onKeyDown={(e) =>
                        e.keyCode === 13 ? handleSearch() : ""
                      }
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
                {formData.map((e, index) => (
                  <React.Fragment key={index}>
                    <tr>
                      <td className="col-4">
                        {!isDesigner && (
                          <button className="btn btn-light btn-small mr-2"   onClick={() => handleToggle(index) } disabled={!e.description}>
                              <i
                            className={`fa ${
                              openIndex === index
                                ? "fa-chevron-up"
                                : "fa-chevron-down"
                            }`}
                          
                          ></i>
                          </button>
                        )}
                        <span className="ml-2 mt-2">{e.title}</span>
                      </td>
                      <td
                        className="text-truncate"
                        style={{
                          maxWidth: "350px",
                        }}
                      >
                        {extractContent(e.description)}
                      </td>

                      <td className="text-center">
                        <button
                          className="btn btn-primary"
                          onClick={() => submitNewForm(e._id)}
                        >
                          <Translation>{(t) => t("Submit New")}</Translation>
                        </button>
                      </td>
                    </tr>

                    {index === openIndex && 
                        <tr>
                          <td colSpan={10}>
                            <div className="bg-white p-3">
                              <h4>
                                <strong>{t("Form Description")}</strong>
                              </h4>

                              <div
                                style={{ maxWidth: "68vw" }}
                                className="form-description-p-tag "
                                dangerouslySetInnerHTML={{
                                  __html: sanitize(
                                    e?.description,
                                    {
                                      ADD_ATTR: ["target"],
                                    }
                                  ),
                                }}
                              />
                            </div>
                          </td>
                        </tr>
                    } 
                  </React.Fragment>
                ))}
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
              {t("of")} {totalForms} {t("Results")}
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

export default ClientTable;
