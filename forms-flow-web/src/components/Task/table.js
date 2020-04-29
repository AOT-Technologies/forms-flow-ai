import React from 'react'
import { Link } from 'react-router-dom'
import { textFilter, selectFilter } from 'react-bootstrap-table2-filter';

let idFilter,titleFilter,statusFilter,ownerFilter,appidFilter,submittedFilter,apptypeFilter;

export const defaultSortedBy = [{
  dataField: "id",
  order: "asc"  // or desc
}];
export const TaskSearch = (props) => {
  let input;
  const changeStatusFilter = () => {
    props.onSearch(input.value);
  };
  return (
    <div>
      <select className="form-control" ref={ n => input = n } onChange={ changeStatusFilter }>
              <option defaultValue  value=" ">All tasks</option>
              <option value="Assigned">Assigned tasks</option>
              <option value="Completed">Completed tasks</option>
            </select>
    </div>
  );
  
};

const selectOptions = [
  { value: 'Assigned', label: 'Assigned' },
  { value: 'Completed', label: 'Completed' },
  { value: 'Assigned to me', label: 'Assigned to me' }
];

function linkDueDate(cell) {
  return <a href=" ">{cell}</a>
}
function linkSubmisionId(cell) {
  return <Link to={`/task/${cell}`}>{cell}</Link>
}

function buttonFormatter(cell, row){
  if(cell==="Assigned")
  {
    return <label className="text-primary font-weight-bold text-uppercase">{cell}</label>;
  }
  else if(cell==="Completed")
  {
    return <label className="text-success font-weight-bold text-uppercase task-btn">{cell}</label>;
  }
  else if(cell==="Assign to me")
  {
    return <button className="btn btn-outline-primary btn-sm">{cell}</button>;
  }
  
}

export const clearFilter = () => {
  idFilter('');
  titleFilter('');
  statusFilter('');
  ownerFilter('');
  appidFilter('');
  submittedFilter('');
  apptypeFilter('');
};

export const columns = [{
  dataField: 'id',
  text: 'Task Id',
  formatter:linkSubmisionId,
  className:'task-table-header',
  sort:true,
  filter: textFilter({
    placeholder: "\uf002 Task Id",  // custom the input placeholder
    caseSensitive: false, // default is false, and true will only work when comparator is LIKE
    className:"icon-seach",
    getFilter: (filter) => {
      idFilter = filter;
    }
  })
}, {
  dataField: 'taskTitle',
  text: 'Task Title',
  sort:true,
  filter: textFilter({
    placeholder: '\uf002 Task Title',  // custom the input placeholder
    caseSensitive: false, // default is false, and true will only work when comparator is LIKE
    className:"icon-seach",
    getFilter: (filter) => {
      titleFilter = filter;
    }
  })
}, 
{
    dataField: 'taskOwner',
    text: 'Task Owner',
    sort:true,
    filter: textFilter({
      placeholder: '\uf002 Task Owner',  // custom the input placeholder
      caseSensitive: false, // default is false, and true will only work when comparator is LIKE
      className:"icon-seach",
      getFilter: (filter) => {
        ownerFilter = filter;
      }
    })
  },
  {
  dataField: 'taskStatus',
  text: 'Task Status',
  sort:true,
  formatter:buttonFormatter,
  filter: selectFilter({
    options: selectOptions,
    placeholder: 'All',
    caseSensitive: false, // default is false, and true will only work when comparator is LIKE
    getFilter: (filter) => {
      statusFilter = filter;
    }
  })
},
{
  dataField: 'applicationId',
  text: 'Application Id',
  sort:true,
  filter: textFilter({
    placeholder: '\uf002 Id',  // custom the input placeholder
    caseSensitive: false, // default is false, and true will only work when comparator is LIKE
    className:"icon-seach",
    getFilter: (filter) => {
      appidFilter = filter;
    }
  })
},
{
  dataField: 'submittedBy',
  text: 'Primary Applicant',
  style: {'whiteSpace': 'nowrap'} ,
  filter: textFilter({
    placeholder: '\uf002 Name',  // custom the input placeholder
    caseSensitive: false, // default is false, and true will only work when comparator is LIKE
    className:"icon-seach",
    getFilter: (filter) => {
      submittedFilter = filter;
    }
  })
},
  {
    dataField: 'form',
    text: 'Application Type',
    filter: textFilter({
      placeholder: '\uf002 Application Type',  // custom the input placeholder
      caseSensitive: false, // default is false, and true will only work when comparator is LIKE
      className:"icon-seach",
      getFilter: (filter) => {
        apptypeFilter = filter;
      }
    })
  },
  {
    dataField: 'dueDate',
    text: 'Due Date',
    formatter:linkDueDate,
    sort:true,
  },];

const customTotal = (from, to, size) => (
  <span className="react-bootstrap-table-pagination-total">
    Showing { from} to { to} of { size} Results
  </span>
);

export const getoptions = (count) => {
  let options = {}
  return options = {
    expandRowBgColor: 'rgb(173,216,230)',
    pageStartIndex: 1,
    alwaysShowAllBtns: true, // Always show next and previous button
    withFirstAndLast: false, // Hide the going to First and Last page button
    hideSizePerPage: true, // Hide the sizePerPage dropdown always
    // hidePageListOnlyOnePage: true, // Hide the pagination list when only one page
    paginationSize: 7,  // the pagination bar size.
    prePageText: '«',
    nextPageText: '»',
    showTotal: true,
    Total:count,
    paginationTotalRenderer: customTotal,
    disablePageTitle: true,
    sizePerPage: 5
  }
}