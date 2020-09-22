import React from "react";
import { Link } from "react-router-dom";
import startCase from "lodash/startCase";
// import { textFilter, selectFilter } from "react-bootstrap-table2-filter";

export const defaultSortedBy = [
  {
    dataField: "name",
    order: "asc", // or desc
  },
];


const linkApplication = (cell, row) => {
  return (
    <Link to={`/application/${row.id}`} title={cell}>
      {cell}
    </Link>
  );
}


const linkSubmision = (cell) => {
  return (
    <div title={cell} onClick={()=> window.open(cell, "_blank")}>
        <span className="btn btn-primary btn-sm form-btn"><span><i
          className="fa fa-eye"/>&nbsp;</span>View Submission</span>
    </div>
  );
}


function timeFormatter(cell) {
  const localdate = new Date(cell.replace(' ','T')+'Z').toLocaleString() 
  return <label title={cell}>{localdate}</label>;
}

const nameFormatter = (cell) => {
  const name= startCase(cell);
  return <label className="text-truncate w-100" title={name}>{startCase(name)}</label>;
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
    formatter: linkApplication,
    sort: true,
  },
  {
    dataField: "applicationName",
    text: "Application Name",
    sort: true,
    formatter: nameFormatter
  },
  {
    dataField: "applicationStatus",
    text: "Application Status",
    sort: true
  },
  {
    dataField: "formUrl",
    text: "Link to Form Submission",
    formatter: linkSubmision,
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
