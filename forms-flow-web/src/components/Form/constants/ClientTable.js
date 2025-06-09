// Import statements
import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  setClientFormLimit,
  setClientFormListPage,
  setClientFormListSort
} from "../../../actions/formActions";
import { HelperServices } from "@formsflow/service";
import { useTranslation } from "react-i18next";
import { TableFooter, CustomButton } from "@formsflow/components";
import LoadingOverlay from "react-loading-overlay-ts";
import SortableHeader from '../../CustomComponents/SortableHeader';
import { navigateToFormEntries } from "../../../helper/routerHelper";
import SubmissionDrafts from "../../../routes/Submit/Forms/DraftAndSubmissions";

function ClientTable() {
  // Redux hooks and state management
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const tenantKey = useSelector((state) => state.tenants?.tenantId);
  const bpmForms = useSelector((state) => state.bpmForms);
  const searchFormLoading = useSelector((state) => state.formCheckList.searchFormLoading);
  const [showSubmissions, setShowSubmissions] = useState(false);
  // Local state
  const [expandedRowIndex, setExpandedRowIndex] = useState(null);

  // Derived state from Redux
  const formData = bpmForms?.forms || [];
  const pageNo = useSelector((state) => state.bpmForms.submitListPage);
  const limit = useSelector((state) => state.bpmForms.submitFormLimit);
  const totalForms = useSelector((state) => state.bpmForms.totalForms);
  const formsort = useSelector((state) => state.bpmForms.submitFormSort);


  // Constants
  const pageOptions = [
    { text: "5", value: 5 },
    { text: "25", value: 25 },
    { text: "50", value: 50 },
    { text: "100", value: 100 },
    { text: "All", value: totalForms },
  ];

  // Utility functions
  const stripHtml = (html) => {
    let doc = new DOMParser().parseFromString(html, 'text/html');
    return doc.body.textContent || "";
  };

  const handleKeyPress = (e, index) => {
    if (e.key === "Enter" || e.key === " ") {
      toggleRow(index);
    }
  };

  // Event handlers
  const handleSort = (key) => {
    const newSortOrder = formsort[key].sortOrder === "asc" ? "desc" : "asc";

    // Reset all other columns to default (ascending) except the active one
    const updatedSort = Object.keys(formsort).reduce((acc, columnKey) => {
      acc[columnKey] = { sortOrder: columnKey === key ? newSortOrder : "asc" };
      return acc;
    }, {});

    dispatch(setClientFormListSort({
      ...updatedSort,
      activeKey: key,
    }));
  };

  const showFormEntries = (parentFormId) => {
    setShowSubmissions(true);
    navigateToFormEntries(dispatch, tenantKey, parentFormId);
  };


  const handlePageChange = (page) => {
    dispatch(setClientFormListPage(page));
  };

  const onSizePerPageChange = (newLimit) => {
    dispatch(setClientFormLimit(newLimit));
    dispatch(setClientFormListPage(1));
  };

  const toggleRow = (index) => {
    setExpandedRowIndex(prevIndex => prevIndex === index ? null : index);
  };

  // UI Components
  const noDataFound = () => {
    return (
      <tbody>
        <tr>
          <td colSpan="3">
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

    <LoadingOverlay
      active={searchFormLoading}
      spinner
      text={t("Loading...")}
    >
      <div className="min-height-400">
        <div className="custom-tables-wrapper">
          <table className="table custom-tables table-responsive-sm" data-testid="client-table">
            <thead className="table-header">
              <tr>
                <th className="w-20" data-testid="form-name-header">
                  <SortableHeader
                    columnKey="formName"
                    title="Form Name"
                    currentSort={formsort}
                    handleSort={handleSort}
                    className="gap-2"
                  />
                </th>
                <th className="w-30" scope="col" data-testid="description-header">{t("Description")}</th>

                <th className="w-13" scope="col" data-testid="submission-count-header">
                  <SortableHeader
                    columnKey="submissionCount"
                    title="Submissions"
                    currentSort={formsort}
                    handleSort={handleSort}
                    className="gap-2" />
                </th>

                <th className="w-13" scope="col" data-testid="latest-submission-header">
                  <SortableHeader
                    columnKey="latestSubmission"
                    title={t("Latest Submission")}
                    currentSort={formsort}
                    handleSort={handleSort}
                    className="gap-2" />
                </th>
                <th className="w-12" colSpan="4" aria-label="Select a Form"></th>
              </tr>
            </thead>
            {formData?.length ? (
              <tbody>
                {formData.map((e, index) => {
                  const isExpanded = expandedRowIndex === index;
                  return (
                    <React.Fragment key={index}>
                      <tr>
                        <td className="w-20">
                          <span
                            data-testid={`form-title-${e._id}`}
                            className="mt-2 text-container"
                          >
                            {e.title}
                          </span>
                        </td>
                        <td className="w-30">
                          <span
                            data-testid="description-cell"
                            className={` cursor-pointer ${isExpanded ? "text-container-expand" : "text-container"}`}
                            role="button"
                            tabIndex="0"
                            aria-expanded={isExpanded} // Adds accessibility
                            onClick={() => toggleRow(index)}
                            onKeyDown={(e) => handleKeyPress(e, index)}
                          >
                            {stripHtml(e.description ? e.description : "")}
                          </span>
                        </td>
                        <td
                          data-testid={`Submissions-count-${e._id}`} className="w-13">
                          {e.submissionsCount}
                        </td>
                        <td
                          data-testid={`latest-submission-${e._id}`} className="w-13">
                         {HelperServices?.getLocaldate(e.latestSubmission)}
                        </td>

                        <td className=" w-12 ">
                          <div className="d-flex justify-content-end">
                            <CustomButton
                                variant="secondary"
                                size="table"
                                label={t("Select")}
                                onClick={() => showFormEntries(e.parentFormId)}
                                dataTestId={`form-submit-button-${e.parentFormId}`}
                                aria-label={t("Select a form")}
                            />
                          </div>
                        </td>
                      </tr>

                    </React.Fragment>
                  );
                })}
                {formData.length ? (
                  <TableFooter
                    limit={limit}
                    activePage={pageNo}
                    totalCount={totalForms}
                    handlePageChange={handlePageChange}
                    onLimitChange={onSizePerPageChange}
                    pageOptions={pageOptions}
                  />
                ) : (
                  <td colSpan={3}></td>
                )}

              </tbody>
            ) : !searchFormLoading ? (
              noDataFound()
            ) : (
              null
            )}
          </table>
        </div>
        {showSubmissions && <SubmissionDrafts />}
      </div>
    </LoadingOverlay>

  );
}

export default ClientTable;
