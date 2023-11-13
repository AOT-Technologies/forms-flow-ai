/* eslint-disable */
import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { MULTITENANCY_ENABLED } from "../../constants/constants";
import { HelperServices } from "@formsflow/service";
import { Translation } from "react-i18next";
import { Dropdown, DropdownButton } from "react-bootstrap";
import Pagination from "react-js-pagination";
import { push } from "connected-react-router";
import {
  setCountPerpage,
  setDraftDelete,
  setDraftListActivePage,
} from "../../actions/draftActions";
import DraftFilter from "./DraftFilter";
import DraftOperations from "./DraftOperations";

import { useTranslation } from "react-i18next";

const DraftTable = () => {
  const dispatch = useDispatch();
  const [displayFilter, setDisplayFilter] = useState(false);
  const [filterParams, setFilterParams] = useState({});
  const [pageLimit, setPageLimit] = useState(5);
  const drafts = useSelector((state) => state.draft.draftList);
  const tenantKey = useSelector((state) => state.tenants?.tenantId);
  const redirectUrl = MULTITENANCY_ENABLED ? `/tenant/${tenantKey}/` : "/";
  const userRoles = useSelector((state) => state.user.roles);
  const pageNo = useSelector((state) => state.draft?.activePage);
  const limit = useSelector((state) => state.draft?.countPerPage);
  const totalForms = useSelector((state) => state.draft?.draftCount);
  const { t } = useTranslation();

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

  const viewDraft = (data) => (
    <button
      className="btn btn-link mt-2"
      onClick={() => dispatch(push(`${redirectUrl}draft/${data.id}`))}
    >
      <Translation>{(t) => t("View Draft Details")}</Translation>{" "}
    </button>
  );

  const editDraft = (formData) => {
    const url = `${redirectUrl}form/${formData.formId}/draft/${formData.id}/edit`;
    return (
      <button
        className="btn btn-link mt-2"
        onClick={() => window.open(url, "_blank")}
      >
        <Translation>{(t) => t("Edit Draft")}</Translation>{" "}
      </button>
    );
  };


  const handlePageChange = (page) => {
    dispatch(setDraftListActivePage(page));
  };

  const onSizePerPageChange = (limit) => {
    setPageLimit(limit);
    dispatch(setCountPerpage(limit));
    dispatch(setDraftListActivePage(1));
  };

  return (
    <>
      <div style={{ minHeight: "400px" }}>
        <table className="table custom-table table-responsive-sm">
          <thead>
            <tr>
              <th>{t("Draft Id")}</th>
              <th>{t("Draft Title")}</th>
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
                        <DraftFilter
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
            {drafts?.map((e, index) => {
              return (
                <tr key={index}>
                  <td>{e.id}</td>
                  <td>{e.DraftName}</td>

                  <td>{HelperServices?.getLocalDateAndTime(e.modified)}</td>
                  <td>{viewDraft(e)}</td>
                  <td>{editDraft(e)}</td>
                  <td><DraftOperations row={e}/></td>
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

export default DraftTable;
