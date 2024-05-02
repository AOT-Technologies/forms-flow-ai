import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getUserRolePermission } from "../../helper/user";
import {
  CLIENT,
  MULTITENANCY_ENABLED,
  STAFF_REVIEWER,
} from "../../constants/constants";
import { CLIENT_EDIT_STATUS } from "../../constants/applicationConstants";
import { HelperServices } from "@formsflow/service";
import { Translation } from "react-i18next";
import ApplicationFilter from "./ApplicationFilter";
import { Dropdown } from "react-bootstrap";
import Pagination from "react-js-pagination";
import { useTranslation } from "react-i18next";

import {
  setApplicationListActivePage,
  setApplicationLoading,
  setApplicationSortBy,
  setApplicationSortOrder,
  setCountPerpage,
} from "../../actions/applicationActions";
import { push } from "connected-react-router";
import LoadingOverlay from "react-loading-overlay-ts";

const ApplicationTable = () => {
  const dispatch = useDispatch();
  const [displayFilter, setDisplayFilter] = useState(false);
  const searchParams = useSelector((state) => state.applications.searchParams);
  const [filterParams, setFilterParams] = useState(searchParams);
  const [pageLimit, setPageLimit] = useState(5);
  const applications = useSelector(
    (state) => state.applications.applicationsList
  );
  const { t } = useTranslation();

  const tenantKey = useSelector((state) => state.tenants?.tenantId);
  const redirectUrl = MULTITENANCY_ENABLED ? `/tenant/${tenantKey}/` : "/";
  const userRoles = useSelector((state) => state.user.roles);
  const pageNo = useSelector((state) => state.applications?.activePage);
  const limit = useSelector((state) => state.applications?.countPerPage);
  const sortOrder = useSelector((state) => state.applications?.sortOrder);
  const sortBy = useSelector((state) => state.applications?.sortBy);
  const isApplicationLoading = useSelector(
    (state) => state.applications.isApplicationLoading
  );
  const isAscending = sortOrder === "asc" ? true : false;
  const totalForms = useSelector(
    (state) => state.applications?.applicationCount
  );
  const isClientEdit = (applicationStatus) => {
    if (
      getUserRolePermission(userRoles, CLIENT) ||
      getUserRolePermission(userRoles, STAFF_REVIEWER)
    ) {
      return CLIENT_EDIT_STATUS.includes(applicationStatus);
    } else {
      return false;
    }
  };
  const listApplications = (applications) => {
    let totalApplications = applications.map((application) => {
      application.isClientEdit = isClientEdit(application.applicationStatus);
      return application;
    });
    return totalApplications;
  };

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

  const submissionDetails = (data) => {
    dispatch(push(`${redirectUrl}application/${data.id}`));
  };

  const viewSubmissionDetails = (data) => (
    <button
      data-testid={`submission-details-button-${data.id}`}
      className="btn btn-link text-primary mt-2"
      onClick={() => submissionDetails(data)}
    >
      <Translation>{(t) => t("View Details")}</Translation>{" "}
    </button>
  );

  const getNoDataIndicationContent = () => {
    return (
      <div className="div-no-application bg-transparent">
        <label className="lbl-no-application">
          {" "}
          <Translation>{(t) => t("No submissions found")}</Translation>{" "}
        </label>
        <br />
        {(filterParams?.id ||
          filterParams?.applicationName ||
          filterParams?.applicationStatus ||
          filterParams?.modified) && (
          <label className="lbl-no-application-desc">
            {" "}
            <Translation>
              {(t) =>
                t("Please change the selected filters to view submissions")
              }
            </Translation>
          </label>
        )}
        <br />
      </div>
    );
  };

  const viewSubmittedForm = (formData) => {
    const url =
      formData.isClientEdit || formData.isResubmit
        ? `${redirectUrl}form/${formData.formId}/submission/${formData.submissionId}/edit`
        : `${redirectUrl}form/${formData.formId}/submission/${formData.submissionId}`;
    return (
      <button
        className="btn btn-link text-primary mt-2"
        data-testid={`submission-view-button-${formData.id}`}
        onClick={() => window.open(url, "_blank")}
      >
        <Translation>
          {(t) =>
            t(
              `${
                formData.isClientEdit || formData.isResubmit
                  ? "Edit Form"
                  : "View Submitted Form"
              }`
            )
          }
        </Translation>{" "}
      </button>
    );
  };

  const handlePageChange = (page) => {
    dispatch(setApplicationLoading(true));
    dispatch(setApplicationListActivePage(page));
  };

  const onSizePerPageChange = (limit) => {
    dispatch(setApplicationLoading(true));
    setPageLimit(limit);
    dispatch(setCountPerpage(limit));
    dispatch(setApplicationListActivePage(1));
  };

  const updateSort = (sortOrder, sortBy) => {
    dispatch(setApplicationLoading(true));
    dispatch(setApplicationSortOrder(sortOrder));
    dispatch(setApplicationSortBy(sortBy));
    dispatch(setApplicationListActivePage(1));
  };

  return (
    <>
      <LoadingOverlay
        active={isApplicationLoading}
        spinner
        text={t("Loading...")}
      >
        <table className="table custom-table table-responsive-sm">
          <thead>
            <tr>
              <th>
                {t("Id")}{" "}
                {isAscending && sortBy === "id" ? (
                  <i
                    data-testid="submission-id-desc-sort-icon"
                    onClick={() => updateSort("desc", "id")}
                    className="fa-sharp fa-solid fa-arrow-down-1-9 cursor-pointer"
                    title={t("Descending")}
                  />
                ) : (
                  <i
                    data-testid="submission-id-asc-sort-icon"
                    onClick={() => updateSort("asc", "id")}
                    className="fa-sharp fa-solid fa-arrow-down-9-1 cursor-pointer"
                    title={t("Ascending")}
                  />
                )}{" "}
              </th>
              <th>
                {t("Form Title")}{" "}
                {isAscending && sortBy === "applicationName" ? (
                  <i
                    data-testid="submission-title-desc-sort-icon"
                    onClick={() => updateSort("desc", "applicationName")}
                    className="fa-sharp fa-solid fa-arrow-down-a-z cursor-pointer"
                    title={t("Descending")}
                  />
                ) : (
                  <i
                    data-testid="submission-title-asc-sort-icon"
                    onClick={() => updateSort("asc", "applicationName")}
                    className="fa-sharp fa-solid fa-arrow-down-z-a cursor-pointer"
                    title={t("Ascending")}
                  />
                )}
              </th>
              <th>
                {t("Status")}
                {isAscending && sortBy === "applicationStatus" ? (
                  <i
                    data-testid="submission-status-desc-sort-icon"
                    onClick={() => updateSort("desc", "applicationStatus")}
                    className="fa-sharp fa-solid fa-arrow-down-a-z  ms-2 cursor-pointer"
                    title={t("Descending")}
                  />
                ) : (
                  <i
                    data-testid="submission-status-asc-sort-icon"
                    onClick={() => updateSort("asc", "applicationStatus")}
                    className="fa-sharp fa-solid fa-arrow-down-z-a  ms-2 cursor-pointer"
                    title={t("Ascending")}
                  />
                )}
              </th>
              <th>
                {t("Last Modified")}
                {isAscending && sortBy === "modified" ? (
                  <i
                    data-testid="submission-modified-desc-sort-icon"
                    onClick={() => updateSort("desc", "modified")}
                    className="fa-sharp fa-solid fa-arrow-down-1-9  ms-2 cursor-pointer"
                    title={t("Descending")}
                  />
                ) : (
                  <i
                    data-testid="submission-modified-asc-sort-icon"
                    onClick={() => updateSort("asc", "modified")}
                    className="fa-sharp fa-solid fa-arrow-down-9-1  ms-2 cursor-pointer"
                    title={t("Ascending")}
                  />
                )}
              </th>
              <th colSpan="4">
                <div className="d-flex justify-content-end filter-sort-bar mt-1">
                  <div className="filter-container-list application-filter-list-view">
                    <button
                      type="button"
                      className="btn btn-outline-secondary tooltiptext"
                      onClick={() => {
                        setDisplayFilter(true);
                      }}
                      data-testid="submission-filter-btn"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        fill="currentColor"
                        className="bi bi-filter me-2"
                        viewBox="0 0 16 16"
                      >
                        <path d="M6 10.5a.5.5 0 0 1 .5-.5h3a.5.5 0 0 1 0 1h-3a.5.5 0 0 1-.5-.5zm-2-3a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7a.5.5 0 0 1-.5-.5zm-2-3a.5.5 0 0 1 .5-.5h11a.5.5 0 0 1 0 1h-11a.5.5 0 0 1-.5-.5z" />
                      </svg>
                      {t("Filter")}
                    </button>

                    {displayFilter && (
                      <div className="clickable shadow border filter-list-view m-0 p-0">
                        <ApplicationFilter
                          filterParams={filterParams}
                          setFilterParams={setFilterParams}
                          setDisplayFilter={setDisplayFilter}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            {applications.length ? (
              listApplications(applications)?.map((e) => {
                return (
                  <tr key={e.id}>
                    <td>{e.id}</td>
                    <td>{e.applicationName}</td>
                    <td>{e.applicationStatus}</td>
                    <td>{HelperServices?.getLocalDateAndTime(e.modified)}</td>
                    <td>{viewSubmittedForm(e)}</td>
                    <td>{viewSubmissionDetails(e)}</td>
                  </tr>
                );
              })
            ) : (
              <td colSpan="6" className="text-center">
                {getNoDataIndicationContent()}
              </td>
            )}
          </tbody>
        </table>

        {applications.length ? (
          <div className="d-flex justify-content-between align-items-center  flex-column flex-md-row">
            <div className="d-flex align-items-center">
              <span className="me-2"> {t("Rows per page")}</span>
              <Dropdown size="sm">
                <Dropdown.Toggle variant="light" id="dropdown-basic" data-testid="page-limit-dropdown-toggle">
                  {pageLimit}
                </Dropdown.Toggle>
                <Dropdown.Menu>
                  {pageOptions.map((option) => (
                    <Dropdown.Item
                      key={option.value}
                      type="button"
                      onClick={() => {
                        onSizePerPageChange(option.value);
                      }}
                      data-testid={`page-limit-dropdown-item-${option.value}`}
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
        ) : null}
      </LoadingOverlay>
    </>
  );
};

export default ApplicationTable;
