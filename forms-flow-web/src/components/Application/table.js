import React from "react";
import { Link } from "react-router-dom";
import startCase from "lodash/startCase";
import { textFilter , selectFilter } from "react-bootstrap-table2-filter";

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

const selectOptions = [
  { value: "Approved", label: "Approved" },
  { value: "New", label: "New" },
  { value: "Reviewed", label: "Reviewed" },
  { value: "Returned", label: "Returned" }
]


const linkApplication = (cell, row) => {
  return (
    <Link to={`/application/${row.id}`} title={cell}>
      {cell}
    </Link>
  );
}


const linkSubmision = (cell,row) => {
  const url = row.isClientEdit ? `/form/${row.formId}/submission/${row.submissionId}/edit`:`/form/${row.formId}/submission/${row.submissionId}`;
  const buttonText = row.isClientEdit ? 'Edit' : 'View'
  const icon=row.isClientEdit? 'fa fa-edit' : 'fa fa-eye';
  return (
  <div onClick={()=> window.open(url, "_blank")}>
        <span className="btn btn-primary btn-sm form-btn"><span><i
          className={icon}/>&nbsp;</span>{buttonText}</span>
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
    filter: textFilter({
      placeholder: "\uf002 Application ID", // custom the input placeholder
      caseSensitive: false, // default is false, and true will only work when comparator is LIKE
      className: "icon-search",
      getFilter: (filter) => {
      idFilter = filter;
      },
    }),
  },
  {
    dataField: "applicationName",
    text: "Application Name",
    sort: true,
    formatter: nameFormatter,
    filter: textFilter({
      placeholder: "\uf002 Application Name", // custom the input placeholder
      caseSensitive: false, // default is false, and true will only work when comparator is LIKE
      className: "icon-search",
      getFilter: (filter) => {
        nameFilter = filter;
      },
    }),
  },
  {
    dataField: "applicationStatus",
    text: "Application Status",
    sort: true,
    filter: selectFilter({
      options: selectOptions,
      placeholder: "All",
	    defaultValue: 'All',
      caseSensitive: false, // default is false, and true will only work when comparator is LIKE
      getFilter: (filter) => {
        statusFilter = filter;
      },
    }),
  },
  {
    dataField: "formUrl",
    text: "Link to Form Submission",
    formatter: linkSubmision,
  },
 
  {
    dataField: "modified",
    text: "Last Modified",
    formatter: timeFormatter,
    sort: true,
    headerStyle: (colum, colIndex) => {
      return { width: "15%" };
    },
    filter: textFilter({
      placeholder: "\uf002 Last Modified", // custom the input placeholder
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
export const clearFilter = () => {
    statusFilter("");
    idFilter("");
    nameFilter("");
};
export const ApplicatioSearch = (props) => {
  let input;
  let id = props.id;

  const statusChange = () => {
	clearFilter();
  //   if (input.value === "Username") {
	//   props.onSearch(userName);
  //   } else {
	// 	props.onSearch(input.value);
	// 	if(input.value === "Active") {
	// 	statusFilter("Active")
	// 	} else {
	// 	statusFilter("")
	// 	}
	//  }
  };

  return (
    <div>
      <select id="taskfilter"
        className="form-control"
        ref={(n) => (input = n)}
        onChange={statusChange} defaultValue="Active"
      >
        <option value=" ">All tasks</option>
        <option value="Active">Active tasks</option>
        <option value="Username">My assigned tasks</option>
      </select>
    </div>
  );
};
