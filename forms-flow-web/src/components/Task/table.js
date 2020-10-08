import React from "react";
import { Link } from "react-router-dom";
import { textFilter, selectFilter } from "react-bootstrap-table2-filter";

let titleFilter,
  statusFilter,
  ownerFilter,
  appidFilter,
  submittedFilter,
  submittedOnFilter,
  apptypeFilter;

export const defaultSortedBy = [
  {
    dataField: "name",
    order: "asc", // or desc
  },
];

export const TaskSearch = (props) => {
  let input;
  let userName = props.user;

  const statusChange = () => {
	clearFilter();
    if (input.value === "Username") {
	  props.onSearch(userName);
    } else {
		props.onSearch(input.value);
		if(input.value === "Active") {
		statusFilter("Active")
		} else {
		statusFilter("")
		}
	 }
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


const selectOptions = [
  { value: "Active", label: "Active" },
  { value: "Completed", label: "Completed" }
]


/*function linkDueDate(cell) {
  return <a href=" ">{cell}</a>;
}*/

function linkSubmision(cell, row) {
  return (
    <Link to={`/task/${row.id}`} title={cell}>
      {cell}
    </Link>
  );
}

function linkSubmisionId(cell) {
  return (
    <label className="text-truncate w-100" title={cell}>
      {cell}
    </label>
  );
}

function buttonFormatter(cell) {
  if (cell === "Completed") {
    return (
      <label className="text-success font-weight-bold text-capitalize task-btn">
        {"Completed"}
      </label>
    );
  } else {
    return (
      <label className="text-primary font-weight-bold text-capitalize task-btn">
        {"Active"}
      </label>
    );
  }
}

function timeFormatter(cell) {
  return <label title={cell}>{cell}</label>;
}

function linkTaskAssignee(cell, row) {
  if (cell) {
    return (
      <div>
        {cell}
        {row.userName === row.taskAssignee &&
        row.taskStatus !== "Completed" ? (
          <p className="mb-0" onClick={() => row.unAssignFn(row.id)}>
            Unassign
          </p>
        ) : null}
      </div>
    );
  } else {
    return (
      <p
        className="mb-0"
        onClick={() => row.assignToMeFn(row.id, row.userName, row.applicationId)}
      >
        Assign to me
      </p>
    );
  }
}

export const clearFilter = () => {
  titleFilter("");
  statusFilter("");
  ownerFilter("");
  appidFilter("");
  submittedFilter("");
  submittedOnFilter("");
  apptypeFilter("");
};
export const columns_history = [
  {
    dataField: "applicationName",
    text: "Application Name",
       sort: true,
    filter: textFilter({
      placeholder: "\uf002 Application Name", // custom the input placeholder
      caseSensitive: false, // default is false, and true will only work when comparator is LIKE
      className: "icon-search",
      getFilter: (filter) => {
        titleFilter = filter;
      },
    }),
  },
  {
    dataField: "applicationStatus",
    text: "Application Status",
    sort: true,
    formatter: buttonFormatter,
    filter: selectFilter({
      options: selectOptions,
      placeholder: "All",
      caseSensitive: false, // default is false, and true will only work when comparator is LIKE
      getFilter: (filter) => {
        statusFilter = filter;
      },
    }),
  },
];
export const columns = [
  {
    dataField: "taskTitle",
    text: "Task Title",
    formatter: linkSubmision,
    sort: true,
    filter: textFilter({
      placeholder: "\uf002 Task Title", // custom the input placeholder
      caseSensitive: false, // default is false, and true will only work when comparator is LIKE
      className: "icon-search",
      getFilter: (filter) => {
        titleFilter = filter;
      },
    }),
  },
  {
    dataField: "taskAssignee",
    text: "Task Assignee",
    formatter: linkTaskAssignee,
    sort: true,
    filter: textFilter({
      placeholder: "\uf002 Task Assignee", // custom the input placeholder
      caseSensitive: false, // default is false, and true will only work when comparator is LIKE
      className: "icon-search",
      getFilter: (filter) => {
        ownerFilter = filter;
      },
    }),
  },
  {
    dataField: "taskStatus",
    text: "Task Status",
    sort: true,
    formatter: buttonFormatter,
    filter: selectFilter({
      options: selectOptions,
      placeholder: "All",
	  defaultValue: 'Active',
      caseSensitive: false, // default is false, and true will only work when comparator is LIKE
      getFilter: (filter) => {
        statusFilter = filter;
      },
    }),
  },
  {
    dataField: "applicationId",
    text: "Application Id",
    formatter: linkSubmisionId,
    sort: true,
    sortFunc: (a, b, order) => {
      if (order === "asc") {
          return b - a;
      }
      return a - b;
    },
    filter: textFilter({
      placeholder: "\uf002 Id", // custom the input placeholder
      caseSensitive: false, // default is false, and true will only work when comparator is LIKE
      className: "icon-search",
      getFilter: (filter) => {
        appidFilter = filter;
      },
    }),
  },
  {
    dataField: "form",
    text: "Application Name",
    filter: textFilter({
      placeholder: "\uf002 Application Name", // custom the input placeholder
      caseSensitive: false, // default is false, and true will only work when comparator is LIKE
      className: "icon-search",
      getFilter: (filter) => {
        apptypeFilter = filter;
      },
    }),
  },
  {
    dataField: "submittedBy",
    text: "Applicant",
    filter: textFilter({
      placeholder: "\uf002 Name", // custom the input placeholder
      caseSensitive: false, // default is false, and true will only work when comparator is LIKE
      className: "icon-search",
      getFilter: (filter) => {
        submittedFilter = filter;
      },
    }),
  },
  {
    dataField: "submissionDate",
    text: "Submitted On",
    formatter: timeFormatter,
    sort: true,
    headerStyle: (colum, colIndex) => {
      return { width: "15%" };
    },
    filter: textFilter({
      placeholder: "\uf002 Date", // custom the input placeholder
      caseSensitive: false, // default is false, and true will only work when comparator is LIKE
      className: "icon-search",
      getFilter: (filter) => {
        submittedOnFilter = filter;
      },
    }),
  }
  // {
  //   dataField: 'dueDate',
  //   text: 'Due Date',
  //   formatter: linkDueDate,
  //   sort: true,
  // },
  // {
  //   dataField: "statusName",
  //   text: "Application Status",
  //   sort: true,
  //   formatter: buttonFormatter,
  //   filter: selectFilter({
  //     options: selectOptions,
  //     placeholder: "All",
  //     caseSensitive: false, // default is false, and true will only work when comparator is LIKE
  //     getFilter: (filter) => {
  //       statusFilter = filter;
  //     },
  //   }),
  // },
  // {
  //   dataField: "formName",
  //   text: "Form Name",
  //   sort: true,
  //   formatter: buttonFormatter,
  //   filter: selectFilter({
  //     options: selectOptions,
  //     placeholder: "All",
  //     caseSensitive: false, // default is false, and true will only work when comparator is LIKE
  //     getFilter: (filter) => {
  //       statusFilter = filter;
  //     },
  //   }),
  // },

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
