import React from "react";
import { Link } from "react-router-dom";
import startCase from "lodash/startCase";
import { textFilter , selectFilter } from "react-bootstrap-table2-filter";
import {getLocalDateTime} from "../../apiManager/services/formatterService";
import {AWAITING_ACKNOWLEDGEMENT} from "../../constants/applicationConstants";
import {Translation} from "react-i18next";
let statusFilter,
    idFilter,
    nameFilter,
    modifiedDateFilter;

export const defaultSortedBy = [
  {
    dataField: "name",
    order: "asc", // or desc
  },
];

const getApplicationStatusOptions = (rows) => {
  const statusArray =  rows.map(row=>row.applicationStatus)
  const uniqueStatusArray = [...new Set(statusArray)];
  const selectOptions = uniqueStatusArray.map(option => {
    return {value:option,label:option}
  })
  return selectOptions;
}

const linkApplication = (cell, row) => {
  return (
    <Link to={`/application/${row.id}`} title={cell}>
      {cell}
    </Link>
  );
}


const linkSubmission = (cell,row) => {
  const url = row.isClientEdit ? `/form/${row.formId}/submission/${row.submissionId}/edit`:`/form/${row.formId}/submission/${row.submissionId}`;
  const buttonText = row.isClientEdit ? (row.applicationStatus===AWAITING_ACKNOWLEDGEMENT?'Acknowledge':<Translation>{(t)=>t("edit")}</Translation>) : <Translation>{(t)=>t("view")}</Translation>
  const icon=row.isClientEdit? 'fa fa-edit' : 'fa fa-eye';
  return (
  <div onClick={()=> window.open(url, "_blank")}>
        <span className="btn btn-primary btn-sm form-btn"><span><i
          className={icon}/>&nbsp;</span>{buttonText}</span>
  </div>
  );
}
  

function timeFormatter(cell) {
  const localdate = getLocalDateTime(cell) ;
  return <label title={cell}>{localdate}</label>;
}

const nameFormatter = (cell) => {
  const name= startCase(cell);
  return <label className="text-truncate w-100" title={name}>{startCase(name)}</label>;
}

export const columns_history = [
  {
    dataField: "applicationname",
    text: <Translation>{(t)=>t("application_name")}</Translation>,
    sort: true,
  },
  {
    dataField: "applicationstatus",
    text: <Translation>{(t)=>t("application_status")}</Translation>,
    sort: true,
  },
];

export const columns  = (rows,t) => [
  {
    dataField: "id",
    text: <Translation>{(t)=>t("application_id")}</Translation>,
    formatter: linkApplication,
    sort: true,
    filter: textFilter({
      placeholder:`\uf002 ${t("placeholder_appid")}` , // custom the input placeholder
      caseSensitive: false, // default is false, and true will only work when comparator is LIKE
      className: "icon-search",
      getFilter: (filter) => {
      idFilter = filter;
      },
    }),
  },
  {
    dataField: "applicationName",
    text: <Translation>{(t)=>t("application_name")}</Translation>,
    sort: true,
    formatter: nameFormatter,
    filter: textFilter({
      placeholder: `\uf002 ${t("application_name")}`, // custom the input placeholder
      caseSensitive: false, // default is false, and true will only work when comparator is LIKE
      className: "icon-search",
      getFilter: (filter) => {
        nameFilter = filter;
      },
    }),
  },
  {
    dataField: "applicationStatus",
    text: <Translation>{(t)=>t("application_status")}</Translation>,
    sort: true,
    filter: selectFilter({
      options: getApplicationStatusOptions(rows),
      placeholder: `\uf002 ${t("all")}`,
	    defaultValue: 'All',
      className: "icon-search",
      caseSensitive: false, // default is false, and true will only work when comparator is LIKE
      getFilter: (filter) => {
        statusFilter = filter;
      },
    }),
  },
  {
    dataField: "formUrl",
    text: <Translation>{(t)=>t("link_to_form_submission")}</Translation>,
    formatter: linkSubmission,
  },

  {
    dataField: "modified",
    text:<Translation>{(t)=>t("last_modified")}</Translation>,
    formatter: timeFormatter,
    sort: true,
    headerStyle: (colum, colIndex) => {
      return { width: "15%" };
    },
    filter: textFilter({
      placeholder: `\uf002 ${t("last_modified")}`, // custom the input placeholder
      caseSensitive: false, // default is false, and true will only work when comparator is LIKE
      className: "icon-search",
      getFilter: (filter) => {
        modifiedDateFilter = filter;
      },
    }),
  }

];

const customTotal = (from, to, size) => (
  <span className="react-bootstrap-table-pagination-total">
    <Translation>{(t)=>t("showing")}</Translation> {from} <Translation>{(t)=>t("to")}</Translation> {to} <Translation>{(t)=>t("of")}</Translation> {size} <Translation>{(t)=>t("results")}</Translation>
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
};
export const clearFilter = () => {
    statusFilter("");
    idFilter("");
    nameFilter("");
    modifiedDateFilter("");
};
