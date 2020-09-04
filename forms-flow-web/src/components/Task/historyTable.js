import React from "react";
import { Link } from "react-router-dom";
export const defaultSortedBy = [
  {
    dataField: "name",
    order: "asc", // or desc
  },
];
function linkSubmision(cell, row) {
  return (
    <Link to={`/task/${row.id}`} title={cell}>
      {cell}
    </Link>
  );
}

// History table columns
export const columns_history = [
  {
    dataField: "applicationStatus",
    text: "Status",
    sort: true,
  },
  {
    dataField: "created",
    text: "Created",
    sort: true,
  },
  {
    dataField: "formUrl",
    text: "Form",
    formatter: linkSubmision,
  },
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
}
;
