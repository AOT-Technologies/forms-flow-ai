import React from 'react'
import { Link } from 'react-router-dom'
import { textFilter,selectFilter } from 'react-bootstrap-table2-filter';

const selectOptions = [
  { value: 'Assigned', label: 'Assigned' },
  { value: 'Completed', label: 'Completed' },
  { value: 'Assigned to me', label: 'Assigned to me' }
];

export const columns = [{
  dataField: 'id',
  text: 'Task Id',
  formatter:linkSubmisionId,
  style: {'width': '10px'} ,
  className:'task-table-header',
  sort:true,
  filter: textFilter({
    placeholder: 'Task Id',  // custom the input placeholder
    caseSensitive: false, // default is false, and true will only work when comparator is LIKE
    
  })
}, {
  dataField: 'taskTitle',
  text: 'Task Title',
  sort:true,
  filter: textFilter({
    placeholder: 'Task Title',  // custom the input placeholder
    caseSensitive: false, // default is false, and true will only work when comparator is LIKE
    
  })
}, 
{
    dataField: 'taskOwner',
    text: 'Task Owner',
    sort:true,
    filter: textFilter({
      placeholder: 'Task Owner',  // custom the input placeholder
      caseSensitive: false, // default is false, and true will only work when comparator is LIKE
      
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
  })
},
{
  dataField: 'applicationId',
  text: 'Application Id',
  sort:true,
  filter: textFilter({
    placeholder: 'Application Id',  // custom the input placeholder
    caseSensitive: false, // default is false, and true will only work when comparator is LIKE
    
  })
},
{
  dataField: 'submittedBy',
  text: 'Primary Applicant',
  style: {'whiteSpace': 'nowrap'} ,
  filter: textFilter({
    placeholder: 'Primary Applicant',  // custom the input placeholder
    caseSensitive: false, // default is false, and true will only work when comparator is LIKE
    
  })
},
  {
    dataField: 'form',
    text: 'Application Type',
    filter: textFilter({
      placeholder: 'Application Type',  // custom the input placeholder
      caseSensitive: false, // default is false, and true will only work when comparator is LIKE
      
    })
  },
  {
    dataField: 'dueDate',
    text: 'Due Date',
    formatter:linkDueDate,
    sort:true,
    style: {'whiteSpace': 'nowrap'} 
  },];
  
  function linkDueDate()
  {
    return  <a href="#"  className="btn-link">Set due date</a>
  }
  function linkSubmisionId(cell)
  {
    return <Link to='/task/task-detail'className="btn-link">{cell}</Link>  
  }
  
  function linkButton() {
    return <button type="button" className="btn btn-link">Set due date</button>
  }
  function viewButton(cell, row) {
    return <button className="btn btn-primary btn-sm">view</button>;
  }
  function buttonFormatter(cell, row) {
    if (cell === "Claimed") {
      return <button className="btn btn-primary btn-sm">Claimed</button>;
    }
    else if (cell === "Approved") {
      return <button className="btn btn-success btn-sm">Approved</button>;
    }
    else if (cell === "Rejected") {
      return <button className="btn btn-danger btn-sm">Rejected</button>;
    }
    else if (cell === "Claim Now") {
      return <button className="btn btn-outline-primary btn-sm">Claim Now</button>;
    }
  
  }
  const customTotal = (from, to, size) => (
    <span className="react-bootstrap-table-pagination-total">
      Showing { from} to { to} of { size} Results
    </span>
  );

  export const getoptions=(count)=>{
      let options = {}
      return options = {
        paginationSize: 4,
        pageStartIndex: 0,
        alwaysShowAllBtns: true, // Always show next and previous button
        withFirstAndLast: false, // Hide the going to First and Last page button
        hideSizePerPage: true, // Hide the sizePerPage dropdown always
        // hidePageListOnlyOnePage: true, // Hide the pagination list when only one page
        firstPageText: 'First',
        prePageText: 'Previous',
        nextPageText: 'Next',
        lastPageText: 'Last',
        nextPageTitle: 'First page',
        prePageTitle: 'Pre page',
        firstPageTitle: 'Next page',
        lastPageTitle: 'Last page',
        showTotal: false,
        paginationTotalRenderer: customTotal,
        disablePageTitle: true,
        sizePerPageList: [{
          text: '5', value: 5
        }, {
          text: '10', value: 10
        }, {
          text: 'All', value: count
        }] // A numeric array is also available. the purpose of above example is custom the text
      }
  }