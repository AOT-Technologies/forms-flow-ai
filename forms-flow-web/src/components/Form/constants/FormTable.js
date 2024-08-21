import React, { useState } from "react";
import { Dropdown } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import { push } from "connected-react-router";
import Pagination from "react-js-pagination";
import downArrow from "../../Modals/downArrow.svg";
import {
  setBPMFormLimit,
  setBPMFormListPage,
  setBPMFormListSort,
} from "../../../actions/formActions";
import LoadingOverlay from "react-loading-overlay-ts";
import {
  MULTITENANCY_ENABLED,
} from "../../../constants/constants";
import { useTranslation } from "react-i18next";
import { Translation } from "react-i18next";
import {
  resetFormProcessData
} from "../../../apiManager/services/processServices";
import { HelperServices } from "@formsflow/service";
import Button from "../../CustomComponents/Button";
import  userRoles  from "../../../constants/permissions";

function FormTable() {
  const tenantKey = useSelector((state) => state.tenants?.tenantId);
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const bpmForms = useSelector((state) => state.bpmForms);
  const formData = (() => bpmForms.forms)() || [];
  const pageNo = useSelector((state) => state.bpmForms.page);
  const limit = useSelector((state) => state.bpmForms.limit);
  const totalForms = useSelector((state) => state.bpmForms.totalForms);
  const sortOrder = useSelector((state) => state.bpmForms.sortOrder);
  const searchFormLoading = useSelector(
    (state) => state.formCheckList.searchFormLoading
  );
  const [pageLimit, setPageLimit] = useState(5);
  const isAscending = sortOrder === "asc" ? true : false;
  const redirectUrl = MULTITENANCY_ENABLED ? `/tenant/${tenantKey}/` : "/";
  const isApplicationCountLoading = useSelector((state) => state.process.isApplicationCountLoading);
  const { createDesigns } = userRoles();


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
  const viewOrEditForm = (formId, path) => {
    dispatch(resetFormProcessData());
    dispatch(push(`${redirectUrl}formflow/${formId}/${path}`));
  };

  const handlePageChange = (page) => {
    dispatch(setBPMFormListPage(page));
  };

  const onSizePerPageChange = (limit) => {
    setPageLimit(limit);
    dispatch(setBPMFormLimit(limit));
    dispatch(setBPMFormListPage(1));
  };

  const stripHtml = (html) => {
    let doc = new DOMParser().parseFromString(html, 'text/html');
    return doc.body.textContent || "";
  };

  const noDataFound = () => {
    return (
      <tbody>
        <tr>
          <td colSpan="10">
            <div className="d-flex align-items-center justify-content-center clientForm-table-col flex-column w-100">
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
        <div className="min-height-400">
          <table className="table custom-tables table-responsive-sm">
            <thead>
              <tr>
                <th className="width-30">
                  <div className="d-flex align-items-center justify-content-between">
                    <span className="ms-4 mt-1">{t("Form Name")}</span>
                    <span>
                      {isAscending ? (
                        <i
                          data-testid="form-desc-sort-icon"
                          className="fa fa-arrow-up sort-icon cursor-pointer fs-16 ms-2"
                          onClick={() => {
                            updateSort("desc");
                          }}
                          data-toggle="tooltip"
                          title={t("Ascending")}
                        ></i>
                      ) : (
                        <i
                          data-testid="form-asc-sort-icon"
                          className="fa fa-arrow-down sort-icon cursor-pointer fs-16 ms-2"
                          onClick={() => {
                            updateSort("asc");
                          }}
                          data-toggle="tooltip"
                          title={t("Descending")}
                        ></i>
                      )}
                    </span>
                  </div>
                </th>
                <th className="width-40" scope="col">{t("Description")}</th>
                <th scope="col">{t("Last Edited")}</th>
                <th scope="col">{t("Visibility")}</th>
                <th scope="col">{t("Status")}</th>
                <th colSpan="4" aria-label="Search Forms by form title"></th>
              </tr>
            </thead>

            {formData?.length ? (
              <tbody>
                {formData?.map((e, index) => {
                  return (
                    <tr key={index}>
                      <td className="width-30">
                        <div className="d-flex">
                          <span className="ms-4 text-container">{e.title}</span>
                        </div>
                      </td>
                      <td className="col-4 width-30">
                        <div className="text-container"> {stripHtml(e.description ? e.description : "Description is not added")}</div></td>
                      <td>{HelperServices?.getLocaldate(e.created)}</td>
                      <td>{e.anonymous ? t("Public") : t("Private")}</td>
                      <td>
                        <span data-testid={`form-status-${e._id}`} className="d-flex align-items-center">
                          {e.status === "active" ? (
                            <>
                              <div className="status-live"></div>
                            </>
                          ) : (
                            <div className="status-draft"></div>
                          )}
                          {e.status === "active" ? t("Live") : t("Draft")}
                        </span>
                      </td>
                      <td>
                         {createDesigns && <Button
                          variant="secondary"
                          size="sm"
                          label={<Translation>{(t) => t("Edit")}</Translation>}
                          onClick={() => viewOrEditForm(e._id, 'edit')}
                          className=""
                          dataTestid={`form-edit-button-${e._id}`}
                          ariaLabel="Edit Form Button"
                        />}
                      </td>
                    </tr>
                  );
                })}
                <tr>
                  {formData.length ? (
                    <>
                      <td colSpan={1}>
                        <div className="d-flex justify-content-between align-items-center flex-column flex-md-row">
                          <span className="ms-2 pagination-text">
                            {t("Showing")} {(limit * pageNo) - (limit - 1)} {t("to")}{" "}
                            {limit * pageNo > totalForms ? totalForms : limit * pageNo}{" "}
                            {t("of")} {totalForms} {t("results")}
                          </span>
                        </div>
                      </td>
                      <td colSpan={3}>
                        <div className="d-flex align-items-center justify-content-around">
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
                      </td>
                      <td colSpan={3}>
                        <div className="d-flex align-items-center justify-content-end">
                          <span className="pagination-text">{t("Rows per page")}</span>
                          <div className="pagination-dropdown">
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
                            <img src={downArrow} alt="drppdown" />
                          </div>
                        </div>
                      </td>
                    </>
                  ) : (
                    <td colSpan={3}></td>
                  )}
                </tr>
              </tbody>
            ) : !searchFormLoading ? (
              noDataFound()
            ) : null}
          </table>
        </div>
      </LoadingOverlay>
    </>
  );
}

export default FormTable;
