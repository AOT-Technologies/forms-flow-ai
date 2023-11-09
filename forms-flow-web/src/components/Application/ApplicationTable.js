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
  setCountPerpage,
} from "../../actions/applicationActions";
import { push } from "connected-react-router";

const ApplicationTable = () => {
  const dispatch = useDispatch();
  const [displayFilter, setDisplayFilter] = useState(false);
  const [filterParams, setFilterParams] = useState({});
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

 

  const  viewSubmissionDetails = (data) => (
    <button className="btn btn-link mt-2" onClick={() => submissionDetails(data)}>
      <Translation>{(t) => t("View Details")}</Translation>{" "}
    </button>
  );

  const viewSubmittedForm = (formData) => {
    const url =
    formData.isClientEdit || formData.isResubmit
        ? `${redirectUrl}form/${formData.formId}/submission/${formData.submissionId}/edit`
        : `${redirectUrl}form/${formData.formId}/submission/${formData.submissionId}`;
    return (
      <button
        className="btn btn-link mt-2"
        onClick={() => window.open(url, "_blank")}
      >
        <Translation>{(t) => t("View Submitted Form")}</Translation>{" "}
      </button>
    );
  };

  const handlePageChange = (page) => {
    dispatch(setApplicationListActivePage(page));
  };

  const onSizePerPageChange = (limit) => {
    setPageLimit(limit);
    dispatch(setCountPerpage(limit));
    dispatch(setApplicationListActivePage(1));
  };

  return (
    <>
      <div style={{ minHeight: "400px" }}>
        <table className="table custom-table table-responsive-sm">
          <thead>
            <tr>
              <th>{t("Id")}</th>
              <th>{t("Form Title")}</th>
              <th>{t("Status")}</th>
              <th>{t("Last Modified")}</th>
              <th colSpan="4">
                <div className="d-flex justify-content-end filter-sort-bar mt-1">
                  <div className="filter-container-list application-filter-list-view">
                    <button
                      type="button"
                      className="btn btn-outline-secondary "
                      onClick={() => {
                        setDisplayFilter(true);
                      }}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        fill="currentColor"
                        className="bi bi-filter mr-2"
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
            {listApplications(applications)?.map((e) => {
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
            })}
          </tbody>
        </table>
      </div>
      <div className="d-flex justify-content-between align-items-center  flex-column flex-md-row">
        <div className="d-flex align-items-center">
        <span className="mr-2"> {t("Rows per page")}</span>
        <Dropdown size="sm">
            <Dropdown.Toggle variant="light" id="dropdown-basic">
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
                >
                  {option.text}
                </Dropdown.Item>
              ))}
            </Dropdown.Menu>
        </Dropdown>
          <span className="ml-2">
            {t("Showing")} {(limit * pageNo ) - (limit - 1)} {t("to")}{" "}
            {limit * pageNo > totalForms ? totalForms : limit * pageNo} {t("of")}{" "}
            {totalForms} {t("results")}
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
};

export default ApplicationTable;
