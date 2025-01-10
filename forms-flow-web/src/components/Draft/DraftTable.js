/* eslint-disable */
import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { MULTITENANCY_ENABLED } from "../../constants/constants";
import { HelperServices } from "@formsflow/service";
import { Translation } from "react-i18next";
import { push } from "connected-react-router";
import {
  setCountPerpage,
  setDraftListActivePage,
  setDraftListLoading,
  setDraftSortBy,
  setDraftSortOrder,
} from "../../actions/draftActions";
import DraftFilter from "./DraftFilter";
import DraftOperations from "./DraftOperations";

import { useTranslation } from "react-i18next";
import LoadingOverlay from "react-loading-overlay-ts";
import { TableFooter, CustomButton } from "@formsflow/components"; 

const DraftTable = () => {
  const dispatch = useDispatch();
  const [displayFilter, setDisplayFilter] = useState(false);
  const searchParams = useSelector((state) => state.draft.searchParams);
  const [filterParams, setFilterParams] = useState(searchParams);
  const drafts = useSelector((state) => state.draft.draftList);
  const tenantKey = useSelector((state) => state.tenants?.tenantId);
  const redirectUrl = MULTITENANCY_ENABLED ? `/tenant/${tenantKey}/` : "/";
  const pageNo = useSelector((state) => state.draft?.activePage);
  const limit = useSelector((state) => state.draft?.countPerPage);
  const totalForms = useSelector((state) => state.draft?.draftCount);
  const sortOrder = useSelector((state) => state.draft.sortOrder);
  const sortBy = useSelector((state) => state.draft.sortBy);
  const isDraftLoading = useSelector((state) => state.draft.isDraftLoading);
  const isAscending = sortOrder === "asc" ? true : false;
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

  const getNoDataIndicationContent = () => {
    return (
      <div className="div-no-application">
        <label className="lbl-no-application">
          {" "}
          <Translation>{(t) => t("No drafts found")}</Translation>{" "}
        </label>
        <br />
        {(filterParams?.id || filterParams?.draftName || filterParams?.modified) && (
          <label className="lbl-no-application-desc">
            {" "}
            <Translation>
              {(t) => t("Please change the selected filters to view drafts")}
            </Translation>
          </label>
        )}
        <br />
      </div>
    );
  };

  const viewDraft = (data) => (
    <button
      data-testid={`draft-view-button-${data.id}`}
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
        data-testid={`draft-edit-button-${formData.id}`}
        className="btn btn-link mt-2"
        onClick={() => dispatch(push(url))}
      >
        <Translation>{(t) => t("Edit Draft")}</Translation>{" "}
      </button>
    );
  };

  const handlePageChange = (page) => {
    dispatch(setDraftListLoading(true));
    dispatch(setDraftListActivePage(page));
  };

  const onLimitChange = (newLimit) => {
    dispatch(setDraftListLoading(true));
    dispatch(setCountPerpage(newLimit));
    dispatch(setDraftListActivePage(1));
  };

  const updateSort = (sortOrder, sortBy) => {
    dispatch(setDraftListLoading(true));
    dispatch(setDraftSortOrder(sortOrder));
    dispatch(setDraftSortBy(sortBy));
    dispatch(setDraftListActivePage(1));
  };

  return (

     <LoadingOverlay active={isDraftLoading} spinner text={t("Loading...")}>
      <div >
      <div className="table-responsive" style={{ maxHeight: "75vh", overflowY: "auto" }}>
          <table className="table custom-table table-responsive-sm">
            <thead>
              <tr>
                <th>
                  {t("Id")}{" "}
                  {isAscending && sortBy === "id" ? (
                    <i
                      data-testid="draft-id-desc-sort-icon"
                      onClick={() => updateSort("desc", "id")}
                      className="fa-sharp fa-solid fa-arrow-down-1-9 cursor-pointer"
                      title={t("Descending")}
                    />
                  ) : (
                    <i
                      data-testid="draft-id-asc-sort-icon"
                      onClick={() => updateSort("asc", "id")}
                      className="fa-sharp fa-solid fa-arrow-down-9-1 cursor-pointer"
                      title={t("Ascending")}
                    />
                  )}
                </th>
                <th>
                  {t("Title")}
                  {isAscending && sortBy === "DraftName" ? (
                    <i
                      data-testid="draft-title-desc-sort-icon"
                      onClick={() => updateSort("desc", "DraftName")}
                      className="fa-sharp fa-solid fa-arrow-down-a-z cursor-pointer"
                      title={t("Descending")}                      
                    />
                  ) : (
                    <i
                      data-testid="draft-title-asc-sort-icon"
                      onClick={() => updateSort("asc", "DraftName")}
                      className="fa-sharp fa-solid fa-arrow-down-z-a cursor-pointer"
                      title={t("Ascending")}
                    />
                  )}
                </th>
                <th>
                  {t("Last Modified")}{" "}
                  {isAscending && sortBy === "modified" ? (
                    <i
                      data-testid="draft-modified-desc-sort-icon"
                      onClick={() => updateSort("desc", "modified")}
                      className="fa-sharp fa-solid fa-arrow-down-1-9  ms-2 cursor-pointer"
                      title={t("Descending")}
                    />
                  ) : (
                    <i
                      data-testid="draft-modified-asc-sort-icon"
                      onClick={() => updateSort("asc", "modified")}
                      className="fa-sharp fa-solid fa-arrow-down-9-1  ms-2 cursor-pointer"
                      title={t("Ascending")}
                    />
                  )}
                </th>
                <th colSpan="4">
                  <div className="d-flex justify-content-end filter-sort-bar mt-1">
                    <div className="filter-container-list application-filter-list-view">
                    <CustomButton
                    variant="secondary"
                    size="md"
                    label={t("Filter")}
                    onClick={() => {
                      setDisplayFilter(true);
                    }}
                    dataTestid="draft filter"
                    ariaLabel={t("Draft Filter Button")}
                    />
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
              {drafts.length > 0 ? drafts?.map((e, index) => (
                    <tr key={index}>
                      <td>{e.id}</td>
                      <td>{e.DraftName}</td>
                      <td>{HelperServices?.getLocalDateAndTime(e.modified)}</td>
                      <td>{viewDraft(e)}</td>
                      <td>{editDraft(e)}</td>
                      <td>
                        <DraftOperations row={e} />
                      </td>
                    </tr>
                  )) : <tr>
                  <td colSpan="6" className="text-center">
                    {getNoDataIndicationContent()}
                  </td>
                </tr>}
            </tbody>
          </table>
          </div>
        </div>

        {drafts.length ? (
          <table className="table">
            <tfoot>
            <TableFooter
              limit={limit}
              activePage={pageNo}
              totalCount={totalForms}
              handlePageChange={handlePageChange}
              onLimitChange={onLimitChange}
              pageOptions={pageOptions}
            />
            </tfoot>          
          </table>
        ) : null}
      </LoadingOverlay>

  );
};

export default DraftTable;
