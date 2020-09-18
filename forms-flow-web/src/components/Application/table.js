import React from "react";
import { Link } from "react-router-dom";
// import { textFilter, selectFilter } from "react-bootstrap-table2-filter";

export const defaultSortedBy = [
  {
    dataField: "name",
    order: "asc", // or desc
  },
];


function linkSubmision(cell, row) {
  return (
    <Link to={`/application/${row.id}`} title={cell}>
      {cell}
    </Link>
  );
}

function timeFormatter(cell) {
  return <label title={cell}>{cell}</label>;
}

export const columns_history = [
  {
    dataField: "application_name",
    text: "Application Name",
    sort: true,
  },
  {
    dataField: "application_status",
    text: "Application Status",
    sort: true,
  },
];
export const columns = [
  {
    dataField: "id",
    text: "Application ID",
    formatter: linkSubmision,
    sort: true,
  },
  {
    dataField: "applicationName",
    text: "Form Type",
    sort: true,
  },
  {
    dataField: "applicationStatus",
    text: "Application Status",
    sort: true,
    sortFunc: (a, b, order) => {
      if (order === "asc") {
          return b - a;
      }
      return a - b;
    }
  },
  {
    dataField: "formUrl",
    text: "Link to Form Submission"
  },
  // {
  //   dataField: "submittedBy",
  //   text: "Submitted by User",
  //   filter: textFilter({
  //     placeholder: "\uf002 Submitted by User", // custom the input placeholder
  //     caseSensitive: false, // default is false, and true will only work when comparator is LIKE
  //     className: "icon-search",
  //     getFilter: (filter) => {
  //       submittedFilter = filter;
  //     },
  //   }),
  // },
  {
    dataField: "modified",
    text: "Last Modified",
    formatter: timeFormatter,
    sort: true,
    headerStyle: (colum, colIndex) => {
      return { width: "15%" };
    }
  }

];

const customTotal = (from, to, size) => (
  <span className="react-bootstrap-table-pagination-total">
    Showing {from} to {to} of {size} Results
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
