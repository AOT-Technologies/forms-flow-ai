import React from 'react'

export const columns = [{
    dataField: 'taskName',
    text: 'Task Name'
  }, {
    dataField: 'formName',
    text: 'Form Name'
  },
  {
    dataField: 'taskStatus',
    text: 'Task Status',
    formatter: buttonFormatter,
  }, {
    dataField: 'submitedBy',
    text: 'Submitted By'
  },
  {
    dataField: 'dueDate',
    text: 'Due Date',
    formatter: linkButton,
  },
  {
    dataField: 'actions',
    text: 'Actions',
    formatter: viewButton,
  }];
  
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

//   const options = {
//     paginationSize: 4,
//     pageStartIndex: 0,
//     alwaysShowAllBtns: true, // Always show next and previous button
//     withFirstAndLast: false, // Hide the going to First and Last page button
//     hideSizePerPage: true, // Hide the sizePerPage dropdown always
//     // hidePageListOnlyOnePage: true, // Hide the pagination list when only one page
//     firstPageText: 'First',
//     prePageText: 'Previous',
//     nextPageText: 'Next',
//     lastPageText: 'Last',
//     nextPageTitle: 'First page',
//     prePageTitle: 'Pre page',
//     firstPageTitle: 'Next page',
//     lastPageTitle: 'Last page',
//     showTotal: false,
//     paginationTotalRenderer: customTotal,
//     disablePageTitle: true,
//     sizePerPageList: [{
//       text: '5', value: 5
//     }, {
//       text: '10', value: 10
//     }, {
//       text: 'All', value: props.tasks.length
//     }] // A numeric array is also available. the purpose of above example is custom the text
//   };