import React from "react";
import {getFormIdSubmissionIdFromURL, getFormUrl, getLocalDateTime} from "../../apiManager/services/formatterService";
import { Translation } from "react-i18next";

export const defaultSortedBy = [
  {
    dataField: "name",
    order: "asc", // or desc
  },
];

const linkSubmision = (cell) => {
  const {formId,submissionId} = getFormIdSubmissionIdFromURL(cell);
  const url = getFormUrl(formId,submissionId)
  return (
    <div title={url} onClick={()=> window.open(url, "_blank")}>
        <span className="btn btn-primary btn-sm form-btn"><span><i class="fa fa-eye" aria-hidden="true"></i>&nbsp;</span><Translation>{(t)=>t("view_submission")}</Translation></span>
    </div>
  );
}

function timeFormatter(cell) {
  const localDate = getLocalDateTime(cell);
  return <label title={cell}>{localDate}</label>;
}


// History table columns
export const columns_history = [
  {
    dataField: "applicationStatus",
    text: <Translation>{(t)=>t("status")}</Translation>,
    sort: true,
  },
  {
    dataField: "created",
    text: <Translation>{(t)=>t("created")}</Translation>,
    sort: true,
    formatter: timeFormatter,
  },
  {
      dataField: "submittedBy",
      text: "Submitted By",
      sort: true,
  },
  {
    dataField: "formUrl",
    text: <Translation>{(t)=>t("submissions")}</Translation>,
    formatter: linkSubmision,
  },
];
const customTotal = (from, to, size) => (
  <span className="react-bootstrap-table-pagination-total">
    <Translation>{(t)=>t("showing")}</Translation> {from} <Translation>{(t)=>t("to")}</Translation> {to} <Translation>{(t)=>t("of")}</Translation> {size} Results
  </span>
);

export const getoptions = (count) => {
    return {
      expandRowBgColor: "rgb(173,216,230)",
      pageStartIndex: 1,
      alwaysShowAllBtns: true, // Always show next and previous button
      withFirstAndLast: false, // Hide the going to First and Last page button
      hideSizePerPage: true, // Hide the sizePerPage dropdown always
      // hidePageListOnlyOnePage: true, // Hide the pagination list when only one page
      paginationSize: 7, // the pagination bar size.
      prePageText: "<<",
      nextPageText: ">>",
      showTotal: true,
      Total: count,
      paginationTotalRenderer: customTotal,
      disablePageTitle: true,
      sizePerPage: 5,
    };
  }
;
